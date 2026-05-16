import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerService {
  constructor(private prisma: PrismaService) {}

  async create(partnerId: string, tenantId: string, data: { name: string; document_masked?: string; email?: string }) {
    return this.prisma.customer.create({
      data: {
        partner_id: partnerId,
        tenant_id: tenantId,
        name: data.name,
        document_masked: data.document_masked || null,
        email: data.email || null,
      },
    });
  }

  async listByPartner(partnerId: string, tenantId: string) {
    return this.prisma.customer.findMany({
      where: { partner_id: partnerId, tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
  }

  async findById(id: string, tenantId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }
}
