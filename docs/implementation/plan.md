# SingulAI Validate — Implementation Plan (Updated)

**Status:** APPROVED (with Tokenomics integration)
**Branch:** feature/singulai-validate-white-label
**Last Updated:** 2026-05-16

## TL;DR
Implementar plataforma multi-tenant white label (MVP end-to-end) para validação de procedimentos com Web3 integrado. Prioridade absoluta: partner onboarding → contrato HTML/PDF → aprovação SingulAI → liberação dashboard produção → criação de cliente → criação de procedimento → participantes → magic link → confirmação de dados → assinatura em tela → wallet SGL client-side → hash canônico → Sepolia → protocolo → AuditSGL.

## Nota sobre timeline
Estimativa agressiva: ~3 semanas para MVP end-to-end; não é garantia — risco alto dependendo de integração Web3 e auditoria.

## FASE 0 — Infraestrutura de Base (2-3 dias)
- Shared packages: `packages/types`, `packages/validation`, `packages/crypto`, `packages/config`
- Prisma schema inicial em `services/api/prisma/schema.prisma`
- Migrations iniciais e seed/factories
- Setup de testes (Jest) e fixtures
- Documentação inicial (docs/implementation)

## FASE 1 — Backend API Core (5-7 dias)
- NestJS modules: Auth, Partner, Branding, Contract (HTML→PDF), ScopeApproval, AdminReview, Tenant, MagicLink, Common
- Endpoints mínimos (partners register, branding, scope request, generated-contract, admin review)

## FASE 2 — Partner Portal Frontend (5-7 dias)
- Onboarding flow, Branding, Contract preview, Status tracking, Production dashboard (clientes, procedimentos, participantes, templates, links, auditoria)

## FASE 3 — Customer Link Frontend (4-5 dias)
- Mobile-first flow: magic link, data confirmation, signature canvas, selfie/geolocation (opt-in), wallet BIP39 client-side with positional validation (words 4,8,12), send only public `wallet_address` to backend, protocol receipt

## FASE 4 — Web3 Validate + Integração Tokenomics Existente (3-4 dias)
Objetivo: integrar o módulo Validate com os contratos tokenomics já existentes e criar apenas os contratos complementares necessários ao Validate.

Passos:
- Mapear contratos tokenomics existentes e confirmar deploy Sepolia
- Criar interfaces quando requerido: `ISGLToken.sol`, `IFeeManager.sol`, `IStakingPool.sol`, `IEscrowContract.sol`
- Implementar contratos complementares: `SGLValidateRegistry.sol`, `SGLParticipantRegistry.sol`, `SGLEvidenceAnchor.sol`
- Garantir imports compatíveis com OpenZeppelin 5.x
- Integrar backend (Viem) com the `SGLToken` existente para leitura (balanceOf, allowance quando aplicável)
- Registrar evidences/hashes/status no fluxo Validate e emitir eventos on-chain quando aplicável
- Não criar novo token; não alterar tokenomics core sem autorização

Resultado esperado:
- Interfaces criadas (se necessário)
- Contratos complementares compiláveis e testados localmente
- Backend capaz de registrar referências em Sepolia (ou usar mock se Sepolia não disponível)

## FASE 5 — Admin Console + AuditSGL (3-4 dias)
- Admin review, metrics, audit adapter (mock), webhooks

## FASE 6 — Testing + CI/CD (incremental)
- Jest unit tests, Hardhat tests, E2E smoke tests, GitHub Actions

## Regras de segurança (invioláveis)
- Nunca armazenar seed phrase ou private keys
- Nunca enviar mnemonic ao backend
- Backend recebe apenas `wallet_address` público
- Magic link token salvo somente como `token_hash`
- Dados pessoais NUNCA são enviados on-chain — somente hashes e pseudônimos
- Todo dado operacional inclui `tenant_id` e `partner_id`

## Deliverables FASE 0
- docs/implementation/*.md (plan, current-state, tokenomics-integration, dependency-decisions, phase-0-report template)
- packages/types, packages/validation, packages/crypto, packages/config (stubs)
- `services/api/prisma/schema.prisma` (inicial)
- Jest config em `services/api`

---

## Próximos passos imediatos
1. Criar branch `feature/singulai-validate-white-label` e commitar estes documentos
2. Executar FASE 0: instalar dependências, gerar migrations, seeds e rodar testes unitários iniciais
3. Iniciar FASE 1 (Backend REST API) com foco em endpoints de partner onboarding e contract generation
