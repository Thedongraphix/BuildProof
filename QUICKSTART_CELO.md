# 🚀 Celo Deployment - Quick Start

Deploy BuildProof to Celo Alfajores testnet in 5 minutes!

## ⚡ Super Quick Start (3 Steps)

### 1. Get Test Tokens
Visit: **https://faucet.celo.org/alfajores**
- Paste your wallet address
- Request testnet CELO

### 2. Configure Private Key
```bash
# Edit .env file
nano .env

# Replace this line with your private key:
PRIVATE_KEY=your_actual_private_key_here
```

### 3. Deploy!
```bash
# Run the automated script
./deploy-celo.sh
```

That's it! 🎉

---

## 📝 What Gets Deployed

- ✅ Counter smart contract to Celo Alfajores
- ✅ Verified on Celoscan (if API key provided)
- ✅ Ready to interact via cast or frontend

---

## 🌐 Network Information

| Item | Value |
|------|-------|
| **Network Name** | Celo Alfajores Testnet |
| **RPC URL** | https://alfajores-forno.celo-testnet.org |
| **Chain ID** | 44787 |
| **Currency** | CELO |
| **Explorer** | https://alfajores.celoscan.io |
| **Faucet** | https://faucet.celo.org/alfajores |

---

## 🔑 Getting Your Private Key

### From MetaMask:
1. Click three dots (⋮)
2. Account details
3. Export Private Key
4. Enter password
5. Copy key (without 0x)

### ⚠️ Security Warning:
- **NEVER** share your private key
- **NEVER** commit it to git (already in .gitignore)
- Use a fresh wallet for testnet

---

## 🎯 After Deployment

### View on Celoscan:
```
https://alfajores.celoscan.io/address/YOUR_CONTRACT_ADDRESS
```

### Interact with Contract:
```bash
# Read current value
cast call YOUR_CONTRACT_ADDRESS "number()" --rpc-url celo_alfajores

# Increment counter
cast send YOUR_CONTRACT_ADDRESS "increment()" \\
  --rpc-url celo_alfajores \\
  --private-key $PRIVATE_KEY
```

### Start Frontend:
```bash
npm run dev
# Visit: http://localhost:3000
# Connect wallet and select Celo Alfajores network
```

---

## 🐛 Common Issues

### "insufficient funds"
→ Get more CELO from faucet: https://faucet.celo.org/alfajores

### "nonce too low"
→ Reset account in MetaMask: Settings → Advanced → Reset Account

### "command not found: forge"
→ Install Foundry: https://book.getfoundry.sh

---

## 📚 Need More Help?

- **Detailed Guide:** [CELO_DEPLOYMENT_GUIDE.md](./CELO_DEPLOYMENT_GUIDE.md)
- **Celo Docs:** https://docs.celo.org
- **Celo Discord:** https://discord.gg/celo

---

## 🚀 Manual Deployment (Alternative)

If you prefer manual control:

```bash
# 1. Compile
forge build

# 2. Test
forge test

# 3. Deploy
forge script script/DeployCelo.s.sol \\
  --rpc-url celo_alfajores \\
  --broadcast \\
  --verify
```

---

**Ready? Run `./deploy-celo.sh` and deploy in seconds!** 🎊
