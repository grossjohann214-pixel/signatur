import { Module } from '@nestjs/common';
import { CustomerFlowService } from './customer-flow.service';
import { CustomerFlowController } from './customer-flow.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { EvidenceModule } from '../evidence/evidence.module';
import { Web3Module } from '../web3/web3.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [EvidenceModule, Web3Module, AuditModule],
  controllers: [CustomerFlowController],
  providers: [CustomerFlowService, PrismaService],
})
export class CustomerFlowModule {}
