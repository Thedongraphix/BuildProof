"use client"

import { useState } from 'react'
import { Github, ArrowRight, Shield, Zap, Lock } from "lucide-react"

export default function Home() {
  const [contractAddress, setContractAddress] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Verifying:', contractAddress)
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Premium Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="w-9 h-9 border border-white flex items-center justify-center transition-transform group-hover:scale-105">
                <span className="font-bold text-sm">BP</span>
              </div>
              <div className="absolute inset-0 bg-white/5 blur-xl transition-opacity opacity-0 group-hover:opacity-100" />
            </div>
            <span className="text-lg font-semibold tracking-tight">BuildProof</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">
              Features
            </a>
            <a href="#security" className="text-sm text-white/60 hover:text-white transition-colors">
              Security
            </a>
            <appkit-button />
            <a
              href="https://github.com/Thedongraphix/BuildProof"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors hover:scale-110 transition-transform"
            >
              <Github size={20} />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium Design */}
      <section className="relative pt-32 pb-20 px-8">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent opacity-50" />

        <div className="max-w-6xl mx-auto relative">
          {/* Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 bg-white/5 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-xs text-white/80 font-medium tracking-wide">ENTERPRISE SECURITY</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-center mb-6 animate-fade-in-up">
            <div className="text-7xl md:text-8xl font-bold tracking-tighter leading-none mb-4">
              Smart Contract
            </div>
            <div className="text-7xl md:text-8xl font-bold tracking-tighter leading-none text-white/40">
              Verification
            </div>
          </h1>

          {/* Subheadline */}
          <p className="text-center text-xl text-white/50 max-w-2xl mx-auto mb-16 leading-relaxed animate-fade-in-up animation-delay-200">
            Professional security analysis for smart contracts across multiple blockchain networks.
            Instant verification, real-time monitoring.
          </p>

          {/* Premium Input Section */}
          <div className="max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
            <form onSubmit={handleSubmit} className="relative group">
              <div className={`
                relative border transition-all duration-300
                ${isFocused ? 'border-white shadow-premium' : 'border-white/20'}
              `}>
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Enter contract address"
                  className="w-full bg-transparent text-white px-8 py-6 text-lg focus:outline-none placeholder-white/30"
                />

                {/* Animated border glow */}
                {isFocused && (
                  <div className="absolute inset-0 border border-white animate-border-glow pointer-events-none" />
                )}
              </div>

              <button
                type="submit"
                disabled={!contractAddress}
                className="w-full mt-4 bg-white text-black px-8 py-5 text-base font-semibold hover:bg-white/90 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 group hover:gap-4"
              >
                <span>Verify Contract</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <Shield size={16} />
                <span>SOC 2 Compliant</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <Zap size={16} />
                <span>Real-time Analysis</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <Lock size={16} />
                <span>256-bit Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Modern Grid */}
      <section className="relative py-24 px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-px bg-white/10">
            {/* Stat 1 */}
            <div className="bg-black p-12 hover:bg-white/5 transition-colors group cursor-default">
              <div className="text-6xl font-bold mb-3 group-hover:scale-105 transition-transform">1K+</div>
              <div className="text-white/50 text-sm tracking-wide">Contracts Verified</div>
              <div className="mt-4 text-white/30 text-xs">Last 30 days</div>
            </div>

            {/* Stat 2 */}
            <div className="bg-black p-12 hover:bg-white/5 transition-colors group cursor-default">
              <div className="text-6xl font-bold mb-3 group-hover:scale-105 transition-transform">99.9%</div>
              <div className="text-white/50 text-sm tracking-wide">Uptime Guaranteed</div>
              <div className="mt-4 text-white/30 text-xs">SLA backed</div>
            </div>

            {/* Stat 3 */}
            <div className="bg-black p-12 hover:bg-white/5 transition-colors group cursor-default">
              <div className="text-6xl font-bold mb-3 group-hover:scale-105 transition-transform">&lt;2s</div>
              <div className="text-white/50 text-sm tracking-wide">Average Response</div>
              <div className="mt-4 text-white/30 text-xs">Global CDN</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid - Premium Cards */}
      <section id="features" className="relative py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center">
            Built for <span className="text-white/40">Enterprises</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-px bg-white/10">
            <div className="bg-black p-12 hover:bg-white/5 transition-all group cursor-default border-r border-b border-white/10">
              <div className="text-4xl mb-6">⚡</div>
              <h3 className="text-xl font-semibold mb-3">Real-time Verification</h3>
              <p className="text-white/50 leading-relaxed">
                Instant security analysis with our distributed verification network across
                multiple blockchain networks.
              </p>
            </div>

            <div className="bg-black p-12 hover:bg-white/5 transition-all group cursor-default border-b border-white/10">
              <div className="text-4xl mb-6">🔒</div>
              <h3 className="text-xl font-semibold mb-3">Enterprise Security</h3>
              <p className="text-white/50 leading-relaxed">
                Bank-grade encryption and SOC 2 compliance for the highest level of
                security and privacy.
              </p>
            </div>

            <div className="bg-black p-12 hover:bg-white/5 transition-all group cursor-default border-r border-white/10">
              <div className="text-4xl mb-6">📊</div>
              <h3 className="text-xl font-semibold mb-3">Advanced Analytics</h3>
              <p className="text-white/50 leading-relaxed">
                Comprehensive insights and reports on contract security vulnerabilities
                and optimization opportunities.
              </p>
            </div>

            <div className="bg-black p-12 hover:bg-white/5 transition-all group cursor-default">
              <div className="text-4xl mb-6">🌐</div>
              <h3 className="text-xl font-semibold mb-3">Multi-Chain Support</h3>
              <p className="text-white/50 leading-relaxed">
                Support for Ethereum, Base, Polygon, Arbitrum, and more blockchain
                networks with unified API.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="security" className="relative py-32 px-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to secure your<br />smart contracts?
          </h2>
          <p className="text-xl text-white/50 mb-12">
            Join thousands of developers and enterprises trusting BuildProof
          </p>
          <button className="bg-white text-black px-12 py-5 text-lg font-semibold hover:bg-white/90 transition-all inline-flex items-center gap-3 group">
            <span>Get Started</span>
            <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative border-t border-white/10 px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-white/30 flex items-center justify-center">
                <span className="font-bold text-xs">BP</span>
              </div>
              <span className="text-sm text-white/40">© 2025 BuildProof</span>
            </div>

            <div className="flex items-center gap-8 text-sm text-white/40">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
