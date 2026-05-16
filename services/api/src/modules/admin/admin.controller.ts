import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('partners/pending')
  pendingPartners(@Req() req: any) {
    return this.adminService.pendingPartners(req.user);
  }

  @Get('partners/:id')
  getPartner(@Req() req: any, @Param('id') id: string) {
    return this.adminService.getPartner(req.user, id);
  }

  @Post('partners/:id/approve')
  approve(@Req() req: any, @Param('id') id: string) {
    return this.adminService.approve(req.user, id);
  }

  @Post('partners/:id/reject')
  reject(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.adminService.reject(req.user, id);
  }

  @Post('partners/:id/request-changes')
  requestChanges(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.adminService.requestChanges(req.user, id);
  }

  @Post('partners/:id/release-production')
  releaseProduction(@Req() req: any, @Param('id') id: string) {
    return this.adminService.releaseProduction(req.user, id);
  }
}
