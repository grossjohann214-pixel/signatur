#!/bin/bash

# SingulAI Validate - Complete Repository Setup Script
# This script creates the entire monorepo structure with all necessary files

set -e  # Exit on error

echo "🚀 Creating SingulAI Validate monorepo structure..."

# Create main directory structure
mkdir -p apps/{partner-portal,customer-link,admin-console,audit-adapter}
mkdir -p services/{api,worker,webhook-service,evidence-service,notification-service}
mkdir -p packages/{ui,config,types,validation,crypto,web3-client,audit-sdk}
mkdir -p contracts/{src,scripts,test,deployments}
mkdir -p docs/{architecture,api,security,legal,partner}
mkdir -p infra/{docker,nginx,ci-cd,monitoring}
mkdir -p scripts/{seed,deploy,maintenance}

echo "📁 Directory structure created!"

# ============================================================================
# ROOT CONFIGURATION FILES
# ============================================================================

# Main README.md
cat > README.md << 'EOF'
# SingulAI Validate - White Label Authorization & Execution Layer

<div align="center">

![SingulAI Validate](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=SingulAI+Validate)

**Multi-tenant platform for Web3-anchored procedure validation with partner onboarding, magic links, and independent audit.**

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)]()

</div>

---

## 🎯 Overview

SingulAI Validate is a white label platform that enables partners to:
- ✅ Create procedures with multiple participants
- 🔐 Collect confirmations and signatures via unique magic links
- 🌐 Generate SGL wallets automatically (client-side only)
- 🔗 Anchor evidence on Sepolia blockchain
- 📊 Provide independent audit trails via AuditSGL

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Partner Portal │────▶│   NestJS API     │────▶│  PostgreSQL DB  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ├──────────▶ Redis Cache
                               │
                               ├──────────▶ BullMQ Jobs
                               │
                               └──────────▶ Sepolia (Web3)
                                                   │
                                                   ▼
                                          ┌─────────────────┐
                                          │  AuditSGL.online│
                                          └─────────────────┘
```

## 📦 Monorepo Structure

```
singulai-validate/
├── apps/                    # Frontend applications
│   ├── partner-portal/      # Partner dashboard (Next.js)
│   ├── customer-link/       # Magic link flow (Next.js)
│   ├── admin-console/       # SingulAI admin (Next.js)
│   └── audit-adapter/       # AuditSGL integration
│
├── services/                # Backend services
│   ├── api/                 # Main API gateway (NestJS)
│   ├── worker/              # Background jobs
│   ├── webhook-service/     # Webhook delivery
│   ├── evidence-service/    # Hash generation
│   └── notification-service/# Email/SMS
│
├── packages/                # Shared libraries
│   ├── ui/                  # React components
│   ├── config/              # Shared configs
│   ├── types/               # TypeScript types
│   ├── validation/          # Zod schemas
│   ├── crypto/              # Hash utilities
│   ├── web3-client/         # Contract interactions
│   └── audit-sdk/           # AuditSGL SDK
│
├── contracts/               # Smart contracts
│   ├── src/                 # Solidity files
│   ├── scripts/             # Deploy scripts
│   ├── test/                # Contract tests
│   └── deployments/         # Deployed addresses
│
├── docs/                    # Documentation
└── infra/                   # Infrastructure configs
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env

# Start database
docker-compose up -d postgres redis

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Start development
pnpm dev
```

### Development URLs

- Partner Portal: http://localhost:3000
- Customer Link: http://localhost:3001
- Admin Console: http://localhost:3002
- API: http://localhost:4000
- API Docs: http://localhost:4000/api

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi + Viem
- **State**: Zustand / TanStack Query
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Cache**: Redis
- **Queue**: BullMQ

### Web3
- **Language**: Solidity 0.8.20
- **Framework**: Hardhat
- **Network**: Sepolia Testnet
- **Libraries**: OpenZeppelin Contracts

### Infrastructure
- **Container**: Docker
- **Proxy**: Nginx
- **CI/CD**: GitHub Actions
- **Monitoring**: (TBD)

## 📋 Available Scripts

```bash
# Development
pnpm dev              # Start all services
pnpm dev:portal       # Start partner portal
pnpm dev:link         # Start customer link
pnpm dev:admin        # Start admin console
pnpm dev:api          # Start API service

# Build
pnpm build            # Build all apps
pnpm build:portal     # Build partner portal
pnpm build:contracts  # Compile smart contracts

# Database
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio

# Testing
pnpm test             # Run all tests
pnpm test:unit        # Unit tests
pnpm test:e2e         # E2E tests
pnpm test:contracts   # Contract tests

# Web3
pnpm contracts:compile # Compile contracts
pnpm contracts:test    # Test contracts
pnpm contracts:deploy  # Deploy to Sepolia

# Code Quality
pnpm lint             # Lint all code
pnpm format           # Format with Prettier
pnpm typecheck        # TypeScript check
```

## 🔒 Security

### Critical Rules

- ❌ **NEVER** store private keys or seed phrases in backend
- ❌ **NEVER** log sensitive data
- ❌ **NEVER** expose customer data in plain text on blockchain
- ✅ Always use HTTPS/TLS
- ✅ Always hash sensitive data before blockchain
- ✅ Always validate tenant isolation
- ✅ Always use Row Level Security (RLS)

### LGPD Compliance

- **Partner** = Data Controller (defines purpose)
- **SingulAI** = Data Processor (provides infrastructure)
- **Customer** = Data Subject (owns wallet keys)

## 📚 Documentation

- [Architecture Overview](./docs/architecture/README.md)
- [API Documentation](./docs/api/README.md)
- [Security Guidelines](./docs/security/README.md)
- [Partner Onboarding](./docs/partner/README.md)
- [Smart Contracts](./contracts/README.md)

## 🧪 Development Workflow

### 1. Partner Onboarding
```typescript
// Partner registers → Contract auto-generated → SingulAI approves → Production unlocked
```

### 2. Procedure Creation
```typescript
// Partner creates procedure → Adds participants → Generates magic links → Sends to customers
```

### 3. Customer Flow
```typescript
// Customer opens link → Confirms data → Signs → Creates wallet → Receives protocol
```

### 4. Blockchain & Audit
```typescript
// Evidence hashed → Sepolia anchor → AuditSGL verification → Partner receives report
```

## 🌍 Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/singulai_validate
REDIS_URL=redis://localhost:6379

# API
API_PORT=4000
JWT_SECRET=your-secret-key

# Web3
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
DEPLOYER_PRIVATE_KEY=0x...
VALIDATOR_PRIVATE_KEY=0x...
REGISTRY_CONTRACT_ADDRESS=0x...

# AuditSGL
AUDIT_SGL_URL=https://auditsgl.online/api
AUDIT_SGL_API_KEY=your-audit-key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WALLET_CONNECT_ID=your-wc-id

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@singulai.com
SMTP_PASS=your-password

# Storage
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=singulai-validate
```

## 🤝 Contributing

This is a private repository. For contribution guidelines, please contact the SingulAI team.

## 📄 License

Proprietary - © 2024 SingulAI. All rights reserved.

## 📞 Support

For technical support or questions:
- Email: dev@singulai.com
- Slack: #singulai-validate
- Documentation: https://docs.singulai.com

---

<div align="center">
Built with ❤️ by SingulAI Team
</div>
EOF

# Root package.json
cat > package.json << 'EOF'
{
  "name": "singulai-validate",
  "version": "0.1.0",
  "private": true,
  "description": "White Label Authorization & Execution Layer with Web3 anchoring",
  "author": "SingulAI <dev@singulai.com>",
  "license": "UNLICENSED",
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "dev": "turbo run dev",
    "dev:portal": "turbo run dev --filter=partner-portal",
    "dev:link": "turbo run dev --filter=customer-link",
    "dev:admin": "turbo run dev --filter=admin-console",
    "dev:api": "turbo run dev --filter=api",
    "build": "turbo run build",
    "build:portal": "turbo run build --filter=partner-portal",
    "build:contracts": "cd contracts && npx hardhat compile",
    "test": "turbo run test",
    "test:unit": "turbo run test:unit",
    "test:e2e": "turbo run test:e2e",
    "test:contracts": "cd contracts && npx hardhat test",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "typecheck": "turbo run typecheck",
    "db:migrate": "cd services/api && pnpm prisma migrate dev",
    "db:seed": "cd services/api && pnpm prisma db seed",
    "db:studio": "cd services/api && pnpm prisma studio",
    "db:generate": "cd services/api && pnpm prisma generate",
    "contracts:compile": "cd contracts && npx hardhat compile",
    "contracts:test": "cd contracts && npx hardhat test",
    "contracts:deploy": "cd contracts && npx hardhat run scripts/deploy.ts --network sepolia",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "prettier": "^3.1.0",
    "turbo": "^1.11.0",
    "typescript": "^5.3.3"
  },
  "packageManager": "pnpm@8.15.0"
}
EOF

# pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - "apps/*"
  - "services/*"
  - "packages/*"
  - "contracts"
EOF

# turbo.json
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "test:unit": {
      "outputs": ["coverage/**"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
EOF

# .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
*.log

# Next.js
.next/
out/
build/
dist/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Misc
*.pem
.turbo/

# Database
*.db
*.db-journal

# Hardhat
contracts/cache/
contracts/artifacts/
contracts/typechain-types/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Temporary files
tmp/
temp/
*.tmp
EOF

# .env.example
cat > .env.example << 'EOF'
# ============================================================================
# DATABASE
# ============================================================================
DATABASE_URL=postgresql://singulai:singulai123@localhost:5432/singulai_validate
REDIS_URL=redis://localhost:6379

# ============================================================================
# API CONFIGURATION
# ============================================================================
NODE_ENV=development
API_PORT=4000
API_HOST=0.0.0.0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002

# Rate Limiting
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100

# ============================================================================
# WEB3 / BLOCKCHAIN
# ============================================================================
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_CHAIN_ID=11155111

# Deployer wallet (for deploying contracts)
DEPLOYER_PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY

# Validator wallet (backend service wallet for registering procedures)
VALIDATOR_PRIVATE_KEY=0xYOUR_VALIDATOR_PRIVATE_KEY
BACKEND_WALLET_ADDRESS=0xYOUR_BACKEND_WALLET_ADDRESS

# Contract addresses (fill after deployment)
SGL_TOKEN_ADDRESS=0xYOUR_SGL_TOKEN_ADDRESS
REGISTRY_CONTRACT_ADDRESS=0xYOUR_REGISTRY_CONTRACT_ADDRESS
PARTICIPANT_REGISTRY_ADDRESS=0xYOUR_PARTICIPANT_REGISTRY_ADDRESS
EVIDENCE_ANCHOR_ADDRESS=0xYOUR_EVIDENCE_ANCHOR_ADDRESS

# Etherscan (for verification)
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# ============================================================================
# AUDITSGL INTEGRATION
# ============================================================================
AUDIT_SGL_URL=https://auditsgl.online/api
AUDIT_SGL_API_KEY=your-audit-sgl-api-key

# ============================================================================
# FRONTEND (Next.js Apps)
# ============================================================================
# Partner Portal
NEXT_PUBLIC_PARTNER_PORTAL_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000

# Customer Link
NEXT_PUBLIC_CUSTOMER_LINK_URL=http://localhost:3001
CUSTOMER_LINK_BASE_URL=http://localhost:3001

# Admin Console
NEXT_PUBLIC_ADMIN_CONSOLE_URL=http://localhost:3002

# WalletConnect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-walletconnect-project-id

# ============================================================================
# EMAIL / NOTIFICATIONS
# ============================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@singulai.com
SMTP_PASS=your-email-password
SMTP_FROM=SingulAI Validate <noreply@singulai.com>

# SendGrid (alternative)
# SENDGRID_API_KEY=your-sendgrid-api-key

# ============================================================================
# SMS (Optional)
# ============================================================================
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# ============================================================================
# STORAGE (S3-compatible)
# ============================================================================
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=singulai-validate
S3_PUBLIC_URL=http://localhost:9000/singulai-validate

# ============================================================================
# HASHING / ENCRYPTION
# ============================================================================
HASH_SALT=your-random-salt-for-pseudonymization
ENCRYPTION_KEY=your-32-character-encryption-key

# ============================================================================
# MONITORING / LOGGING
# ============================================================================
LOG_LEVEL=debug
LOG_FORMAT=json

# Sentry (optional)
# SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# ============================================================================
# FEATURE FLAGS
# ============================================================================
ENABLE_SELFIE_CAPTURE=true
ENABLE_GEOLOCATION=true
ENABLE_WEBHOOKS=true
EOF

# .prettierrc
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
EOF

# .prettierignore
cat > .prettierignore << 'EOF'
node_modules
.next
dist
build
coverage
*.min.js
*.min.css
pnpm-lock.yaml
EOF

# tsconfig.base.json
cat > tsconfig.base.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "commonjs",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true
  },
  "exclude": ["node_modules", "dist", "build"]
}
EOF

echo "✅ Root configuration files created!"

# ============================================================================
# APPS - Partner Portal
# ============================================================================

cat > apps/partner-portal/package.json << 'EOF'
{
  "name": "partner-portal",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  }
}
EOF

cat > apps/partner-portal/README.md << 'EOF'
# Partner Portal

Dashboard para parceiros do SingulAI Validate.

## Features

- Onboarding de parceiros
- Gestão de procedimentos
- Cadastro de clientes
- Envio de magic links
- Visualização de auditoria
- Relatórios

## Development

```bash
pnpm dev
```

Acesse: http://localhost:3000
EOF

# ============================================================================
# APPS - Customer Link
# ============================================================================

cat > apps/customer-link/package.json << 'EOF'
{
  "name": "customer-link",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  }
}
EOF

cat > apps/customer-link/README.md << 'EOF'
# Customer Link

Fluxo de validação para clientes via magic link.

## Features

- Confirmação de dados
- Assinatura em tela
- Captura de selfie (opcional)
- Geolocalização (opcional)
- Criação de wallet SGL
- Exibição de protocolo

## Development

```bash
pnpm dev
```

Acesse: http://localhost:3001
EOF

# ============================================================================
# APPS - Admin Console
# ============================================================================

cat > apps/admin-console/package.json << 'EOF'
{
  "name": "admin-console",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start -p 3002",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5"
  }
}
EOF

cat > apps/admin-console/README.md << 'EOF'
# Admin Console

Console administrativo interno da SingulAI.

## Features

- Aprovação de parceiros
- Gestão de escopos
- Monitoramento de procedimentos
- Auditoria global
- Configurações do sistema

## Development

```bash
pnpm dev
```

Acesse: http://localhost:3002
EOF

# ============================================================================
# SERVICES - API
# ============================================================================

cat > services/api/package.json << 'EOF'
{
  "name": "api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "start:prod": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.2",
    "@types/node": "^20.3.1",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.3"
  }
}
EOF

cat > services/api/README.md << 'EOF'
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
EOF

# ============================================================================
# CONTRACTS
# ============================================================================

cat > contracts/package.json << 'EOF'
{
  "name": "contracts",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "compile": "hardhat compile",
    "test": "hardhat test",
    "deploy": "hardhat run scripts/deploy.ts",
    "deploy:sepolia": "hardhat run scripts/deploy.ts --network sepolia",
    "verify": "hardhat verify --network sepolia"
  },
  "devDependencies": {
    "@nomicfoundation/hardhat-toolbox": "^4.0.0",
    "hardhat": "^2.19.0"
  },
  "dependencies": {
    "@openzeppelin/contracts": "^5.0.0"
  }
}
EOF

cat > contracts/README.md << 'EOF'
# Smart Contracts

Solidity contracts for SingulAI Validate on Sepolia.

## Contracts

- `SGLValidateRegistry.sol` - Main procedure registry
- `SGLParticipantRegistry.sol` - Participant tracking
- `SGLEvidenceAnchor.sol` - Evidence anchoring

## Development

```bash
# Compile contracts
pnpm compile

# Run tests
pnpm test

# Deploy to Sepolia
pnpm deploy:sepolia
```

## Security

- Uses OpenZeppelin contracts
- Access control via roles
- No personal data stored on-chain
- Only hashes and public addresses
EOF

cat > contracts/hardhat.config.ts << 'EOF'
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

export default config;
EOF

# ============================================================================
# DOCUMENTATION
# ============================================================================

cat > docs/architecture/README.md << 'EOF'
# Architecture Overview

## System Design

SingulAI Validate follows a multi-layered architecture:

1. **Frontend Layer** - Next.js apps (Partner Portal, Customer Link, Admin)
2. **API Layer** - NestJS microservices
3. **Data Layer** - PostgreSQL with multi-tenant isolation
4. **Blockchain Layer** - Sepolia smart contracts
5. **Audit Layer** - AuditSGL independent verification

## Key Principles

- Multi-tenant by design
- Security first (no private keys in backend)
- LGPD compliant (partner = controller, SingulAI = processor)
- Signature agnostic (support multiple providers)
- Independent audit trail

## Data Flow

```
Partner → Creates Procedure → Adds Participants → Generates Magic Links
                                                          ↓
Customer → Opens Link → Confirms → Signs → Creates Wallet
                                                          ↓
Evidence Service → Generates Hash → Blockchain Anchor → AuditSGL
                                                          ↓
Partner ← Receives Protocol + Audit Report
```
EOF

cat > docs/api/README.md << 'EOF'
# API Documentation

## Base URL

```
Development: http://localhost:4000
Production: https://api.singulai.com
```

## Authentication

All endpoints require JWT Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.singulai.com/procedures
```

## Key Endpoints

### Partner Onboarding
- `POST /partners/register` - Register new partner
- `GET /partners/me` - Get current partner profile
- `PUT /partners/branding` - Update branding

### Procedures
- `POST /procedures` - Create procedure
- `GET /procedures/:id` - Get procedure details
- `GET /procedures` - List procedures (tenant-scoped)

### Participants
- `POST /procedures/:id/participants` - Add participant
- `POST /participants/:id/send-link` - Send magic link

### Evidence
- `GET /procedures/:id/evidence` - Get evidence details
- `GET /procedures/:id/protocol` - Get protocol number

Full documentation: http://localhost:4000/api
EOF

cat > docs/security/README.md << 'EOF'
# Security Guidelines

## Critical Rules

### ❌ NEVER
- Store private keys or seed phrases in backend
- Log sensitive data (keys, passwords, hashes)
- Expose personal data on blockchain
- Share tenant data across boundaries

### ✅ ALWAYS
- Use HTTPS/TLS 1.3
- Hash sensitive data before blockchain
- Validate tenant isolation
- Apply Row Level Security (RLS)
- Sanitize user inputs
- Use prepared statements

## Wallet Security

Wallets are generated **client-side only**:

1. Frontend generates mnemonic using Web Crypto API
2. Customer downloads/saves recovery phrase
3. Frontend sends **only public address** to backend
4. Backend never sees private key or seed

## Multi-Tenant Isolation

Every query must filter by `tenant_id`:

```typescript
await prisma.procedure.findMany({
  where: { tenant_id: currentTenantId }
});
```

Use PostgreSQL RLS as additional defense layer.
EOF

cat > docs/partner/README.md << 'EOF'
# Partner Onboarding Guide

## Pre-Partnership Phase

1. Register at https://partners.singulai.com
2. Fill company information (CNPJ, legal entity)
3. Upload company logo
4. Select desired procedure types
5. System generates partnership contract
6. Submit for SingulAI review

## Approval Process

1. SingulAI reviews application (1-3 business days)
2. May request additional information
3. Approval decision sent via email
4. Contract acceptance required

## Post-Approval

1. Production dashboard unlocked
2. Access to approved procedure types
3. Can create procedures and send magic links
4. Limited to approved scope

## Creating Your First Procedure

1. Navigate to "Procedimentos" → "Criar Novo"
2. Select customer (or create new)
3. Choose procedure type (within approved scope)
4. Add participants with roles
5. Configure requirements (signature, selfie, geo)
6. Review and authorize sending
7. Track status in dashboard

## Limits

- Procedures per month: Check your plan
- Participants per procedure: Unlimited
- Magic link expiration: 24 hours (default)
- Custom documents: Subject to approval
EOF

# ============================================================================
# DOCKER CONFIGURATION
# ============================================================================

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: singulai-postgres
    environment:
      POSTGRES_DB: singulai_validate
      POSTGRES_USER: singulai
      POSTGRES_PASSWORD: singulai123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - singulai-network

  redis:
    image: redis:7-alpine
    container_name: singulai-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - singulai-network

  minio:
    image: minio/minio:latest
    container_name: singulai-minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    networks:
      - singulai-network

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  singulai-network:
    driver: bridge
EOF

# ============================================================================
# GITHUB WORKFLOWS
# ============================================================================

mkdir -p .github/workflows

cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Lint
        run: pnpm lint
      
      - name: Type check
        run: pnpm typecheck
      
      - name: Test
        run: pnpm test
      
      - name: Build
        run: pnpm build
EOF

# ============================================================================
# BLUEPRINT DOCUMENT
# ============================================================================

cat > BLUEPRINT.md << 'EOF'
# SingulAI Validate - Complete System Blueprint

## Executive Summary

Platform white label for partners create validated procedures with Web3 anchoring and independent audit.

## Core Components

### 1. Partner Onboarding System
- Self-registration
- Auto-generated contracts
- SingulAI approval workflow
- Tenant activation

### 2. Procedure Engine
- Multi-participant support
- Scope validation
- Template management
- Custom documents

### 3. Magic Link System
- Unique, temporary, single-use links
- White-labeled to partner branding
- Secure token generation
- Expiration handling

### 4. Customer Flow
- Data confirmation
- Canvas signature
- Optional geolocation
- Optional selfie
- Client-side wallet generation

### 5. Evidence Layer
- SHA-256 hashing
- Protocol number generation
- Blockchain anchoring (Sepolia)
- AuditSGL integration

### 6. Audit System
- Independent verification
- Risk scoring
- Technical reports
- Public audit trail

## Technology Decisions

### Frontend
**Next.js** - File-based routing, Server Components, optimal for multi-app monorepo
**Tailwind CSS** - Utility-first, rapid prototyping, consistent design
**Wagmi/Viem** - Type-safe Web3 interactions, React hooks

### Backend
**NestJS** - Modular architecture, scalable, enterprise-grade
**PostgreSQL** - ACID compliance, Row Level Security, JSON support
**Prisma** - Type-safe ORM, migrations, schema introspection

### Web3
**Hardhat** - Best-in-class Solidity development environment
**OpenZeppelin** - Security-audited contract libraries
**Sepolia** - Ethereum testnet with faucets and stability

## Security Architecture

### Multi-Layer Defense
1. Application-level tenant filtering
2. PostgreSQL Row Level Security
3. JWT + RBAC for API access
4. Rate limiting per tenant
5. Input validation with Zod

### Wallet Security
- **Client-side generation only**
- Web Crypto API for randomness
- BIP39 mnemonic standard
- Backend receives only public address
- No private keys in logs or database

### LGPD Compliance
- Minimization: Collect only necessary data
- Pseudonymization: Hash data before blockchain
- Transparency: Clear role separation (partner = controller, SingulAI = processor)
- Right to erasure: Delete off-chain data (blockchain hashes remain pseudonymized)

## Data Flow Diagrams

### Partner Onboarding
```
Registration → Contract Generation → SingulAI Review → Approval → Tenant Activation → Production Dashboard
```

### Procedure Execution
```
Partner Creates Procedure → Adds Participants → System Generates Magic Links → Sends via Email/SMS
    ↓
Customer Opens Link → Confirms Data → Signs → Creates Wallet → Completes Flow
    ↓
Evidence Service → Generates Hash → Blockchain Anchor → AuditSGL Verification
    ↓
Partner Receives Protocol + Audit Report
```

## Database Schema Highlights

### Key Tables
- `partners` - Partner companies
- `partner_tenants` - Isolated tenant spaces
- `partner_scope_requests` - Approved procedure types
- `procedures` - Created procedures
- `procedure_participants` - Multi-participant tracking
- `magic_links` - Temporary access tokens
- `evidences` - Cryptographic proofs
- `audit_records` - AuditSGL responses

### Multi-Tenant Pattern
Every row includes:
- `tenant_id` - Isolates data by partner
- `partner_id` - References partner entity
- `created_by` - Audit trail
- `created_at` / `updated_at` - Timestamps

### Row Level Security
```sql
CREATE POLICY tenant_isolation ON procedures
FOR ALL TO authenticated_user
USING (tenant_id = current_setting('app.current_tenant_id')::UUID);
```

## Smart Contract Architecture

### SGLValidateRegistry
- Stores procedure references (pseudonymized)
- Links customer wallet address
- Records evidence hash
- Tracks status transitions
- Emits events for indexing

### SGLParticipantRegistry
- Tracks all participants per procedure
- Supports witness/lawyer/beneficiary roles
- Records signing timestamps
- Links participant wallets

### SGLEvidenceAnchor
- Immutable evidence storage
- Optional IPFS/Arweave URI
- Anchoring timestamp
- Verifiable proofs

## Development Roadmap

### Sprint 1: Foundation
- Monorepo setup
- NestJS API skeleton
- Next.js Partner Portal skeleton
- PostgreSQL + Prisma schema
- Authentication (JWT)

### Sprint 2: Partner Onboarding
- Registration flow
- Contract auto-generation
- SingulAI admin console
- Approval workflow
- Tenant activation

### Sprint 3: Procedures
- Procedure creation UI
- Participant management
- Template selection
- Scope validation

### Sprint 4: Magic Links
- Token generation
- Email delivery
- Customer link app
- Signature canvas
- Geolocation/selfie

### Sprint 5: Wallet & Web3
- Client-side wallet generation
- Contract deployment (Sepolia)
- Evidence anchoring
- Transaction handling

### Sprint 6: Audit
- AuditSGL integration
- Evidence payload generation
- Risk scoring
- Report UI

### Sprint 7: Pilot
- 1 partner onboarding
- 100 test users
- Testnet environment
- Monitoring & feedback

## Deployment Strategy

### Infrastructure
- Ubuntu 22.04 VPS
- Docker Compose (dev/staging)
- Kubernetes (production scale)
- Nginx reverse proxy
- Cloudflare CDN + DDoS protection

### CI/CD
- GitHub Actions
- Automated tests on PR
- Staging deployment on merge to develop
- Production deployment on merge to main
- Automated database migrations

### Monitoring
- Structured logging (JSON)
- Error tracking (Sentry optional)
- APM metrics
- Blockchain transaction monitoring
- Automated backups (PostgreSQL, Redis)

## Success Criteria

### Technical
- ✅ Partner can self-register
- ✅ Contract auto-generation works
- ✅ SingulAI admin can approve/reject
- ✅ Tenant isolation enforced
- ✅ Magic links are single-use and expire
- ✅ Wallet generation is client-side only
- ✅ Evidence hashes anchor to Sepolia
- ✅ AuditSGL integration returns reports

### Business
- ✅ Partner completes onboarding in < 10 minutes
- ✅ Customer completes procedure in < 5 minutes
- ✅ Protocol generated within 30 seconds
- ✅ Audit report available within 1 minute
- ✅ Zero private key exposures
- ✅ Zero cross-tenant data leaks

### Legal
- ✅ LGPD compliance documented
- ✅ Role separation clear (controller vs processor)
- ✅ Data minimization enforced
- ✅ Right to erasure supported (off-chain)

## Risk Mitigation

### Technical Risks
- **Private key exposure**: Wallet generation client-side only, extensive testing, code reviews
- **Cross-tenant leaks**: RLS + application filters, penetration testing
- **Blockchain failures**: Retry logic, transaction monitoring, fallback RPC nodes

### Business Risks
- **Partner churn**: Excellent onboarding UX, responsive support
- **Scope creep**: Clear approval workflow, documented limits
- **Scalability**: Horizontal scaling design, caching strategy

### Legal Risks
- **LGPD violations**: Legal review, privacy-by-design, DPA with partners
- **Signature validity**: Signature-agnostic design, partner responsibility clarified

---

For detailed technical specifications, see:
- [Architecture Docs](./docs/architecture/)
- [API Reference](./docs/api/)
- [Security Guidelines](./docs/security/)
- [Partner Guide](./docs/partner/)
EOF

# ============================================================================
# CREATE PLACEHOLDER FILES
# ============================================================================

# Create .gitkeep files for empty directories
find . -type d -empty -not -path "./.git/*" -exec touch {}/.gitkeep \;

echo "
✨ SingulAI Validate repository structure created successfully!

📂 Structure:
   - 3 Frontend Apps (Next.js)
   - 5 Backend Services (NestJS)
   - 7 Shared Packages
   - Smart Contracts (Hardhat)
   - Complete Documentation
   - Docker Configuration
   - CI/CD Workflows

📋 Next Steps:
   1. Install dependencies: pnpm install
   2. Copy environment: cp .env.example .env
   3. Start database: docker-compose up -d
   4. Run migrations: pnpm db:migrate
   5. Start development: pnpm dev

📖 Documentation:
   - README.md - Project overview
   - BLUEPRINT.md - Complete system design
   - docs/ - Detailed documentation

🚀 Happy coding!
"
