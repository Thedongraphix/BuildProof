# Deployed Contracts

This document tracks all deployed contract addresses across different networks.

## Base Sepolia (Chain ID: 84532)

### BuilderBounty
- **Address**: `0xBEDC1F6351776b5073580372b553158De85Ae53D`
- **Explorer**: https://sepolia.basescan.org/address/0xBEDC1F6351776b5073580372b553158De85Ae53D
- **Features**: Decentralized bounty system with IPFS proof submission
- **Platform Fee**: 2.5%

### BuilderReputation
- **Address**: `0x812daccF0691E7116ecF536E46426baf3Ce90177`
- **Explorer**: https://sepolia.basescan.org/address/0x812daccF0691E7116ecF536E46426baf3Ce90177
- **Features**: On-chain reputation, skills, and achievements tracking
- **Authorized Issuer**: Owner can authorize additional issuers

### BuilderTeams
- **Address**: `0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519`
- **Explorer**: https://sepolia.basescan.org/address/0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519
- **Features**: Collaborative team management with reward splitting
- **Share System**: Basis points (10000 = 100%)

### BuilderEscrow
- **Address**: `0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519`
- **Explorer**: https://sepolia.basescan.org/address/0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519
- **Features**: Milestone-based escrow with dispute resolution
- **Platform Fee**: 2.5%

## Network Information

### Base Sepolia
- **RPC URL**: https://sepolia.base.org
- **Chain ID**: 84532
- **Block Explorer**: https://sepolia.basescan.org
- **Currency**: ETH
- **Faucet**: https://www.coinbase.com/faucets/base-sepolia-faucet

## Integration

To integrate these contracts in your frontend, use the contract addresses from `src/lib/contracts.ts`:

```typescript
import { contracts } from '@/lib/contracts'

// Access contract addresses
const bountyAddress = contracts.builderBounty.address
const reputationAddress = contracts.builderReputation.address
const teamsAddress = contracts.builderTeams.address
const escrowAddress = contracts.builderEscrow.address
```

## Verification Status

All contracts are deployed and configured in the frontend. Verification on BaseScan is in progress.

## Deployment History

1. **BuilderBounty** - Initially deployed for bounty management
2. **BuilderReputation** - Added reputation tracking system
3. **BuilderTeams** - Added collaborative team features
4. **BuilderEscrow** - Added milestone-based escrow system

## Security Notes

- All contracts implement proper access control
- Platform fees are configurable by contract owner
- Dispute resolution available through owner arbitration
- Emergency pause functionality not implemented (consider for production)

## Gas Estimates

Approximate gas costs on Base Sepolia:

| Operation | Contract | Estimated Gas |
|-----------|----------|---------------|
| Create Bounty | BuilderBounty | ~150,000 |
| Claim Bounty | BuilderBounty | ~80,000 |
| Register Builder | BuilderReputation | ~120,000 |
| Create Team | BuilderTeams | ~200,000 |
| Create Escrow | BuilderEscrow | ~250,000 |

*Gas estimates are approximate and may vary based on network conditions.*
