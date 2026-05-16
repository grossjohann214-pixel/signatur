import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { RegisterPartnerDto } from './dto/register-partner.dto';
import { ScopeRequestDto } from './dto/scope-request.dto';

@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  // PUBLIC - no auth
  @Post('register')
  async register(@Body() body: RegisterPartnerDto) {
    return this.partnerService.register(body);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('me')
  async me(@Req() req: any) {
    return this.partnerService.findById(req.user.partner_id);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('me/status')
  async status(@Req() req: any) {
    return this.partnerService.getStatus(req.user.partner_id);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('me/scope-request')
  async createScopeRequest(@Req() req: any, @Body() body: ScopeRequestDto) {
    return this.partnerService.createScopeRequest(
      req.user.partner_id,
      req.user.tenant_id,
      body,
    );
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('me/scope-request')
  async getScopeRequests(@Req() req: any) {
    return this.partnerService.getScopeRequests(req.user.partner_id);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('me/generated-contract')
  async getContract(@Req() req: any) {
    return this.partnerService.getGeneratedContract(req.user.partner_id);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('me/accept-contract')
  async acceptContract(@Req() req: any) {
    return this.partnerService.acceptContract(
      req.user.partner_id,
      req.user.id,
      req.ip,
      req.headers?.['user-agent'],
    );
  }
}
