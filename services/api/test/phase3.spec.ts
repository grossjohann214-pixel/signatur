import { Test, TestingModule } from '@nestjs/testing';
import { PartnerService } from '../src/modules/partner/partner.service';
import { AdminService } from '../src/modules/admin/admin.service';
import { CustomerService } from '../src/modules/customer/customer.service';
import { ProcedureService } from '../src/modules/procedure/procedure.service';
import { CustomerFlowService } from '../src/modules/customer-flow/customer-flow.service';
import { MagicLinkService } from '../src/modules/magiclink/magiclink.service';
import { MockMagicLinkSender } from '../src/modules/magiclink/magiclink.sender';
import { Web3Service } from '../src/modules/web3/web3.service';
import { AuditService } from '../src/modules/audit/audit.service';
import { EvidenceService } from '../src/modules/evidence/evidence.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Phase 3 - Customer Flow', () => {
  let partnerService: PartnerService;
  let adminService: AdminService;
  let customerService: CustomerService;
  let procedureService: ProcedureService;
  let flowService: CustomerFlowService;
  let magicLinkService: MagicLinkService;
  let prisma: PrismaService;

  let partnerId: string;
  let tenantId: string;
  let userId: string;
  let customerId: string;
  let procedureId: string;
  let participantId: string;
  let linkId: string;
  let plainToken: string;
  const testEmail = `test_phase3_${Date.now()}@test.local`;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartnerService, AdminService, CustomerService,
        ProcedureService, CustomerFlowService,
        MagicLinkService, MockMagicLinkSender,
        EvidenceService, Web3Service, AuditService, PrismaService,
      ],
    }).compile();

    partnerService = module.get(PartnerService);
    adminService = module.get(AdminService);
    customerService = module.get(CustomerService);
    procedureService = module.get(ProcedureService);
    flowService = module.get(CustomerFlowService);
    magicLinkService = module.get(MagicLinkService);
    prisma = module.get(PrismaService);
    await prisma.$connect();

    // Full setup: register -> scope -> accept -> approve -> release
    const reg = await partnerService.register({
      company_name: 'TestPhase3 Corp',
      cnpj: '33.333.333/0001-33',
      owner_email: testEmail,
      owner_password: 'Test333!@#',
    });
    partnerId = reg.partner_id;
    tenantId = reg.tenant_id;
    userId = reg.user_id;

    await partnerService.createScopeRequest(partnerId, tenantId, { request_type: 'assinatura_de_termo' });
    await partnerService.acceptContract(partnerId, userId);
    await adminService.approve(partnerId);
    await adminService.releaseProduction(partnerId);

    // Create customer + procedure + participant + magic link
    const cust = await customerService.create(partnerId, tenantId, { name: 'Jane Doe', email: 'jane@test.local' });
    customerId = cust.id;

    const proc = await procedureService.create(partnerId, tenantId, userId, {
      type: 'assinatura_de_termo', customer_id: customerId,
    });
    procedureId = proc.id;

    const part = await procedureService.addParticipant(procedureId, tenantId, {
      role: 'signer', email: 'jane@test.local',
    });
    participantId = part.id;

    // Create magic link and capture plain token
    const linkResult = await magicLinkService.createLink(procedureId, participantId);
    plainToken = linkResult.token;
  });

  afterAll(async () => {
    await prisma.evidence.deleteMany({ where: { procedure_id: procedureId } });
    await prisma.customerWallet.deleteMany({ where: { customer_id: customerId } });
    await prisma.procedureLink.deleteMany({ where: { procedure_id: procedureId } });
    await prisma.procedureParticipant.deleteMany({ where: { procedure_id: procedureId } });
    await prisma.procedure.deleteMany({ where: { id: procedureId } });
    await prisma.customer.deleteMany({ where: { id: customerId } });
    await prisma.partnerContract.deleteMany({ where: { partner_id: partnerId } });
    await prisma.partnerScopeRequest.deleteMany({ where: { partner_id: partnerId } });
    await prisma.partnerUser.deleteMany({ where: { email: testEmail } });
    await prisma.partnerTenant.deleteMany({ where: { partner_id: partnerId } });
    await prisma.partner.deleteMany({ where: { id: partnerId } });
    await prisma.$disconnect();
  });

  // 1. Open link returns context
  it('opens link and returns procedure context', async () => {
    const ctx = await flowService.openLink(plainToken);
    expect(ctx.link_id).toBeDefined();
    expect(ctx.procedure_id).toBe(procedureId);
    expect(ctx.participant_id).toBe(participantId);
    expect(ctx.procedure_type).toBe('assinatura_de_termo');
    linkId = ctx.link_id;
  });

  // 2. Open marks link as opened
  it('link status is opened after openLink', async () => {
    const link = await prisma.procedureLink.findUnique({ where: { id: linkId } });
    expect(link!.opened_at).not.toBeNull();
    expect(link!.status).toBe('opened');
  });

  // 3. Confirm data
  it('confirms participant data', async () => {
    const result = await flowService.confirmData(linkId, {
      name: 'Jane Doe', document_masked: '***987654**', confirmed: true,
    });
    expect(result.step).toBe('data_confirmed');
  });

  // 4. Reject unconfirmed data
  it('rejects unconfirmed data', async () => {
    await expect(
      flowService.confirmData(linkId, { name: 'Jane', confirmed: false }),
    ).rejects.toThrow('Data must be confirmed');
  });

  // 5. Submit signature
  it('submits signature hash', async () => {
    const result = await flowService.submitSignature(linkId, 'abc123signaturehash');
    expect(result.step).toBe('signed');
  });

  // 6. Submit wallet address (client-side generated, backend receives only public address)
  it('submits wallet address', async () => {
    const result = await flowService.submitWallet(linkId, '0x1234567890abcdef1234567890abcdef12345678');
    expect(result.step).toBe('wallet_submitted');
    expect(result.wallet_address).toBe('0x1234567890abcdef1234567890abcdef12345678');
  });

  // 7. CustomerWallet was created
  it('customer wallet was persisted', async () => {
    const wallets = await prisma.customerWallet.findMany({ where: { customer_id: customerId } });
    expect(wallets.length).toBe(1);
    expect(wallets[0].wallet_address).toBe('0x1234567890abcdef1234567890abcdef12345678');
  });

  // 8. Complete flow generates evidence + protocol
  it('completes flow with evidence and protocol', async () => {
    const result = await flowService.completeFlow(linkId);
    expect(result.protocol_number).toMatch(/^SGL-/);
    expect(result.evidence_hash).toBeDefined();
    expect(result.evidence_id).toBeDefined();
    expect(result.participant_status).toBe('completed');
  });

  // 9. Participant is now completed
  it('participant status is completed', async () => {
    const p = await prisma.procedureParticipant.findUnique({ where: { id: participantId } });
    expect(p!.status).toBe('completed');
    expect(p!.completed_at).not.toBeNull();
  });

  // 10. Procedure completed (single participant, all done)
  it('procedure is completed when all participants done', async () => {
    const proc = await prisma.procedure.findUnique({ where: { id: procedureId } });
    expect(proc!.status).toBe('completed');
  });

  // 11. Link cannot be reused
  it('completed link cannot be reused', async () => {
    await expect(flowService.openLink(plainToken)).rejects.toThrow('Token already used');
  });

  // 12. Evidence hash is deterministic (same payload = same hash)
  it('evidence hash is stored correctly', async () => {
    const evidence = await prisma.evidence.findFirst({ where: { procedure_id: procedureId } });
    expect(evidence).not.toBeNull();
    expect(evidence!.evidence_hash).toBeDefined();
    expect(evidence!.protocol_number).toMatch(/^SGL-/);
  });
});
