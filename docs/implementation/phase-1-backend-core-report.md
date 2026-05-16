
## Jest Type Stabilization

Correção aplicada para testes TypeScript com Jest.

### Problema

Os testes falhavam com erros como:

- Cannot find name 'describe'
- Cannot find name 'beforeAll'
- Cannot find name 'afterAll'
- Cannot find name 'it'
- Cannot find name 'expect'

### Correção

- Adicionado `@types/jest` em `services/api/package.json`.
- Criado `services/api/tsconfig.spec.json`.
- Configurado `types: ["node", "jest"]`.
- Atualizado `services/api/jest.config.ts` para usar `tsconfig.spec.json`.
- Mantido alias `@packages/*`.

### Validação esperada

- `pnpm build`
- `pnpm test`


## Jest Type Stabilization

Correção aplicada para testes TypeScript com Jest.

### Problema

Os testes falhavam com erros como:

- Cannot find name 'describe'
- Cannot find name 'beforeAll'
- Cannot find name 'afterAll'
- Cannot find name 'it'
- Cannot find name 'expect'

### Correção

- Adicionado `@types/jest` em `services/api/package.json`.
- Criado `services/api/tsconfig.spec.json`.
- Configurado `types: ["node", "jest"]`.
- Atualizado `services/api/jest.config.ts` para usar `tsconfig.spec.json`.
- Mantido alias `@packages/*`.

### Validação esperada

- `pnpm build`
- `pnpm test`

