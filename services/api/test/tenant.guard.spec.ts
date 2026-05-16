import { TenantGuard } from '../src/modules/tenant/tenant.guard';

function makeCtx(headers: any, user: any) {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ headers, user }),
    }),
    getHandler: () => {},
    getClass: () => {},
  } as any;
}

describe('TenantGuard', () => {
  const guard = new TenantGuard();

  it('allows when tenant in headers', () => {
    const ctx = makeCtx({ 'x-tenant-id': 't1' }, null);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws when tenant missing', () => {
    const ctx = makeCtx({}, null);
    expect(() => guard.canActivate(ctx)).toThrow();
  });

  it('throws on mismatch between user and header tenant', () => {
    const ctx = makeCtx({ 'x-tenant-id': 't1' }, { tenant_id: 't2' });
    expect(() => guard.canActivate(ctx)).toThrow();
  });
});
