import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getTenantStore } from '../modules/tenant/tenant-context';

const MODEL_NAMES = [
  'partner', 'partnerBranding', 'partnerTenant', 'partnerResponsible',
  'partnerScopeRequest', 'partnerContract', 'partnerUser', 'customer',
  'customerWallet', 'procedure', 'procedureParticipant', 'procedureLink',
  'evidence', 'web3Transaction', 'auditRecord',
];

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    for (const model of MODEL_NAMES) {
      const original = (this as any)[model];
      Object.defineProperty(this, model, {
        get() {
          const store = getTenantStore();
          if (store?.tx) {
            return store.tx[model];
          }
          return original;
        },
      });
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async withTenant<T>(tenantId: string, fn: (tx: any) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SELECT set_config('app.current_tenant_id', $1, true)`,
        tenantId,
      );
      return fn(tx);
    });
  }

  async withBypass<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    return this.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        `SELECT set_config('app.bypass_rls', 'on', true)`,
      );
      return fn(tx);
    });
  }
}
