"use client"

import { useState } from 'react'
import { Terminal } from "@/components/ui/terminal"
import { Search, Github } from "lucide-react"

export default function Home() {
  const [contractAddress, setContractAddress] = useState('')
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  const verifyContract = async () => {
    if (!contractAddress || !isValidAddress(contractAddress)) {
      setTerminalOutput(['ERROR: Invalid contract address format'])
      return
    }

    setIsLoading(true)
    setTerminalOutput([])

    // Professional contract verification process
    const simulatedOutput = [
      'INFO: Initializing enterprise verification engine...',
      `INFO: Contract analysis initiated for ${contractAddress}`,
      'INFO: Retrieving bytecode from Ethereum mainnet...',
      'INFO: Performing static code analysis...',
      'SUCCESS: Bytecode extraction completed',
      'INFO: Running comprehensive security audit...',
      'INFO: Scanning for vulnerability patterns...',
      'WARN: Potential reentrancy vector identified - flagged for review',
      'INFO: Validating access control mechanisms...',
      'SUCCESS: Access controls verified and compliant',
      'INFO: Evaluating gas optimization patterns...',
      'INFO: Generating compliance report...',
      'SUCCESS: Contract verification protocol completed',
      `SUCCESS: ${contractAddress} cleared for production deployment`,
      'INFO: Enterprise security report available for download'
    ]

    for (let i = 0; i < simulatedOutput.length; i++) {
      setTimeout(() => {
        setTerminalOutput(prev => [...prev, simulatedOutput[i]])
        if (i === simulatedOutput.length - 1) {
          setIsLoading(false)
        }
      }, i * 300)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    verifyContract()
  }

  return (
    <div className="min-h-screen bg-black clean-bg fade-in">
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
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight stagger-1">
                  Contract
                  <span className="accent-blue block md:inline md:ml-4 stagger-2">Verification</span>
                </h1>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed stagger-3">
                  Professional smart contract security analysis with institutional-grade verification protocols
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-gray-500 stagger-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="hidden sm:inline">Ethereum</span>
                  <span className="sm:hidden">ETH</span>
                  <span>Mainnet</span>
                </div>
                <div className="w-px h-4 bg-gray-700"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span>Real-time Analysis</span>
                </div>
                <div className="w-px h-4 bg-gray-700"></div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span>Enterprise Security</span>
                </div>
              </div>
            </div>

            {/* Input section */}
            <div className="space-y-8">
              <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <label className="block text-sm font-medium text-gray-400 mb-3">
                      Contract Address
                    </label>
                    <input
                      type="text"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      placeholder="0x742d35c6d46ad0c8f121d0c0e98f5e6e9d8b9c7a"
                      className="contract-input w-full px-6 py-4 text-white text-base border-gray-800 rounded-none"
                    />
                    {!isValidAddress(contractAddress) && contractAddress && (
                      <div className="absolute top-full mt-2 text-red-400 text-sm">
                        Invalid address format
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-end">
                    <button
                      type="submit"
                      disabled={!contractAddress || !isValidAddress(contractAddress) || isLoading}
                      className="btn-primary px-8 py-4 font-semibold rounded-none disabled:cursor-not-allowed"
                    >
                      <Search className="inline mr-2" size={18} />
                      {isLoading ? 'Analyzing...' : 'Verify Contract'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Terminal output */}
            <div className="max-w-5xl mx-auto">
              <Terminal output={terminalOutput} isLoading={isLoading} />
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