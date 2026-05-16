import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  tenantId?: string;
  bypass?: boolean;
  tx?: any;
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>();

export function getTenantStore(): TenantStore | undefined {
  return tenantStorage.getStore();
}
