import { MagicLinkService } from '../src/modules/magiclink/magiclink.service';

describe('MagicLinkService', () => {
  let service: MagicLinkService;
  const fakePrisma: any = {
    procedureLink: {
      create: jest.fn(async ({ data }) => ({ id: '1', ...data })),
      findFirst: jest.fn(async ({ where }) => ({ id: '1', token_hash: where.token_hash, status: 'created', expires_at: new Date(Date.now() + 10000) })),
      update: jest.fn(async ({ where, data }) => ({ id: where.id, ...data })),
    },
  };
  const fakeSender = { sendMagicLink: jest.fn(async () => true) };

  beforeEach(() => {
    service = new MagicLinkService(fakePrisma as any, fakeSender as any);
  });

  it('creates link and returns token', async () => {
    const res = await service.createLink('proc1', 'part1', 60);
    expect(res.token).toBeDefined();
    expect(res.link).toBeDefined();
    expect(fakePrisma.procedureLink.create).toHaveBeenCalled();
  });

  it('consumes token successfully', async () => {
    // create token then consume
    const { token } = await service.createLink('proc1', 'part1', 60);
    // override findFirst to return matching link with id
    fakePrisma.procedureLink.findFirst.mockResolvedValueOnce({ id: '1', token_hash: 'x', status: 'created', expires_at: new Date(Date.now() + 10000) });
    fakePrisma.procedureLink.update.mockResolvedValueOnce({ id: '1', status: 'completed' });

    // call consumeToken with token (sha256 will not match 'x' but test focuses on flow)
    await expect(service.consumeToken(token)).resolves.toBeDefined();
  });
});
