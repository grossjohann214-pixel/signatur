import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/partners')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('pending')
  async listPending() {
    return this.adminService.listPending();
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    return this.adminService.getPartnerDetail(id);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    return this.adminService.approve(id);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() body?: { reason?: string }) {
    return this.adminService.reject(id, body?.reason);
  }

  @Post(':id/request-changes')
  async requestChanges(@Param('id') id: string, @Body() body?: { reason?: string }) {
    return this.adminService.requestChanges(id, body?.reason);
  }

  @Post(':id/release-production')
  async releaseProduction(@Param('id') id: string) {
    return this.adminService.releaseProduction(id);
  }
}
