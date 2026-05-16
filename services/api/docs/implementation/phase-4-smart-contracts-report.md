# FASE 4 — Smart Contracts — Relatório

Data: 2026-05-16
Status: Concluida
Testes: 8/8 contrato + 41/41 backend (total 49)

## Arquivos Criados

- contracts/src/SGLEvidenceAnchor.sol — contrato de ancoragem de evidencias
- contracts/scripts/deploy.ts — script de deploy para Sepolia
- contracts/test/SGLEvidenceAnchor.test.ts — 8 testes
- contracts/tsconfig.json

## Arquivos Alterados

- contracts/hardhat.config.ts — adicionado paths.sources para src/

## Contrato SGLEvidenceAnchor

Funcionalidades:
- anchorEvidence: ancora evidence hash, procedure ID, wallet, protocolo
- verifyEvidence: consulta publica por evidence ID
- getEvidenceCount: total de evidencias ancoradas
- Ownable: apenas owner pode ancorar (sera o backend/validator)
- Emite evento EvidenceAnchored para indexacao

Restricoes:
- Rejeita evidence duplicada
- Rejeita hash zero
- Rejeita chamadas de nao-owner
- Armazena apenas hashes e IDs pseudonimizados (sem dados pessoais)

## Testes de Contrato

1. Ancora evidence com sucesso
2. Emite evento EvidenceAnchored
3. Verifica evidence ancorada
4. Rejeita evidence duplicada
5. Rejeita hash zero
6. Rejeita nao-owner
7. Retorna false para evidence inexistente
8. Conta evidencias corretamente

## Nota sobre SGLToken

O contrato SGLToken (ERC-20 com burn de 2%) ja existia em src/.
Nao foi alterado. Sera utilizado quando necessario.

## Proximos Passos (FASE 5)

1. Web3AnchoringService no backend (ethers.js + contrato)
2. Integrar evidence -> blockchain tx hash
3. Atualizar Web3Transaction no banco
4. AuditSGL mock integration
