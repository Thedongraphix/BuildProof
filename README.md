# BuildProof

<div align="center">
  <img src="https://img.shields.io/badge/Smart_Contract-Verifier-00ff41?style=for-the-badge&logo=ethereum&logoColor=black" alt="Smart Contract" />
  <img src="https://img.shields.io/badge/Security-Analysis-3b82f6?style=for-the-badge&logo=shield&logoColor=white" alt="Security" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</div>

<div align="center">
  <h3>🔍 Smart Contract Security Verifier</h3>
  <p>Instantly verify and analyze the security of any smart contract on the blockchain with our advanced verification engine.</p>
</div>

---

## ✨ What BuildProof Does

BuildProof is a **smart contract security verifier** that helps you check if blockchain contracts are safe to interact with. Think of it as a security scanner for crypto contracts.

### 🔍 **How It Works**
1. **Paste Any Contract Address**: Copy any Ethereum contract address (those long 0x... addresses)
2. **Instant Verification**: Our system analyzes the contract's code and security
3. **Get Results**: See a detailed security report in real-time

### 🛡️ **What We Check**
- **Security Vulnerabilities**: Common attack patterns like reentrancy, overflow, etc.
- **Access Controls**: Who can control the contract and how
- **Code Quality**: How well the contract is written and optimized
- **Gas Efficiency**: How much it costs to use the contract
- **Compliance**: Whether it follows industry standards

### 💡 **Why Use BuildProof?**
- **Stay Safe**: Avoid scam contracts and malicious code
- **Save Money**: Don't lose funds to poorly written contracts
- **Quick Analysis**: Get results in seconds, not hours
- **Easy to Use**: Just paste an address - no technical knowledge required
- **Always Free**: Complete security analysis at no cost

### 🎯 **Perfect For**
- **Crypto Investors**: Verify tokens before buying
- **DeFi Users**: Check protocols before depositing funds
- **NFT Collectors**: Analyze NFT contracts before minting
- **Developers**: Quick security audits during development
- **Anyone**: Who wants to stay safe in crypto

---

## 🚀 Quick Start

### 🌐 **Use Online (Easiest)**
Just visit our website and start verifying contracts immediately - no installation required!

### 💻 **Run Locally**
Want to run BuildProof on your own computer? Here's how:

1. **Download the code:**
```bash
git clone https://github.com/Thedongraphix/BuildProof.git
cd BuildProof
```

2. **Install requirements:**
```bash
npm install
```

3. **Start the app:**
```bash
npm run dev
```

4. **Open in browser:**
Go to `http://localhost:3000` and start verifying contracts!

---

## 📁 Project Structure

```
BuildProof/
├── contracts/              # Smart contracts (Solidity)
│   └── Counter.sol         # Example contract
├── src/                    # Next.js frontend application
│   ├── app/               # App Router pages and layouts
│   │   ├── globals.css    # Global styles and theme
│   │   ├── layout.tsx     # Root layout component
│   │   └── page.tsx       # Homepage component
│   ├── components/        # Reusable UI components
│   │   └── ui/           # shadcn/ui component library
│   └── lib/              # Utility functions and helpers
├── test/                  # Smart contract tests
├── script/               # Deployment and utility scripts
├── lib/                  # Foundry dependencies (git submodules)
│   ├── forge-std/        # Foundry standard library
│   └── openzeppelin-contracts/ # OpenZeppelin contracts
├── .github/workflows/    # CI/CD pipeline configuration
├── foundry.toml         # Foundry configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── package.json         # Node.js dependencies and scripts
```

---

## 🛠️ Development Commands

### Smart Contract Development

```bash
# Compile contracts
forge build

# Run tests
forge test

# Run tests with detailed output
forge test -vvv

# Generate gas report
forge test --gas-report

# Check code coverage
forge coverage

# Format code
forge fmt

# Deploy to local network
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Deploy to testnet
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
```

### Frontend Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

---

## 🎨 Design System

### Color Palette
- **Primary**: Blue (`#3B82F6`) - Used for primary actions and highlights
- **Background**: Dark Navy (`#0A0F1C`) - Main background color
- **Surface**: Gray-900 with transparency - Card and component backgrounds
- **Text**: Light colors with proper contrast ratios for accessibility

### Typography
- **Font Family**: Geist Sans & Geist Mono (optimized for web)
- **Scale**: Responsive typography scale following modern design principles

### Components
- **Buttons**: Multiple variants with hover states and animations
- **Cards**: Glass-morphism effect with backdrop blur
- **Navigation**: Sticky header with smooth transitions

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# RPC URLs
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY
ARBITRUM_RPC_URL=https://arbitrum-mainnet.infura.io/v3/YOUR_INFURA_KEY

# Explorer API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key

# Private Keys (DO NOT COMMIT REAL KEYS)
PRIVATE_KEY=your_private_key_here
DEPLOYER_PRIVATE_KEY=your_deployer_private_key_here
```

### Network Configuration

The project supports multiple networks out of the box:
- **Local**: Anvil (development)
- **Testnet**: Sepolia, Goerli
- **Mainnet**: Ethereum, Polygon, Arbitrum

---

## 🧪 Testing

### Smart Contract Tests

```bash
# Run all tests
forge test

# Run specific test file
forge test --match-path test/Counter.t.sol

# Run with gas reporting
forge test --gas-report

# Run with coverage
forge coverage --report lcov
```

### Frontend Tests

```bash
# Run Jest tests (when configured)
npm test

# Run E2E tests (when configured)
npm run test:e2e
```

---

## 🚀 Deployment

### Deploy to Celo Sepolia Testnet

**Step 1: Add Celo Sepolia to MetaMask**
```
Network Name: Celo Sepolia Testnet
RPC URL: https://1rpc.io/celo/sepolia
Chain ID: 11142220
Currency: CELO
Explorer: https://celo-sepolia.blockscout.com
```

**Step 2: Get Test Tokens**
- Faucet 1: https://faucet.celo.org/celo-sepolia
- Faucet 2: https://cloud.google.com/application/web3/faucet/celo/sepolia

**Step 3: Configure Private Key**
```bash
# Edit .env file
nano .env

# Add your private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here
```

**Step 4: Install Dependencies**
```bash
forge install
npm install
```

**Step 5: Compile & Test**
```bash
forge build
forge test
```

**Step 6: Deploy**
```bash
# Deploy without verification
forge script script/DeployCelo.s.sol --rpc-url celo_sepolia --broadcast

# Deploy with verification (requires CELOSCAN_API_KEY in .env)
forge script script/DeployCelo.s.sol --rpc-url celo_sepolia --broadcast --verify
```

**Step 7: Interact with Deployed Contract**
```bash
# Read contract state
cast call YOUR_CONTRACT_ADDRESS "number()" --rpc-url celo_sepolia

# Write to contract
cast send YOUR_CONTRACT_ADDRESS "increment()" --rpc-url celo_sepolia --private-key $PRIVATE_KEY
```

**Step 8: Connect Frontend**
```bash
npm run dev
# Open http://localhost:3000
# Connect wallet and select Celo Sepolia
```

### Local Deployment

```bash
# Start Anvil
anvil

# Deploy contracts
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Production Deployment

#### Smart Contracts
- Use multi-signature wallets for contract ownership
- Implement timelock contracts for critical functions
- Conduct thorough security audits before mainnet deployment

#### Frontend
- Deploy to Vercel, Netlify, or similar platforms
- Configure environment variables in deployment platform
- Set up custom domain and SSL certificates

---

## 🛡️ Security

### Best Practices Implemented
- **OpenZeppelin Standards**: Using battle-tested contract libraries
- **Static Analysis**: Integrated Slither analysis in CI/CD
- **Access Control**: Proper role-based access control patterns
- **Input Validation**: Comprehensive input sanitization
- **Reentrancy Protection**: Guards against common attack vectors

### Security Checklist
- [ ] All contracts audited by security professionals
- [ ] Multi-signature wallet implementation for admin functions
- [ ] Timelock contracts for critical operations
- [ ] Bug bounty program established
- [ ] Emergency pause mechanisms implemented

---

## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the coding standards and add tests
4. **Commit your changes**: Use conventional commit messages
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**: Provide a clear description of your changes

### Development Standards
- Write comprehensive tests for all new features
- Follow Solidity and TypeScript best practices
- Ensure all CI/CD checks pass
- Update documentation for any API changes

---

## 📚 Resources

### Documentation
- [Foundry Book](https://book.getfoundry.sh/) - Comprehensive Foundry documentation
- [OpenZeppelin Docs](https://docs.openzeppelin.com/) - Smart contract security patterns
- [Next.js Documentation](https://nextjs.org/docs) - Frontend framework guide
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework

### Community
- [Discord Server](#) - Join our developer community
- [Twitter](#) - Follow for updates and announcements
- [Blog](#) - Technical articles and tutorials

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenZeppelin** for providing secure smart contract standards
- **Foundry** team for the excellent development framework
- **Next.js** team for the powerful React framework
- **Tailwind CSS** for the utility-first CSS framework
- **Radix UI** for accessible component primitives

---

<div align="center">
  <p>Built with ❤️ by the BuildProof team</p>
  <p>
    <a href="https://github.com/yourusername/buildproof">GitHub</a> •
    <a href="#documentation">Documentation</a> •
    <a href="#community">Community</a> •
    <a href="#contributing">Contributing</a>
  </p>
</div>
