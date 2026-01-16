import BuilderBountyABI from './abis/BuilderBounty.json'
import BuilderReputationABI from './abis/BuilderReputation.json'
import BuilderTeamsABI from './abis/BuilderTeams.json'
import BuilderEscrowABI from './abis/BuilderEscrow.json'

// BuilderInsurance simplified ABI for key functions
const BuilderInsuranceABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_lockDuration', type: 'uint256' }],
    name: 'stakeAsBuilder',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalStaked',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'insurancePool',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalPolicies',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const contracts = {
  builderInsurance: {
    address: (process.env.NEXT_PUBLIC_BUILDER_INSURANCE_ADDRESS ||
      '0x5882b106397A46eA005354e0f4Fbc438734e0605') as `0x${string}`,
    abi: BuilderInsuranceABI,
    chainId: 84532, // Base Sepolia
  },
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

// Utility functions
export const formatEther = (wei: bigint | string): string => {
  const weiNum = typeof wei === 'string' ? BigInt(wei) : wei
  return (Number(weiNum) / 1e18).toFixed(4)
}

export const formatAddress = (address: string): string => {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}
