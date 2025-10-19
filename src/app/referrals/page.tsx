"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAccount } from "wagmi"
import {
  Github,
  Copy,
  Share2,
  Trophy,
  Users,
  Gift,
  TrendingUp,
  Check,
  QrCode
} from "lucide-react"
import { QRCode } from "@/components/ui/qr-code"

interface LeaderboardEntry {
  rank: number
  address: string
  username: string
  referrals: number
  rewards: string
  avatar?: string
}

export default function ReferralsPage() {
  const { address, isConnected } = useAccount()
  const [referralCode, setReferralCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard'>('overview')

  // User's referral stats
  const [userStats, setUserStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalRewards: '0',
    pendingRewards: '0',
    rank: 0
  })

  // Leaderboard data
  const [leaderboard] = useState<LeaderboardEntry[]>([
    {
      rank: 1,
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      username: 'alice_builder',
      referrals: 247,
      rewards: '12.5'
    },
    {
      rank: 2,
      address: '0x1234567890123456789012345678901234567890',
      username: 'bob_dev',
      referrals: 189,
      rewards: '9.8'
    },
    {
      rank: 3,
      address: '0x9876543210987654321098765432109876543210',
      username: 'charlie_eth',
      referrals: 156,
      rewards: '8.2'
    },
    {
      rank: 4,
      address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
      username: 'diana_web3',
      referrals: 134,
      rewards: '6.9'
    },
    {
      rank: 5,
      address: '0xfedcbafedcbafedcbafedcbafedcbafedcbafed',
      username: 'eve_crypto',
      referrals: 98,
      rewards: '5.1'
    },
    {
      rank: 6,
      address: '0x1111111111111111111111111111111111111111',
      username: 'frank_sol',
      referrals: 87,
      rewards: '4.6'
    },
    {
      rank: 7,
      address: '0x2222222222222222222222222222222222222222',
      username: 'grace_defi',
      referrals: 76,
      rewards: '4.0'
    },
    {
      rank: 8,
      address: '0x3333333333333333333333333333333333333333',
      username: 'henry_nft',
      referrals: 65,
      rewards: '3.4'
    },
    {
      rank: 9,
      address: '0x4444444444444444444444444444444444444444',
      username: 'iris_dao',
      referrals: 54,
      rewards: '2.8'
    },
    {
      rank: 10,
      address: '0x5555555555555555555555555555555555555555',
      username: 'jack_blockchain',
      referrals: 43,
      rewards: '2.2'
    }
  ])

  useEffect(() => {
    if (isConnected && address) {
      // Generate referral code from address
      const code = `BP-${address.slice(2, 8).toUpperCase()}`
      setReferralCode(code)

      // Simulate user stats
      setUserStats({
        totalReferrals: 12,
        activeReferrals: 8,
        totalRewards: '0.65',
        pendingRewards: '0.15',
        rank: 47
      })
    }
  }, [isConnected, address])

  const referralLink = `https://buildproof.xyz?ref=${referralCode}`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join BuildProof',
        text: 'Verify smart contracts with BuildProof - enterprise-grade security analysis',
        url: referralLink
      })
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'text-yellow-400' }
    if (rank === 2) return { icon: '🥈', color: 'text-gray-300' }
    if (rank === 3) return { icon: '🥉', color: 'text-orange-400' }
    return { icon: `#${rank}`, color: 'text-blue-400' }
  }

  return (
    <div className="min-h-screen bg-black gradient-bg fade-in">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-6 nav-border slide-in-left">
        <div className="flex items-center space-x-4">
          <Link href="/" className="w-10 h-10 bg-black border border-gray-800 flex items-center justify-center hover-lift">
            <span className="text-white font-bold text-base tracking-wider">BP</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-lg md:text-xl tracking-tight">BuildProof</span>
            <span className="text-gray-500 text-xs font-medium">Referral Program</span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 slide-in-right">
          <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
            Verify
          </Link>
          <Link href="/bounties" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
            Bounties
          </Link>
          <Link href="/reputation" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
            Reputation
          </Link>
          <Link href="/teams" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
            Teams
          </Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
            Dashboard
          </Link>
          <Link href="/referrals" className="text-blue-400 font-medium text-sm">
            Referrals
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

      {/* Main Content */}
      <main className="px-4 md:px-8 py-12 md:py-16">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">Referral</span>
              <span className="text-blue-500 ml-4">Program</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Earn rewards by inviting developers to BuildProof. Get 5% of all verification fees from your referrals.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 border font-medium transition-colors ${
                activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-gray-800 text-gray-400 hover:border-blue-500'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 border font-medium transition-colors ${
                activeTab === 'leaderboard' ? 'border-blue-500 text-blue-400' : 'border-gray-800 text-gray-400 hover:border-blue-500'
              }`}
            >
              Leaderboard
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8 fade-in">
              {/* Referral Code Section */}
              {isConnected ? (
                <div className="max-w-3xl mx-auto">
                  <div className="card p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <Gift className="text-blue-400" size={28} />
                      <h2 className="text-2xl font-bold text-white">Your Referral Link</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Referral Code</label>
                        <div className="flex gap-3">
                          <div className="flex-1 border border-blue-500 px-6 py-4 bg-black">
                            <span className="text-blue-400 font-mono text-xl font-bold">{referralCode}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(referralCode)}
                            className="px-6 border border-gray-800 hover:border-blue-500 transition-colors"
                          >
                            {copied ? <Check className="text-blue-400" size={20} /> : <Copy className="text-gray-400" size={20} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Referral Link</label>
                        <div className="flex gap-3">
                          <div className="flex-1 border border-gray-800 px-6 py-4 bg-black">
                            <span className="text-gray-400 font-mono text-sm break-all">{referralLink}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(referralLink)}
                            className="px-6 border border-gray-800 hover:border-blue-500 transition-colors"
                          >
                            {copied ? <Check className="text-blue-400" size={20} /> : <Copy className="text-gray-400" size={20} />}
                          </button>
                          <button
                            onClick={shareReferral}
                            className="px-6 border border-gray-800 hover:border-blue-500 transition-colors"
                          >
                            <Share2 className="text-gray-400" size={20} />
                          </button>
                        </div>
                      </div>

                      {/* QR Code Section */}
                      <div className="mt-8 pt-8 border-t border-gray-800">
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 border border-blue-500">
                              <Share2 className="text-blue-400" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-white">Share Your Referral</h3>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500">
                            <QrCode className="text-blue-400" size={16} />
                            <span className="text-blue-400 text-xs font-semibold">SCAN TO SHARE</span>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 items-center">
                          <div className="relative">
                            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 animate-pulse">
                              SHARE
                            </div>
                            <QRCode
                              value={referralLink}
                              size={180}
                              title="Referral QR Code"
                              description="Share this QR code to refer builders to BuildProof"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-400 text-sm mb-4">
                              Share this QR code with other builders! They can scan it to instantly access BuildProof with your referral code applied.
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <div className="w-2 h-2 bg-blue-500"></div>
                                <span>Instant referral tracking</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <div className="w-2 h-2 bg-blue-500"></div>
                                <span>Download and print</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <div className="w-2 h-2 bg-blue-500"></div>
                                <span>Share on social media</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-3xl mx-auto card p-8 text-center">
                  <p className="text-gray-400 mb-4">Connect your wallet to get your referral link</p>
                  <appkit-button />
                </div>
              )}

              {/* User Stats */}
              {isConnected && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="card p-6 border-blue-500">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="text-blue-400" size={24} />
                      <span className="text-gray-400 text-sm font-medium">Total Referrals</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{userStats.totalReferrals}</div>
                    <div className="text-xs text-gray-500 mt-2">{userStats.activeReferrals} active</div>
                  </div>

                  <div className="card p-6 border-blue-500">
                    <div className="flex items-center gap-3 mb-3">
                      <Gift className="text-blue-400" size={24} />
                      <span className="text-gray-400 text-sm font-medium">Total Rewards</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{userStats.totalRewards} ETH</div>
                    <div className="text-xs text-gray-500 mt-2">{userStats.pendingRewards} ETH pending</div>
                  </div>

                  <div className="card p-6 border-blue-500">
                    <div className="flex items-center gap-3 mb-3">
                      <Trophy className="text-blue-400" size={24} />
                      <span className="text-gray-400 text-sm font-medium">Your Rank</span>
                    </div>
                    <div className="text-3xl font-bold text-white">#{userStats.rank}</div>
                    <div className="text-xs text-gray-500 mt-2">Global ranking</div>
                  </div>

                  <div className="card p-6 border-blue-500">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="text-blue-400" size={24} />
                      <span className="text-gray-400 text-sm font-medium">Commission</span>
                    </div>
                    <div className="text-3xl font-bold text-white">5%</div>
                    <div className="text-xs text-gray-500 mt-2">Of verification fees</div>
                  </div>
                </div>
              )}

              {/* How It Works */}
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card p-6 text-center">
                    <div className="w-12 h-12 border border-blue-500 flex items-center justify-center mx-auto mb-4">
                      <span className="text-blue-400 font-bold text-xl">1</span>
                    </div>
                    <h4 className="text-white font-bold mb-2">Share Your Link</h4>
                    <p className="text-gray-400 text-sm">Share your unique referral link with developers and teams</p>
                  </div>

                  <div className="card p-6 text-center">
                    <div className="w-12 h-12 border border-blue-500 flex items-center justify-center mx-auto mb-4">
                      <span className="text-blue-400 font-bold text-xl">2</span>
                    </div>
                    <h4 className="text-white font-bold mb-2">They Verify</h4>
                    <p className="text-gray-400 text-sm">Your referrals use BuildProof to verify their contracts</p>
                  </div>

                  <div className="card p-6 text-center">
                    <div className="w-12 h-12 border border-blue-500 flex items-center justify-center mx-auto mb-4">
                      <span className="text-blue-400 font-bold text-xl">3</span>
                    </div>
                    <h4 className="text-white font-bold mb-2">You Earn</h4>
                    <p className="text-gray-400 text-sm">Get 5% commission on all their verification fees</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-8 fade-in">
              <div className="max-w-5xl mx-auto">
                <div className="card p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <Trophy className="text-blue-400" size={28} />
                    <h2 className="text-2xl font-bold text-white">Top Referrers</h2>
                  </div>

                  {/* Top 3 Podium */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {/* 2nd Place */}
                    <div className="card p-6 text-center border-gray-800">
                      <div className="text-4xl mb-2">🥈</div>
                      <div className="text-white font-bold mb-1">{leaderboard[1].username}</div>
                      <div className="text-gray-500 text-xs mb-3 font-mono">
                        {leaderboard[1].address.slice(0, 6)}...{leaderboard[1].address.slice(-4)}
                      </div>
                      <div className="text-2xl font-bold text-blue-400 mb-1">{leaderboard[1].referrals}</div>
                      <div className="text-xs text-gray-400">referrals</div>
                      <div className="text-sm text-blue-400 mt-2">{leaderboard[1].rewards} ETH</div>
                    </div>

                    {/* 1st Place */}
                    <div className="card p-6 text-center border-blue-500">
                      <div className="text-5xl mb-2">🥇</div>
                      <div className="text-white font-bold mb-1">{leaderboard[0].username}</div>
                      <div className="text-gray-500 text-xs mb-3 font-mono">
                        {leaderboard[0].address.slice(0, 6)}...{leaderboard[0].address.slice(-4)}
                      </div>
                      <div className="text-3xl font-bold text-blue-400 mb-1">{leaderboard[0].referrals}</div>
                      <div className="text-xs text-gray-400">referrals</div>
                      <div className="text-sm text-blue-400 mt-2">{leaderboard[0].rewards} ETH</div>
                    </div>

                    {/* 3rd Place */}
                    <div className="card p-6 text-center border-gray-800">
                      <div className="text-4xl mb-2">🥉</div>
                      <div className="text-white font-bold mb-1">{leaderboard[2].username}</div>
                      <div className="text-gray-500 text-xs mb-3 font-mono">
                        {leaderboard[2].address.slice(0, 6)}...{leaderboard[2].address.slice(-4)}
                      </div>
                      <div className="text-2xl font-bold text-blue-400 mb-1">{leaderboard[2].referrals}</div>
                      <div className="text-xs text-gray-400">referrals</div>
                      <div className="text-sm text-blue-400 mt-2">{leaderboard[2].rewards} ETH</div>
                    </div>
                  </div>

                  {/* Full Leaderboard */}
                  <div className="space-y-2">
                    {leaderboard.map((entry) => {
                      const badge = getRankBadge(entry.rank)
                      return (
                        <div
                          key={entry.rank}
                          className={`flex items-center justify-between p-4 border transition-colors ${
                            entry.rank <= 3 ? 'border-blue-500' : 'border-gray-800 hover:border-blue-500'
                          }`}
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 text-center font-bold ${badge.color}`}>
                              {badge.icon}
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-semibold">{entry.username}</div>
                              <div className="text-gray-500 text-xs font-mono">
                                {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="text-right">
                              <div className="text-white font-bold">{entry.referrals}</div>
                              <div className="text-gray-500 text-xs">referrals</div>
                            </div>
                            <div className="text-right">
                              <div className="text-blue-400 font-bold">{entry.rewards} ETH</div>
                              <div className="text-gray-500 text-xs">earned</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="nav-border px-4 md:px-8 py-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm font-medium">
            © 2025 BuildProof. Referral rewards program.
          </div>
          <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
              <span>Base Sepolia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
