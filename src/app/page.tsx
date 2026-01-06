"use client"

import { useState } from 'react'
import { Github } from "lucide-react"

export default function Home() {
  const [contractAddress, setContractAddress] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Verification logic will be added later
    console.log('Verifying:', contractAddress)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple Header */}
      <header className="border-b border-white px-8 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 border border-white flex items-center justify-center">
              <span className="font-bold text-lg">BP</span>
            </div>
            <span className="text-xl font-bold">BuildProof</span>
          </div>

          <div className="flex items-center gap-6">
            <appkit-button />
            <a
              href="https://github.com/Thedongraphix/BuildProof"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-70 transition-opacity"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Hero */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold">
              Smart Contract
              <br />
              Verification
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Verify and secure your smart contracts on multiple blockchain networks
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mt-16">
            <div className="border border-white p-8 bg-black">
              <input
                type="text"
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="Enter contract address (0x...)"
                className="w-full bg-black text-white border-b border-white px-4 py-4 text-lg focus:outline-none placeholder-white/30"
              />
            </div>

            <button
              type="submit"
              disabled={!contractAddress}
              className="w-full bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-white/90 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed transition-all"
            >
              Verify Contract
            </button>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-16 border-t border-white/20">
            <div>
              <div className="text-4xl font-bold">1K+</div>
              <div className="text-white/50 mt-2">Contracts Verified</div>
            </div>
            <div>
              <div className="text-4xl font-bold">5</div>
              <div className="text-white/50 mt-2">Networks</div>
            </div>
            <div>
              <div className="text-4xl font-bold">24/7</div>
              <div className="text-white/50 mt-2">Monitoring</div>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-white px-8 py-8 mt-24">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-white/50 text-sm">
            © 2025 BuildProof
          </div>
          <div className="flex items-center gap-4 text-sm text-white/50">
            <span>Enterprise Grade</span>
            <span>•</span>
            <span>SOC 2 Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
