"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Terminal } from "@/components/ui/terminal"
import { VerificationResults } from "@/components/ui/verification-results"
import { Search, Github, Copy } from "lucide-react"
import { useContractVerification } from "@/hooks/useContractVerification"
import { TEST_CONTRACTS } from "@/lib/test-contracts"

export default function Home() {
  const [contractAddress, setContractAddress] = useState('')
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum')
  const { verifyContract, isLoading, currentSteps, result, reset } = useContractVerification()

  const networks = [
    { id: 'ethereum', name: 'Ethereum Mainnet' },
    { id: 'baseTestnet', name: 'Base Sepolia' },
    { id: 'arbitrum', name: 'Arbitrum One' },
    { id: 'polygon', name: 'Polygon' }
  ]

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setContractAddress(newValue)

    // Reset terminal when input is cleared
    if (!newValue || newValue.trim() === '') {
      reset()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contractAddress || !isValidAddress(contractAddress)) {
      return
    }

    reset()
    await verifyContract(contractAddress, selectedNetwork)
  }

  const handleSampleClick = (address: string, network: string = 'ethereum') => {
    setContractAddress(address)
    setSelectedNetwork(network)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Convert verification steps to terminal output format
  const terminalOutput = currentSteps.map(step => step.message)

  return (
    <div className="min-h-screen bg-black gradient-bg fade-in">
      <div className="relative">
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
              className="text-blue-400 font-medium text-sm"
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
              href="/dashboard"
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
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
        <main className="flex flex-col items-center justify-center px-4 md:px-8 py-12 md:py-16">
          <div className="w-full max-w-5xl mx-auto space-y-12 md:space-y-16">
            {/* Hero section */}
            <div className="text-center space-y-8 fade-in">
              <div className="space-y-6">
                <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
                  <span className="text-blue-400 text-sm font-medium">Enterprise-Grade Security Platform</span>
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight stagger-1">
                  <span className="text-white">Smart Contract</span>
                  <br />
                  <span className="gradient-text stagger-2">Verification Platform</span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed stagger-3">
                  Institutional-grade security analysis powered by advanced verification protocols.
                  Trusted by leading DeFi projects for comprehensive smart contract auditing.
                </p>
                <div className="flex items-center justify-center gap-8 pt-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Real-time Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Multi-Chain Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span>99.9% Uptime</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input section */}
            <div className="space-y-8">
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="glass-card p-8 rounded-2xl space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Contract Address
                      </label>
                      <input
                        type="text"
                        value={contractAddress}
                        onChange={handleInputChange}
                        placeholder="0x742d35c6d46ad0c8f121d0c0e98f5e6e9d8b9c7a"
                        className="contract-input w-full px-6 py-4 text-white text-base border-gray-700 rounded-xl bg-black/50 focus:ring-2 focus:ring-blue-500/50"
                      />
                      {!isValidAddress(contractAddress) && contractAddress && (
                        <div className="absolute top-full mt-2 text-red-400 text-sm flex items-center gap-1">
                          <span>⚠</span> Invalid address format
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-300 mb-3">
                        Network
                      </label>
                      <select
                        value={selectedNetwork}
                        onChange={(e) => setSelectedNetwork(e.target.value)}
                        className="contract-input w-full px-6 py-4 text-white text-base border-gray-700 rounded-xl bg-black/50 cursor-pointer focus:ring-2 focus:ring-blue-500/50"
                      >
                        {networks.map((network) => (
                          <option key={network.id} value={network.id} className="bg-gray-900">
                            {network.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col justify-end">
                      <button
                        type="submit"
                        disabled={!contractAddress || !isValidAddress(contractAddress) || isLoading}
                        className="btn-primary px-8 py-4 font-semibold rounded-xl disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
                      >
                        <Search className="inline mr-2" size={18} />
                        {isLoading ? 'Analyzing...' : 'Verify Contract'}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Sample Contracts */}
            {!isLoading && terminalOutput.length === 0 && (
              <div className="max-w-4xl mx-auto mb-8">
                <h3 className="text-xl font-semibold text-white mb-6 text-center">
                  Try Sample Contracts
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="feature-card card p-5 hover:bg-gray-900/30 transition-all cursor-pointer rounded-xl" onClick={() => handleSampleClick(TEST_CONTRACTS.BASE_SEPOLIA_USDC, 'baseTestnet')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Base USDC</h4>
                        <p className="text-sm text-gray-400">Base Sepolia Testnet</p>
                      </div>
                      <Copy className="w-4 h-4 text-gray-400" onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(TEST_CONTRACTS.BASE_SEPOLIA_USDC)
                      }} />
                    </div>
                  </div>

                  <div className="feature-card card p-5 hover:bg-gray-900/30 transition-all cursor-pointer rounded-xl" onClick={() => handleSampleClick(TEST_CONTRACTS.BASE_SEPOLIA_WETH, 'baseTestnet')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">Base WETH</h4>
                        <p className="text-sm text-gray-400">Wrapped ETH on Base</p>
                      </div>
                      <Copy className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(TEST_CONTRACTS.BASE_SEPOLIA_WETH)
                      }} />
                    </div>
                  </div>

                  <div className="feature-card card p-5 hover:bg-gray-900/30 transition-all cursor-pointer rounded-xl" onClick={() => handleSampleClick(TEST_CONTRACTS.USDC, 'ethereum')}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-white">ETH USDC</h4>
                        <p className="text-sm text-gray-400">Ethereum Mainnet</p>
                      </div>
                      <Copy className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors" onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(TEST_CONTRACTS.USDC)
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terminal output */}
            <div className="max-w-5xl mx-auto">
              <Terminal output={terminalOutput} isLoading={isLoading} />

              {/* Verification Results */}
              {result && result.isComplete && (
                <VerificationResults result={result} />
              )}
            </div>
          </div>
        </main>

        {/* Professional footer */}
        <footer className="nav-border px-4 md:px-8 py-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm font-medium">
              © 2025 BuildProof. Enterprise-grade contract verification platform.
            </div>
            <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Network</span>
              </div>
              <div className="w-px h-4 bg-gray-700"></div>
              <span>SOC 2 Compliant</span>
              <div className="w-px h-4 bg-gray-700"></div>
              <span>24/7 Monitoring</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}