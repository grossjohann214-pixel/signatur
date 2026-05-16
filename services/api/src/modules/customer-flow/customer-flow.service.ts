import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EvidenceService } from '../evidence/evidence.service';
import { Web3Service } from '../web3/web3.service';
import { AuditService } from '../audit/audit.service';
import * as crypto from 'crypto';

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

@Injectable()
export class CustomerFlowService {
  constructor(
    private prisma: PrismaService,
    private evidenceService: EvidenceService,
    private web3Service: Web3Service,
    private auditService: AuditService,
  ) {}

  async openLink(token: string) {
    const tokenHash = sha256(token);
    const link = await this.prisma.procedureLink.findFirst({ where: { token_hash: tokenHash } });
    if (!link) throw new BadRequestException('Invalid or expired token');
    if (link.revoked_at) throw new BadRequestException('Token revoked');
    if (link.completed_at) throw new BadRequestException('Token already used');
    if (link.expires_at && link.expires_at < new Date()) throw new BadRequestException('Token expired');

    if (!link.opened_at) {
      await this.prisma.procedureLink.update({
        where: { id: link.id },
        data: { opened_at: new Date(), status: 'opened' },
      });
    }

    const procedure = await this.prisma.procedure.findUnique({ where: { id: link.procedure_id } });
    const participant = await this.prisma.procedureParticipant.findUnique({ where: { id: link.participant_id } });

    return {
      link_id: link.id,
      procedure_id: link.procedure_id,
      participant_id: link.participant_id,
      procedure_type: procedure?.type,
      participant_role: participant?.role,
      participant_email: participant?.email,
    };
  }

  async confirmData(linkId: string, data: { name: string; document_masked?: string; confirmed: boolean }) {
    const link = await this.getActiveLink(linkId);
    if (!data.confirmed) throw new BadRequestException('Data must be confirmed');

    await this.prisma.procedureParticipant.update({
      where: { id: link.participant_id },
      data: { document_masked: data.document_masked || undefined, status: 'data_confirmed' },
    });

    return { step: 'data_confirmed', participant_id: link.participant_id };
  }

  async submitSignature(linkId: string, signatureHash: string) {
    const link = await this.getActiveLink(linkId);

    await this.prisma.procedureParticipant.update({
      where: { id: link.participant_id },
      data: { signature_hash: signatureHash, status: 'signed' },
    });

    return { step: 'signed', participant_id: link.participant_id };
  }

  async submitWallet(linkId: string, walletAddress: string, network: string = 'sepolia') {
    const link = await this.getActiveLink(linkId);
    const participant = await this.prisma.procedureParticipant.findUnique({ where: { id: link.participant_id } });
    if (!participant) throw new NotFoundException('Participant not found');

    await this.prisma.procedureParticipant.update({
      where: { id: link.participant_id },
      data: { wallet_address: walletAddress },
    });

    const procedure = await this.prisma.procedure.findUnique({ where: { id: link.procedure_id } });
    if (procedure?.customer_id) {
      await this.prisma.customerWallet.create({
        data: { customer_id: procedure.customer_id, wallet_address: walletAddress, network },
      });
    }

    return { step: 'wallet_submitted', wallet_address: walletAddress };
  }

  async completeFlow(linkId: string) {
    const link = await this.getActiveLink(linkId);
    const participant = await this.prisma.procedureParticipant.findUnique({ where: { id: link.participant_id } });
    if (!participant) throw new NotFoundException('Participant not found');
    if (!participant.signature_hash) throw new BadRequestException('Signature required before completing');

    const procedure = await this.prisma.procedure.findUnique({ where: { id: link.procedure_id } });
    if (!procedure) throw new NotFoundException('Procedure not found');

    const protocolNumber = this.generateProtocol(procedure.id);

    // Evidence payload — only hashes and pseudonymized IDs
    const evidencePayload = {
      procedure_id: procedure.id,
      procedure_type: procedure.type,
      participant_id: participant.id,
      participant_role: participant.role,
      signature_hash: participant.signature_hash,
      wallet_address: participant.wallet_address || null,
      protocol_number: protocolNumber,
      completed_at: new Date().toISOString(),
    };

    const evidence = await this.evidenceService.createEvidence(procedure.id, evidencePayload);

    await this.prisma.evidence.update({
      where: { id: evidence.id },
      data: { protocol_number: protocolNumber },
    });

    // Web3 anchoring (skipped if not configured)
    let txHash: string | null = null;
    const anchorResult = await this.web3Service.anchorEvidence({
      evidenceId: evidence.id,
      evidenceHash: evidence.evidence_hash,
      procedureId: procedure.id,
      participantWallet: participant.wallet_address || '',
      protocolNumber,
    });
    if (anchorResult) {
      txHash = anchorResult.txHash;
      await this.prisma.evidence.update({
        where: { id: evidence.id },
        data: { web3_tx_hash: txHash },
      });
    }

    // Audit trail
    await this.auditService.record({
      entity_type: 'procedure',
      entity_id: procedure.id,
      action: 'participant_completed',
      evidence_hash: evidence.evidence_hash,
      protocol_number: protocolNumber,
      tx_hash: txHash || undefined,
    });

    // AuditSGL mock submission
    const auditResult = await this.auditService.submitToAuditSGL(evidence.id, evidence.evidence_hash, txHash || undefined);

    // Complete participant
    await this.prisma.procedureParticipant.update({
      where: { id: participant.id },
      data: { status: 'completed', completed_at: new Date() },
    });

    // Complete link
    await this.prisma.procedureLink.update({
      where: { id: link.id },
      data: { completed_at: new Date(), status: 'completed' },
    });

    await this.checkProcedureCompletion(procedure.id);

    return {
      protocol_number: protocolNumber,
      evidence_hash: evidence.evidence_hash,
      evidence_id: evidence.id,
      web3_tx_hash: txHash,
      audit_id: auditResult.audit_id,
      participant_status: 'completed',
    };
  }

  private generateProtocol(procedureId: string): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `SGL-${ts}-${rand}`;
  }

  private async checkProcedureCompletion(procedureId: string) {
    const participants = await this.prisma.procedureParticipant.findMany({
      where: { procedure_id: procedureId },
    });
    const allCompleted = participants.every((p) => p.status === 'completed');
    if (allCompleted && participants.length > 0) {
      await this.prisma.procedure.update({
        where: { id: procedureId },
        data: { status: 'completed' },
      });
    }
  }

  private async getActiveLink(linkId: string) {
    const link = await this.prisma.procedureLink.findUnique({ where: { id: linkId } });
    if (!link) throw new NotFoundException('Link not found');
    if (link.revoked_at) throw new BadRequestException('Link revoked');
    if (link.completed_at) throw new BadRequestException('Link already completed');
    if (link.expires_at && link.expires_at < new Date()) throw new BadRequestException('Link expired');
    return link;
  }
}
