# Phase 1 Endpoints Manual Patch

## Status

Endpoints Partner/Admin Phase 1 implementados por patch manual via terminal.

## Endpoints adicionados/validados

### Partner

- POST /partners/register
- GET /partners/me
- GET /partners/me/status
- POST /partners/me/scope-request
- GET /partners/me/scope-request
- GET /partners/me/generated-contract
- POST /partners/me/accept-contract

### Admin

- GET /admin/partners/pending
- GET /admin/partners/:id
- POST /admin/partners/:id/approve
- POST /admin/partners/:id/reject
- POST /admin/partners/:id/request-changes
- POST /admin/partners/:id/release-production

## Regras implementadas

- Cadastro do parceiro cria Partner, Tenant e PartnerUser.
- Senha salva com bcrypt.
- passwordHash/password_hash não retornado.
- Scope request valida tipos permitidos.
- Contrato HTML gerado com hash.
- Aceite de contrato gera hash de aceite.
- Admin endpoints exigem role admin.
- Release production exige partner aprovado e contrato aceito.
- Production release registrado no tenant.

## Validação

Executar:

cd /workspaces/signatur/services/api
pnpm build
pnpm test

