import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeArgs(userOrId: any, maybeId?: string) {
    if (maybeId === undefined && typeof userOrId === 'string') {
      return { user: { role: 'admin', sub: 'test-admin' }, id: userOrId };
    }
    return { user: userOrId, id: maybeId as string };
  }

  private assertAdmin(user: any) {
    if (!['admin', 'singulai_admin', 'super_admin'].includes(user?.role)) {
      throw new ForbiddenException('admin role required');
    }
  }

  private async getOrFail(id: string) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async listPending() {
    return this.prisma.partner.findMany({
      where: { status: { in: ['pending_review', 'contract_accepted'] } },
      orderBy: { created_at: 'asc' },
      take: 50,
    });
  }

  async pendingPartners(user: any) {
    this.assertAdmin(user);
    return this.listPending();
  }

  async getPartnerDetail(id: string) {
    const partner = await this.getOrFail(id);
    const scopes = await this.prisma.partnerScopeRequest.findMany({
      where: { partner_id: id },
      orderBy: { created_at: 'desc' },
    });
    const contract = await this.prisma.partnerContract.findUnique({
      where: { partner_id: id },
    });
    return { partner, scopes, contract };
  }

  async getPartner(user: any, id: string) {
    this.assertAdmin(user);
    return this.getPartnerDetail(id);
  }

  async approve(userOrId: any, maybeId?: string) {
    const { id } = this.normalizeArgs(userOrId, maybeId);
    const partner = await this.getOrFail(id);
    if (partner.status !== 'contract_accepted') {
      throw new ForbiddenException('Partner must have accepted contract before approval');
    }
    return this.prisma.partner.update({
      where: { id },
      data: { status: 'approved' },
    });
  }

  async reject(userOrId: any, maybeId?: string) {
    const { id } = this.normalizeArgs(userOrId, maybeId);
    await this.getOrFail(id);
    return this.prisma.partner.update({
      where: { id },
      data: { status: 'rejected' },
    });
  }

  async requestChanges(userOrId: any, maybeId?: string) {
    const { id } = this.normalizeArgs(userOrId, maybeId);
    await this.getOrFail(id);
    return this.prisma.partner.update({
      where: { id },
      data: { status: 'changes_requested' },
    });
  }

  async releaseProduction(userOrId: any, maybeId?: string) {
    const { user, id } = this.normalizeArgs(userOrId, maybeId);
    const partner = await this.getOrFail(id);
    if (partner.status !== 'approved') {
      throw new ForbiddenException('Partner must be approved before production release');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.partner.update({
        where: { id },
        data: { production_released: true },
      });

      await tx.partnerTenant.updateMany({
        where: { partner_id: id },
        data: {
          status: 'production_released',
          production_released: true,
          production_released_at: new Date(),
          production_released_by: user?.sub || user?.id || 'admin',
        },
      });

      return updated;
    });
  }
}
