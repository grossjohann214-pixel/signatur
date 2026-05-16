# Tokenomics Update Report

**Data:** 2026-05-16
**Autor:** TBD

## Resumo

- Tokenomics implementado localmente e testado (78 testes aprovados).
- Contratos locais informados pelo owner (endereços no ambiente local).
- Status: integrar `SGLToken` ao Validate em testnet; não alterar tokenomics core sem autorização.

## Verificação no repositório
- Encontrado no repo: NÃO (contratos tokenomics não estão versionados neste repositório)

## Ações realizadas
- Criados/atualizados:
  - `docs/implementation/tokenomics-integration.md`
  - `docs/implementation/plan.md` (FASE 4 atualizada)
  - `docs/implementation/current-state.md` (tokenomics adicionado)
  - `docs/implementation/tokenomics-update-report.md` (este arquivo)

## Pendências
- Confirmar deploy Sepolia para SGLToken, FeeManager, StakingPool, EscrowContract.
- Commit dos contratos tokenomics no repo (se desejado pelo owner).
- Aumentar cobertura de testes para 70%+.
- Revisão de segurança e jurídica.

## Próximos passos recomendados
1. Confirmar endereços Sepolia ou realizar deploy controlado.
2. Criar `ISGLToken.sol` + interfaces para FeeManager/Staking/Escrow se os contratos forem versionados aqui.
3. Implementar `SGLValidateRegistry`, `SGLParticipantRegistry`, `SGLEvidenceAnchor`.
4. Integrar backend (Viem) para leitura do `SGLToken` em testnet.
