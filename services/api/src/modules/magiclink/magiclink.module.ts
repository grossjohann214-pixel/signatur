import { Module } from '@nestjs/common';
import { MagicLinkService } from './magiclink.service';
import { MagicLinkController } from './magiclink.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { MockMagicLinkSender } from './magiclink.sender';

@Module({
  controllers: [MagicLinkController],
  providers: [MagicLinkService, PrismaService, MockMagicLinkSender],
  exports: [MagicLinkService],
})
export class MagicLinkModule {}
