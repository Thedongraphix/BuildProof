# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BuildProof is a modern full-stack blockchain development project that combines Foundry for smart contract development with Next.js for the frontend interface. It features a premium dark theme with blue accents and professional development tooling.

## Development Commands

### Frontend (Next.js)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Smart Contracts (Foundry)
- `forge build` - Compile contracts
- `forge test` - Run all tests
- `forge test -vvv` - Run tests with detailed output
- `forge test --gas-report` - Run tests with gas usage report
- `forge coverage` - Generate test coverage report
- `forge fmt` - Format code according to project standards
- `forge fmt --check` - Check code formatting without changes

### Deployment
- `forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast` - Deploy to local Anvil
- `forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast --verify` - Deploy to testnet with verification

## Architecture

### Project Structure
- `contracts/` - Smart contracts (Solidity files)
- `src/` - Next.js frontend source code
  - `app/` - App Router (Next.js 13+)
  - `components/` - React components with shadcn/ui
  - `lib/` - Utilities and helpers
- `test/` - Foundry tests
- `script/` - Foundry deployment scripts
- `lib/` - Foundry dependencies (git submodules)

### Frontend Architecture
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with custom dark theme
- **Components**: shadcn/ui components with Radix UI primitives
- **Icons**: Lucide React
- **Typography**: Geist font family

### Smart Contract Architecture
- **Framework**: Foundry
- **Dependencies**: OpenZeppelin Contracts v5.4.0
- **Compiler**: Solidity 0.8.26
- **Testing**: Comprehensive test suite with forge-std

## Development Best Practices

- Always run `forge fmt` before committing code
- Maintain comprehensive test coverage
- Use OpenZeppelin contracts for security-critical functionality
- Follow the established remapping patterns when importing contracts
- Keep private keys and sensitive data in `.env` files only
- Run `forge build` and `forge test` before pushing changes

## Notes

- Professional commit messages without AI attribution
- Comprehensive CI/CD pipeline with GitHub Actions
- Security analysis with Slither integration
- Multi-network deployment support 
