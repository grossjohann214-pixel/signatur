import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { sha256 } from '../../../../../packages/crypto/index';
import { randomBytes } from 'crypto';
import { MockMagicLinkSender } from './magiclink.sender';

@Injectable()
export class MagicLinkService {
  constructor(private prisma: PrismaService, private sender: MockMagicLinkSender) {}

  generateToken() {
    return randomBytes(24).toString('hex');
  }

  async createLink(procedureId: string, participantId: string, ttlSeconds = 60 * 60 * 24) {
    const token = this.generateToken();
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const link = await this.prisma.procedureLink.create({
      data: {
        procedure_id: procedureId,
        participant_id: participantId,
        token_hash: tokenHash,
        status: 'created',
        expires_at: expiresAt,
      },
    });

    await this.sender.sendMagicLink(participantId, token);
    return { token, link };
  }

  async consumeToken(token: string) {
    const tokenHash = sha256(token);
    const link = await this.prisma.procedureLink.findFirst({ where: { token_hash: tokenHash } });
    if (!link) throw new BadRequestException('invalid or expired token');
    if (link.revoked_at) throw new BadRequestException('token revoked');
    if (link.completed_at) throw new BadRequestException('token already used');
    if (link.expires_at && link.expires_at < new Date()) throw new BadRequestException('token expired');

    const updated = await this.prisma.procedureLink.update({
      where: { id: link.id },
      data: { opened_at: new Date(), completed_at: new Date(), status: 'completed' },
    });
    return updated;
  }

  async revokeLinkById(linkId: string) {
    return this.prisma.procedureLink.update({ where: { id: linkId }, data: { revoked_at: new Date(), status: 'revoked' } });
  }
}
