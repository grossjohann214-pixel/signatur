import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';

const ALLOWED_PROCEDURE_TYPES = [
  'confirmacao_cadastral', 'assinatura_de_termo', 'autorizacao_de_servico',
  'liberacao_de_execucao', 'ressarcimento', 'quitacao', 'declaracao_de_ciencia',
  'validacao_de_beneficiario', 'contrato_com_testemunhas', 'prestacao_de_servico',
  'termo_juridico', 'termo_contabil', 'outro_procedimento',
];

function sha256(input: string) {
  return createHash('sha256').update(input).digest('hex');
}

function canonicalJson(payload: Record<string, any>) {
  return JSON.stringify(
    Object.keys(payload).sort().reduce((acc, k) => {
      acc[k] = payload[k];
      return acc;
    }, {} as Record<string, any>),
  );
}

@Injectable()
export class PartnerService {
  constructor(private readonly prisma: PrismaService) {}

  async register(body: CreatePartnerDto & Record<string, any>) {
    const email = (body.owner_email || body.email)?.toLowerCase?.().trim();
    const password = body.owner_password || body.password;

    if (!email || !password) {
      throw new BadRequestException('email and password are required');
    }


    const tenantId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const companyName = body.company_name || body.companyName || body.name || 'Partner';

    const result = await this.prisma.withBypass(async (tx) => {
      const existing = await tx.partnerUser.findUnique({ where: { email } });
      if (existing) throw new BadRequestException("Email already registered");

      const partner = await tx.partner.create({
        data: {
          tenant_id: tenantId,
          company_name: companyName,
          cnpj: body.cnpj || null,
          trading_name: body.trading_name || null,
          status: 'draft',
          production_released: false,
          created_by: 'self_registration',
        },
      });

      const tenant = await tx.partnerTenant.create({
        data: {
          partner_id: partner.id,
          tenant_id: tenantId,
          status: 'configuring',
          production_released: false,
        },
      });

      const partnerUser = await tx.partnerUser.create({
        data: {
          partner_id: partner.id,
          tenant_id: tenantId,
          email,
          password: passwordHash,
          role: 'admin',
          is_owner: true,
        },
      });

      await tx.partnerBranding.create({
        data: { partner_id: partner.id, display_name: body.display_name || companyName },
      });

      return { partner, tenant, partnerUser };
    });

    return {
      partner_id: result.partner.id,
      tenant_id: tenantId,
      user_id: result.partnerUser.id,
      email: result.partnerUser.email,
      status: result.partner.status,
      production_released: result.partner.production_released,
    };
  }

  async findById(id: string): Promise<any> {
    if (!id) return null;
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async me(user: any) {
    return this.findById(user.partner_id || user.partnerId);
  }

  async getStatus(partnerId: string) {
    const partner = await this.findById(partnerId);
    return {
      status: partner.status,
      production_released: partner.production_released,
    };
  }

  async status(user: any) {
    return this.getStatus(user.partner_id || user.partnerId);
  }

  private resolveScopeArgs(a: any, b: any, c?: any) {
    const legacy = typeof a === 'string' && typeof b === 'string';
    return {
      partnerId: legacy ? a : a.partner_id || a.partnerId,
      tenantId: legacy ? b : a.tenant_id || a.tenantId,
      body: legacy ? c || {} : b || {},
    };
  }

  async createScopeRequest(a: any, b: any, c?: any) {
    const { partnerId, tenantId, body } = this.resolveScopeArgs(a, b, c);

    const requestType = body.request_type
      || (Array.isArray(body.procedure_types) ? body.procedure_types[0] : undefined);

    if (!requestType) throw new BadRequestException('request_type is required');
    if (!ALLOWED_PROCEDURE_TYPES.includes(requestType)) {
      throw new BadRequestException('Invalid request_type');
    }

    const partner = await this.findById(partnerId);
    if (partner.status !== 'draft' && partner.status !== 'changes_requested') {
      throw new ForbiddenException('Cannot request scope in current status');
    }

    return this.prisma.$transaction(async (tx) => {
      const scope = await tx.partnerScopeRequest.create({
        data: {
          partner_id: partnerId,
          tenant_id: tenantId,
          request_type: requestType,
          description: body.description || null,
          status: 'pending_review',
        },
      });

      await tx.partner.update({
        where: { id: partnerId },
        data: { status: 'pending_review' },
      });

      const existing = await tx.partnerContract.findUnique({ where: { partner_id: partnerId } });
      if (!existing) {
        const html = `<h1>Contrato de Parceria SingulAI Validate</h1>
<p>Parceiro: ${partner.company_name}</p>
<p>CNPJ: ${partner.cnpj || 'N/A'}</p>
<p>Escopo: ${requestType}</p>`;
        const hash = sha256(canonicalJson({ partner_id: partnerId, tenant_id: tenantId, html }));
        await tx.partnerContract.create({
          data: {
            partner_id: partnerId,
            tenant_id: tenantId,
            status: 'generated',
            contract_hash: hash,
            generated_html: html,
          },
        });
      }

      return scope;
    });
  }

  async getScopeRequest(user: any) {
    const partnerId = user.partner_id || user.partnerId;
    return this.prisma.partnerScopeRequest.findMany({
      where: { partner_id: partnerId },
      orderBy: { created_at: 'desc' },
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

  async generatedContract(user: any) {
    return this.getGeneratedContract(user.partner_id || user.partnerId);
  }

  async acceptContract(a: any, b?: any, ip?: string, userAgent?: string) {
    const legacy = typeof a === 'string';
    const partnerId = legacy ? a : a.partner_id || a.partnerId;
    const userId = legacy ? b : a.sub || a.id;
    const meta = legacy ? { ip, userAgent } : (b || {});

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
          accepted_by: userId || null,
          accepted_ip: meta.ip || null,
          accepted_user_agent: meta.userAgent || null,
        },
      });

      await tx.partner.update({
        where: { id: partnerId },
        data: { status: 'contract_accepted' },
      });

      return { status: updated.status, accepted_at: updated.accepted_at };
    });
  }

  async assertProductionReleased(partnerId: string) {
    const partner = await this.findById(partnerId);
    if (!partner.production_released) {
      throw new ForbiddenException('production not released for this partner');
    }
    return true;
  }
}
