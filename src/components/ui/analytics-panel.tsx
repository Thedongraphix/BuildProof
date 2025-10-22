"use client"

import { useState } from 'react'
import { BarChart3, TrendingUp, Award, Clock, CheckCircle, Target } from 'lucide-react'

export function AnalyticsPanel() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')

  const stats = {
    totalVerifications: 45280,
    successRate: 94.2,
    avgTime: 12.5,
    topContracts: [
      { name: 'USDC', type: 'ERC20', verifications: 8420 },
      { name: 'UniswapV3', type: 'DeFi', verifications: 6150 },
      { name: 'BoredApe', type: 'ERC721', verifications: 5890 }
    ],
    dailyStats: [
      { day: 'Mon', count: 420 },
      { day: 'Tue', count: 580 },
      { day: 'Wed', count: 650 },
      { day: 'Thu', count: 720 },
      { day: 'Fri', count: 890 },
      { day: 'Sat', count: 560 },
      { day: 'Sun', count: 410 }
    ]
  }

  const maxDaily = Math.max(...stats.dailyStats.map(s => s.count))

  return (
    <div className="card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded">
            <BarChart3 className="text-green-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Verification Analytics</h3>
            <p className="text-sm text-gray-400">Platform-wide statistics</p>
          </div>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '24h' | '7d' | '30d' | 'all')}
          className="contract-input px-3 py-2 text-sm border-gray-700 rounded bg-black cursor-pointer"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Target className="text-blue-400" size={16} />
            <TrendingUp className="text-green-400" size={14} />
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalVerifications.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Total Verifications</div>
        </div>

        <div className="card p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-400" size={16} />
            <span className="text-xs text-green-400">+2.4%</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.successRate}%</div>
          <div className="text-xs text-gray-500 mt-1">Success Rate</div>
        </div>

        <div className="card p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-yellow-400" size={16} />
            <span className="text-xs text-yellow-400">-1.2s</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.avgTime}s</div>
          <div className="text-xs text-gray-500 mt-1">Avg Time</div>
        </div>

        <div className="card p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Award className="text-purple-400" size={16} />
            <span className="text-xs text-purple-400">Top 5%</span>
          </div>
          <div className="text-2xl font-bold text-white">A+</div>
          <div className="text-xs text-gray-500 mt-1">Platform Rating</div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white">Daily Verifications</h4>
        <div className="border border-gray-800 rounded p-4 bg-gray-900/20">
          <div className="h-32 flex items-end justify-between gap-2">
            {stats.dailyStats.map((stat, index) => {
              const height = (stat.count / maxDaily) * 100
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="relative w-full group cursor-pointer">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all hover:from-blue-400 hover:to-blue-300"
                      style={{ height: `${height}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                      {stat.count} verifications
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{stat.day}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top Contracts */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white">Most Verified Contracts</h4>
        <div className="space-y-2">
          {stats.topContracts.map((contract, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-800 rounded hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-400">#{index + 1}</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{contract.name}</div>
                  <div className="text-xs text-gray-500">{contract.type}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white">{contract.verifications.toLocaleString()}</div>
                <div className="text-xs text-gray-500">verifications</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
