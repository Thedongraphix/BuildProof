// Test contract addresses for demonstration
export const TEST_CONTRACTS = {
  // USDC on Ethereum Mainnet (well-known verified contract)
  USDC: '0xA0b86a33E6441044F8FbA09110aBF1CD4Ae51f5e',

  // Ethereum Name Service Registry
  ENS: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',

  // Uniswap V3 Factory
  UNISWAP_V3_FACTORY: '0x1F98431c8aD98523631AE4a59f267346ea31F984',

  // OpenSea Seaport (complex contract)
  OPENSEA_SEAPORT: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',

  // Invalid/Empty address for testing error handling
  INVALID: '0x0000000000000000000000000000000000000000',

  // Non-contract address (EOA)
  EOA: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // Vitalik's address
} as const

export type TestContractKey = keyof typeof TEST_CONTRACTS