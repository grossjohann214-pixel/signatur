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
