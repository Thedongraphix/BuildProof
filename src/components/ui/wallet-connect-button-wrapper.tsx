'use client'

import { Wallet } from 'lucide-react'
import { useEffect, useState } from 'react'

export function WalletConnectButton() {
  const [mounted, setMounted] = useState(false)
  const [WalletComponent, setWalletComponent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    const loadWalletComponent = async () => {
      try {
        // Dynamically import the wallet component to avoid SSR issues
        const { WalletConnectButtonClient } = await import('./wallet-connect-button-client')
        setWalletComponent(() => WalletConnectButtonClient)
        setMounted(true)
      } catch (error) {
        console.error('Failed to load wallet component:', error)
        setMounted(true)
      }
    }

    loadWalletComponent()
  }, [])

  if (!mounted) {
    return (
      <button
        disabled
        className="px-6 py-3 bg-gray-700 text-gray-400 font-semibold rounded-lg flex items-center gap-2"
      >
        <Wallet size={18} />
        Loading...
      </button>
    )
  }

  if (!WalletComponent) {
    return (
      <button
        disabled
        className="px-6 py-3 bg-gray-700 text-gray-400 font-semibold rounded-lg flex items-center gap-2"
      >
        <Wallet size={18} />
        Unavailable
      </button>
    )
  }

  return <WalletComponent />
}