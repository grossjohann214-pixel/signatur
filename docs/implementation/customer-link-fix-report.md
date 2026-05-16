# Customer Link Fix Report

## Status

Correções aplicadas ao fluxo Customer Link.

## Arquivos alterados

- apps/customer-link/src/lib/api.ts
- apps/customer-link/src/app/flow/sign/page.tsx
- apps/customer-link/src/app/flow/wallet/page.tsx

## Correções

### Assinatura

- Removido uso de require("crypto") em componente client-side.
- Hash da assinatura passou a usar Web Crypto API: crypto.subtle.digest("SHA-256").
- Canvas melhorado com pointer events.
- Suporte mobile com touchAction none.
- Validação de assinatura vazia.
- Envio apenas de signature_hash e timestamp.

### Wallet

- Wallet criada client-side com ethers.Wallet.createRandom().
- Exibição de endereço público.
- Download local de chave/frase de recuperação.
- Confirmação obrigatória de guarda da chave.
- Envio ao backend somente de:
  - wallet_address
  - network
  - key_saved_confirmation_hash
- Mnemonic/privateKey não são enviados ao backend.
- Estado sensível é limpo após confirmação.

### API

- Base URL padrão: http://localhost:4000.
- Tratamento padronizado de erros HTTP.
- Sem logs de payloads sensíveis.

## Comandos corretos

Backend:
cd /workspaces/signatur/services/api
pnpm dev

Partner Portal:
cd /workspaces/signatur/apps/partner-portal
pnpm dev

Customer Link:
cd /workspaces/signatur/apps/customer-link
pnpm dev

Admin Console:
cd /workspaces/signatur/apps/admin-console
pnpm dev

## Validações

Executar:

cd /workspaces/signatur/services/api && pnpm test
cd /workspaces/signatur/apps/customer-link && pnpm build

