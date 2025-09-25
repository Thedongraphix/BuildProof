"use client"

import { useState } from 'react'
import { Terminal } from "@/components/ui/terminal"
import { WalletConnectButton } from "@/components/ui/wallet-connect-button-wrapper"
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

    // Simulate contract verification process
    const simulatedOutput = [
      'INFO: Initializing contract verification...',
      `INFO: Analyzing contract at ${contractAddress}`,
      'INFO: Fetching contract bytecode from blockchain...',
      'INFO: Decompiling bytecode...',
      'SUCCESS: Contract bytecode retrieved successfully',
      'INFO: Running security analysis...',
      'INFO: Checking for common vulnerabilities...',
      'WARN: Reentrancy patterns detected - review required',
      'INFO: Checking access controls...',
      'SUCCESS: Access controls properly implemented',
      'INFO: Analyzing gas optimization opportunities...',
      'SUCCESS: Contract verification completed',
      `SUCCESS: Contract ${contractAddress} is verified and secure`,
      'INFO: Full report available in terminal output'
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix background */}
      <div className="absolute inset-0 matrix-bg"></div>

      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/50 to-black"></div>

      <div className="relative z-10">
        {/* Minimal header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center glow-green">
              <span className="text-black font-bold text-sm">BP</span>
            </div>
            <span className="text-white font-mono text-lg tracking-wide">BuildProof</span>
          </div>

          <div className="flex items-center gap-4">
            <WalletConnectButton />
            <a
              href="https://github.com/Thedongraphix/BuildProof"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
          </div>
        </header>

        {/* Main content */}
        <main className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">
          <div className="w-full max-w-4xl mx-auto text-center space-y-12">
            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-mono font-bold text-white">
                Contract
                <span className="text-green-400 glow-green ml-4">Verifier</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto font-mono">
                Verify smart contracts onchain with advanced security analysis
              </p>
            </div>

            {/* Input section */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={contractAddress}
                    onChange={(e) => setContractAddress(e.target.value)}
                    placeholder="0x742d35c6d46ad0c8f121d0c0e98f5e6e9d8b9c7a"
                    className="contract-input w-full px-6 py-4 rounded-lg text-white font-mono text-lg placeholder-gray-500 focus:glow-green"
                  />
                  {!isValidAddress(contractAddress) && contractAddress && (
                    <div className="absolute top-full mt-2 text-red-400 text-sm font-mono">
                      Invalid address format
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={!contractAddress || !isValidAddress(contractAddress) || isLoading}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-black font-mono font-bold rounded-lg hover:from-green-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-green"
                >
                  <Search className="inline mr-2" size={18} />
                  Verify
                </button>
              </form>
            </div>

            {/* Terminal output */}
            <div className="max-w-4xl mx-auto">
              <Terminal output={terminalOutput} isLoading={isLoading} />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800/50 p-6 text-center">
          <p className="text-gray-500 font-mono text-sm">
            Powered by blockchain security protocols
          </p>
        </footer>
      </div>
    </div>
  )
}