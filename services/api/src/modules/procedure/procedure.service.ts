import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MagicLinkService } from '../magiclink/magiclink.service';

const ALLOWED_TYPES = [
  'confirmacao_cadastral', 'assinatura_de_termo', 'autorizacao_de_servico',
  'liberacao_de_execucao', 'ressarcimento', 'quitacao', 'declaracao_de_ciencia',
  'validacao_de_beneficiario', 'contrato_com_testemunhas', 'prestacao_de_servico',
  'termo_juridico', 'termo_contabil', 'outro_procedimento',
];

@Injectable()
export class ProcedureService {
  constructor(
    private prisma: PrismaService,
    private magicLinkService: MagicLinkService,
  ) {}

  async create(partnerId: string, tenantId: string, userId: string, data: { type: string; customer_id?: string; template_id?: string }) {
    if (!ALLOWED_TYPES.includes(data.type)) {
      throw new BadRequestException('Invalid procedure type');
    }

    return this.prisma.procedure.create({
      data: {
        partner_id: partnerId,
        tenant_id: tenantId,
        type: data.type,
        customer_id: data.customer_id || null,
        template_id: data.template_id || null,
        status: 'draft',
        created_by: userId,
      },
    });
  }

  async listByPartner(partnerId: string, tenantId: string) {
    return this.prisma.procedure.findMany({
      where: { partner_id: partnerId, tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
  }

  async findById(id: string, tenantId: string): Promise<any> {
    const proc = await this.prisma.procedure.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!proc) throw new NotFoundException('Procedure not found');
    return proc;
  }

  async addParticipant(procedureId: string, tenantId: string, data: { role: string; email?: string; phone?: string; document_masked?: string }) {
    const proc = await this.findById(procedureId, tenantId);
    if (proc.status !== 'draft') {
      throw new ForbiddenException('Cannot add participant to non-draft procedure');
    }

    return this.prisma.procedureParticipant.create({
      data: {
        procedure_id: procedureId,
        role: data.role,
        email: data.email || null,
        phone: data.phone || null,
        document_masked: data.document_masked || null,
        status: 'pending',
      },
    });
  }

  async listParticipants(procedureId: string, tenantId: string) {
    await this.findById(procedureId, tenantId);
    return this.prisma.procedureParticipant.findMany({
      where: { procedure_id: procedureId },
    });
  }

  async sendLink(procedureId: string, participantId: string, tenantId: string) {
    const proc = await this.findById(procedureId, tenantId);
    if (proc.status === 'completed') {
      throw new ForbiddenException('Procedure already completed');
    }

    const participant = await this.prisma.procedureParticipant.findFirst({
      where: { id: participantId, procedure_id: procedureId },
    });
    if (!participant) throw new NotFoundException('Participant not found');

    // Update procedure status if still draft
    if (proc.status === 'draft') {
      await this.prisma.procedure.update({
        where: { id: procedureId },
        data: { status: 'in_progress' },
      });
    }

    const result = await this.magicLinkService.createLink(procedureId, participantId);
    return { link_id: result.link.id, status: result.link.status };
  }
}
