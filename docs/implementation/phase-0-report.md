# Phase 0 Report (Template)

**Phase:** 0 — Infraestrutura de Base
**Data:** 2026-05-16
**Autor:** TBD

## Arquivos criados

- docs/implementation/plan.md
- docs/implementation/current-state.md
- docs/implementation/tokenomics-integration.md
- docs/implementation/tokenomics-update-report.md
- packages/types/index.ts
- packages/validation/index.ts
- packages/crypto/index.ts
- packages/config/index.ts
- services/api/prisma/schema.prisma
- services/api/jest.config.ts

## Arquivos alterados

- services/api/package.json (adicionados deps jwt/passport/bcrypt/@prisma/client/prisma e seed config)
- services/api/src/app.module.ts (registro de novos módulos)
- services/api/src/modules/auth/* (novo AuthController e bcrypt login)
- services/api/src/modules/tenant/tenant.guard.ts (novo)
- services/api/src/modules/magiclink/* (novo)
- services/api/src/modules/evidence/* (novo)
- services/api/src/modules/magiclink/magiclink.sender.ts (mock provider de envio)
- services/api/prisma/seed.js (seed em JS para compatibilidade local)
- services/api/.env (local service env para Docker Compose)
- docker-compose.yml (senha do Postgres alinhada ao DATABASE_URL local)

## Comandos executados

```bash
cd /workspaces/signatur
docker compose down -v
docker compose up -d postgres redis
pnpm install
cd services/api
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init_singulai_validate
pnpm exec prisma db seed
pnpm test
```

## Dependências adicionadas

- @nestjs/jwt, @nestjs/passport, passport, passport-jwt, bcrypt, @prisma/client, prisma
- @jest/types para suportar o ambiente de testes TypeScript do Jest

## Decisões técnicas

- Autenticação JWT com `@nestjs/jwt`, `passport-jwt` e guarda `JwtAuthGuard`.
- RBAC via decorator `Roles()` e `RolesGuard`, com exemplo de rota admin em `PartnerController`.
- Tenant isolation obrigatória via `TenantGuard` que exige `tenant_id` em token ou cabeçalho e rejeita mismatch.
- Magic links mantêm apenas `token_hash` no banco, têm `expires_at`, `revoked_at`, são de uso único e token plano é retornado somente na criação.
- Foi criada abstração de envio `MockMagicLinkSender` para FASE 0, sem integração real de e-mail/SMS.
- EvidenceService gera JSON canônico recursivo e hash SHA-256 determinístico com versão de schema.

## Pendências

- Adicionar fluxo completo de onboarding de usuários e endpoint de registro seguro.
- Revisar e centralizar `TenantGuard` / `RBAC` com políticas de RLS Postgres para reforçar isolamento por `tenant_id`.
- Implementar envio de magic links real e auditoria de entrega segura.
- Expandir testes de integração com banco real, rotas autenticadas e fixtures de Prisma.

## Resultado dos testes

- `pnpm test` em `services/api` passou com todos os testes unitários:
  - `test/tenant.guard.spec.ts` ✅
  - `test/magiclink.service.spec.ts` ✅
  - `test/evidence.service.spec.ts` ✅

## Próximos passos para FASE 1

- Adicionar endpoints de gestão de usuário e refresh token robusto.
- Implementar controle de acesso mais granular para parceiros e administradores.
- Expandir o backend com `Procedure`, `Participant` e integração de assinatura digital.
- Adicionar pipeline CI para verificar migrations, testes e segurança de dependências.

## Riscos

- Testes que dependem de `PrismaService` devem apontar para um banco de teste ou usar mocks.
- Não foram criados ou alterados contratos SGL — conforme instruções, não criar novo token SGL.

## Próximos passos para FASE 1

- Implementar `AuthController` endpoints de login/refresh e integração com `TenantGuard`.
- Implementar envio seguro de magic links (provider) e rotas de auditoria.
- Converter comparações de senha para `bcrypt` e adicionar fluxos de recuperação.
- Adicionar testes de integração com um banco ephemeral (Docker) e CI pipeline.
