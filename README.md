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
