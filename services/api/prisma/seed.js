const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SELECT set_config('app.bypass_rls', 'on', true)`);

    const partner = await tx.partner.create({
      data: {
        company_name: 'ACME Partners Ltd',
        cnpj: '00.000.000/0001-00',
        trading_name: 'ACME',
        status: 'draft',
        production_released: false,
        created_by: 'system',
        tenant_id: 'default_tenant',
      },
    });

    await tx.partnerBranding.create({
      data: { partner_id: partner.id, display_name: 'ACME' },
    });

    const partnerPasswordHash = await bcrypt.hash('S1ngulAI!Dev', 12);
    await tx.partnerUser.create({
      data: {
        tenant_id: 'default_tenant',
        partner_id: partner.id,
        email: 'owner@acme.local',
        password: partnerPasswordHash,
        role: 'admin',
        is_owner: true,
      },
    });
  });

  console.log('Seed finished.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
