"use client"

import { useState } from "react"
import Link from "next/link"
import { useAccount } from "wagmi"
import {
  Github,
  TrendingUp,
  Award,
  Users,
  DollarSign,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Target,
  Briefcase
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("week")

  // Sample data - in production, fetch from contracts
  const stats = {
    totalBounties: 12,
    activeBounties: 8,
    completedBounties: 4,
    totalEarnings: "2.5",
    reputationScore: 850,
    teamCount: 3,
    pendingRewards: "0.75",
    successRate: 95
  }

  const recentActivity = [
    {
      id: 1,
      type: "bounty_completed",
      title: "DeFi Dashboard completed",
      reward: "0.5 ETH",
      time: "2 hours ago",
      status: "success"
    },
    {
      id: 2,
      type: "bounty_claimed",
      title: "Smart Contract Audit Tool claimed",
      time: "5 hours ago",
      status: "pending"
    },
    {
      id: 3,
      type: "team_joined",
      title: "Joined DevSquad team",
      time: "1 day ago",
      status: "info"
    },
    {
      id: 4,
      type: "achievement",
      title: "Earned 'Security Expert' badge",
      time: "2 days ago",
      status: "success"
    }
  ]

  const quickActions = [
    {
      title: "Create Bounty",
      description: "Post a new task",
      icon: Target,
      color: "blue",
      link: "/bounties"
    },
    {
      title: "Form Team",
      description: "Start collaborating",
      icon: Users,
      color: "purple",
      link: "/teams"
    },
    {
      title: "Verify Contract",
      description: "Security analysis",
      icon: CheckCircle,
      color: "green",
      link: "/"
    },
    {
      title: "View Profile",
      description: "Track reputation",
      icon: Award,
      color: "yellow",
      link: "/reputation"
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "bounty_completed":
        return <CheckCircle className="text-green-400" size={20} />
      case "bounty_claimed":
        return <Clock className="text-blue-400" size={20} />
      case "team_joined":
        return <Users className="text-purple-400" size={20} />
      case "achievement":
        return <Award className="text-yellow-400" size={20} />
      default:
        return <Activity className="text-gray-400" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-green-500/30 bg-green-500/5"
      case "pending":
        return "border-blue-500/30 bg-blue-500/5"
      case "info":
        return "border-purple-500/30 bg-purple-500/5"
      default:
        return "border-gray-500/30 bg-gray-500/5"
    }
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
            <span className="text-gray-500 text-xs font-medium">Builder Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6 slide-in-right">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
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
            href="/referrals"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Referrals
          </Link>
          <Link
            href="/dashboard"
            className="text-blue-400 font-medium text-sm"
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

      {/* Main Content */}
      <main className="px-4 md:px-8 py-12 md:py-16">
        <div className="w-full max-w-7xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="space-y-6 fade-in">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 mb-3">
                  <span className="text-blue-400 text-sm font-medium">Builder Overview</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-white">Your</span>
                  <span className="text-blue-500 ml-4">Dashboard</span>
                </h1>
                <p className="text-gray-400 text-lg mt-3">
                  {isConnected ? `Welcome back, ${address?.slice(0, 6)}...${address?.slice(-4)}` : "Connect your wallet to view your stats"}
                </p>
              </div>
              <div className="hidden md:block">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Activity className="text-green-400" size={16} />
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-6 stat-item hover:border-blue-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10">
                  <Briefcase className="text-blue-400" size={24} />
                </div>
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.activeBounties}</div>
              <div className="text-sm text-gray-400 font-medium">Active Bounties</div>
              <div className="text-xs text-gray-500 mt-2">
                {stats.totalBounties} total • {stats.completedBounties} completed
              </div>
            </div>

            <div className="card p-6 stat-item hover:border-green-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/10">
                  <DollarSign className="text-green-400" size={24} />
                </div>
                <Zap className="text-yellow-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.totalEarnings} ETH</div>
              <div className="text-sm text-gray-400 font-medium">Total Earnings</div>
              <div className="text-xs text-gray-500 mt-2">
                {stats.pendingRewards} ETH pending
              </div>
            </div>

            <div className="card p-6 stat-item hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10">
                  <Award className="text-purple-400" size={24} />
                </div>
                <TrendingUp className="text-green-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.reputationScore}</div>
              <div className="text-sm text-gray-400 font-medium">Reputation Score</div>
              <div className="text-xs text-gray-500 mt-2">
                Top 15% globally
              </div>
            </div>

            <div className="card p-6 stat-item hover:border-yellow-500/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/10">
                  <Users className="text-yellow-400" size={24} />
                </div>
                <CheckCircle className="text-green-400" size={20} />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.teamCount}</div>
              <div className="text-sm text-gray-400 font-medium">Active Teams</div>
              <div className="text-xs text-gray-500 mt-2">
                {stats.successRate}% success rate
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.link}>
                  <div className="feature-card card p-6 hover:border-blue-500/30 transition-all cursor-pointer group">
                    <div className={`p-3 bg-${action.color}-500/10 w-fit mb-4 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`text-${action.color}-400`} size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-400">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as "week" | "month" | "all")}
                  className="contract-input px-3 py-2 text-sm border-gray-700 rounded-lg bg-black cursor-pointer"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className={`card p-4 ${getStatusColor(activity.status)} hover:border-blue-500/30 transition-all`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-gray-900/50 rounded-lg">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-white font-semibold mb-1">{activity.title}</h4>
                            <p className="text-sm text-gray-400">{activity.time}</p>
                          </div>
                          {activity.reward && (
                            <div className="text-green-400 font-semibold text-sm">
                              +{activity.reward}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Insights */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">Performance</h2>

              <div className="card p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 font-medium">Completion Rate</span>
                    <span className="text-sm text-green-400 font-semibold">{stats.successRate}%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2">
                    <div
                      className="bg-blue-500 h-2"
                      style={{ width: `${stats.successRate}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 font-medium">Response Time</span>
                    <span className="text-sm text-blue-400 font-semibold">Excellent</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2">
                    <div className="bg-blue-500 h-2" style={{ width: "88%" }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 font-medium">Quality Score</span>
                    <span className="text-sm text-blue-400 font-semibold">4.8/5.0</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2">
                    <div className="bg-blue-500 h-2" style={{ width: "96%" }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <AlertCircle size={16} className="text-blue-400" />
                    <span>Keep maintaining high standards to boost your reputation!</span>
                  </div>
                </div>
              </div>

              <Link href="/reputation">
                <Button className="w-full">
                  View Full Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="nav-border px-4 md:px-8 py-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm font-medium">
            © 2025 BuildProof. Comprehensive builder dashboard.
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
