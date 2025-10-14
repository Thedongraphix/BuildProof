import BuilderBountyABI from './abis/BuilderBounty.json'
import BuilderReputationABI from './abis/BuilderReputation.json'
import BuilderTeamsABI from './abis/BuilderTeams.json'
import BuilderEscrowABI from './abis/BuilderEscrow.json'

export const contracts = {
  builderBounty: {
    address: '0xBEDC1F6351776b5073580372b553158De85Ae53D' as `0x${string}`,
    abi: BuilderBountyABI,
    chainId: 84532, // Base Sepolia
  },
  builderReputation: {
    address: '0x812daccF0691E7116ecF536E46426baf3Ce90177' as `0x${string}`,
    abi: BuilderReputationABI,
    chainId: 84532, // Base Sepolia
  },
  builderTeams: {
    address: '0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519' as `0x${string}`,
    abi: BuilderTeamsABI,
    chainId: 84532, // Base Sepolia
  },
  builderEscrow: {
    address: '0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519' as `0x${string}`,
    abi: BuilderEscrowABI,
    chainId: 84532, // Base Sepolia
  },
} as const

export const CHAIN_IDS = {
  BASE_SEPOLIA: 84532,
  ETHEREUM_SEPOLIA: 11155111,
  CELO_SEPOLIA: 44787,
} as const

export const EXPLORER_URLS = {
  [CHAIN_IDS.BASE_SEPOLIA]: 'https://sepolia.basescan.org',
  [CHAIN_IDS.ETHEREUM_SEPOLIA]: 'https://sepolia.etherscan.io',
  [CHAIN_IDS.CELO_SEPOLIA]: 'https://celo-sepolia.blockscout.com',
} as const
