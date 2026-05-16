# API Service — SingulAI Validate

This folder contains the NestJS API service for SingulAI Validate.

## Setup (FASE 0)

1. Copy environment variables from root `.env.example` and fill secrets (do not commit secrets).

2. Install dependencies (from repo root):

```bash
pnpm install
pnpm -w install
```

3. Generate Prisma client (after installing `@prisma/client` and `prisma`):

```bash
pnpm --filter services/api prisma generate
```

4. Run Prisma migrations (dev):

```bash
cd services/api
pnpm prisma migrate dev --name init
```

5. Seed database (optional):

```bash
cd services/api
pnpm ts-node prisma/seed.ts
```

6. Start dev server:

```bash
cd services/api
pnpm run dev
```

**Important:** Antes de rodar migrações e seeds, insira as chaves e credenciais necessárias no `.env`. Do not commit private keys or mnemonic phrases.
# API Service

Main NestJS API gateway for SingulAI Validate.

## Features

- RESTful API
- JWT Authentication
- Role-Based Access Control (RBAC)
- Multi-tenant isolation
- OpenAPI/Swagger documentation
- Rate limiting
- Request validation

## Development

```bash
pnpm dev
```

API: http://localhost:4000
Docs: http://localhost:4000/api
