import { Module } from '@nestjs/common';
import { ProcedureService } from './procedure.service';
import { ProcedureController } from './procedure.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { MagicLinkModule } from '../magiclink/magiclink.module';

@Module({
  imports: [MagicLinkModule],
  controllers: [ProcedureController],
  providers: [ProcedureService, PrismaService],
  exports: [ProcedureService],
})
export class ProcedureModule {}
