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
