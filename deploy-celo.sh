#!/bin/bash

# BuildProof - Celo Sepolia Deployment Script
# This script automates the deployment process to Celo Sepolia testnet

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  BuildProof - Celo Deployment Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo -e "${YELLOW}Please create .env file with your configuration${NC}"
    exit 1
fi

# Source environment variables
source .env

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" = "your_private_key_here" ]; then
    echo -e "${RED}❌ Error: PRIVATE_KEY not configured in .env${NC}"
    echo -e "${YELLOW}Please add your wallet private key to .env file${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment configuration loaded${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${BLUE}📦 Step 1: Installing dependencies...${NC}"
if ! forge --version > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Foundry not installed${NC}"
    echo -e "${YELLOW}Install Foundry: https://book.getfoundry.sh/getting-started/installation${NC}"
    exit 1
fi

forge install --no-commit
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Compile contracts
echo -e "${BLUE}🔨 Step 2: Compiling contracts...${NC}"
forge build
echo -e "${GREEN}✅ Contracts compiled${NC}"
echo ""

# Step 3: Run tests
echo -e "${BLUE}🧪 Step 3: Running tests...${NC}"
forge test
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${RED}❌ Tests failed. Fix issues before deploying.${NC}"
    exit 1
fi
echo ""

# Step 4: Deploy
echo -e "${BLUE}🚀 Step 4: Deploying to Celo Sepolia...${NC}"
echo -e "${YELLOW}⏳ This may take a minute...${NC}"
echo ""

# Check if user wants to verify
read -p "Do you want to verify the contract on Blockscout? (y/n): " verify_choice

if [ "$verify_choice" = "y" ] || [ "$verify_choice" = "Y" ]; then
    if [ -z "$CELOSCAN_API_KEY" ] || [ "$CELOSCAN_API_KEY" = "your_celoscan_api_key" ]; then
        echo -e "${YELLOW}⚠️  Warning: CELOSCAN_API_KEY not configured${NC}"
        echo -e "${YELLOW}Deploying without verification...${NC}"
        forge script script/DeployCelo.s.sol --rpc-url celo_sepolia --broadcast
    else
        forge script script/DeployCelo.s.sol --rpc-url celo_sepolia --broadcast --verify
    fi
else
    forge script script/DeployCelo.s.sol --rpc-url celo_sepolia --broadcast
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo -e "1. Visit Blockscout to view your contract:"
echo -e "   ${YELLOW}https://alfajores.celoscan.io${NC}"
echo ""
echo -e "2. Get testnet CELO if needed:"
echo -e "   ${YELLOW}https://faucet.celo.org/alfajores${NC}"
echo ""
echo -e "3. Start the frontend:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo -e "${BLUE}📚 For detailed guide, see:${NC} ${YELLOW}CELO_DEPLOYMENT_GUIDE.md${NC}"
echo ""
