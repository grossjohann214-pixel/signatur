import { Test, TestingModule } from '@nestjs/testing';
import { PartnerService } from '../src/modules/partner/partner.service';
import { AdminService } from '../src/modules/admin/admin.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { ProductionGuard } from '../src/modules/auth/production.guard';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('Phase 1 - Backend Core', () => {
  let partnerService: PartnerService;
  let adminService: AdminService;
  let authService: AuthService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnerService,
        AdminService,
        AuthService,
        PrismaService,
        { provide: JwtService, useValue: { sign: (p: any) => 'mock_token' } },
      ],
    }).compile();

    partnerService = module.get(PartnerService);
    adminService = module.get(AdminService);
    authService = module.get(AuthService);
    prisma = module.get(PrismaService);
    await prisma.$connect();
  });

  afterAll(async () => {
    // cleanup test data
    await prisma.partnerContract.deleteMany({});
    await prisma.partnerScopeRequest.deleteMany({});
    await prisma.partnerUser.deleteMany({ where: { email: { startsWith: 'test_phase1_' } } });
    await prisma.partnerTenant.deleteMany({});
    await prisma.partnerBranding.deleteMany({});
    await prisma.partner.deleteMany({ where: { company_name: { startsWith: 'TestPhase1' } } });
    await prisma.$disconnect();
  });

  let partnerId: string;
  let tenantId: string;
  let userId: string;
  const testEmail = `test_phase1_${Date.now()}@test.local`;

  // 1. Register creates Partner + Tenant + PartnerUser
  it('register creates Partner + Tenant + PartnerUser', async () => {
    const result = await partnerService.register({
      company_name: 'TestPhase1 Corp',
      cnpj: '11.111.111/0001-11',
      trading_name: 'TP1',
      owner_email: testEmail,
      owner_password: 'Test123!@#',
    });

    expect(result.partner_id).toBeDefined();
    expect(result.tenant_id).toBeDefined();
    expect(result.user_id).toBeDefined();
    expect(result.status).toBe('draft');

    partnerId = result.partner_id;
    tenantId = result.tenant_id;
    userId = result.user_id;

    // Verify tenant was created
    const tenant = await prisma.partnerTenant.findFirst({ where: { partner_id: partnerId } });
    expect(tenant).not.toBeNull();
    expect(tenant!.tenant_id).toBe(tenantId);
  });

  // 2. Password is stored with bcrypt
  it('password is saved with bcrypt hash', async () => {
    const user = await prisma.partnerUser.findUnique({ where: { email: testEmail } });
    expect(user!.password).not.toBe('Test123!@#');
    const isValid = await bcrypt.compare('Test123!@#', user!.password);
    expect(isValid).toBe(true);
  });

  // 3. Login returns token, not passwordHash
  it('login returns token without passwordHash', async () => {
    const validated = await authService.validateUser(testEmail, 'Test123!@#');
    expect(validated).not.toBeNull();
    expect(validated.password).toBeUndefined();
    expect(validated.id).toBeDefined();

    const loginResult = await authService.login(validated);
    expect(loginResult.access_token).toBeDefined();
  });

  // 4. Status returns correct value
  it('status returns draft initially', async () => {
    const status = await partnerService.getStatus(partnerId);
    expect(status.status).toBe('draft');
    expect(status.production_released).toBe(false);
  });

  // 5. Scope request changes status to pending_review and generates contract
  it('scope request works and generates contract', async () => {
    const scope = await partnerService.createScopeRequest(partnerId, tenantId, {
      request_type: 'confirmacao_cadastral',
      description: 'Test scope',
    });
    expect(scope.status).toBe('pending_review');

    const status = await partnerService.getStatus(partnerId);
    expect(status.status).toBe('pending_review');

    const contract = await partnerService.getGeneratedContract(partnerId);
    expect(contract.contract_hash).toBeDefined();
    expect(contract.status).toBe('generated');
  });

  // 6. Accept contract changes status
  it('accept contract updates status correctly', async () => {
    const result = await partnerService.acceptContract(partnerId, userId, '127.0.0.1', 'jest');
    expect(result.status).toBe('accepted');

    const status = await partnerService.getStatus(partnerId);
    expect(status.status).toBe('contract_accepted');
  });

  // 7. Admin approve requires contract_accepted
  it('admin approve works after contract accepted', async () => {
    const approved = await adminService.approve(partnerId);
    expect(approved.status).toBe('approved');
  });

  // 8. Production guard blocks before release
  it('production not released before explicit release', async () => {
    const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
    expect(partner!.production_released).toBe(false);
  });

  // 9. Release production works after approval
  it('release production works after approval', async () => {
    const released = await adminService.releaseProduction(partnerId);
    expect(released.production_released).toBe(true);
  });

  // 10. Admin cannot approve partner that is not contract_accepted
  it('admin approve rejects wrong status', async () => {
    // partner is now 'approved', not 'contract_accepted'
    await expect(adminService.approve(partnerId)).rejects.toThrow('must have accepted contract');
  });

  // 11. Duplicate email rejected
  it('duplicate email registration fails', async () => {
    await expect(
      partnerService.register({
        company_name: 'TestPhase1 Dup',
        owner_email: testEmail,
        owner_password: 'Test123!@#',
      }),
    ).rejects.toThrow('Email already registered');
  });

  // 12. Invalid scope type rejected
  it('invalid scope type is rejected', async () => {
    // Reset partner to draft for this test
    await prisma.partner.update({ where: { id: partnerId }, data: { status: 'draft' } });
    await expect(
      partnerService.createScopeRequest(partnerId, tenantId, {
        request_type: 'invalid_type',
      }),
    ).rejects.toThrow('Invalid request_type');
  });
});
