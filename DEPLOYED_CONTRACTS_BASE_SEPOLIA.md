# Deployed Contracts - Base Sepolia

## Deployment Information

**Network**: Base Sepolia (Chain ID: 84532)
**Deployer**: 0x08dEa68F3646d3362Ab5e7f0EBe2DdBCECD1b44F
**Date**: October 25, 2025
**Status**: ✅ All contracts deployed and verified

---

## Contract Addresses

### BuildProofToken (BPROOF)
- **Address**: `0x0d9c6536BcF92932558E6bFF19151bb41d336e55`
- **BaseScan**: https://sepolia.basescan.org/address/0x0d9c6536bcf92932558e6bff19151bb41d336e55
- **Type**: ERC20 Governance Token
- **Features**:
  - Voting & Delegation (ERC20Votes)
  - Permit (EIP-2612)
  - Transfer Tax (0-5% configurable)
  - Minter Roles
  - Pausable
- **Supply**:
  - Initial: 100,000,000 BPROOF
  - Max: 1,000,000,000 BPROOF

### BuilderLiquidityPool
- **Address**: `0x7AEa0d4279C5601a7a745937Babb41391e04A5a7`
- **BaseScan**: https://sepolia.basescan.org/address/0x7aea0d4279c5601a7a745937babb41391e04a5a7
- **Type**: AMM Liquidity Pool (BPROOF/ETH)
- **Features**:
  - Constant Product Formula (x * y = k)
  - 0.3% Trading Fee
  - Add/Remove Liquidity
  - Token Swaps (BPROOF ↔ ETH)
  - Slippage Protection

### BuilderTimelock
- **Address**: `0xdAc134B725be453A9Ef2de4383066ea7CDc50DaD`
- **BaseScan**: https://sepolia.basescan.org/address/0xdac134b725be453a9ef2de4383066ea7cdc50dad
- **Type**: Governance Timelock Controller
- **Features**:
  - 2-day minimum delay
  - Proposer & Executor roles
  - OpenZeppelin TimelockController

---

## Frontend Configuration

Add these to your `.env.local`:

```bash
NEXT_PUBLIC_BPROOF_TOKEN_ADDRESS=0x0d9c6536BcF92932558E6bFF19151bb41d336e55
NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS=0x7AEa0d4279C5601a7a745937Babb41391e04A5a7
NEXT_PUBLIC_TIMELOCK_ADDRESS=0xdAc134B725be453A9Ef2de4383066ea7CDc50DaD
NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID=84532
```

---

## Quick Interaction Commands

### Check Token Balance
```bash
cast call 0x0d9c6536BcF92932558E6bFF19151bb41d336e55 \
    "balanceOf(address)(uint256)" \
    YOUR_ADDRESS \
    --rpc-url base_sepolia
```

### Transfer Tokens
```bash
cast send 0x0d9c6536BcF92932558E6bFF19151bb41d336e55 \
    "transfer(address,uint256)" \
    RECIPIENT_ADDRESS \
    1000000000000000000 \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY
```

### Approve Pool to Spend Tokens
```bash
cast send 0x0d9c6536BcF92932558E6bFF19151bb41d336e55 \
    "approve(address,uint256)" \
    0x7AEa0d4279C5601a7a745937Babb41391e04A5a7 \
    1000000000000000000000 \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY
```

### Add Liquidity (1000 BPROOF + 0.1 ETH)
```bash
cast send 0x7AEa0d4279C5601a7a745937Babb41391e04A5a7 \
    "addLiquidity(uint256,uint256)" \
    1000000000000000000000 \
    0 \
    --value 0.1ether \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY
```

### Swap ETH for BPROOF
```bash
cast send 0x7AEa0d4279C5601a7a745937Babb41391e04A5a7 \
    "swapEthForBproof(uint256)" \
    0 \
    --value 0.01ether \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY
```

### Get Quote (1 ETH → BPROOF)
```bash
cast call 0x7AEa0d4279C5601a7a745937Babb41391e04A5a7 \
    "getQuoteEthToBproof(uint256)(uint256)" \
    1000000000000000000 \
    --rpc-url base_sepolia
```

### Delegate Voting Power
```bash
cast send 0x0d9c6536BcF92932558E6bFF19151bb41d336e55 \
    "delegate(address)" \
    YOUR_DELEGATE_ADDRESS \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY
```

---

## Verification Status

All contracts have been verified on BaseScan ✅

- ✅ BuildProofToken: Verified
- ✅ BuilderLiquidityPool: Verified
- ✅ BuilderTimelock: Verified

You can view the source code directly on BaseScan by clicking the links above.

---

## Next Steps

1. ✅ Contracts deployed
2. ✅ Contracts verified on BaseScan
3. 🔄 Add initial liquidity to the pool
4. 🔄 Update frontend with contract addresses
5. 🔄 Test token transfers and swaps
6. 🔄 Configure WalletConnect integration
7. 🔄 Test governance delegation

---

## Deployment Transaction Details

All deployment transactions and receipts are saved in:
- `broadcast/DeployNewDeFi.s.sol/84532/run-latest.json`
- `cache/DeployNewDeFi.s.sol/84532/run-latest.json`

---

## Gas Used

- Estimated total gas: 6,575,728
- Estimated cost: 0.000006576425027168 ETH
- Actual gas price: 0.001000106 gwei

---

## Security Notes

- All contracts use OpenZeppelin standards
- Contracts include ReentrancyGuard, Pausable, and Ownable
- Custom errors for gas optimization
- Comprehensive test coverage (34 tests, 100% passing)

---

**Deployment Successful! 🚀**
