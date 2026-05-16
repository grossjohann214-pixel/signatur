# FASE 3 — Customer Flow — Relatório

Data: 2026-05-16
Status: Concluída
Testes: 41/41 (6 suites)

## Arquivos Criados

- src/modules/customer-flow/customer-flow.service.ts
- src/modules/customer-flow/customer-flow.controller.ts
- src/modules/customer-flow/customer-flow.module.ts
- src/modules/customer-flow/dto/confirm-data.dto.ts
- src/modules/customer-flow/dto/submit-signature.dto.ts
- src/modules/customer-flow/dto/submit-wallet.dto.ts
- test/phase3.spec.ts (12 testes)

## Arquivos Alterados

- src/app.module.ts — adicionado CustomerFlowModule

## Endpoints Implementados (todos publicos — acesso via magic link token)

- POST /flow/open — abre link, retorna contexto do procedimento
- POST /flow/:linkId/confirm — confirma dados do participante
- POST /flow/:linkId/sign — envia hash da assinatura (gerada client-side)
- POST /flow/:linkId/wallet — envia wallet address (gerada client-side)
- POST /flow/:linkId/complete — finaliza fluxo, gera evidence + protocolo

## Fluxo do Cliente

1. Cliente recebe magic link
2. POST /flow/open com token -> recebe contexto (procedure_type, participant_role)
3. POST /flow/:linkId/confirm -> confirma dados pessoais
4. POST /flow/:linkId/sign -> envia hash da assinatura canvas
5. POST /flow/:linkId/wallet -> envia wallet address publica (gerada client-side)
6. POST /flow/:linkId/complete -> gera evidence hash + protocolo SGL-XXXXX

## Regras de Negocio Validadas

- Link so pode ser aberto uma vez (uso unico)
- Link expirado/revogado rejeitado
- Dados devem ser confirmados (confirmed=true)
- Assinatura obrigatoria antes de completar
- Backend recebe apenas wallet_address publica (nunca private key/mnemonic)
- Evidence payload contem apenas hashes e IDs pseudonimizados (sem dados pessoais)
- Protocolo gerado com prefixo SGL-
- Procedure muda para completed quando todos participantes completam
- CustomerWallet criado automaticamente se procedure tem customer_id

## Testes FASE 3

1. Abre link e retorna contexto
2. Link marcado como opened
3. Confirma dados do participante
4. Rejeita dados nao confirmados
5. Envia hash da assinatura
6. Envia wallet address
7. CustomerWallet persistido
8. Complete gera evidence + protocolo
9. Participante marcado como completed
10. Procedure completed quando todos participantes concluem
11. Link nao pode ser reutilizado
12. Evidence hash armazenado corretamente

## Pendencias

- Rate limiting nas rotas publicas /flow/*
- Validacao DTO com class-validator
- Geolocation e selfie (opcionais, sprint futuro)

## Proximos Passos (FASE 4)

1. Smart contracts Solidity (SGLValidateRegistry, SGLEvidenceAnchor)
2. Hardhat setup + testes de contrato
3. Deploy script para Sepolia
4. Web3 anchoring service no backend
5. Integracao evidence -> blockchain tx hash
