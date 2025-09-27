# 🚀 BuildProof Base Testnet Deployment Guide

## Prerequisites Checklist
- [ ] Private key added to `.env` file
- [ ] Base Sepolia testnet ETH in your wallet (from faucet)
- [ ] Basescan API key (optional but recommended)

## Deployment Commands

### 1. Install Foundry Dependencies
```bash
forge install
```

### 2. Build Contracts
```bash
forge build
```

### 3. Test Contracts (Optional)
```bash
forge test
```

### 4. Deploy to Base Sepolia
```bash
forge script script/DeployBase.s.sol --rpc-url base_sepolia --broadcast --verify
```

### 5. If Verification Fails, Manual Verify
```bash
forge verify-contract \
  --chain-id 84532 \
  --num-of-optimizations 200 \
  --compiler-version 0.8.26 \
  <CONTRACT_ADDRESS> \
  contracts/ContractRegistry.sol:ContractRegistry \
  --etherscan-api-key $BASESCAN_API_KEY
```

## Expected Output
After successful deployment, you should see:
```
ContractRegistry deployed at: 0x[ADDRESS]
Deployer address: 0x[YOUR_ADDRESS]
Chain ID: 84532
```

## Next Steps After Deployment
1. Copy the contract address from the output
2. Add it to your `.env` file as `NEXT_PUBLIC_CONTRACT_REGISTRY_ADDRESS`
3. Update frontend to use Base testnet
4. Test the complete system

## Troubleshooting
- **"insufficient funds"**: Get more test ETH from faucet
- **"nonce too low"**: Wait a few minutes and retry
- **"verification failed"**: Use manual verification command above