// Test contract addresses for demonstration
export const TEST_CONTRACTS = {
  // USDC on Ethereum Mainnet (well-known verified contract)
  USDC: '0xA0b86a33E6441044F8FbA09110aBF1CD4Ae51f5e',

  // Ethereum Name Service Registry
  ENS: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',

  // Uniswap V3 Factory
  UNISWAP_V3_FACTORY: '0x1F98431c8aD98523631AE4a59f267346ea31F984',

  // Base Sepolia Testnet Contracts
  BASE_SEPOLIA_USDC: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
  BASE_SEPOLIA_WETH: '0x4200000000000000000000000000000000000006', // WETH on Base

  // Invalid/Empty address for testing error handling
  INVALID: '0x0000000000000000000000000000000000000000',

  // Non-contract address (EOA)
  EOA: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // Vitalik's address
} as const

export type TestContractKey = keyof typeof TEST_CONTRACTS