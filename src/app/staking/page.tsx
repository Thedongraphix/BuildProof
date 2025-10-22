"use client"

import { useState } from "react"
import Link from "next/link"
import { useAccount } from "wagmi"
import {
  Github,
  Lock,
  Unlock,
  TrendingUp,
  Clock,
  DollarSign,
  Award,
  History,
  AlertCircle,
  CheckCircle,
  Zap
} from "lucide-react"

export default function StakingPage() {
  const { address, isConnected } = useAccount()
  const [stakeAmount, setStakeAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 90 | 180 | 365>(90)

  // Mock data - will be replaced with real contract calls
  const stakingData = {
    totalStaked: "125,000",
    yourStake: "5,000",
    pendingRewards: "125.50",
    apy: {
      30: 12,
      90: 18,
      180: 25,
      365: 35
    },
    totalRewardsEarned: "450.75",
    stakingPeriodEnd: Date.now() + 15 * 24 * 60 * 60 * 1000, // 15 days from now
    isStaking: true
  }

  const stakingHistory = [
    {
      id: 1,
      type: "stake",
      amount: "2,000",
      timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
      status: "completed"
    },
    {
      id: 2,
      type: "reward",
      amount: "150.50",
      timestamp: Date.now() - 15 * 24 * 60 * 60 * 1000,
      status: "completed"
    },
    {
      id: 3,
      type: "stake",
      amount: "3,000",
      timestamp: Date.now() - 45 * 24 * 60 * 60 * 1000,
      status: "completed"
    }
  ]

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getDaysRemaining = () => {
    const days = Math.ceil((stakingData.stakingPeriodEnd - Date.now()) / (24 * 60 * 60 * 1000))
    return days
  }

  const handleStake = () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    alert(`Staking ${stakeAmount} tokens for ${selectedPeriod} days`)
  }

  const handleWithdraw = () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    alert(`Withdrawing ${withdrawAmount} tokens`)
  }

  const handleClaimRewards = () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    alert(`Claiming ${stakingData.pendingRewards} rewards`)
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
            <span className="text-gray-500 text-xs font-medium">Staking Dashboard</span>
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
          <Link href="/staking" className="text-blue-400 font-medium text-sm">
            Staking
          </Link>
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
            Dashboard
          </Link>
          <appkit-button />
          <a
            href="https://github.com/Thedongraphix/BuildProof"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-900/20 hover-lift"
          >
            <Github size={18} />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-8 py-12 md:py-16">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="space-y-6 fade-in">
            <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 mb-3">
              <span className="text-blue-400 text-sm font-medium">Earn Rewards by Staking</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">Stake & </span>
              <span className="text-blue-500">Earn</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl">
              Lock your tokens to earn competitive rewards. Choose your staking period and start earning passive income.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-6 stat-item hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10">
                  <Lock className="text-blue-400" size={24} />
                </div>
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{stakingData.totalStaked}</div>
              <div className="text-sm text-gray-400 font-medium">Total Value Locked</div>
            </div>

            <div className="card p-6 stat-item hover:border-green-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/10">
                  <DollarSign className="text-green-400" size={24} />
                </div>
                <Zap className="text-yellow-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{stakingData.yourStake}</div>
              <div className="text-sm text-gray-400 font-medium">Your Staked Balance</div>
            </div>

            <div className="card p-6 stat-item hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10">
                  <Award className="text-purple-400" size={24} />
                </div>
                <CheckCircle className="text-green-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{stakingData.pendingRewards}</div>
              <div className="text-sm text-gray-400 font-medium">Pending Rewards</div>
            </div>

            <div className="card p-6 stat-item hover:border-yellow-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/10">
                  <TrendingUp className="text-yellow-400" size={24} />
                </div>
                <span className="text-xs text-green-400 font-semibold">APY</span>
              </div>
              <div className="text-3xl font-bold text-white">{stakingData.apy[selectedPeriod]}%</div>
              <div className="text-sm text-gray-400 font-medium">Current APY</div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Staking Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stake Tokens */}
              <div className="card p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded">
                    <Lock className="text-blue-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Stake Tokens</h3>
                    <p className="text-sm text-gray-400">Lock your tokens to start earning rewards</p>
                  </div>
                </div>

                {/* Staking Period Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-300">Select Staking Period</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[30, 90, 180, 365].map((days) => (
                      <button
                        key={days}
                        onClick={() => setSelectedPeriod(days as any)}
                        className={`p-4 rounded border transition-all ${
                          selectedPeriod === days
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-800 hover:border-gray-700'
                        }`}
                      >
                        <div className="text-sm font-semibold text-white">{days} Days</div>
                        <div className={`text-xs mt-1 ${selectedPeriod === days ? 'text-blue-400' : 'text-gray-500'}`}>
                          {stakingData.apy[days as keyof typeof stakingData.apy]}% APY
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300">Amount to Stake</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      placeholder="0.00"
                      className="contract-input w-full px-4 py-3 text-white text-lg border-gray-700 bg-black"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-blue-400 hover:text-blue-300 font-medium">
                      MAX
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Available: 10,000 BP</span>
                    <span>≈ ${(parseFloat(stakeAmount || "0") * 2.5).toFixed(2)} USD</span>
                  </div>
                </div>

                {/* Stake Button */}
                <button
                  onClick={handleStake}
                  disabled={!stakeAmount || !isConnected}
                  className="btn-primary w-full px-6 py-4 font-semibold text-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isConnected ? 'Stake Tokens' : 'Connect Wallet to Stake'}
                </button>

                {/* Info Box */}
                <div className="border border-blue-500/30 rounded p-4 bg-blue-500/5">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-gray-400">
                      <p className="font-semibold text-blue-400 mb-1">Staking Information</p>
                      <p>Your tokens will be locked for the selected period. Rewards are calculated daily and can be claimed at any time. Early withdrawal may incur penalties.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Withdraw & Claim */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Withdraw */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded">
                      <Unlock className="text-red-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Withdraw</h3>
                      <p className="text-xs text-gray-400">Unstake your tokens</p>
                    </div>
                  </div>

                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Amount to withdraw"
                    className="contract-input w-full px-4 py-3 text-white text-sm border-gray-700 bg-black"
                  />

                  <button
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || !isConnected || !stakingData.isStaking}
                    className="w-full px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Withdraw
                  </button>

                  {stakingData.isStaking && (
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Clock size={12} />
                      <span>{getDaysRemaining()} days until unlock</span>
                    </div>
                  )}
                </div>

                {/* Claim Rewards */}
                <div className="card p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded">
                      <Award className="text-green-400" size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Claim Rewards</h3>
                      <p className="text-xs text-gray-400">Collect your earnings</p>
                    </div>
                  </div>

                  <div className="text-center py-4">
                    <div className="text-3xl font-bold text-green-400">{stakingData.pendingRewards}</div>
                    <div className="text-sm text-gray-500 mt-1">BP Rewards</div>
                  </div>

                  <button
                    onClick={handleClaimRewards}
                    disabled={!isConnected || parseFloat(stakingData.pendingRewards) === 0}
                    className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Claim Rewards
                  </button>

                  <div className="text-xs text-gray-500 text-center">
                    Total earned: {stakingData.totalRewardsEarned} BP
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & History */}
            <div className="space-y-6">
              {/* APY Calculator */}
              <div className="card p-6 space-y-4">
                <h3 className="text-base font-bold text-white">Earnings Calculator</h3>

                <div className="space-y-3">
                  {[30, 90, 180, 365].map((days) => (
                    <div key={days} className="flex items-center justify-between p-3 border border-gray-800 rounded">
                      <div className="flex items-center gap-2">
                        <Clock className="text-gray-400" size={14} />
                        <span className="text-sm text-gray-300">{days} Days</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-white">{stakingData.apy[days as keyof typeof stakingData.apy]}% APY</div>
                        <div className="text-xs text-gray-500">
                          ≈ {((parseFloat(stakingData.yourStake.replace(/,/g, '')) * stakingData.apy[days as keyof typeof stakingData.apy] / 100) * (days / 365)).toFixed(0)} BP
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staking History */}
              <div className="card p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <History className="text-gray-400" size={20} />
                  <h3 className="text-base font-bold text-white">Recent Activity</h3>
                </div>

                <div className="space-y-2">
                  {stakingHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-gray-800 rounded hover:border-blue-500/30 transition-colors">
                      <div>
                        <div className="text-sm font-semibold text-white capitalize">{item.type}</div>
                        <div className="text-xs text-gray-500">{formatDate(item.timestamp)}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${item.type === 'reward' ? 'text-green-400' : 'text-blue-400'}`}>
                          {item.type === 'reward' ? '+' : ''}{item.amount}
                        </div>
                        <div className="text-xs text-gray-500">{item.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="nav-border px-4 md:px-8 py-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm font-medium">
            © 2025 BuildProof. Secure staking platform.
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
