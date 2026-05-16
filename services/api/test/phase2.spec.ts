import { Test, TestingModule } from '@nestjs/testing';
import { PartnerService } from '../src/modules/partner/partner.service';
import { AdminService } from '../src/modules/admin/admin.service';
import { CustomerService } from '../src/modules/customer/customer.service';
import { ProcedureService } from '../src/modules/procedure/procedure.service';
import { MagicLinkService } from '../src/modules/magiclink/magiclink.service';
import { MockMagicLinkSender } from '../src/modules/magiclink/magiclink.sender';
import { PrismaService } from '../src/prisma/prisma.service';
import { enableBypass } from './helpers/rls';

describe('Phase 2 - Procedures + Customers + Magic Links', () => {
  let partnerService: PartnerService;
  let adminService: AdminService;
  let customerService: CustomerService;
  let procedureService: ProcedureService;
  let prisma: PrismaService;

  let partnerId: string;
  let tenantId: string;
  let userId: string;
  let customerId: string;
  let procedureId: string;
  let participantId: string;
  const testEmail = `test_phase2_${Date.now()}@test.local`;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnerService,
        AdminService,
        CustomerService,
        ProcedureService,
        MagicLinkService,
        MockMagicLinkSender,
        PrismaService,
      ],
    }).compile();

    partnerService = module.get(PartnerService);
    adminService = module.get(AdminService);
    customerService = module.get(CustomerService);
    procedureService = module.get(ProcedureService);
    prisma = module.get(PrismaService);
    await prisma.$connect();
    await enableBypass(prisma);

    // Setup: register + scope + accept + approve + release
    const reg = await partnerService.register({
      company_name: 'TestPhase2 Corp',
      cnpj: '22.222.222/0001-22',
      owner_email: testEmail,
      owner_password: 'Test222!@#',
    });
    partnerId = reg.partner_id;
    tenantId = reg.tenant_id;
    userId = reg.user_id;

    await partnerService.createScopeRequest(partnerId, tenantId, {
      request_type: 'confirmacao_cadastral',
    });
    await partnerService.acceptContract(partnerId, userId);
    await adminService.approve(partnerId);
    await adminService.releaseProduction(partnerId);
  });

  afterAll(async () => {
    await prisma.procedureLink.deleteMany({});
    await prisma.procedureParticipant.deleteMany({});
    await prisma.procedure.deleteMany({ where: { partner_id: partnerId } });
    await prisma.customer.deleteMany({ where: { partner_id: partnerId } });
    await prisma.partnerContract.deleteMany({ where: { partner_id: partnerId } });
    await prisma.partnerScopeRequest.deleteMany({ where: { partner_id: partnerId } });
    await prisma.partnerUser.deleteMany({ where: { email: testEmail } });
    await prisma.partnerBranding.deleteMany({ where: { partner_id: partnerId } });
    await prisma.partnerTenant.deleteMany({ where: { partner_id: partnerId } });
    await prisma.partner.deleteMany({ where: { id: partnerId } });
    await prisma.$disconnect();
  });

  // 1. Create customer
  it('creates customer for partner', async () => {
    const customer = await customerService.create(partnerId, tenantId, {
      name: 'John Doe',
      document_masked: '***123456**',
      email: 'john@test.local',
    });
    expect(customer.id).toBeDefined();
    expect(customer.partner_id).toBe(partnerId);
    expect(customer.tenant_id).toBe(tenantId);
    customerId = customer.id;
  });

  // 2. List customers
  it('lists customers by partner', async () => {
    const list = await customerService.listByPartner(partnerId, tenantId);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  // 3. Create procedure
  it('creates procedure with valid type', async () => {
    const proc = await procedureService.create(partnerId, tenantId, userId, {
      type: 'confirmacao_cadastral',
      customer_id: customerId,
    });
    expect(proc.id).toBeDefined();
    expect(proc.status).toBe('draft');
    expect(proc.partner_id).toBe(partnerId);
    procedureId = proc.id;
  });

  // 4. Invalid procedure type rejected
  it('rejects invalid procedure type', async () => {
    await expect(
      procedureService.create(partnerId, tenantId, userId, { type: 'invalid' }),
    ).rejects.toThrow('Invalid procedure type');
  });

  // 5. Add participant
  it('adds participant to draft procedure', async () => {
    const p = await procedureService.addParticipant(procedureId, tenantId, {
      role: 'signer',
      email: 'john@test.local',
    });
    expect(p.id).toBeDefined();
    expect(p.status).toBe('pending');
    participantId = p.id;
  });

  // 6. List participants
  it('lists participants', async () => {
    const list = await procedureService.listParticipants(procedureId, tenantId);
    expect(list.length).toBe(1);
  });

  // 7. Send magic link changes procedure to in_progress
  it('sends magic link and changes status to in_progress', async () => {
    const result = await procedureService.sendLink(procedureId, participantId, tenantId);
    expect(result.link_id).toBeDefined();

    const proc = await procedureService.findById(procedureId, tenantId);
    expect(proc.status).toBe('in_progress');
  });

  // 8. Cannot add participant to non-draft procedure
  it('rejects adding participant to in_progress procedure', async () => {
    await expect(
      procedureService.addParticipant(procedureId, tenantId, { role: 'witness' }),
    ).rejects.toThrow('Cannot add participant to non-draft procedure');
  });

  // 9. Tenant isolation on procedures
  it('cannot find procedure with wrong tenant', async () => {
    await expect(
      procedureService.findById(procedureId, 'wrong_tenant_id'),
    ).rejects.toThrow('Procedure not found');
  });

  // 10. Tenant isolation on customers
  it('cannot find customer with wrong tenant', async () => {
    await expect(
      customerService.findById(customerId, 'wrong_tenant_id'),
    ).rejects.toThrow('Customer not found');
  });
});
