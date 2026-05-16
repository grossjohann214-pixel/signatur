import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const partnerId = request.user?.partner_id;
    if (!partnerId) throw new ForbiddenException('No partner context');

    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
    });
    if (!partner || !partner.production_released) {
      throw new ForbiddenException('Production not released for this partner');
    }
    return true;
  }
}
