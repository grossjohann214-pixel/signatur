import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class PartnerService {
  constructor(private prisma: PrismaService) {}

  async register(data: {
    company_name: string;
    cnpj?: string;
    trading_name?: string;
    owner_email: string;
    owner_password: string;
    owner_name?: string;
  }) {
    const existing = await this.prisma.partnerUser.findUnique({
      where: { email: data.owner_email },
    });
    if (existing) throw new BadRequestException('Email already registered');

    const tenantId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(data.owner_password, 12);

    return this.prisma.$transaction(async (tx) => {
      const partner = await tx.partner.create({
        data: {
          tenant_id: tenantId,
          company_name: data.company_name,
          cnpj: data.cnpj || null,
          trading_name: data.trading_name || null,
          status: 'draft',
          production_released: false,
          created_by: 'self_registration',
        },
      });

      await tx.partnerTenant.create({
        data: {
          partner_id: partner.id,
          tenant_id: tenantId,
          status: 'configuring',
        },
      });

      const user = await tx.partnerUser.create({
        data: {
          partner_id: partner.id,
          tenant_id: tenantId,
          email: data.owner_email,
          password: passwordHash,
          role: 'admin',
          is_owner: true,
        },
      });

      return {
        partner_id: partner.id,
        tenant_id: tenantId,
        user_id: user.id,
        email: user.email,
        status: partner.status,
      };
    });
  }

  async findById(id: string): Promise<any> {
    if (!id) return null;
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async getStatus(partnerId: string) {
    const partner = await this.findById(partnerId);
    return {
      status: partner.status,
      production_released: partner.production_released,
    };
  }

  async createScopeRequest(partnerId: string, tenantId: string, data: { request_type: string; description?: string }) {
    const partner = await this.findById(partnerId);
    if (partner.status !== 'draft' && partner.status !== 'changes_requested') {
      throw new ForbiddenException('Cannot request scope in current status');
    }

    const ALLOWED_TYPES = [
      'confirmacao_cadastral', 'assinatura_de_termo', 'autorizacao_de_servico',
      'liberacao_de_execucao', 'ressarcimento', 'quitacao', 'declaracao_de_ciencia',
      'validacao_de_beneficiario', 'contrato_com_testemunhas', 'prestacao_de_servico',
      'termo_juridico', 'termo_contabil', 'outro_procedimento',
    ];
    if (!ALLOWED_TYPES.includes(data.request_type)) {
      throw new BadRequestException('Invalid request_type');
    }

    return this.prisma.$transaction(async (tx) => {
      const scope = await tx.partnerScopeRequest.create({
        data: {
          partner_id: partnerId,
          tenant_id: tenantId,
          request_type: data.request_type,
          description: data.description || null,
          status: 'pending_review',
        },
      });

      await tx.partner.update({
        where: { id: partnerId },
        data: { status: 'pending_review' },
      });

      // Auto-generate contract
      await this.generateContract(tx, partnerId, tenantId);

      return scope;
    });
  }

  async getScopeRequests(partnerId: string) {
    return this.prisma.partnerScopeRequest.findMany({
      where: { partner_id: partnerId },
      orderBy: { created_at: 'desc' },
    });
  }

  async getGeneratedContract(partnerId: string) {
    const contract = await this.prisma.partnerContract.findUnique({
      where: { partner_id: partnerId },
    });
    if (!contract) throw new NotFoundException('No contract generated yet');
    return contract;
  }

  async acceptContract(partnerId: string, userId: string, ip?: string, userAgent?: string) {
    const contract = await this.prisma.partnerContract.findUnique({
      where: { partner_id: partnerId },
    });
    if (!contract) throw new NotFoundException('No contract generated');
    if (contract.status !== 'generated') throw new ForbiddenException('Contract already processed');

    const partner = await this.findById(partnerId);
    if (partner.status !== 'pending_review') {
      throw new ForbiddenException('Partner must be in pending_review to accept contract');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.partnerContract.update({
        where: { partner_id: partnerId },
        data: {
          status: 'accepted',
          accepted_at: new Date(),
          accepted_by: userId,
          accepted_ip: ip || null,
          accepted_user_agent: userAgent || null,
        },
      });

      await tx.partner.update({
        where: { id: partnerId },
        data: { status: 'contract_accepted' },
      });

      return { status: updated.status, accepted_at: updated.accepted_at };
    });
  }

  private async generateContract(tx: any, partnerId: string, tenantId: string) {
    const existing = await tx.partnerContract.findUnique({
      where: { partner_id: partnerId },
    });
    if (existing) return existing;

    const partner = await tx.partner.findUnique({ where: { id: partnerId } });
    const html = `<h1>Contrato de Parceria SingulAI Validate</h1>
<p>Parceiro: ${partner.company_name}</p>
<p>CNPJ: ${partner.cnpj || 'N/A'}</p>
<p>Gerado em: ${new Date().toISOString()}</p>
<p>Este contrato estabelece os termos de uso da plataforma SingulAI Validate.</p>`;

    const hash = crypto.createHash('sha256').update(html).digest('hex');

    return tx.partnerContract.create({
      data: {
        partner_id: partnerId,
        tenant_id: tenantId,
        status: 'generated',
        contract_hash: hash,
        generated_html: html,
      },
    });
  }
}
