"use client"

import { useState } from 'react'
import { Github, ArrowRight } from "lucide-react"

export default function Home() {
  const [contractAddress, setContractAddress] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Verifying:', contractAddress)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* iOS-style Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-2xl">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="font-bold text-black text-xs">BP</span>
            </div>
            <span className="text-base font-semibold">BuildProof</span>
          </div>

          <div className="flex items-center gap-4">
            <appkit-button />
            <a
              href="https://github.com/Thedongraphix/BuildProof"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-all"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section - Simplified iOS Style */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">

          {/* Main Headline - Larger, Simpler */}
          <div className="space-y-4 animate-fade-in">
            <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tight">
              Verify Smart Contracts
            </h1>
            <p className="text-xl text-white/50 max-w-xl mx-auto">
              Professional security verification across all blockchain networks
            </p>
          </div>

          {/* iOS-style Input Card */}
          <div className="max-w-2xl mx-auto mt-12 animate-fade-in-up">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-transparent text-white text-lg focus:outline-none placeholder-white/30"
                />
              </div>

              <button
                type="submit"
                disabled={!contractAddress}
                className="w-full bg-white text-black px-8 py-4 rounded-2xl text-base font-semibold hover:bg-white/90 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
              >
                <span>Verify Contract</span>
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>
          </div>

          {/* Trust Pills */}
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            <div className="px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full text-sm text-white/60 border border-white/10">
              SOC 2 Compliant
            </div>
            <div className="px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full text-sm text-white/60 border border-white/10">
              Real-time Analysis
            </div>
            <div className="px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full text-sm text-white/60 border border-white/10">
              256-bit Encryption
            </div>
          </div>
        </div>

        {/* Stats - iOS Cards */}
        <div className="max-w-4xl mx-auto mt-24 grid grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center hover:bg-white/10 transition-all">
            <div className="text-5xl font-bold mb-2">1K+</div>
            <div className="text-sm text-white/50">Verified</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center hover:bg-white/10 transition-all">
            <div className="text-5xl font-bold mb-2">99.9%</div>
            <div className="text-sm text-white/50">Uptime</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center hover:bg-white/10 transition-all">
            <div className="text-5xl font-bold mb-2">&lt;2s</div>
            <div className="text-sm text-white/50">Response</div>
          </div>
        </div>

        {/* Features - iOS Cards */}
        <div className="max-w-5xl mx-auto mt-20 space-y-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:bg-white/10 transition-all">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Verification</h3>
            <p className="text-white/50 leading-relaxed">
              Instant security analysis with our distributed verification network
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:bg-white/10 transition-all">
            <div className="text-3xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Enterprise Security</h3>
            <p className="text-white/50 leading-relaxed">
              Bank-grade encryption with SOC 2 compliance
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:bg-white/10 transition-all">
            <div className="text-3xl mb-4">🌐</div>
            <h3 className="text-xl font-semibold mb-2">Multi-Chain Support</h3>
            <p className="text-white/50 leading-relaxed">
              Support for Ethereum, Base, Polygon, Arbitrum, and more
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto mt-24 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to secure your contracts?
          </h2>
          <p className="text-lg text-white/50 mb-8">
            Join thousands of developers trusting BuildProof
          </p>
          <button className="bg-white text-black px-10 py-4 rounded-2xl text-base font-semibold hover:bg-white/90 transition-all inline-flex items-center gap-2">
            <span>Get Started</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </main>

      {/* iOS Footer */}
      <footer className="px-6 py-8 mt-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
              <span className="font-bold text-white/60 text-xs">BP</span>
            </div>
            <span>© 2025 BuildProof</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
