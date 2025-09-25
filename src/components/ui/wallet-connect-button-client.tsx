'use client'

import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react'
import { Wallet, Power } from 'lucide-react'
import { useEffect, useState } from 'react'

export function WalletConnectButtonClient() {
  const [mounted, setMounted] = useState(false)
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  const shortenAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (!mounted) {
    // Show loading state or skeleton during hydration
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

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg text-green-400 font-mono text-sm">
          {shortenAddress(address)}
        </div>
        <button
          onClick={() => disconnect()}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
          title="Disconnect wallet"
        >
          <Power size={18} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => open()}
      className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-black font-semibold rounded-lg hover:from-green-400 hover:to-blue-400 transition-all glow-green flex items-center gap-2"
    >
      <Wallet size={18} />
      Connect Wallet
    </button>
  )
}