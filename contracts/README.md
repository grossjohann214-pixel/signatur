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
