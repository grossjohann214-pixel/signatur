# FASE 8 — Row Level Security — Relatório

Data: 2026-05-16
Status: Concluida
Testes: 54/54 (8 suites) + typecheck limpo

## Arquivos Criados

- prisma/migrations/20260516120000_enable_rls/migration.sql
- src/modules/tenant/tenant-context.ts (AsyncLocalStorage)
- src/modules/tenant/tenant-transaction.interceptor.ts
- test/helpers/rls.ts

## Arquivos Alterados

- src/prisma/prisma.service.ts — proxy de model + withTenant/withBypass
- src/app.module.ts — TenantTransactionInterceptor global
- src/modules/partner/partner.service.ts — register usa withBypass
- src/modules/auth/auth.service.ts — validateUser/validateJwtPayload usam withBypass
- prisma/seed.js — bypass de RLS no seed
- test/phase1|2|3.spec.ts — enableBypass no setup
- .env — DATABASE_URL=sgl_app, MIGRATE_DATABASE_URL=singulai
- package.json — scripts db:migrate, db:migrate:dev, db:seed

## Implementacao

RLS no PostgreSQL com isolamento por tenant_id em 7 tabelas:
Partner, PartnerTenant, PartnerScopeRequest, PartnerContract,
PartnerUser, Customer, Procedure.

Funcao sgl_tenant_check(tenant_id):
- retorna true se app.bypass_rls = 'on'
- senao compara tenant_id com app.current_tenant_id

## Descoberta Critica

O role 'singulai' era SUPERUSER (rolsuper=t), e superusers IGNORAM RLS
mesmo com FORCE ROW LEVEL SECURITY. A seguranca multi-tenant estava
inerte.

Solucao: role 'sgl_app' (rolsuper=f, rolbypassrls=f) para runtime da
aplicacao. Role 'singulai' reservado para migrations/seed (DDL).

## Estrategia de Transacao

- TenantTransactionInterceptor envolve cada request HTTP numa transacao
- SET LOCAL app.current_tenant_id (autenticado) ou app.bypass_rls (publico)
- AsyncLocalStorage propaga o tx para o PrismaService proxy
- Sem vazamento de tenant entre requests no connection pool

## Operacoes com Bypass (sem tenant)

- register (cria tenant do zero — porta de entrada)
- validateUser / validateJwtPayload (autenticacao roda antes do tenant)
- seed (operacao de sistema)
- testes (helper enableBypass)

## Validacao

Quando testes rodaram como sgl_app sem bypass: 39 falharam com
'42501: new row violates row-level security policy'.
Prova direta de que o RLS bloqueia acesso sem contexto de tenant.

## Pendencias

- Connection dedicada / pgbouncer para producao
- Teste e2e dedicado de cross-tenant (tenant A nao ve dados de tenant B)
- Web3 anchoring fora da transacao do request (evitar timeout)

## Proximos Passos

1. Teste cross-tenant explicito
2. Deploy VPS com Sepolia real
3. Mover anchoring Web3 para job assincrono
