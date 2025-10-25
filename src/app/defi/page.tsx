"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Github, Coins, Droplet, ArrowLeftRight, Vote } from "lucide-react"
import { TokenDashboard } from "@/components/defi/TokenDashboard"
import { LiquidityPool } from "@/components/defi/LiquidityPool"
import { SwapInterface } from "@/components/defi/SwapInterface"
import { GovernancePanel } from "@/components/defi/GovernancePanel"
import { NotificationsCenter } from "@/components/ui/notifications-center"

export default function DeFiPage() {
  const [activeTab, setActiveTab] = useState<'token' | 'liquidity' | 'swap' | 'governance'>('token')

  const tabs = [
    { id: 'token' as const, name: 'Token', icon: Coins },
    { id: 'liquidity' as const, name: 'Liquidity', icon: Droplet },
    { id: 'swap' as const, name: 'Swap', icon: ArrowLeftRight },
    { id: 'governance' as const, name: 'Governance', icon: Vote }
  ]

  return (
    <div className="min-h-screen bg-black gradient-bg fade-in">
      {/* Professional header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-6 nav-border slide-in-left">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-black border border-gray-800 flex items-center justify-center hover-lift">
            <span className="text-white font-bold text-base tracking-wider">BP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-lg md:text-xl tracking-tight">BuildProof</span>
            <span className="text-gray-500 text-xs font-medium">Enterprise Verifier</span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 slide-in-right">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Verify
          </Link>
          <Link
            href="/bounties"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Bounties
          </Link>
          <Link
            href="/reputation"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Reputation
          </Link>
          <Link
            href="/teams"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Teams
          </Link>
          <Link
            href="/referrals"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Referrals
          </Link>
          <Link
            href="/staking"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Staking
          </Link>
          <Link
            href="/defi"
            className="text-blue-400 font-medium text-sm"
          >
            DeFi
          </Link>
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Dashboard
          </Link>
          <NotificationsCenter />
          <appkit-button />
          <a
            href="https://github.com/Thedongraphix/BuildProof"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-900/20 hover-lift"
            aria-label="View source code"
          >
            <Github size={18} />
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 md:px-8 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero */}
          <div className="text-center space-y-4 fade-in">
            <h1 className="text-5xl md:text-6xl font-bold">
              <span className="text-white">DeFi</span>
              <br />
              <span className="text-blue-500">Protocol</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Trade BPROOF tokens, provide liquidity, and participate in governance on Base Sepolia
            </p>
          </div>

          {/* Tabs */}
          <div className="card p-2 flex gap-2 max-w-2xl mx-auto slide-in-left">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-3 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900/20'
                }`}
              >
                <tab.icon className="inline mr-2" size={18} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="slide-in-right">
            {activeTab === 'token' && <TokenDashboard />}
            {activeTab === 'liquidity' && <LiquidityPool />}
            {activeTab === 'swap' && <SwapInterface />}
            {activeTab === 'governance' && <GovernancePanel />}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="nav-border px-4 md:px-8 py-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm font-medium">
            © 2025 BuildProof. Enterprise-grade DeFi protocol.
          </div>
          <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Base Sepolia</span>
            </div>
            <div className="w-px h-4 bg-gray-700"></div>
            <span>Audited</span>
            <div className="w-px h-4 bg-gray-700"></div>
            <span>Open Source</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
