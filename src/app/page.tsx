"use client"

import { useState } from 'react'
import { Github, ArrowRight, CheckCircle, AlertTriangle, XCircle, Shield, Clock, FileText, TrendingUp, Lock, Zap } from "lucide-react"
import { contracts, formatEther, formatAddress, isValidAddress } from '@/lib/contracts'
import { useReadContract } from 'wagmi'

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
  const [activeTab, setActiveTab] = useState<'verify' | 'insurance' | 'tools'>('verify')

  // Read BuilderInsurance contract stats
  const { data: totalStaked } = useReadContract({
    address: contracts.builderInsurance.address,
    abi: contracts.builderInsurance.abi,
    functionName: 'totalStaked',
  })

  const { data: insurancePool } = useReadContract({
    address: contracts.builderInsurance.address,
    abi: contracts.builderInsurance.abi,
    functionName: 'insurancePool',
  })

  const { data: totalPolicies } = useReadContract({
    address: contracts.builderInsurance.address,
    abi: contracts.builderInsurance.abi,
    functionName: 'totalPolicies',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contractAddress) return

    setIsVerifying(true)
    setResult(null)

    await new Promise(resolve => setTimeout(resolve, 2500))

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
      {/* Navigation */}
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
        <div className="max-w-5xl mx-auto">

          {/* Tabs */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setActiveTab('verify')}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                activeTab === 'verify'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              Verify
            </button>
            <button
              onClick={() => setActiveTab('insurance')}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                activeTab === 'insurance'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              Insurance
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all ${
                activeTab === 'tools'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white hover:bg-white/10'
              }`}
            >
              Tools
            </button>
          </div>

          {/* Verify Tab */}
          {activeTab === 'verify' && !result && (
            <div className="space-y-8 animate-fade-in">
              <div className="text-center space-y-4">
                <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tight">
                  Verify Smart Contracts
                </h1>
                <p className="text-xl text-white/50 max-w-xl mx-auto">
                  Professional security verification across all blockchain networks
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
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

              <div className="flex items-center justify-center gap-3 flex-wrap">
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
          {activeTab === 'verify' && result && (
            <div className="space-y-6 animate-fade-in">
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

          {/* Insurance Tab */}
          {activeTab === 'insurance' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-4 mb-12">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                  Builder Insurance
                </h1>
                <p className="text-xl text-white/50 max-w-xl mx-auto">
                  Protect your projects with on-chain insurance coverage
                </p>
              </div>

              {/* Live Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
                  <Lock className="w-8 h-8 text-white/40 mx-auto mb-3" />
                  <div className="text-4xl font-bold mb-2">
                    {totalStaked ? formatEther(totalStaked) : '0.0000'}
                  </div>
                  <div className="text-sm text-white/50">Total Staked (ETH)</div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
                  <Shield className="w-8 h-8 text-white/40 mx-auto mb-3" />
                  <div className="text-4xl font-bold mb-2">
                    {insurancePool ? formatEther(insurancePool) : '0.0000'}
                  </div>
                  <div className="text-sm text-white/50">Insurance Pool (ETH)</div>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 text-center">
                  <TrendingUp className="w-8 h-8 text-white/40 mx-auto mb-3" />
                  <div className="text-4xl font-bold mb-2">
                    {totalPolicies?.toString() || '0'}
                  </div>
                  <div className="text-sm text-white/50">Active Policies</div>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                  <Lock className="w-12 h-12 text-white mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Stake as Builder</h3>
                  <p className="text-white/50 mb-6 text-sm">
                    Stake ETH to unlock insurance benefits and earn 5% APY rewards
                  </p>
                  <button className="w-full bg-white text-black px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-white/90 transition-all">
                    Stake Now
                  </button>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                  <Shield className="w-12 h-12 text-white mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Purchase Policy</h3>
                  <p className="text-white/50 mb-6 text-sm">
                    Get insurance coverage for your projects and protect against disputes
                  </p>
                  <button className="w-full bg-white text-black px-6 py-3 rounded-2xl text-sm font-semibold hover:bg-white/90 transition-all">
                    Get Coverage
                  </button>
                </div>
              </div>

              {/* Contract Info */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="font-semibold mb-3">Contract Address</h3>
                <div className="flex items-center justify-between">
                  <code className="text-sm text-white/60">{contracts.builderInsurance.address}</code>
                  <a
                    href={`https://sepolia.basescan.org/address/${contracts.builderInsurance.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    View on Basescan
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Tools Tab */}
          {activeTab === 'tools' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-4 mb-12">
                <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                  Security Tools
                </h1>
                <p className="text-xl text-white/50 max-w-xl mx-auto">
                  Comprehensive security analysis and development utilities
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:bg-white/10 transition-all">
                  <Zap className="w-10 h-10 text-white mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Gas Estimator</h3>
                  <p className="text-white/50 leading-relaxed mb-4">
                    Estimate gas costs for your contract transactions across multiple networks
                  </p>
                  <button className="bg-white/10 text-white px-6 py-2 rounded-2xl text-sm font-semibold hover:bg-white/20 transition-all border border-white/10">
                    Coming Soon
                  </button>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:bg-white/10 transition-all">
                  <Shield className="w-10 h-10 text-white mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Security Scanner</h3>
                  <p className="text-white/50 leading-relaxed mb-4">
                    Advanced static analysis to detect vulnerabilities and security issues
                  </p>
                  <button className="bg-white/10 text-white px-6 py-2 rounded-2xl text-sm font-semibold hover:bg-white/20 transition-all border border-white/10">
                    Coming Soon
                  </button>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-10 border border-white/10 hover:bg-white/10 transition-all">
                  <FileText className="w-10 h-10 text-white mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Code Formatter</h3>
                  <p className="text-white/50 leading-relaxed mb-4">
                    Format and beautify your Solidity code with best practices
                  </p>
                  <button className="bg-white/10 text-white px-6 py-2 rounded-2xl text-sm font-semibold hover:bg-white/20 transition-all border border-white/10">
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
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
