# FASE 2 — Procedures + Customers + Magic Links — Relatório

Data: 2026-05-16
Status: Concluída
Testes: 29/29 (5 suites)

## Arquivos Criados

- src/modules/customer/customer.service.ts
- src/modules/customer/customer.controller.ts
- src/modules/customer/customer.module.ts
- src/modules/customer/dto/create-customer.dto.ts
- src/modules/procedure/procedure.service.ts
- src/modules/procedure/procedure.controller.ts
- src/modules/procedure/procedure.module.ts
- src/modules/procedure/dto/create-procedure.dto.ts
- src/modules/procedure/dto/add-participant.dto.ts
- test/phase2.spec.ts (10 testes)

## Arquivos Alterados

- src/modules/magiclink/magiclink.controller.ts — protegido com JWT+Tenant+ProductionGuard (create/revoke), consume permanece publico
- src/app.module.ts — adicionados CustomerModule e ProcedureModule, removido ContractModule (duplicado)

## Arquivos Removidos

- src/modules/contract/* — rota duplicada com PartnerController

## Endpoints Implementados

Customer (todos JWT+Tenant+ProductionGuard):
- POST /customers — criar cliente
- GET /customers — listar clientes do parceiro
- GET /customers/:id — detalhe do cliente

Procedure (todos JWT+Tenant+ProductionGuard):
- POST /procedures — criar procedimento
- GET /procedures — listar procedimentos
- GET /procedures/:id — detalhe
- POST /procedures/:id/participants — adicionar participante
- GET /procedures/:id/participants — listar participantes
- POST /procedures/:id/participants/:participantId/send-link — enviar magic link

Magic Link (atualizado):
- POST /magic-links/create — protegido (JWT+Tenant+ProductionGuard)
- POST /magic-links/consume — publico (cliente consome token)
- POST /magic-links/:id/revoke — protegido (JWT+Tenant)

## Testes FASE 2

1. Cria customer para parceiro
2. Lista customers por parceiro
3. Cria procedure com tipo valido
4. Rejeita tipo de procedure invalido
5. Adiciona participante a procedure draft
6. Lista participantes
7. Envia magic link e muda status para in_progress
8. Rejeita participante em procedure nao-draft
9. Isolamento de tenant em procedures
10. Isolamento de tenant em customers

## Regras de Negocio Validadas

- Procedures so podem ser criados por parceiros com producao liberada (ProductionGuard)
- Participantes so podem ser adicionados em procedures com status draft
- Magic link muda procedure de draft para in_progress
- Tenant isolation funciona em customers e procedures
- Tipos de procedure validados contra lista fixa

## Pendencias

- Validacao DTO com class-validator ou Zod
- Testes e2e HTTP com supertest
- Fluxo completo do customer (assinatura, wallet, evidence)

## Proximos Passos (FASE 3)

1. Customer flow — consumo do magic link com confirmacao de dados
2. Canvas signature hash
3. Wallet generation client-side (placeholder backend)
4. Evidence generation ao completar participante
5. Protocol number generation
