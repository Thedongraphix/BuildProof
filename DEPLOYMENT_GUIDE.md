# BuildProof Deployment Guide

## New DeFi Contracts Deployment to Base Sepolia

This guide will help you deploy the new DeFi contracts (BuildProofToken, BuilderLiquidityPool, BuilderTimelock) to Base Sepolia testnet.

---

## Prerequisites

### 1. Environment Setup

Create or update your `.env` file with the following variables:

```bash
# Base Sepolia RPC (you can use the public RPC or get one from Alchemy/Infura)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Get your BaseScan API key from https://basescan.org/myapikey
BASESCAN_API_KEY=your_basescan_api_key_here

# Your wallet private key (DO NOT share or commit this!)
PRIVATE_KEY=0xyour_private_key_here
```

### 2. Get Test ETH

You'll need Base Sepolia ETH to deploy contracts:

1. **Bridge ETH to Base Sepolia**:
   - Go to https://bridge.base.org/deposit
   - Switch to Sepolia testnet
   - Bridge some Sepolia ETH to Base Sepolia

2. **Alternative - Get Sepolia ETH first**:
   - Sepolia Faucet: https://sepoliafaucet.com/
   - Then bridge to Base Sepolia using the bridge above

3. **Verify your balance**:
   ```bash
   cast balance YOUR_ADDRESS --rpc-url base_sepolia
   ```

---

## Deployment Steps

### Step 1: Build and Test

```bash
# Build all contracts
forge build

# Run tests for new contracts
forge test --match-contract "BuildProofToken" -vv
forge test --match-contract "BuilderLiquidityPool" -vv

# Format code
forge fmt
```

### Step 2: Deploy Contracts

```bash
# Deploy to Base Sepolia with verification
forge script script/DeployNewDeFi.s.sol:DeployNewDeFi \
    --rpc-url base_sepolia \
    --broadcast \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY \
    -vvvv
```

### Step 3: Verify Deployment

After deployment, you'll see output like:

```
====================================
Deployment Summary
====================================
BuildProofToken: 0x...
BuilderLiquidityPool: 0x...
BuilderTimelock: 0x...
====================================
```

**Save these addresses!** You'll need them for:
- Frontend configuration
- Contract interactions
- Documentation

### Step 4: Verify Contracts on BaseScan

If automatic verification didn't work, manually verify:

```bash
# Verify BuildProofToken
forge verify-contract \
    <BPROOF_TOKEN_ADDRESS> \
    contracts/BuildProofToken.sol:BuildProofToken \
    --chain base-sepolia \
    --constructor-args $(cast abi-encode "constructor(uint256)" 100000000000000000000000000)

# Verify BuilderLiquidityPool
forge verify-contract \
    <POOL_ADDRESS> \
    contracts/BuilderLiquidityPool.sol:BuilderLiquidityPool \
    --chain base-sepolia \
    --constructor-args $(cast abi-encode "constructor(address)" <BPROOF_TOKEN_ADDRESS>)

# Verify BuilderTimelock
forge verify-contract \
    <TIMELOCK_ADDRESS> \
    contracts/BuilderTimelock.sol:BuilderTimelock \
    --chain base-sepolia \
    --constructor-args $(cast abi-encode "constructor(uint256,address[],address[],address)" 172800 "[<DEPLOYER>]" "[<DEPLOYER>]" <DEPLOYER>)
```

---

## Post-Deployment Configuration

### 1. Update Frontend Environment Variables

Update your frontend `.env.local` or `.env`:

```bash
# Add to your .env.local
NEXT_PUBLIC_BPROOF_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS=0x...
NEXT_PUBLIC_TIMELOCK_ADDRESS=0x...
NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID=84532
```

### 2. Initialize Liquidity Pool

Add initial liquidity to the pool:

```bash
# Approve tokens for pool
cast send <BPROOF_TOKEN_ADDRESS> \
    "approve(address,uint256)" \
    <POOL_ADDRESS> \
    1000000000000000000000 \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY

# Add liquidity (1000 BPROOF + 1 ETH)
cast send <POOL_ADDRESS> \
    "addLiquidity(uint256,uint256)" \
    1000000000000000000000 \
    0 \
    --value 1ether \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY
```

### 3. Configure Minters (Optional)

If you want to allow other addresses to mint tokens:

```bash
cast send <BPROOF_TOKEN_ADDRESS> \
    "addMinter(address)" \
    <MINTER_ADDRESS> \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY
```

---

## Contract Interactions

### BuildProofToken

```bash
# Check balance
cast call <BPROOF_TOKEN_ADDRESS> \
    "balanceOf(address)(uint256)" \
    <YOUR_ADDRESS> \
    --rpc-url base_sepolia

# Transfer tokens
cast send <BPROOF_TOKEN_ADDRESS> \
    "transfer(address,uint256)" \
    <RECIPIENT> \
    1000000000000000000 \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY

# Delegate voting power
cast send <BPROOF_TOKEN_ADDRESS> \
    "delegate(address)" \
    <DELEGATE_ADDRESS> \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY
```

### BuilderLiquidityPool

```bash
# Get quote for swapping 100 BPROOF to ETH
cast call <POOL_ADDRESS> \
    "getQuoteBproofToEth(uint256)(uint256)" \
    100000000000000000000 \
    --rpc-url base_sepolia

# Swap BPROOF for ETH
cast send <POOL_ADDRESS> \
    "swapBproofForEth(uint256,uint256)" \
    100000000000000000000 \
    0 \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY

# Swap ETH for BPROOF
cast send <POOL_ADDRESS> \
    "swapEthForBproof(uint256)" \
    0 \
    --value 0.1ether \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY
```

---

## Verification Checklist

- [ ] All contracts deployed successfully
- [ ] Contracts verified on BaseScan
- [ ] Contract addresses saved and documented
- [ ] Frontend .env updated with contract addresses
- [ ] Initial liquidity added to pool
- [ ] Test swaps working correctly
- [ ] Token transfers working
- [ ] Delegation functioning
- [ ] Documentation updated

---

## Troubleshooting

### Issue: "Insufficient funds for gas * price + value"
**Solution**: Make sure you have enough Base Sepolia ETH. Get more from the faucet.

### Issue: "Contract verification failed"
**Solution**: Try manual verification with the commands in Step 4, or check BaseScan for existing verification.

### Issue: "execution reverted"
**Solution**: Check that:
- You've approved tokens before trying to transfer them
- You have sufficient balance
- Gas limit is sufficient

### Issue: "Invalid API key"
**Solution**: Double-check your `BASESCAN_API_KEY` in the `.env` file.

---

## Security Notes

- **NEVER** commit your `.env` file or private keys to git
- Use a separate wallet for testnet deployments
- Test thoroughly on testnet before considering mainnet deployment
- Consider using a multisig wallet for contract ownership in production

---

## Next Steps

1. **Test the contracts** thoroughly on Base Sepolia
2. **Integrate with frontend** using the WalletConnect setup
3. **Gather user feedback** from the testnet deployment
4. **Security audit** before mainnet deployment
5. **Prepare mainnet deployment** plan

---

## Useful Links

- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Base Sepolia Bridge**: https://bridge.base.org/deposit
- **Foundry Book**: https://book.getfoundry.sh/
- **Base Documentation**: https://docs.base.org

---

## Support

If you encounter issues:
1. Check the Foundry documentation
2. Review Base Sepolia block explorer for transaction details
3. Check contract verification status on BaseScan
4. Review the test suite for expected behavior

Happy Building! 🚀
