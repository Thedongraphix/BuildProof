# BuildProof

<div align="center">
  <img src="https://img.shields.io/badge/Solidity-0.8.26-e6007a?style=for-the-badge&logo=solidity&logoColor=white" alt="Solidity" />
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Foundry-Latest-1e1e3f?style=for-the-badge&logo=ethereum&logoColor=white" alt="Foundry" />
  <img src="https://img.shields.io/badge/OpenZeppelin-v5.4.0-4e5ee4?style=for-the-badge&logo=openzeppelin&logoColor=white" alt="OpenZeppelin" />
</div>

<div align="center">
  <h3>🛡️ Modern Smart Contract Development Platform</h3>
  <p>A comprehensive full-stack blockchain development environment combining the power of Foundry with a premium Next.js frontend interface.</p>
</div>

---

## ✨ Features

### 🔐 **Smart Contract Development**
- **Foundry Framework**: Blazing fast smart contract development and testing
- **OpenZeppelin Integration**: Industry-standard secure contract libraries (v5.4.0)
- **Comprehensive Testing**: Full test coverage with advanced debugging capabilities
- **Gas Optimization**: Automated gas usage analysis and optimization recommendations
- **Multi-Network Support**: Seamless deployment across multiple EVM networks

### 🎨 **Premium Frontend Interface**
- **Modern Design System**: Professional dark theme with blue accent colors
- **Responsive Layout**: Mobile-first design optimized for all devices
- **Component Library**: Custom UI components built on Radix UI primitives
- **Performance Optimized**: Built with Next.js 15 and App Router architecture
- **TypeScript Integration**: Full type safety across the entire application

### ⚡ **Developer Experience**
- **Hot Reload**: Instant feedback during development
- **Automated CI/CD**: GitHub Actions pipeline with comprehensive testing
- **Security Analysis**: Integrated Slither static analysis
- **Professional Tooling**: ESLint, Prettier, and automated code formatting
- **Documentation**: Comprehensive guides and API documentation

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Foundry](https://getfoundry.sh/)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/buildproof.git
cd buildproof
```

2. **Install dependencies:**
```bash
# Install Foundry dependencies
forge install

# Install Node.js dependencies
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration values
```

4. **Start development servers:**
```bash
# Terminal 1: Start the frontend
npm run dev

# Terminal 2: Start local blockchain (optional)
anvil
```

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

### Local Deployment

1. **Start Anvil:**
```bash
anvil
```

2. **Deploy contracts:**
```bash
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

### Testnet Deployment

1. **Configure environment variables**
2. **Deploy with verification:**
```bash
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify
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
