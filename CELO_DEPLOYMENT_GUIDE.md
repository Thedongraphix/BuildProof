# 🚀 Celo Alfajores Testnet Deployment Guide

Complete step-by-step guide to deploy BuildProof smart contracts on Celo Alfajores testnet.

---

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js and npm** installed (v18 or later)
2. **Foundry** installed ([Installation Guide](https://book.getfoundry.sh/getting-started/installation))
3. **Git** installed
4. **MetaMask** or another Web3 wallet

---

## 🔧 Step 1: Set Up Your Wallet for Celo Alfajores

### 1.1 Add Celo Alfajores to MetaMask

1. Open MetaMask
2. Click the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add Network" → "Add a network manually"
4. Enter the following details:

```
Network Name: Celo Alfajores Testnet
RPC URL: https://alfajores-forno.celo-testnet.org
Chain ID: 44787
Currency Symbol: CELO
Block Explorer URL: https://alfajores.celoscan.io
```

5. Click "Save"

### 1.2 Get Test CELO Tokens

1. Visit the Celo Faucet: **https://faucet.celo.org/alfajores**
2. Connect your wallet or paste your wallet address
3. Request test CELO tokens
4. Wait 30-60 seconds for tokens to arrive
5. Verify balance in MetaMask (switch to Celo Alfajores network)

**Alternative Faucet:** https://celo.org/developers/faucet

---

## 🔐 Step 2: Configure Environment Variables

### 2.1 Export Your Private Key

**⚠️ WARNING: Never share or commit your private key!**

From MetaMask:
1. Click the three dots menu
2. Select "Account details"
3. Click "Export Private Key"
4. Enter your password
5. Copy the private key

### 2.2 Update .env File

```bash
# Open .env file
nano .env
```

Update the following variables:

```env
# Replace with your actual private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Celo RPC URLs (already configured)
CELO_RPC_URL=https://forno.celo.org
CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org

# Get API key from https://celoscan.io/myapikey (optional for verification)
CELOSCAN_API_KEY=your_celoscan_api_key
```

**🔒 Security Tip:** Add `.env` to `.gitignore` (already done in this project)

---

## 📦 Step 3: Install Dependencies

```bash
# Install Foundry dependencies
forge install

# Install npm packages
npm install
```

---

## 🏗️ Step 4: Compile Contracts

```bash
# Compile all smart contracts
forge build
```

Expected output:
```
[⠊] Compiling...
[⠒] Compiling 1 files with 0.8.26
[⠢] Solc 0.8.26 finished in X.XXs
Compiler run successful!
```

---

## 🧪 Step 5: Run Tests (Optional but Recommended)

```bash
# Run all tests
forge test

# Run tests with detailed output
forge test -vvv

# Run tests with gas report
forge test --gas-report
```

---

## 🚀 Step 6: Deploy to Celo Alfajores

### 6.1 Dry Run (Simulation)

Test deployment without broadcasting:

```bash
forge script script/DeployCelo.s.sol --rpc-url celo_alfajores
```

### 6.2 Actual Deployment

Deploy and broadcast transactions:

```bash
forge script script/DeployCelo.s.sol \
  --rpc-url celo_alfajores \
  --broadcast \
  --verify
```

**Breakdown of flags:**
- `--rpc-url celo_alfajores`: Use Celo Alfajores testnet
- `--broadcast`: Actually send transactions
- `--verify`: Verify contract on Celoscan (requires API key)

### 6.3 Without Verification

If you don't have a Celoscan API key yet:

```bash
forge script script/DeployCelo.s.sol \
  --rpc-url celo_alfajores \
  --broadcast
```

Expected output:
```
========================================
Celo Alfajores Deployment Complete
========================================
Counter deployed to: 0x...
Network: Celo Alfajores Testnet
Chain ID: 44787
========================================
```

**📝 Save the deployed contract address!**

---

## ✅ Step 7: Verify Deployment

### 7.1 Check on Celoscan

Visit: `https://alfajores.celoscan.io/address/YOUR_CONTRACT_ADDRESS`

You should see:
- Contract creation transaction
- Contract bytecode
- Transaction history

### 7.2 Verify Contract Source Code (if not done automatically)

```bash
forge verify-contract \
  YOUR_CONTRACT_ADDRESS \
  contracts/Counter.sol:Counter \
  --chain celo_alfajores \
  --watch
```

---

## 🔄 Step 8: Interact with Deployed Contract

### 8.1 Read Contract State

```bash
# Read current counter value
cast call YOUR_CONTRACT_ADDRESS \
  "number()" \
  --rpc-url celo_alfajores
```

### 8.2 Write to Contract

```bash
# Increment counter
cast send YOUR_CONTRACT_ADDRESS \
  "increment()" \
  --rpc-url celo_alfajores \
  --private-key $PRIVATE_KEY

# Set number to specific value
cast send YOUR_CONTRACT_ADDRESS \
  "setNumber(uint256)" \
  42 \
  --rpc-url celo_alfajores \
  --private-key $PRIVATE_KEY
```

---

## 🌐 Step 9: Connect Frontend to Celo

The frontend is already configured for Celo! Just:

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000

3. Click "Connect Wallet"

4. Switch to **Celo Alfajores** network in the wallet selector

5. You can now interact with Celo contracts!

---

## 🎯 Step 10: Update Frontend with Contract Address

### 10.1 Update Environment Variables

Add your deployed contract address to `.env.local`:

```bash
# Create .env.local if it doesn't exist
touch .env.local

# Add your contract address
echo "NEXT_PUBLIC_COUNTER_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS" >> .env.local
```

### 10.2 Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Restart
npm run dev
```

---

## 📊 Useful Celo Alfajores Resources

| Resource | URL |
|----------|-----|
| **Faucet** | https://faucet.celo.org/alfajores |
| **Block Explorer** | https://alfajores.celoscan.io |
| **RPC Endpoint** | https://alfajores-forno.celo-testnet.org |
| **Celo Docs** | https://docs.celo.org |
| **Chain ID** | 44787 |
| **Network Status** | https://stats.celo.org |

---

## 🐛 Troubleshooting

### Issue: "insufficient funds for gas"

**Solution:** Get more test CELO from the faucet
```bash
# Visit: https://faucet.celo.org/alfajores
```

### Issue: "nonce too low"

**Solution:** Reset your account in MetaMask
1. Settings → Advanced → Reset Account

### Issue: "failed to verify contract"

**Solution:** Manually verify on Celoscan
1. Go to https://alfajores.celoscan.io
2. Find your contract
3. Click "Contract" → "Verify and Publish"
4. Fill in compiler details from `foundry.toml`

### Issue: "could not connect to RPC"

**Solution:** Check RPC endpoint is correct in `.env`
```bash
CELO_ALFAJORES_RPC_URL=https://alfajores-forno.celo-testnet.org
```

---

## 🔄 Redeployment

To redeploy (e.g., after contract changes):

```bash
# 1. Make your changes
# 2. Recompile
forge build

# 3. Run tests
forge test

# 4. Deploy again
forge script script/DeployCelo.s.sol \
  --rpc-url celo_alfajores \
  --broadcast \
  --verify
```

---

## 🎉 Success Checklist

- [ ] Celo Alfajores network added to wallet
- [ ] Test CELO tokens received
- [ ] Private key configured in `.env`
- [ ] Dependencies installed
- [ ] Contracts compiled successfully
- [ ] Tests passing
- [ ] Contract deployed to Celo Alfajores
- [ ] Contract address saved
- [ ] Contract verified on Celoscan
- [ ] Can interact with contract via cast
- [ ] Frontend connected to Celo network
- [ ] Can interact via web interface

---

## 🚀 Deploy to Celo Mainnet (Production)

**⚠️ Only deploy to mainnet when ready for production!**

1. Get real CELO tokens (buy on exchange)
2. Update RPC URL to mainnet:
```bash
forge script script/DeployCelo.s.sol \
  --rpc-url celo \
  --broadcast \
  --verify
```

**Mainnet RPC:** `https://forno.celo.org`
**Chain ID:** 42220

---

## 📚 Additional Resources

- [Celo Developer Documentation](https://docs.celo.org)
- [Foundry Book](https://book.getfoundry.sh)
- [Celo Discord Community](https://discord.gg/celo)
- [BuildProof Documentation](./README.md)

---

## 💡 Quick Command Reference

```bash
# Deploy to Celo Alfajores
forge script script/DeployCelo.s.sol --rpc-url celo_alfajores --broadcast --verify

# Read contract
cast call <ADDRESS> "number()" --rpc-url celo_alfajores

# Write to contract
cast send <ADDRESS> "increment()" --rpc-url celo_alfajores --private-key $PRIVATE_KEY

# Check balance
cast balance <YOUR_ADDRESS> --rpc-url celo_alfajores

# Get current block
cast block-number --rpc-url celo_alfajores
```

---

**🎊 Congratulations! You've successfully deployed to Celo Alfajores!**

For questions or issues, open an issue on GitHub or join the Celo Discord.
