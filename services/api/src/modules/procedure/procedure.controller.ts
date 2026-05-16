import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ProcedureService } from './procedure.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { ProductionGuard } from '../auth/production.guard';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { AddParticipantDto } from './dto/add-participant.dto';

@Controller('procedures')
@UseGuards(JwtAuthGuard, TenantGuard, ProductionGuard)
export class ProcedureController {
  constructor(private readonly procedureService: ProcedureService) {}

  @Post()
  async create(@Req() req: any, @Body() body: CreateProcedureDto) {
    return this.procedureService.create(
      req.user.partner_id,
      req.user.tenant_id,
      req.user.id,
      body,
    );
  }

  @Get()
  async list(@Req() req: any) {
    return this.procedureService.listByPartner(req.user.partner_id, req.user.tenant_id);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.procedureService.findById(id, req.user.tenant_id);
  }

  @Post(':id/participants')
  async addParticipant(@Req() req: any, @Param('id') id: string, @Body() body: AddParticipantDto) {
    return this.procedureService.addParticipant(id, req.user.tenant_id, body);
  }

  @Get(':id/participants')
  async listParticipants(@Req() req: any, @Param('id') id: string) {
    return this.procedureService.listParticipants(id, req.user.tenant_id);
  }

  @Post(':id/participants/:participantId/send-link')
  async sendLink(@Req() req: any, @Param('id') id: string, @Param('participantId') pid: string) {
    return this.procedureService.sendLink(id, pid, req.user.tenant_id);
  }
}
