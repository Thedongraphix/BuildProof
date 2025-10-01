# BuildProof MVP - Complete Development Guide

> **For AI Assistant (Cursor):** This guide provides step-by-step instructions to build a decentralized smart contract verification system on Base. Follow the phases sequentially and implement each component as specified.

## 🎯 Project Overview

BuildProof is a decentralized verification protocol that creates immutable proofs linking smart contract source code to deployed bytecode, enabling builders to establish trust and credibility.

### Tech Stack
- **Blockchain:** Base (Sepolia testnet for development)
- **Smart Contracts:** Solidity + Foundry
- **Backend:** Node.js + ethers.js
- **Frontend:** React + Tailwind CSS + Lucide icons
- **Deployment:** Wallet-based (MetaMask/WalletConnect)

---

## 📁 Project Structure

```
buildproof-mvp/
├── contracts/
│   ├── BuildProof.sol
│   ├── test/
│   └── script/
├── cli/
│   ├── build-verifier.js
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── foundry.toml
├── package.json
└── README.md
```

---

## 🚀 Phase 1: Environment Setup & Smart Contract Development

### 1.1 Initialize Project (Linux)

```bash
# Create main project directory
mkdir buildproof-mvp && cd buildproof-mvp

# Initialize npm project
npm init -y

# Install global dependencies
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc  # or ~/.zshrc
foundryup

# Initialize Foundry project
forge init --force

# Install OpenZeppelin contracts
forge install OpenZeppelin/openzeppelin-contracts
```

### 1.2 Configure Foundry

Create `foundry.toml`:

```toml
[profile.default]
src = "contracts"
out = "out"
libs = ["lib"]
remappings = [
    "@openzeppelin/=lib/openzeppelin-contracts/"
]

[rpc_endpoints]
base_sepolia = "https://sepolia.base.org"

[etherscan]
base_sepolia = { key = "${BASESCAN_API_KEY}", url = "https://api-sepolia.basescan.org/api" }
```

### 1.3 Smart Contract Implementation

Create `contracts/BuildProof.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BuildProof
 * @dev Decentralized smart contract verification system
 * @notice Stores immutable proofs linking source code to deployed contracts
 */
contract BuildProof {
    struct Verification {
        bytes32 sourceCodeHash;    // Hash of all source files
        bytes32 dependencyHash;    // Hash of package.json/foundry.toml
        string githubRepo;         // GitHub repo URL
        string commitHash;         // Specific commit used
        address verifier;          // Who submitted the proof
        uint256 timestamp;         // When it was verified
        bool isVerified;          // Verification status
        uint256 challenges;       // Number of challenges received
    }
    
    // Contract address => Verification data
    mapping(address => Verification) public verifications;
    
    // Track verifier reputation
    mapping(address => uint256) public verifierReputation;
    
    // Events for indexing
    event ContractVerified(
        address indexed contractAddress,
        address indexed verifier,
        string githubRepo,
        string commitHash,
        bytes32 sourceCodeHash
    );
    
    event VerificationChallenged(
        address indexed contractAddress,
        address indexed challenger,
        string reason
    );
    
    event ReputationUpdated(
        address indexed verifier,
        uint256 newReputation
    );
    
    /**
     * @dev Submit verification proof for a contract
     * @param contractAddress The deployed contract to verify
     * @param sourceCodeHash Hash of concatenated source files
     * @param dependencyHash Hash of dependency configuration
     * @param githubRepo GitHub repository URL
     * @param commitHash Specific commit hash
     */
    function submitVerification(
        address contractAddress,
        bytes32 sourceCodeHash,
        bytes32 dependencyHash,
        string calldata githubRepo,
        string calldata commitHash
    ) external {
        require(contractAddress.code.length > 0, "Contract does not exist");
        require(bytes(githubRepo).length > 0, "GitHub repo required");
        require(bytes(commitHash).length > 0, "Commit hash required");
        require(sourceCodeHash != bytes32(0), "Source code hash required");
        require(dependencyHash != bytes32(0), "Dependency hash required");
        
        // Prevent overwriting existing verifications
        require(!verifications[contractAddress].isVerified, "Already verified");
        
        verifications[contractAddress] = Verification({
            sourceCodeHash: sourceCodeHash,
            dependencyHash: dependencyHash,
            githubRepo: githubRepo,
            commitHash: commitHash,
            verifier: msg.sender,
            timestamp: block.timestamp,
            isVerified: true,
            challenges: 0
        });
        
        // Increase verifier reputation
        verifierReputation[msg.sender] += 1;
        
        emit ContractVerified(
            contractAddress, 
            msg.sender, 
            githubRepo, 
            commitHash,
            sourceCodeHash
        );
        
        emit ReputationUpdated(msg.sender, verifierReputation[msg.sender]);
    }
    
    /**
     * @dev Get verification data for a contract
     */
    function getVerification(address contractAddress) 
        external 
        view 
        returns (Verification memory) 
    {
        return verifications[contractAddress];
    }
    
    /**
     * @dev Challenge a verification
     * @param contractAddress Contract to challenge
     * @param reason Reason for the challenge
     */
    function challengeVerification(
        address contractAddress, 
        string calldata reason
    ) external {
        require(verifications[contractAddress].isVerified, "Not verified");
        require(bytes(reason).length > 0, "Reason required");
        
        verifications[contractAddress].challenges += 1;
        
        emit VerificationChallenged(contractAddress, msg.sender, reason);
    }
    
    /**
     * @dev Batch get verifications for multiple contracts
     */
    function getVerifications(address[] calldata contractAddresses)
        external
        view
        returns (Verification[] memory)
    {
        Verification[] memory results = new Verification[](contractAddresses.length);
        
        for (uint256 i = 0; i < contractAddresses.length; i++) {
            results[i] = verifications[contractAddresses[i]];
        }
        
        return results;
    }
    
    /**
     * @dev Check if a contract is verified
     */
    function isContractVerified(address contractAddress) 
        external 
        view 
        returns (bool) 
    {
        return verifications[contractAddress].isVerified;
    }
}
```

### 1.4 Deployment Script

Create `script/Deploy.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/BuildProof.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        BuildProof buildProof = new BuildProof();
        
        console.log("BuildProof deployed to:", address(buildProof));
        
        vm.stopBroadcast();
    }
}
```

### 1.5 Contract Tests

Create `contracts/test/BuildProof.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../BuildProof.sol";

contract BuildProofTest is Test {
    BuildProof public buildProof;
    address public user1;
    address public user2;
    
    // Mock contract for testing
    address public mockContract = address(0x123456789);
    
    function setUp() public {
        buildProof = new BuildProof();
        user1 = address(0x1);
        user2 = address(0x2);
        
        // Deploy mock contract code
        vm.etch(mockContract, hex"60806040");
    }
    
    function testSubmitVerification() public {
        vm.prank(user1);
        
        buildProof.submitVerification(
            mockContract,
            keccak256("source code"),
            keccak256("dependencies"),
            "https://github.com/test/repo",
            "abc123"
        );
        
        BuildProof.Verification memory verification = buildProof.getVerification(mockContract);
        
        assertEq(verification.isVerified, true);
        assertEq(verification.verifier, user1);
        assertEq(verification.githubRepo, "https://github.com/test/repo");
        assertEq(verification.commitHash, "abc123");
    }
    
    function testCannotVerifyTwice() public {
        vm.prank(user1);
        buildProof.submitVerification(
            mockContract,
            keccak256("source code"),
            keccak256("dependencies"),
            "https://github.com/test/repo",
            "abc123"
        );
        
        vm.prank(user2);
        vm.expectRevert("Already verified");
        buildProof.submitVerification(
            mockContract,
            keccak256("different source"),
            keccak256("different deps"),
            "https://github.com/other/repo",
            "def456"
        );
    }
    
    function testChallengeVerification() public {
        // First verify
        vm.prank(user1);
        buildProof.submitVerification(
            mockContract,
            keccak256("source code"),
            keccak256("dependencies"),
            "https://github.com/test/repo",
            "abc123"
        );
        
        // Then challenge
        vm.prank(user2);
        buildProof.challengeVerification(mockContract, "Invalid source hash");
        
        BuildProof.Verification memory verification = buildProof.getVerification(mockContract);
        assertEq(verification.challenges, 1);
    }
}
```

### 1.6 Deployment Instructions

Create deployment script `deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Deploying BuildProof to Base Sepolia..."

# Check if required environment variables are set
if [ -z "$BASESCAN_API_KEY" ]; then
    echo "❌ BASESCAN_API_KEY environment variable is required"
    exit 1
fi

# Compile contracts
echo "📦 Compiling contracts..."
forge build

# Run tests
echo "🧪 Running tests..."
forge test -vv

# Deploy using wallet (you'll be prompted to connect)
echo "🔗 Deploying with wallet connection..."
echo "Please connect your wallet when prompted..."

forge script script/Deploy.s.sol:DeployScript \
    --rpc-url https://sepolia.base.org \
    --broadcast \
    --verify \
    --etherscan-api-key $BASESCAN_API_KEY \
    --interactive

echo "✅ Deployment complete!"
echo "📋 Don't forget to save the deployed contract address!"
```

---

## 🛠 Phase 2: CLI Tool Development

### 2.1 CLI Tool Setup

Create `cli/package.json`:

```json
{
  "name": "buildproof-cli",
  "version": "1.0.0",
  "description": "CLI tool for BuildProof verification",
  "main": "build-verifier.js",
  "bin": {
    "buildproof": "./build-verifier.js"
  },
  "scripts": {
    "test": "node test.js"
  },
  "dependencies": {
    "ethers": "^6.7.1",
    "commander": "^11.0.0",
    "chalk": "^4.1.2",
    "ora": "^5.4.1"
  },
  "engines": {
    "node": ">=16.0.0"
  },
  "keywords": ["blockchain", "verification", "base", "smart-contracts"]
}
```

### 2.2 CLI Implementation

Create `cli/build-verifier.js`:

```javascript
#!/usr/bin/env node

const { ethers } = require('ethers');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { Command } = require('commander');
const chalk = require('chalk');
const ora = require('ora');

// BuildProof Contract Configuration
const BUILD_PROOF_ADDRESS = "0x..."; // Replace with deployed address
const BUILD_PROOF_ABI = [
    "function submitVerification(address contractAddress, bytes32 sourceCodeHash, bytes32 dependencyHash, string githubRepo, string commitHash) external",
    "function getVerification(address contractAddress) external view returns (tuple(bytes32 sourceCodeHash, bytes32 dependencyHash, string githubRepo, string commitHash, address verifier, uint256 timestamp, bool isVerified, uint256 challenges))",
    "function isContractVerified(address contractAddress) external view returns (bool)",
    "event ContractVerified(address indexed contractAddress, address indexed verifier, string githubRepo, string commitHash, bytes32 sourceCodeHash)"
];

class BuildVerifier {
    constructor(rpcUrl = "https://sepolia.base.org") {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.contract = new ethers.Contract(BUILD_PROOF_ADDRESS, BUILD_PROOF_ABI, this.provider);
    }

    async connectWallet(privateKey) {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.contract = this.contract.connect(this.wallet);
        
        const balance = await this.provider.getBalance(this.wallet.address);
        console.log(chalk.blue(`💰 Wallet: ${this.wallet.address}`));
        console.log(chalk.blue(`💰 Balance: ${ethers.formatEther(balance)} ETH`));
    }

    /**
     * Generate hash of all Solidity source files
     */
    generateSourceHash(contractsDir = "./contracts") {
        if (!fs.existsSync(contractsDir)) {
            throw new Error(`Contracts directory not found: ${contractsDir}`);
        }

        const sourceFiles = this.getAllSolidityFiles(contractsDir);
        
        if (sourceFiles.length === 0) {
            throw new Error('No Solidity files found');
        }

        let concatenatedSource = '';
        
        // Sort files for deterministic hashing
        sourceFiles.sort().forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            // Remove comments and normalize whitespace for consistency
            const normalized = content
                .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
                .replace(/\/\/.*$/gm, '')         // Remove line comments
                .replace(/\s+/g, ' ')             // Normalize whitespace
                .trim();
            
            concatenatedSource += `// File: ${path.relative(process.cwd(), file)}\n${normalized}\n`;
        });
        
        return crypto.createHash('sha256').update(concatenatedSource).digest('hex');
    }

    /**
     * Generate hash of dependency configuration
     */
    generateDependencyHash() {
        let depContent = '';
        
        // Check for different dependency files
        const depFiles = [
            'package.json', 
            'foundry.toml', 
            'hardhat.config.js',
            'hardhat.config.ts',
            'remappings.txt'
        ];
        
        depFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                depContent += `// File: ${file}\n${content}\n`;
            }
        });
        
        if (!depContent) {
            console.log(chalk.yellow('⚠️  No dependency files found, using empty hash'));
            depContent = 'empty';
        }
        
        return crypto.createHash('sha256').update(depContent).digest('hex');
    }

    /**
     * Get current git commit hash
     */
    getCommitHash() {
        try {
            const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
            
            // Check if working directory is clean
            try {
                execSync('git diff-index --quiet HEAD --', { stdio: 'ignore' });
            } catch {
                console.log(chalk.yellow('⚠️  Working directory has uncommitted changes'));
            }
            
            return commitHash;
        } catch (error) {
            throw new Error('Unable to get git commit hash. Make sure you\'re in a git repository with commits.');
        }
    }

    /**
     * Get GitHub repository URL
     */
    getGithubRepo() {
        try {
            const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
            
            // Convert SSH to HTTPS format
            if (remoteUrl.startsWith('git@github.com:')) {
                return remoteUrl.replace('git@github.com:', 'https://github.com/').replace('.git', '');
            }
            
            // Handle HTTPS URLs
            return remoteUrl.replace('.git', '');
        } catch (error) {
            throw new Error('Unable to get GitHub repository URL. Make sure remote origin is set.');
        }
    }

    /**
     * Get all Solidity files recursively
     */
    getAllSolidityFiles(dir) {
        let files = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }
        
        const items = fs.readdirSync(dir);
        items.forEach(item => {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                files = files.concat(this.getAllSolidityFiles(fullPath));
            } else if (item.endsWith('.sol')) {
                files.push(fullPath);
            }
        });
        
        return files;
    }

    /**
     * Validate contract address
     */
    validateContractAddress(address) {
        if (!ethers.isAddress(address)) {
            throw new Error('Invalid contract address');
        }
        return ethers.getAddress(address); // Normalize to checksum format
    }

    /**
     * Submit verification to the smart contract
     */
    async submitVerification(contractAddress, options = {}) {
        const spinner = ora('Generating build fingerprint...').start();
        
        try {
            // Validate inputs
            contractAddress = this.validateContractAddress(contractAddress);
            
            // Check if contract exists
            const code = await this.provider.getCode(contractAddress);
            if (code === '0x') {
                throw new Error('Contract not found at the provided address');
            }

            // Generate verification data
            const sourceHash = this.generateSourceHash(options.contractsDir);
            const dependencyHash = this.generateDependencyHash();
            const commitHash = this.getCommitHash();
            const githubRepo = this.getGithubRepo();
            
            spinner.succeed('Build fingerprint generated');
            
            // Display summary
            console.log('\n' + chalk.bold('📋 Verification Summary:'));
            console.log(chalk.gray(`🎯 Contract: ${contractAddress}`));
            console.log(chalk.gray(`📝 Source Hash: 0x${sourceHash.slice(0, 16)}...`));
            console.log(chalk.gray(`📦 Dependency Hash: 0x${dependencyHash.slice(0, 16)}...`));
            console.log(chalk.gray(`📍 Commit: ${commitHash.slice(0, 12)}...`));
            console.log(chalk.gray(`🐙 Repository: ${githubRepo}`));
            
            // Check if already verified
            const isVerified = await this.contract.isContractVerified(contractAddress);
            if (isVerified) {
                console.log(chalk.yellow('\n⚠️  Contract is already verified'));
                return null;
            }
            
            // Estimate gas
            const gasEstimate = await this.contract.submitVerification.estimateGas(
                contractAddress,
                `0x${sourceHash}`,
                `0x${dependencyHash}`,
                githubRepo,
                commitHash
            );
            
            console.log(chalk.blue(`⛽ Estimated gas: ${gasEstimate.toString()}`));
            
            // Submit to blockchain
            const submitSpinner = ora('Submitting verification to Base Sepolia...').start();
            
            const tx = await this.contract.submitVerification(
                contractAddress,
                `0x${sourceHash}`,
                `0x${dependencyHash}`,
                githubRepo,
                commitHash,
                { gasLimit: gasEstimate * 120n / 100n } // Add 20% buffer
            );
            
            submitSpinner.text = `Transaction submitted: ${tx.hash}`;
            
            const receipt = await tx.wait();
            submitSpinner.succeed(`Verification submitted successfully!`);
            
            console.log('\n' + chalk.green.bold('✅ SUCCESS!'));
            console.log(chalk.green(`🔗 Transaction: ${tx.hash}`));
            console.log(chalk.green(`📦 Block: ${receipt.blockNumber}`));
            console.log(chalk.green(`⛽ Gas used: ${receipt.gasUsed.toString()}`));
            
            return {
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                sourceHash,
                dependencyHash,
                commitHash,
                githubRepo
            };
            
        } catch (error) {
            spinner.fail('Verification failed');
            console.error(chalk.red(`❌ Error: ${error.message}`));
            throw error;
        }
    }

    /**
     * Verify an existing contract
     */
    async verifyContract(contractAddress) {
        const spinner = ora('Fetching verification data...').start();
        
        try {
            contractAddress = this.validateContractAddress(contractAddress);
            
            const verification = await this.contract.getVerification(contractAddress);
            
            spinner.succeed('Verification data retrieved');
            
            if (!verification.isVerified) {
                console.log(chalk.yellow('\n❌ Contract not verified'));
                return null;
            }
            
            console.log('\n' + chalk.green.bold('✅ Contract Verification Found'));
            console.log(chalk.gray('━'.repeat(50)));
            console.log(chalk.blue(`📝 Source Hash: ${verification.sourceCodeHash}`));
            console.log(chalk.blue(`📦 Dependency Hash: ${verification.dependencyHash}`));
            console.log(chalk.blue(`🐙 Repository: ${verification.githubRepo}`));
            console.log(chalk.blue(`📍 Commit: ${verification.commitHash}`));
            console.log(chalk.blue(`👤 Verifier: ${verification.verifier}`));
            console.log(chalk.blue(`⏰ Timestamp: ${new Date(Number(verification.timestamp) * 1000).toISOString()}`));
            console.log(chalk.blue(`🚨 Challenges: ${verification.challenges}`));
            
            return verification;
        } catch (error) {
            spinner.fail('Failed to fetch verification');
            console.error(chalk.red(`❌ Error: ${error.message}`));
            throw error;
        }
    }
}

// CLI Setup
const program = new Command();

program
    .name('buildproof')
    .description('BuildProof CLI - Verify smart contracts on Base')
    .version('1.0.0');

program
    .command('submit')
    .description('Submit verification proof for a deployed contract')
    .argument('<contract-address>', 'deployed contract address')
    .option('-c, --contracts-dir <dir>', 'contracts directory', './contracts')
    .option('-k, --private-key <key>', 'private key (or use PRIVATE_KEY env var)')
    .action(async (contractAddress, options) => {
        try {
            const privateKey = options.privateKey || process.env.PRIVATE_KEY;
            
            if (!privateKey) {
                console.error(chalk.red('❌ Private key required. Use --private-key or set PRIVATE_KEY environment variable'));
                process.exit(1);
            }
            
            const verifier = new BuildVerifier();
            await verifier.connectWallet(privateKey);
            await verifier.submitVerification(contractAddress, options);
        } catch (error) {
            console.error(chalk.red(`❌ ${error.message}`));
            process.exit(1);
        }
    });

program
    .command('verify')
    .description('Check verification status of a contract')
    .argument('<contract-address>', 'contract address to check')
    .action(async (contractAddress) => {
        try {
            const verifier = new BuildVerifier();
            await verifier.verifyContract(contractAddress);
        } catch (error) {
            console.error(chalk.red(`❌ ${error.message}`));
            process.exit(1);
        }
    });

program
    .command('info')
    .description('Show BuildProof contract information')
    .action(() => {
        console.log(chalk.blue.bold('📋 BuildProof Contract Information'));
        console.log(chalk.gray('━'.repeat(40)));
        console.log(chalk.blue(`📍 Contract Address: ${BUILD_PROOF_ADDRESS}`));
        console.log(chalk.blue(`🌐 Network: Base Sepolia`));
        console.log(chalk.blue(`🔗 Explorer: https://sepolia.basescan.org/address/${BUILD_PROOF_ADDRESS}`));
    });

// Handle unknown commands
program.on('command:*', () => {
    console.error(chalk.red('❌ Invalid command. See --help for available commands.'));
    process.exit(1);
});

// Parse CLI arguments
program.parse();
```

### 2.3 CLI Testing

Create `cli/test.js`:

```javascript
const BuildVerifier = require('./build-verifier');

// Mock test - replace with actual deployed addresses
async function testCLI() {
    console.log('🧪 Testing BuildProof CLI...');
    
    try {
        const verifier = new BuildVerifier();
        
        // Test source hash generation
        console.log('Testing source hash generation...');
        const sourceHash = verifier.generateSourceHash('../contracts');
        console.log(`✅ Source hash: ${sourceHash.slice(0, 16)}...`);
        
        // Test dependency hash generation
        console.log('Testing dependency hash generation...');
        const depHash = verifier.generateDependencyHash();
        console.log(`✅ Dependency hash: ${depHash.slice(0, 16)}...`);
        
        console.log('✅ CLI tests passed!');
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

if (require.main === module) {
    testCLI();
}
```

---

## 🎨 Phase 3: Frontend Development

### 3.1 Frontend Setup

```bash
# Create React app
cd buildproof-mvp
npx create-react-app frontend
cd frontend

# Install dependencies
npm install ethers lucide-react @web3modal/ethereum @web3modal/react wagmi viem
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3.2 Tailwind Configuration

Update `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'base-blue': '#0052FF',
        'base-light': '#E6F0FF',
      }
    },
  },
  plugins: [],
}
```

### 3.3 Main App Component

Update `frontend/src/App.js`:

```javascript
import React from 'react';
import VerificationChecker from './components/VerificationChecker';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <VerificationChecker />
      </main>
      <Footer />
    </div>
  );
}

export default App;
```

### 3.4 Header Component

Create `frontend/src/components/Header.js`:

```javascript
import React from 'react';
import { Shield, Github, ExternalLink } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-base-blue rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">BuildProof</h1>
              <p className="text-sm text-gray-500">Smart Contract Verification</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/your-username/buildproof-mvp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Github className="h-5 w-5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <a 
              href="https://base.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-base-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Built on Base</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### 3.5 Main Verification Component

Create `frontend/src/components/VerificationChecker.js`:

```javascript
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Search, CheckCircle, XCircle, ExternalLink, Github, Clock, AlertTriangle, User, Hash } from 'lucide-react';

// Contract configuration - UPDATE WITH YOUR DEPLOYED CONTRACT
const BUILD_PROOF_ADDRESS = "0x..."; // Replace with your deployed contract address
const BUILD_PROOF_ABI = [
  "function getVerification(address contractAddress) external view returns (tuple(bytes32 sourceCodeHash, bytes32 dependencyHash, string githubRepo, string commitHash, address verifier, uint256 timestamp, bool isVerified, uint256 challenges))",
  "function isContractVerified(address contractAddress) external view returns (bool)"
];

export default function VerificationChecker() {
  const [address, setAddress] = useState('');
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize provider
  const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
  const contract = new ethers.Contract(BUILD_PROOF_ADDRESS, BUILD_PROOF_ABI, provider);

  const checkVerification = async () => {
    if (!address) {
      setError('Please enter a contract address');
      return;
    }

    if (!ethers.isAddress(address)) {
      setError('Invalid contract address');
      return;
    }
    
    setLoading(true);
    setError('');
    setVerification(null);
    
    try {
      // Check if contract exists
      const code = await provider.getCode(address);
      if (code === '0x') {
        setError('No contract found at this address');
        return;
      }

      // Get verification data
      const verificationData = await contract.getVerification(address);
      
      if (verificationData.isVerified) {
        setVerification({
          sourceCodeHash: verificationData.sourceCodeHash,
          dependencyHash: verificationData.dependencyHash,
          githubRepo: verificationData.githubRepo,
          commitHash: verificationData.commitHash,
          verifier: verificationData.verifier,
          timestamp: Number(verificationData.timestamp),
          isVerified: verificationData.isVerified,
          challenges: Number(verificationData.challenges)
        });
      } else {
        setVerification({ isVerified: false });
      }
    } catch (err) {
      console.error('Error fetching verification:', err);
      setError('Failed to fetch verification data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
    setError('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkVerification();
    }
  };

  const formatHash = (hash) => {
    if (!hash) return '';
    return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGithubCommitUrl = (repo, commit) => {
    if (!repo || !commit) return '';
    return `${repo}/commit/${commit}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Smart Contract Verification
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Verify that deployed smart contracts match their claimed source code and build configuration. 
          Build trust through transparency.
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Enter contract address (0x...)"
              value={address}
              onChange={handleAddressChange}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-base-blue focus:border-transparent text-lg"
            />
            <Search className="absolute right-4 top-4.5 h-6 w-6 text-gray-400" />
          </div>
          <button
            onClick={checkVerification}
            disabled={loading || !address}
            className="px-8 py-4 bg-base-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg transition-colors"
          >
            {loading ? 'Checking...' : 'Verify'}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {verification && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Status Header */}
          <div className={`p-6 ${
            verification.isVerified 
              ? 'bg-green-50 border-b border-green-200' 
              : 'bg-red-50 border-b border-red-200'
          }`}>
            <div className="flex items-center gap-4">
              {verification.isVerified ? (
                <>
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-800">
                      ✅ Contract Verified
                    </h3>
                    <p className="text-green-700">
                      This contract has been verified with BuildProof
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-7 w-7 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-800">
                      ❌ Not Verified
                    </h3>
                    <p className="text-red-700">
                      No verification found for this contract
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {verification.isVerified && (
            <div className="p-6">
              {/* Challenges Warning */}
              {verification.challenges > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <p className="text-yellow-800 font-medium">
                      ⚠️ This verification has received {verification.challenges} challenge(s)
                    </p>
                  </div>
                </div>
              )}

              {/* Main Verification Info */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* GitHub Repository */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Github className="h-5 w-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">Source Repository</h4>
                  </div>
                  <a 
                    href={verification.githubRepo} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 font-medium">{verification.githubRepo}</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </a>
                </div>

                {/* Commit Information */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">Commit Hash</h4>
                  </div>
                  <a 
                    href={getGithubCommitUrl(verification.githubRepo, verification.commitHash)}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <code className="text-gray-800 font-mono text-sm">
                        {verification.commitHash}
                      </code>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </a>
                </div>
              </div>

              {/* Build Hashes */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Source Code Hash</h5>
                  <code className="text-sm text-gray-600 font-mono break-all block p-2 bg-gray-50 rounded">
                    {verification.sourceCodeHash}
                  </code>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Dependency Hash</h5>
                  <code className="text-sm text-gray-600 font-mono break-all block p-2 bg-gray-50 rounded">
                    {verification.dependencyHash}
                  </code>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Verified on {formatDate(verification.timestamp)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>By {formatAddress(verification.verifier)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* How It Works Section */}
      <div className="mt-12 bg-base-light rounded-xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          How BuildProof Works
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-base-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Deploy Contract</h4>
            <p className="text-gray-600 text-sm">
              Deploy your smart contract to Base network using your preferred tools.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-base-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Submit Verification</h4>
            <p className="text-gray-600 text-sm">
              Use BuildProof CLI to generate and submit cryptographic proofs of your build.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-base-blue rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">3</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Build Trust</h4>
            <p className="text-gray-600 text-sm">
              Users can verify your contract matches the source code before interacting.
            </p>
          </div>
        </div>
      </div>

      {/* Developer Instructions */}
      <div className="mt-8 bg-gray-900 rounded-xl p-8 text-white">
        <h3 className="text-xl font-bold mb-4">
          🛠️ For Developers: Verify Your Contract
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-gray-300 mb-2">1. Install BuildProof CLI:</p>
            <code className="block bg-gray-800 p-3 rounded text-green-400 font-mono text-sm">
              npm install -g buildproof-cli
            </code>
          </div>
          <div>
            <p className="text-gray-300 mb-2">2. Submit verification:</p>
            <code className="block bg-gray-800 p-3 rounded text-green-400 font-mono text-sm">
              buildproof submit 0xYourContractAddress
            </code>
          </div>
          <div>
            <p className="text-gray-300 mb-2">3. Check verification status:</p>
            <code className="block bg-gray-800 p-3 rounded text-green-400 font-mono text-sm">
              buildproof verify 0xYourContractAddress
            </code>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-900 rounded-lg">
          <p className="text-blue-200 text-sm">
            💡 <strong>Tip:</strong> Make sure you're in your project directory with a clean git working tree before submitting verification.
          </p>
        </div>
      </div>
    </div>
  );
}
```

### 3.6 Footer Component

Create `frontend/src/components/Footer.js`:

```javascript
import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-600 text-sm">
            Built with ❤️ for the Base ecosystem
          </div>
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/your-username/buildproof-mvp" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Github className="h-4 w-4" />
              <span>Source Code</span>
            </a>
            <a 
              href="https://sepolia.basescan.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>Base Sepolia Explorer</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

## 🚀 Phase 4: Deployment & Testing

### 4.1 Environment Setup

Create `.env` files:

**Root `.env`:**
```bash
# Deployment
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_basescan_api_key_here

# Contract addresses (fill after deployment)
BUILD_PROOF_ADDRESS=0x...
```

**Frontend `.env`:**
```bash
REACT_APP_BUILD_PROOF_ADDRESS=0x...
REACT_APP_RPC_URL=https://sepolia.base.org
```

### 4.2 Deployment Scripts

Create `deploy-all.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 BuildProof MVP Deployment Script"
echo "=================================="

# Check environment
if [ -z "$BASESCAN_API_KEY" ]; then
    echo "❌ BASESCAN_API_KEY required"
    exit 1
fi

# 1. Deploy smart contract
echo "📦 1. Deploying smart contract..."
cd contracts
chmod +x deploy.sh
./deploy.sh

# Get deployed address (you'll need to update this manually)
echo "📝 Please update BUILD_PROOF_ADDRESS in your .env files"
read -p "Enter deployed contract address: " CONTRACT_ADDRESS

# 2. Update CLI configuration
echo "🛠️  2. Updating CLI configuration..."
cd ../cli
sed -i "s/const BUILD_PROOF_ADDRESS = \"0x...\"/const BUILD_PROOF_ADDRESS = \"$CONTRACT_ADDRESS\"/" build-verifier.js

# 3. Update frontend configuration
echo "🎨 3. Updating frontend configuration..."
cd ../frontend
echo "REACT_APP_BUILD_PROOF_ADDRESS=$CONTRACT_ADDRESS" > .env

# 4. Install and build everything
echo "📦 4. Installing dependencies..."
cd ../cli
npm install

cd ../frontend
npm install
npm run build

echo "✅ Deployment complete!"
echo "🔗 Contract: $CONTRACT_ADDRESS"
echo "🌐 Frontend: Ready for deployment"
```

### 4.3 Testing Script

Create `test-all.sh`:

```bash
#!/bin/bash
set -e

echo "🧪 Running BuildProof Tests"
echo "=========================="

# Test smart contracts
echo "🔍 Testing smart contracts..."
cd contracts
forge test -vv

# Test CLI tool
echo "🛠️  Testing CLI tool..."
cd ../cli
npm test

# Test frontend build
echo "🎨 Testing frontend build..."
cd ../frontend
npm run build

echo "✅ All tests passed!"
```

---

## 📋 Development Checklist

### Smart Contract ✅
- [ ] `BuildProof.sol` implemented with all required functions
- [ ] Comprehensive test suite in `BuildProof.t.sol`
- [ ] Deployment script configured for Base Sepolia
- [ ] Contract deployed and verified on BaseScan

### CLI Tool ✅  
- [ ] `build-verifier.js` with source/dependency hashing
- [ ] Git integration for commit hash and repo URL
- [ ] Wallet-based transaction signing
- [ ] Error handling and user-friendly output
- [ ] CLI published as npm package

### Frontend ✅
- [ ] React app with Tailwind CSS styling
- [ ] Contract address input and validation
- [ ] Web3 integration with ethers.js
- [ ] Verification status display
- [ ] GitHub repository linking
- [ ] Responsive design for mobile

### Integration ✅
- [ ] All components use same contract address
- [ ] Environment variables configured
- [ ] Error handling across all layers  
- [ ] Testing scripts for full workflow

---

## 🎯 Next Steps & Enhancements

### Phase 5: Advanced Features
1. **Security Enhancements**
   - Multi-signature verification requirements
   - Reputation-based weighting system
   - Integration with audit APIs (Slither, MythX)

2. **Developer Experience**  
   - GitHub Actions integration
   - Foundry/Hardhat plugins
   - VS Code extension
   - Package manager integrations

3. **Network Effects**
   - Contract discovery dashboard  
   - Verification badges for Base ecosystem
   - API for third-party integrations
   - Subgraph for historical data

### Phase 6: Production Deployment
1. **Mainnet Deployment**
   - Deploy to Base mainnet
   - Set up monitoring and alerts
   - Gas optimization analysis

2. **Infrastructure**
   - Frontend hosting (Vercel/Netlify)
   - CDN for static assets
   - Analytics integration

3. **Community**
   - Documentation website
   - Community Discord/Telegram
   - Bug bounty program

---

## 💡 Key Benefits for Builders

- **Trust**: Instant credibility through cryptographic proofs
- **Security**: Reduced supply chain attack risks  
- **Adoption**: Users more confident interacting with verified contracts
- **Composability**: Other builders can safely integrate verified contracts
- **Ecosystem**: Enhanced tooling support for verified contracts
- **Compliance**: Helps meet audit requirements for institutional use

---

## 🔗 Important Links

- **Base Sepolia RPC**: https://sepolia.base.org
- **Base Sepolia Explorer**: https://sepolia.basescan.org  
- **Base Documentation**: https://docs.base.org
- **Foundry Documentation**: https://book.getfoundry.sh
- **ethers.js Documentation**: https://docs.ethers.org

---

**Happy Building! 🚀**