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
