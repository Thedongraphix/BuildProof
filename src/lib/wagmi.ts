import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon, sepolia } from 'viem/chains'

// 1. Get projectId from environment variables
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID

if (!projectId) {
  throw new Error('NEXT_PUBLIC_REOWN_PROJECT_ID is not set')
}

// 2. Create wagmiConfig using WagmiAdapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [mainnet, arbitrum, polygon, sepolia]
})

// 3. Configure the metadata
const metadata = {
  name: 'BuildProof',
  description: 'Smart Contract Security Verifier',
  url: 'https://buildproof.vercel.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// 4. Create the AppKit instance
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum, polygon, sepolia],
  defaultNetwork: mainnet,
  metadata,
  features: {
    analytics: true,
    email: false,
    socials: [],
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#00ff41',
    '--w3m-color-mix-strength': 20,
    '--w3m-accent': '#3b82f6'
  }
})

export const wagmiConfig = wagmiAdapter.wagmiConfig