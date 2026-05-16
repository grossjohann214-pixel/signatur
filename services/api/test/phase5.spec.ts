import { Test, TestingModule } from '@nestjs/testing';
import { Web3Service } from '../src/modules/web3/web3.service';
import { AuditService } from '../src/modules/audit/audit.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Phase 5 - Web3 + Audit', () => {
  let web3Service: Web3Service;
  let auditService: AuditService;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Web3Service, AuditService, PrismaService],
    }).compile();

    web3Service = module.get(Web3Service);
    auditService = module.get(AuditService);
    prisma = module.get(PrismaService);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.auditRecord.deleteMany({ where: { entity_type: 'test_phase5' } });
    await prisma.$disconnect();
  });

  // 1. Web3 not configured returns null gracefully
  it('web3 not configured returns null', async () => {
    expect(web3Service.isConfigured()).toBe(false);
    const result = await web3Service.anchorEvidence({
      evidenceId: 'test',
      evidenceHash: 'hash',
      procedureId: 'proc',
      participantWallet: '0x0',
      protocolNumber: 'SGL-TEST',
    });
    expect(result).toBeNull();
  });

  // 2. Audit record creation
  it('creates audit record', async () => {
    const record = await auditService.record({
      entity_type: 'test_phase5',
      entity_id: 'test-entity-001',
      action: 'test_action',
      evidence_hash: 'abc123',
      protocol_number: 'SGL-TEST-001',
    });
    expect(record.id).toBeDefined();
    expect(record.entity_type).toBe('test_phase5');
    expect(record.action).toBe('test_action');
  });

  // 3. Audit query by entity
  it('queries audit by entity', async () => {
    const records = await auditService.getByEntity('test_phase5', 'test-entity-001');
    expect(records.length).toBeGreaterThanOrEqual(1);
    expect(records[0].action).toBe('test_action');
  });

  // 4. AuditSGL mock submission
  it('mock AuditSGL returns verified', async () => {
    // Create a temp evidence to update
    const evidence = await prisma.evidence.create({
      data: { schema_version: '1.0', evidence_hash: 'test_hash_phase5' },
    });

    const result = await auditService.submitToAuditSGL(evidence.id, 'test_hash_phase5', 'tx_abc');
    expect(result.audit_id).toMatch(/^AUDIT-/);
    expect(result.status).toBe('verified');
    expect(result.risk_score).toBe(0);

    // Verify evidence updated
    const updated = await prisma.evidence.findUnique({ where: { id: evidence.id } });
    expect(updated!.audit_response_id).toBe(result.audit_id);

    // Cleanup
    await prisma.evidence.delete({ where: { id: evidence.id } });
  });
});
