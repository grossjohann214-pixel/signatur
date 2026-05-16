import { PrismaService } from '../../src/prisma/prisma.service';

/** Ativa bypass de RLS na conexao de teste (operacoes de sistema/seed/cleanup). */
export async function enableBypass(prisma: PrismaService) {
  await prisma.$executeRawUnsafe(`SET app.bypass_rls = 'on'`);
}

/** Seta um tenant especifico na conexao de teste (exercita RLS). */
export async function setTestTenant(prisma: PrismaService, tenantId: string) {
  await prisma.$executeRawUnsafe(`SET app.bypass_rls = 'off'`);
  await prisma.$executeRawUnsafe(
    `SELECT set_config('app.current_tenant_id', $1, false)`,
    tenantId,
  );
}
