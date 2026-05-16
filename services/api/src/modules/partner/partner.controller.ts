import {
  Body,
  Controller,
  Get,
  Headers,
  Ip,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { PartnerService } from './partner.service';
import { CreatePartnerDto } from './dto/create-partner.dto';

@Controller('partners')
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Post('register')
  register(@Body() body: CreatePartnerDto) {
    return this.partnerService.register(body);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('me')
  me(@Req() req: any) {
    return this.partnerService.me(req.user);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('me/status')
  status(@Req() req: any) {
    return this.partnerService.status(req.user);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('me/scope-request')
  createScopeRequest(@Req() req: any, @Body() body: any) {
    return this.partnerService.createScopeRequest(req.user, body);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('me/scope-request')
  getScopeRequest(@Req() req: any) {
    return this.partnerService.getScopeRequest(req.user);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('me/generated-contract')
  generatedContract(@Req() req: any) {
    return this.partnerService.generatedContract(req.user);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('me/accept-contract')
  acceptContract(
    @Req() req: any,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.partnerService.acceptContract(req.user, {
      ip,
      userAgent,
    });
  }
}
