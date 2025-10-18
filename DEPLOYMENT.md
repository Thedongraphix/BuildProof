# BuildProof Contract Deployments

## Base Sepolia Testnet (Chain ID: 84532)

### Recently Deployed Contracts

#### BuilderNFT - Achievement NFT System
- **Address**: `0x5bf619fb8D02E35Da5BD3ED6D041E7302b330AAF`
- **Explorer**: https://sepolia.basescan.org/address/0x5bf619fb8d02e35da5bd3ed6d041e7302b330aaf
- **Status**: ✅ Verified
- **Description**: ERC721 NFT contract for awarding achievements to builders
- **Features**:
  - Achievement-based NFT minting
  - One achievement per builder per type
  - Batch minting capability
  - 10,000 maximum supply
  - Pausable for security

#### BuilderStaking - ETH Staking & Rewards
- **Address**: `0x952d6038eaC607286b25974458c91090A19E48C6`
- **Explorer**: https://sepolia.basescan.org/address/0x952d6038eac607286b25974458c91090a19e48c6
- **Status**: ✅ Verified
- **Description**: Staking contract with 5% APY for builders
- **Features**:
  - Stake 0.01 - 10 ETH per user
  - 5% annual percentage yield
  - 7-day minimum staking period
  - Claim rewards without unstaking
  - Initial funding: 0.1 ETH

#### BuilderGovernance - DAO Governance
- **Address**: `0x925FfAF071c908a8c8356afdf7A01C8c1A438B7C`
- **Explorer**: https://sepolia.basescan.org/address/0x925ffaf071c908a8c8356afdf7a01c8c1a438b7c
- **Status**: ✅ Verified
- **Description**: Decentralized governance for platform decisions
- **Features**:
  - Reputation-based voting power
  - 7-day voting periods
  - 10% quorum requirement
  - Proposal creation and execution
  - Cancel proposals by proposer or owner

### Existing Contracts

#### ContractRegistry
- **Address**: `0xb85461e215FD9a4Fa5cB39a1dbc182f88e1858be`
- **Status**: ✅ Deployed

## Deployment Details

- **Network**: Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://base-sepolia.g.alchemy.com/v2/o98k1pc46gMm-sQKZzlNZ
- **Block Explorer**: https://sepolia.basescan.org
- **Deployer**: `0x08dEa68F3646d3362Ab5e7f0EBe2DdBCECD1b44F`
- **Deployment Block**: 32499093

## Testing

All contracts have comprehensive test coverage:
- **BuilderNFT**: 10 tests ✅
- **BuilderStaking**: 15 tests ✅
- **BuilderGovernance**: 20 tests ✅
- **Total**: 45 tests passing

Run tests with:
```bash
forge test --match-contract "BuilderNFT|BuilderStaking|BuilderGovernance"
```

## Verification

All contracts are verified on Basescan with full source code visibility.

To verify manually:
```bash
forge verify-contract 0x5bf619fb8D02E35Da5BD3ED6D041E7302b330AAF contracts/BuilderNFT.sol:BuilderNFT --chain base-sepolia --watch
forge verify-contract 0x952d6038eaC607286b25974458c91090A19E48C6 contracts/BuilderStaking.sol:BuilderStaking --chain base-sepolia --watch
forge verify-contract 0x925FfAF071c908a8c8356afdf7A01C8c1A438B7C contracts/BuilderGovernance.sol:BuilderGovernance --chain base-sepolia --watch
```

## Smart Contract Standards

- **Solidity Version**: 0.8.26
- **Optimizer**: Enabled (200 runs)
- **EVM Version**: Cancun
- **License**: MIT
- **Dependencies**: OpenZeppelin Contracts v5.4.0

## Security Features

All contracts implement:
- ✅ Reentrancy protection (ReentrancyGuard)
- ✅ Access control (Ownable)
- ✅ Pausable functionality
- ✅ Custom errors for gas efficiency
- ✅ Comprehensive input validation
- ✅ Safe math (built-in Solidity 0.8+)

## Gas Optimization

Contracts use:
- Custom errors instead of require strings
- Efficient storage patterns
- Optimized loop structures
- Minimal external calls

## Integration

Add these addresses to your frontend `.env`:
```bash
NEXT_PUBLIC_BUILDER_NFT_ADDRESS=0x5bf619fb8D02E35Da5BD3ED6D041E7302b330AAF
NEXT_PUBLIC_BUILDER_STAKING_ADDRESS=0x952d6038eaC607286b25974458c91090A19E48C6
NEXT_PUBLIC_BUILDER_GOVERNANCE_ADDRESS=0x925FfAF071c908a8c8356afdf7A01C8c1A438B7C
```

## Contract Interactions

### BuilderNFT
```solidity
// Mint achievement NFT
function mintAchievement(address builder, string achievementType, string tokenURI) external onlyOwner

// Check achievement
function hasAchievement(address builder, string achievementType) external view returns (bool)
```

### BuilderStaking
```solidity
// Stake ETH
function stake() external payable

// Unstake and claim all rewards
function unstake() external

// Claim rewards only
function claimRewards() external

// View pending rewards
function getPendingRewards(address staker) external view returns (uint256)
```

### BuilderGovernance
```solidity
// Create proposal
function createProposal(string title, string description) external returns (uint256)

// Vote on proposal
function castVote(uint256 proposalId, bool support) external

// Execute successful proposal
function executeProposal(uint256 proposalId) external onlyOwner

// Update voting power
function updateVotingPower(address account, uint256 newPower) external onlyOwner
```

## Future Enhancements

Potential upgrades for consideration:
- Timelock for governance execution
- Delegation for voting power
- Multi-sig for critical operations
- Upgradeable proxy pattern
- Cross-chain bridging
- Token-based staking (not just ETH)

## Support

For questions or issues:
- GitHub: https://github.com/Thedongraphix/BuildProof
- Documentation: See contract NatSpec comments
