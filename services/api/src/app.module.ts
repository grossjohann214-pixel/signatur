import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PartnerModule } from './modules/partner/partner.module';
import { AdminModule } from './modules/admin/admin.module';
import { CustomerModule } from './modules/customer/customer.module';
import { ProcedureModule } from './modules/procedure/procedure.module';
import { CustomerFlowModule } from './modules/customer-flow/customer-flow.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { MagicLinkModule } from './modules/magiclink/magiclink.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { Web3Module } from './modules/web3/web3.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]),
    PartnerModule, AdminModule, CustomerModule, ProcedureModule,
    CustomerFlowModule, AuthModule, MagicLinkModule, EvidenceModule,
    Web3Module, AuditModule,
  ],
  providers: [
    PrismaService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
