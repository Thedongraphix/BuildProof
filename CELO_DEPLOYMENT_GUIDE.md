# 🚀 Celo Sepolia Testnet Deployment Guide

Complete step-by-step guide to deploy BuildProof smart contracts on **Celo Sepolia testnet** (Celo's new developer testnet).

---

## 📋 What is Celo Sepolia?

The **Celo Sepolia Testnet** is Celo's new developer testnet built on Ethereum Sepolia. It's designed to replace Alfajores and provides a stable environment for developers to build, test, and deploy decentralized applications.

**Key Details:**
- **Chain ID**: 11142220
- **L1 Foundation**: Built on Ethereum Sepolia
- **Fresh State**: Clean slate, no inheritance from Alfajores
- **Explorer**: https://celo-sepolia.blockscout.com

---

## 📋 Prerequisites

1. **Node.js and npm** (v18+)
2. **Foundry** ([Install Here](https://book.getfoundry.sh/getting-started/installation))
3. **MetaMask** or Web3 wallet

---

## 🔧 Step 1: Add Celo Sepolia to MetaMask

```
Network Name: Celo Sepolia Testnet
RPC URL: https://1rpc.io/celo/sepolia
Chain ID: 11142220
Currency Symbol: CELO
Block Explorer: https://celo-sepolia.blockscout.com
```

---

## 💰 Step 2: Get Test CELO Tokens

**Option 1:** https://faucet.celo.org/celo-sepolia
**Option 2:** https://cloud.google.com/application/web3/faucet/celo/sepolia

---

## 🔐 Step 3: Configure Private Key

```bash
# Edit .env file
nano .env

# Add your private key (without 0x)
PRIVATE_KEY=your_private_key_here
```

⚠️ **Use a test wallet only!**

---

## 📦 Step 4: Install & Compile

```bash
# Install dependencies
forge install
npm install

# Compile contracts
forge build

# Run tests
forge test
```

---

## 🚀 Step 5: Deploy to Celo Sepolia

### Quick Deploy (Automated):
```bash
./deploy-celo.sh
```

### Manual Deploy:
```bash
forge script script/DeployCelo.s.sol \
  --rpc-url celo_sepolia \
  --broadcast \
  --verify
```

**Save your contract address!**

---

## ✅ Step 6: Verify on Blockscout

Visit: `https://celo-sepolia.blockscout.com/address/YOUR_CONTRACT_ADDRESS`

---

## 🔄 Step 7: Interact with Contract

```bash
# Read state
cast call YOUR_CONTRACT_ADDRESS "number()" --rpc-url celo_sepolia

# Write transaction
cast send YOUR_CONTRACT_ADDRESS "increment()" \
  --rpc-url celo_sepolia \
  --private-key $PRIVATE_KEY
```

---

## 🌐 Step 8: Connect Frontend

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Connect wallet → Select Celo Sepolia
```

---

## 📊 Quick Reference

| Resource | URL |
|----------|-----|
| **Chain ID** | 11142220 |
| **RPC** | https://1rpc.io/celo/sepolia |
| **Explorer** | https://celo-sepolia.blockscout.com |
| **Faucet 1** | https://faucet.celo.org/celo-sepolia |
| **Faucet 2** | https://cloud.google.com/application/web3/faucet/celo/sepolia |
| **Docs** | https://docs.celo.org |

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| insufficient funds | Get more from faucet |
| nonce too low | Reset account in MetaMask |
| forge not found | Install Foundry |
| RPC error | Check .env configuration |

---

## 💡 Quick Commands

```bash
# Deploy
forge script script/DeployCelo.s.sol --rpc-url celo_sepolia --broadcast

# Check balance
cast balance YOUR_ADDRESS --rpc-url celo_sepolia

# Get block number
cast block-number --rpc-url celo_sepolia
```

---

## 🎉 Success Checklist

- [ ] Celo Sepolia added to wallet
- [ ] Test CELO tokens received
- [ ] Private key in .env
- [ ] Contract deployed
- [ ] Contract verified
- [ ] Frontend connected

---

**🎊 You're all set! Deploy with `./deploy-celo.sh`**

For detailed info, see [Celo Docs](https://docs.celo.org)
