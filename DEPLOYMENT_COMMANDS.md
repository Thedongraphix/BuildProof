# Quick Deployment Commands

## 🚀 Git Commits Created

Successfully created 4 commits ready to push:

```bash
939c699 style: apply forge fmt formatting to existing contracts
edd9609 docs: add comprehensive deployment guide for Base Sepolia
c87fbd6 deploy: add deployment script for new DeFi contracts on Base Sepolia
c65225e test: add comprehensive tests for new DeFi contracts
4b35b61 feat: add advanced DeFi contracts
```

**Push to GitHub:**
```bash
git push origin main
```

---

## ⚙️ Setup Environment (Required before deployment)

### 1. Update your `.env` file:

```bash
# Make sure your PRIVATE_KEY has 0x prefix
PRIVATE_KEY=0xyour_private_key_here

# Get BaseScan API key from: https://basescan.org/myapikey
BASESCAN_API_KEY=your_actual_basescan_api_key_here
```

### 2. Get Base Sepolia ETH:

**Option A: Bridge from Sepolia**
1. Get Sepolia ETH: https://sepoliafaucet.com/
2. Bridge to Base Sepolia: https://bridge.base.org/deposit

**Option B: Direct Faucets**
- Alchemy Faucet: https://www.alchemy.com/faucets/base-sepolia
- QuickNode Faucet: https://faucet.quicknode.com/base/sepolia

### 3. Verify you have funds:

```bash
# Check your balance (replace with your address)
cast balance YOUR_ADDRESS --rpc-url base_sepolia
```

---

## 🚀 Deploy Contracts

Once your environment is configured:

```bash
# Deploy all three contracts at once
forge script script/DeployNewDeFi.s.sol:DeployNewDeFi \
    --rpc-url base_sepolia \
    --broadcast \
    --verify \
    -vvvv
```

**Expected output:**
```
====================================
Deployment Summary
====================================
BuildProofToken: 0x...
BuilderLiquidityPool: 0x...
BuilderTimelock: 0x...
====================================
```

**Save these addresses!** You'll need them for verification and frontend configuration.

---

## ✅ Verify Contracts (if auto-verify fails)

### BuildProofToken:
```bash
forge verify-contract \
    <BPROOF_TOKEN_ADDRESS> \
    contracts/BuildProofToken.sol:BuildProofToken \
    --chain-id 84532 \
    --etherscan-api-key $BASESCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(uint256)" 100000000000000000000000000) \
    --watch
```

### BuilderLiquidityPool:
```bash
forge verify-contract \
    <POOL_ADDRESS> \
    contracts/BuilderLiquidityPool.sol:BuilderLiquidityPool \
    --chain-id 84532 \
    --etherscan-api-key $BASESCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(address)" <BPROOF_TOKEN_ADDRESS>) \
    --watch
```

### BuilderTimelock:
```bash
# Get deployer address first
DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY)

# Verify timelock
forge verify-contract \
    <TIMELOCK_ADDRESS> \
    contracts/BuilderTimelock.sol:BuilderTimelock \
    --chain-id 84532 \
    --etherscan-api-key $BASESCAN_API_KEY \
    --constructor-args $(cast abi-encode "constructor(uint256,address[],address[],address)" 172800 "[$DEPLOYER]" "[$DEPLOYER]" $DEPLOYER) \
    --watch
```

---

## 🔍 Check Verification Status

Visit BaseScan to see your verified contracts:

- BuildProofToken: `https://sepolia.basescan.org/address/<BPROOF_TOKEN_ADDRESS>`
- BuilderLiquidityPool: `https://sepolia.basescan.org/address/<POOL_ADDRESS>`
- BuilderTimelock: `https://sepolia.basescan.org/address/<TIMELOCK_ADDRESS>`

---

## 📝 Update Frontend

After deployment, update your frontend `.env.local`:

```bash
NEXT_PUBLIC_BPROOF_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS=0x...
NEXT_PUBLIC_TIMELOCK_ADDRESS=0x...
NEXT_PUBLIC_BASE_SEPOLIA_CHAIN_ID=84532
```

---

## 🎯 Post-Deployment Actions

### 1. Add Initial Liquidity:

```bash
# Approve tokens
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

### 2. Test a Swap:

```bash
# Swap 0.1 ETH for BPROOF
cast send <POOL_ADDRESS> \
    "swapEthForBproof(uint256)" \
    0 \
    --value 0.1ether \
    --rpc-url base_sepolia \
    --private-key $PRIVATE_KEY
```

### 3. Check Token Balance:

```bash
cast call <BPROOF_TOKEN_ADDRESS> \
    "balanceOf(address)(uint256)" \
    $(cast wallet address --private-key $PRIVATE_KEY) \
    --rpc-url base_sepolia
```

---

## 🎉 Summary of New Contracts

### BuildProofToken (BPROOF)
- **Type**: ERC20 governance token with voting, delegation, and permit
- **Features**: Transfer tax (configurable), minter roles, pausable
- **Max Supply**: 1 billion tokens
- **Initial Supply**: 100 million tokens

### BuilderLiquidityPool
- **Type**: AMM liquidity pool for BPROOF/ETH pair
- **Features**: Constant product formula (x * y = k), 0.3% trading fee
- **Operations**: Add/remove liquidity, swap tokens, get quotes

### BuilderTimelock
- **Type**: Governance timelock controller
- **Features**: 2-day minimum delay, proposer/executor roles
- **Purpose**: Adds security layer to governance decisions

---

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for comprehensive deployment instructions and troubleshooting.

---

**Ready to deploy?** Make sure your `.env` is configured and run the deployment command! 🚀
