import { EvidenceService } from '../src/modules/evidence/evidence.service';

describe('EvidenceService', () => {
  const fakePrisma: any = { evidence: { create: jest.fn(async ({ data }) => ({ id: 'e1', ...data })) } };
  const svc = new EvidenceService(fakePrisma as any);

  it('produces deterministic canonical hash', () => {
    const a = { b: 1, a: 2 };
    const r1 = svc.canonicalizeAndHash(a);
    const r2 = svc.canonicalizeAndHash({ a: 2, b: 1 });
    expect(r1.hash).toEqual(r2.hash);
  });

  it('creates evidence record', async () => {
    const rec = await svc.createEvidence('proc1', { foo: 'bar' });
    expect(rec.id).toBe('e1');
  });
});
