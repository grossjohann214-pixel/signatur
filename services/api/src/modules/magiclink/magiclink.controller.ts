import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MagicLinkService } from './magiclink.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { ProductionGuard } from '../auth/production.guard';

@Controller('magic-links')
export class MagicLinkController {
  constructor(private magicLinkService: MagicLinkService) {}

  // Protected - only partners with production can create
  @UseGuards(JwtAuthGuard, TenantGuard, ProductionGuard)
  @Post('create')
  async create(@Body() body: { procedureId: string; participantId: string; ttlSeconds?: number }) {
    const resp = await this.magicLinkService.createLink(body.procedureId, body.participantId, body.ttlSeconds);
    return { link_id: resp.link.id, status: resp.link.status };
  }

  // Public - customer consumes token
  @Post('consume')
  async consume(@Body() body: { token: string }) {
    return this.magicLinkService.consumeToken(body.token);
  }

  // Protected - revoke
  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post(':id/revoke')
  async revoke(@Param('id') id: string) {
    return this.magicLinkService.revokeLinkById(id);
  }
}
