# 🚀 Celo Sepolia - 3-Step Quick Start

Deploy to Celo's new Sepolia testnet in 5 minutes!

## ⚡ Deploy in 3 Steps

### 1. Get Test Tokens
Visit: **https://faucet.celo.org/celo-sepolia**

Or: **https://cloud.google.com/application/web3/faucet/celo/sepolia**

### 2. Add Private Key
```bash
nano .env
# Replace: PRIVATE_KEY=your_actual_private_key_here
```

### 3. Deploy!
```bash
./deploy-celo.sh
```

**Done! 🎉**

---

## 🌐 Network Info

```
Network: Celo Sepolia Testnet
RPC: https://1rpc.io/celo/sepolia
Chain ID: 11142220
Explorer: https://celo-sepolia.blockscout.com
Faucet: https://faucet.celo.org/celo-sepolia
```

---

## 🔑 Get Private Key (MetaMask)

1. Three dots (⋮) → Account details
2. Export Private Key
3. Enter password
4. Copy key (**without 0x**)

⚠️ **Use test wallet only!**

---

## 🎯 After Deployment

### View Contract:
```
https://celo-sepolia.blockscout.com/address/YOUR_ADDRESS
```

### Interact:
```bash
# Read
cast call YOUR_ADDRESS "number()" --rpc-url celo_sepolia

# Write
cast send YOUR_ADDRESS "increment()" \
  --rpc-url celo_sepolia \
  --private-key $PRIVATE_KEY
```

### Start Frontend:
```bash
npm run dev
# Visit http://localhost:3000
```

---

## 🐛 Quick Fixes

| Issue | Fix |
|-------|-----|
| "insufficient funds" | Get more from faucet |
| "nonce too low" | Reset account in MetaMask |
| "forge not found" | [Install Foundry](https://book.getfoundry.sh) |

---

## 📚 Need Help?

- **Full Guide:** [CELO_DEPLOYMENT_GUIDE.md](./CELO_DEPLOYMENT_GUIDE.md)
- **Celo Docs:** https://docs.celo.org
- **Discord:** https://discord.gg/celo

---

## 🚀 Manual Deploy

```bash
forge build
forge test
forge script script/DeployCelo.s.sol --rpc-url celo_sepolia --broadcast
```

---

**Ready? Run `./deploy-celo.sh` now!** 🎊
