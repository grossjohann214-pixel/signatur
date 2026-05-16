import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { TenantGuard } from '../tenant/tenant.guard';
import { ProductionGuard } from '../auth/production.guard';
import { CreateCustomerDto } from './dto/create-customer.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard, TenantGuard, ProductionGuard)
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async create(@Req() req: any, @Body() body: CreateCustomerDto) {
    return this.customerService.create(req.user.partner_id, req.user.tenant_id, body);
  }

  @Get()
  async list(@Req() req: any) {
    return this.customerService.listByPartner(req.user.partner_id, req.user.tenant_id);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.customerService.findById(id, req.user.tenant_id);
  }
}
