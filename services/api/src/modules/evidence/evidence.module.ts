import { Module } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [EvidenceService, PrismaService],
  exports: [EvidenceService],
})
export class EvidenceModule {}
