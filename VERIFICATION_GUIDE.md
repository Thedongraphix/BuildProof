# Smart Contract Verification Guide - Manual CLI Method

This guide provides step-by-step instructions for manually verifying smart contracts on various blockchain explorers using the command line interface (CLI).

## Prerequisites

Before you begin, ensure you have:

1. **Foundry installed** - Run `forge --version` to verify
2. **API Keys** for the block explorers you want to verify on:
   - Etherscan API key (for Ethereum, Sepolia, Base, etc.)
   - Celoscan API key (for Celo networks)
   - BaseScan API key (for Base network)
3. **Deployed contract address** - The address where your contract is deployed
4. **Environment variables set** in your `.env` file:
   ```bash
   PRIVATE_KEY=your_private_key_here
   ETHERSCAN_API_KEY=your_etherscan_api_key
   BASESCAN_API_KEY=your_basescan_api_key
   CELOSCAN_API_KEY=your_celoscan_api_key
   ```

## BuildProof Smart Contracts

The project includes the following contracts ready for deployment and verification:

### 1. BuilderBounty
A decentralized bounty system where builders can post rewards for completed work.

**Key Features:**
- Create bounties with ETH rewards
- Claim and submit work with IPFS proofs
- Platform fee system (2.5% default)
- Automatic payment distribution

### 2. BuilderReputation
An on-chain reputation system for tracking builder credentials and achievements.

**Key Features:**
- Builder profiles with reputation scores
- Skill endorsements from peers
- Achievement tracking system
- Authorized issuer management

## Deployment & Verification Process

### Method 1: Deploy and Verify in One Command (Recommended)

This is the fastest method - it deploys and verifies your contract in a single command.

#### For BuilderBounty Contract:

**On Sepolia Testnet:**
```bash
forge script script/DeployBounty.s.sol \
  --rpc-url sepolia \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

**On Base Sepolia:**
```bash
forge script script/DeployBounty.s.sol \
  --rpc-url base-sepolia \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY
```

**On Celo Sepolia:**
```bash
forge script script/DeployBounty.s.sol \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --broadcast \
  --verify \
  --verifier blockscout \
  --verifier-url https://celo-sepolia.blockscout.com/api
```

#### For BuilderReputation Contract:

**On Sepolia Testnet:**
```bash
forge script script/DeployReputation.s.sol \
  --rpc-url sepolia \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

**On Base Sepolia:**
```bash
forge script script/DeployReputation.s.sol \
  --rpc-url base-sepolia \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY
```

**On Celo Sepolia:**
```bash
forge script script/DeployReputation.s.sol \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --broadcast \
  --verify \
  --verifier blockscout \
  --verifier-url https://celo-sepolia.blockscout.com/api
```

---

### Method 2: Deploy First, Verify Later

If you've already deployed your contract and need to verify it separately:

#### Step 1: Deploy the Contract

**For BuilderBounty:**
```bash
forge script script/DeployBounty.s.sol \
  --rpc-url <network_rpc_url> \
  --broadcast
```

**For BuilderReputation:**
```bash
forge script script/DeployReputation.s.sol \
  --rpc-url <network_rpc_url> \
  --broadcast
```

After deployment, note the contract address from the console output.

#### Step 2: Verify the Deployed Contract

**On Etherscan-based explorers (Ethereum, Sepolia, Base):**

For BuilderBounty:
```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  contracts/BuilderBounty.sol:BuilderBounty \
  --chain <chain_id> \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --watch
```

For BuilderReputation:
```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  contracts/BuilderReputation.sol:BuilderReputation \
  --chain <chain_id> \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --watch
```

**On Blockscout-based explorers (Celo):**

For BuilderBounty:
```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  contracts/BuilderBounty.sol:BuilderBounty \
  --verifier blockscout \
  --verifier-url https://celo-sepolia.blockscout.com/api \
  --watch
```

For BuilderReputation:
```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  contracts/BuilderReputation.sol:BuilderReputation \
  --verifier blockscout \
  --verifier-url https://celo-sepolia.blockscout.com/api \
  --watch
```

---

### Method 3: Manual Verification with Constructor Arguments

If your contract has constructor arguments (like ContractRegistry), you need to encode them:

#### Step 1: Encode Constructor Arguments (if applicable)

For contracts without constructor arguments (BuilderBounty, BuilderReputation), skip this step.

For contracts with constructor arguments:
```bash
cast abi-encode "constructor(uint256,address)" <arg1> <arg2>
```

#### Step 2: Verify with Encoded Arguments

```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  contracts/YourContract.sol:YourContract \
  --chain <chain_id> \
  --constructor-args <encoded_args> \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --watch
```

---

## Network-Specific Parameters

### Chain IDs:
- **Ethereum Mainnet:** `1`
- **Sepolia Testnet:** `11155111`
- **Base Mainnet:** `8453`
- **Base Sepolia:** `84532`
- **Celo Mainnet:** `42220`
- **Celo Sepolia (Alfajores):** `44787`

### RPC URLs:
Add these to your `foundry.toml` or use directly:

```toml
[rpc_endpoints]
sepolia = "https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}"
base = "https://mainnet.base.org"
base-sepolia = "https://sepolia.base.org"
celo = "https://forno.celo.org"
celo-sepolia = "https://alfajores-forno.celo-testnet.org"
```

### Explorer URLs:
- **Etherscan (Sepolia):** https://sepolia.etherscan.io/
- **BaseScan (Base Sepolia):** https://sepolia.basescan.org/
- **Celo Explorer (Alfajores):** https://celo-sepolia.blockscout.com/

---

## Verification Flags Explained

| Flag | Description |
|------|-------------|
| `--verify` | Automatically verify after deployment |
| `--etherscan-api-key` | Your Etherscan API key (required for Etherscan-based explorers) |
| `--verifier` | Specify verifier type (`etherscan` or `blockscout`) |
| `--verifier-url` | Custom verifier API URL (for Blockscout) |
| `--chain` | Chain ID of the network |
| `--constructor-args` | Encoded constructor arguments |
| `--watch` | Wait for verification to complete |
| `--broadcast` | Broadcast the transaction on-chain |

---

## Troubleshooting

### Issue 1: "Contract source code already verified"
This means the contract is already verified. Check the explorer directly.

### Issue 2: "Invalid API Key"
- Verify your API key is correct in `.env`
- Ensure you're using the right API key for the network (Etherscan vs BaseScan vs Celoscan)
- Check API key has verification permissions enabled

### Issue 3: "Unable to locate ContractName"
- Ensure the contract path is correct: `contracts/ContractName.sol:ContractName`
- Run `forge build` to compile contracts first
- Check for typos in contract name

### Issue 4: "Constructor arguments mismatch"
- For contracts without constructors (BuilderBounty, BuilderReputation), don't include `--constructor-args`
- If contract has constructors, encode them with `cast abi-encode`
- Verify argument types match contract constructor exactly

### Issue 5: Verification Timeout
- Add `--watch` flag to wait for completion
- Check explorer manually after 2-3 minutes
- Network congestion may delay verification

---

## Verification Checklist

Before verifying, ensure:

- [ ] Contract is deployed and you have the address
- [ ] You have the correct API key for the target network
- [ ] Your `.env` file is properly configured
- [ ] You're using the correct chain ID
- [ ] Contract source code matches deployed bytecode
- [ ] All dependencies are properly installed (`forge build` succeeds)

---

## Example: Complete Workflow

### Deploy and Verify BuilderBounty on Sepolia:

1. **Set up environment:**
   ```bash
   source .env
   ```

2. **Deploy with verification:**
   ```bash
   forge script script/DeployBounty.s.sol \
     --rpc-url sepolia \
     --broadcast \
     --verify \
     --etherscan-api-key $ETHERSCAN_API_KEY
   ```

3. **Note the contract address from output**

4. **Visit Sepolia Etherscan to confirm:**
   ```
   https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>
   ```

### If Verification Fails, Retry Manually:

```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  contracts/BuilderBounty.sol:BuilderBounty \
  --chain 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --watch
```

---

## Advanced: Verify with Foundry.toml Configuration

You can streamline verification by adding default settings to `foundry.toml`:

```toml
[etherscan]
sepolia = { key = "${ETHERSCAN_API_KEY}" }
base-sepolia = { key = "${BASESCAN_API_KEY}" }
celo-sepolia = { key = "${CELOSCAN_API_KEY}", url = "https://celo-sepolia.blockscout.com/api" }
```

Then verify with:
```bash
forge verify-contract <CONTRACT_ADDRESS> <CONTRACT_PATH> --chain <chain_id>
```

---

## Resources

- **Foundry Book:** https://book.getfoundry.sh/reference/forge/forge-verify-contract
- **Etherscan API:** https://docs.etherscan.io/
- **BaseScan:** https://docs.basescan.org/
- **Celo Blockscout:** https://docs.blockscout.com/

---

## Contract-Specific Verification Examples

### BuilderBounty:
```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  contracts/BuilderBounty.sol:BuilderBounty \
  --chain 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### BuilderReputation:
```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  contracts/BuilderReputation.sol:BuilderReputation \
  --chain 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### ContractRegistry (Already in Project):
```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  contracts/ContractRegistry.sol:ContractRegistry \
  --chain 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

### Counter (Simple Example):
```bash
forge verify-contract \
  <CONTRACT_ADDRESS> \
  contracts/Counter.sol:Counter \
  --chain 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

---

## Summary

For the **fastest verification** of BuilderBounty and BuilderReputation:

**Sepolia:**
```bash
forge script script/DeployBounty.s.sol --rpc-url sepolia --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
forge script script/DeployReputation.s.sol --rpc-url sepolia --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
```

**Base Sepolia:**
```bash
forge script script/DeployBounty.s.sol --rpc-url base-sepolia --broadcast --verify --etherscan-api-key $BASESCAN_API_KEY
forge script script/DeployReputation.s.sol --rpc-url base-sepolia --broadcast --verify --etherscan-api-key $BASESCAN_API_KEY
```

**Celo Sepolia:**
```bash
forge script script/DeployBounty.s.sol --rpc-url https://alfajores-forno.celo-testnet.org --broadcast --verify --verifier blockscout --verifier-url https://celo-sepolia.blockscout.com/api
forge script script/DeployReputation.s.sol --rpc-url https://alfajores-forno.celo-testnet.org --broadcast --verify --verifier blockscout --verifier-url https://celo-sepolia.blockscout.com/api
```

Happy building! 🚀
