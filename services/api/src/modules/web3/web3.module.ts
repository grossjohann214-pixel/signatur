import { Module } from '@nestjs/common';
import { Web3Service } from './web3.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [Web3Service, PrismaService],
  exports: [Web3Service],
})
export class Web3Module {}
