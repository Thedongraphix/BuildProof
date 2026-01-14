"use client"

import { useState } from 'react'
import { Github, ArrowRight, CheckCircle, AlertTriangle, XCircle, Shield, Clock, FileText } from "lucide-react"

interface VerificationResult {
  isVerified: boolean
  securityScore: number
  contractName: string
  compiler: string
  network: string
  findings: {
    critical: number
    high: number
    medium: number
    low: number
  }
  details: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
    title: string
    description: string
  }>
  verifiedAt: string
}

export default function Home() {
  const [contractAddress, setContractAddress] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!contractAddress) return

    setIsVerifying(true)
    setResult(null)

    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2500))

    // Mock verification result
    const mockResult: VerificationResult = {
      isVerified: true,
      securityScore: 85,
      contractName: "BuilderInsurance",
      compiler: "0.8.26",
      network: "Base Sepolia",
      findings: {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3
      },
      details: [
        {
          severity: 'high',
          title: 'Reentrancy Guard',
          description: 'Contract uses ReentrancyGuard properly to prevent reentrancy attacks'
        },
        {
          severity: 'medium',
          title: 'Access Control',
          description: 'Owner privileges detected. Consider implementing timelock for sensitive functions'
        },
        {
          severity: 'medium',
          title: 'Integer Overflow',
          description: 'Using Solidity 0.8+ which has built-in overflow protection'
        },
        {
          severity: 'low',
          title: 'Gas Optimization',
          description: 'Some functions could be optimized for gas efficiency'
        },
        {
          severity: 'low',
          title: 'Event Emissions',
          description: 'All critical state changes emit events properly'
        },
        {
          severity: 'info',
          title: 'Code Quality',
          description: 'Contract follows best practices and uses OpenZeppelin libraries'
        }
      ],
      verifiedAt: new Date().toLocaleString()
    }

    setResult(mockResult)
    setIsVerifying(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="text-red-400" size={20} />
      case 'high':
        return <AlertTriangle className="text-orange-400" size={20} />
      case 'medium':
        return <AlertTriangle className="text-yellow-400" size={20} />
      case 'low':
        return <CheckCircle className="text-blue-400" size={20} />
      default:
        return <CheckCircle className="text-green-400" size={20} />
    }
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

      {/* Main Content */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Hero Section */}
          {!result && (
            <div className="text-center space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tight">
                  Verify Smart Contracts
                </h1>
                <p className="text-xl text-white/50 max-w-xl mx-auto">
                  Professional security verification across all blockchain networks
                </p>
              </div>

              {/* iOS-style Input Card */}
              <div className="max-w-2xl mx-auto mt-12">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                    <input
                      type="text"
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-transparent text-white text-lg focus:outline-none placeholder-white/30"
                      disabled={isVerifying}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!contractAddress || isVerifying}
                    className="w-full bg-white text-black px-8 py-4 rounded-2xl text-base font-semibold hover:bg-white/90 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Contract</span>
                        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
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
          )}

          {/* Verification Results */}
          {result && (
            <div className="space-y-6 animate-fade-in">
              {/* Back Button */}
              <button
                onClick={() => {
                  setResult(null)
                  setContractAddress('')
                }}
                className="text-white/60 hover:text-white flex items-center gap-2 transition-colors mb-6"
              >
                <ArrowRight size={18} className="rotate-180" />
                <span>New Verification</span>
              </button>

              {/* Security Score Card */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{result.contractName}</h2>
                    <div className="flex items-center gap-4 text-sm text-white/50">
                      <span className="flex items-center gap-1">
                        <Shield size={14} />
                        {result.network}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        Solidity {result.compiler}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {result.verifiedAt}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-5xl font-bold ${getScoreColor(result.securityScore)}`}>
                      {result.securityScore}
                    </div>
                    <div className="text-sm text-white/50 mt-1">Security Score</div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-400" size={20} />
                  <span className="text-green-400 font-semibold">Contract Verified</span>
                </div>
              </div>

              {/* Findings Summary */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-red-400">{result.findings.critical}</div>
                  <div className="text-xs text-white/50 mt-1">Critical</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-orange-400">{result.findings.high}</div>
                  <div className="text-xs text-white/50 mt-1">High</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{result.findings.medium}</div>
                  <div className="text-xs text-white/50 mt-1">Medium</div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-blue-400">{result.findings.low}</div>
                  <div className="text-xs text-white/50 mt-1">Low</div>
                </div>
              </div>

              {/* Detailed Findings */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold mb-4">Detailed Analysis</h3>
                {result.details.map((detail, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">{getSeverityIcon(detail.severity)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{detail.title}</h4>
                          <span className="px-2 py-0.5 bg-white/10 rounded-full text-xs text-white/60 capitalize">
                            {detail.severity}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">
                          {detail.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 bg-white text-black px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-white/90 transition-all">
                  Download Report
                </button>
                <button className="flex-1 bg-white/10 text-white px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-white/20 transition-all border border-white/10">
                  Share Results
                </button>
              </div>
            </div>
          )}

          {/* Stats - Only show when no results */}
          {!result && !isVerifying && (
            <>
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

              {/* Features */}
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
            </>
          )}
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
