import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async listPending() {
    return this.prisma.partner.findMany({
      where: { status: { in: ['pending_review', 'contract_accepted'] } },
      orderBy: { created_at: 'asc' },
      take: 50,
    });
  }

  async getPartnerDetail(partnerId: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });
    if (!partner) throw new NotFoundException('Partner not found');

    const scopes = await this.prisma.partnerScopeRequest.findMany({
      where: { partner_id: partnerId },
    });
    const contract = await this.prisma.partnerContract.findUnique({
      where: { partner_id: partnerId },
    });

    return { partner, scopes, contract };
  }

  async approve(partnerId: string) {
    const partner = await this.getOrFail(partnerId);
    if (partner.status !== 'contract_accepted') {
      throw new ForbiddenException('Partner must have accepted contract before approval');
    }
    return this.prisma.partner.update({
      where: { id: partnerId },
      data: { status: 'approved' },
    });
  }

  async reject(partnerId: string, reason?: string) {
    await this.getOrFail(partnerId);
    return this.prisma.partner.update({
      where: { id: partnerId },
      data: { status: 'rejected' },
    });
  }

  async requestChanges(partnerId: string, reason?: string) {
    await this.getOrFail(partnerId);
    return this.prisma.partner.update({
      where: { id: partnerId },
      data: { status: 'changes_requested' },
    });
  }

  async releaseProduction(partnerId: string) {
    const partner = await this.getOrFail(partnerId);
    if (partner.status !== 'approved') {
      throw new ForbiddenException('Partner must be approved before production release');
    }
    return this.prisma.partner.update({
      where: { id: partnerId },
      data: { production_released: true },
    });
  }

  private async getOrFail(id: string) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }
}
