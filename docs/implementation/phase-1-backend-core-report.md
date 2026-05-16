
# Phase 1 Backend Core - Implementation Report

## 📋 Status

✅ **Endpoints Partner/Admin Phase 1 implementados com sucesso**

## 🔧 Arquivos Modificados

### Partner Module
- **partner.controller.ts** — Endpoints de onboarding e workflow
- **partner.service.ts** — Lógica de cadastro, status, scope, contrato e aceitação

### Admin Module  
- **admin.controller.ts** — Endpoints de gestão de parceiros
- **admin.service.ts** — Lógica de aprovação, rejeição, mudanças e release

## 🎯 Endpoints Implementados

### Partner Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/partners/register` | Cadastro novo parceiro | ❌ Público |
| GET | `/partners/me` | Dados do parceiro autenticado | ✅ JWT + Tenant |
| GET | `/partners/me/status` | Status agregado | ✅ JWT + Tenant |
| POST | `/partners/me/scope-request` | Solicitar scope de procedimentos | ✅ JWT + Tenant |
| GET | `/partners/me/scope-request` | Listar scope requests | ✅ JWT + Tenant |
| GET | `/partners/me/generated-contract` | Obter contrato gerado | ✅ JWT + Tenant |
| POST | `/partners/me/accept-contract` | Aceitar contrato com hash | ✅ JWT + Tenant |

### Admin Endpoints

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/admin/partners/pending` | Listar parceiros em revisão | ✅ JWT + Admin |
| GET | `/admin/partners/:id` | Detalhes do parceiro | ✅ JWT + Admin |
| POST | `/admin/partners/:id/approve` | Aprovar parceiro | ✅ JWT + Admin |
| POST | `/admin/partners/:id/reject` | Rejeitar parceiro | ✅ JWT + Admin |
| POST | `/admin/partners/:id/request-changes` | Solicitar alterações | ✅ JWT + Admin |
| POST | `/admin/partners/:id/release-production` | Liberar produção | ✅ JWT + Admin |

## 🔐 Regras de Negócio

### Cadastro (`register`)
- Validação email + verificação duplicado
- Senha hasheada com bcrypt (10 rounds)
- Criação atomizada: Partner + Tenant + PartnerUser
- Status: draft, configuring; Production bloqueada

### Status Agregado
- Retorna: partner_status, tenant_status, scope_status, contract_status
- Calcula next_steps baseado no fluxo
- Retorna production_released flag

### Scope Request
- Valida tipos de procedimento (13 tipos permitidos)
- Status: pending_review
- Suporta múltiplos tipos

### Contrato
- HTML gerado com dados do parceiro
- Hash SHA256 canonicalizado
- Reutilizado se já existir

### Aceite de Contrato
- Valida existência (gera se necessário)
- Hash de aceitação canonicalizado
- Registra: accepted_at, accepted_by, IP, User-Agent
- Status: accepted

### Admin Actions
- Approve: Partner → approved + Tenant → approved
- Reject: Partner → rejected + Tenant → rejected
- Request Changes: Partner → changes_requested + Tenant → changes_requested
- Release Production: Requer approved + contract accepted

## 🛡️ Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Passwordhash nunca retornado (sanitizeUser)
- ✅ Admin role obrigatório (assertAdmin)
- ✅ Production release validação dupla
- ✅ Hashes determinísticos para audit
- ✅ IP/User-Agent rastreados

## 📊 Fluxo Completo

1. POST /partners/register → Partner (draft) + Tenant (configuring) + PartnerUser
2. POST /auth/login → JWT token
3. GET /partners/me/status → Status agregado
4. POST /partners/me/scope-request → PartnerScopeRequest (pending_review)
5. GET /partners/me/generated-contract → HTML contrato gerado
6. POST /partners/me/accept-contract → Contract (accepted) + acceptance_hash
7. [ADMIN] POST /admin/partners/:id/approve → Partner (approved)
8. [ADMIN] POST /admin/partners/:id/release-production → Tenant (production_released: true)
9. POST /procedures → Permitido (ProductionGuard validado)

## 📝 Validação

Execute localmente:

```bash
cd /workspaces/signatur/services/api
pnpm build
pnpm test
```

**Casos de teste essenciais:**
- Register cria Partner + Tenant + User com senha hasheada
- Login retorna JWT + senha comparada com bcrypt
- Status retorna aggregate correto
- Scope request valida tipos
- Contrato gerado com hash determinístico
- Aceite contrato gera acceptance_hash
- Admin approve requer role admin
- Release production requer approved + contract accepted
- ProductionGuard bloqueia sem production_released

## 🚀 Próximas Tarefas

- [ ] Executar pnpm build
- [ ] Executar pnpm test
- [ ] Testar fluxo manual: register → login → scope → accept → approve → release
- [ ] Validar ProductionGuard em procedures/customers
- [ ] Preparar commit
- [ ] Abrir PR

### Validação esperada

- `pnpm build`
- `pnpm test`


## Phase 1 Hotfix — Compatibility

### Problemas corrigidos

- Import compatível para `JwtAuthGuard`.
- Import compatível para `RolesGuard`.
- `AdminService.approve` agora aceita chamada antiga `approve(partnerId)` e chamada nova `approve(user, partnerId)`.
- `AdminService.releaseProduction` agora aceita chamada antiga `releaseProduction(partnerId)` e chamada nova `releaseProduction(user, partnerId)`.
- Retorno de `approve` e `releaseProduction` inclui propriedades top-level usadas pelos testes: `status` e `production_released`.
- `PartnerService.createScopeRequest` agora aceita chamada antiga `createScopeRequest(partnerId, tenantId, body)` e chamada nova `createScopeRequest(user, body)`.

### Validação

Executar:

```bash
cd /workspaces/signatur/services/api
pnpm build
pnpm test
cd /workspaces/signatur

echo "=== HOTFIX PHASE 1 — COMPATIBILIDADE COM TESTES EXISTENTES ==="

echo "--- Descobrir guards reais ---"
find services/api/src/modules/auth -type f -maxdepth 4 | sort
grep -RIn "class JwtAuthGuard\|export class JwtAuthGuard\|class RolesGuard\|export class RolesGuard" services/api/src/modules/auth || true

echo "--- Criar wrappers de compatibilidade para imports antigos, se necessário ---"
cd /workspaces/signatur/services/api

if [ ! -f src/modules/auth/jwt-auth.guard.ts ]; then
  JWT_FILE=$(grep -RIl "class JwtAuthGuard\|export class JwtAuthGuard" src/modules/auth | head -n 1 || true)
  if [ -n "$JWT_FILE" ]; then
    REL=$(python3 - <<PY
from pathlib import Path
src = Path("$JWT_FILE")
base = Path("src/modules/auth/jwt-auth.guard.ts").parent
print("./" + str(src.relative_to(base)).replace(".ts",""))
PY
)
    cat > src/modules/auth/jwt-auth.guard.ts <<EOF
export { JwtAuthGuard } from '$REL';
