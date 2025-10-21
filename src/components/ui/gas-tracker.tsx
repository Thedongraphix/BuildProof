"use client"

import { useState, useEffect } from 'react'
import { Zap, TrendingUp, TrendingDown, DollarSign, Clock, BarChart3 } from 'lucide-react'

interface GasData {
  network: string
  chainId: number
  slow: number
  standard: number
  fast: number
  instant: number
  trend: 'up' | 'down' | 'stable'
  estimatedCost: {
    verification: number
    deployment: number
  }
}

interface HistoricalData {
  timestamp: number
  price: number
}

export function GasTracker() {
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum')
  const [gasData, setGasData] = useState<Record<string, GasData>>({
    ethereum: {
      network: 'Ethereum',
      chainId: 1,
      slow: 20,
      standard: 25,
      fast: 30,
      instant: 35,
      trend: 'down',
      estimatedCost: {
        verification: 0.005,
        deployment: 0.015
      }
    },
    baseSepolia: {
      network: 'Base Sepolia',
      chainId: 84532,
      slow: 0.3,
      standard: 0.5,
      fast: 0.8,
      instant: 1.2,
      trend: 'stable',
      estimatedCost: {
        verification: 0.0001,
        deployment: 0.0003
      }
    },
    celoSepolia: {
      network: 'Celo Sepolia',
      chainId: 11142220,
      slow: 0.05,
      standard: 0.1,
      fast: 0.15,
      instant: 0.2,
      trend: 'up',
      estimatedCost: {
        verification: 0.00005,
        deployment: 0.00015
      }
    }
  })

  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [showChart, setShowChart] = useState(false)

  useEffect(() => {
    // Generate mock historical data (last 24 hours)
    const data: HistoricalData[] = []
    const now = Date.now()
    for (let i = 24; i >= 0; i--) {
      data.push({
        timestamp: now - i * 3600000,
        price: gasData[selectedNetwork].standard + (Math.random() - 0.5) * 10
      })
    }
    setHistoricalData(data)
  }, [selectedNetwork, gasData])

  useEffect(() => {
    // Simulate real-time gas price updates every 15 seconds
    const interval = setInterval(() => {
      setGasData(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(key => {
          const change = (Math.random() - 0.5) * 2
          updated[key] = {
            ...updated[key],
            slow: Math.max(0.01, updated[key].slow + change),
            standard: Math.max(0.01, updated[key].standard + change),
            fast: Math.max(0.01, updated[key].fast + change),
            instant: Math.max(0.01, updated[key].instant + change),
            trend: change > 0.5 ? 'up' : change < -0.5 ? 'down' : 'stable'
          }
        })
        return updated
      })
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const current = gasData[selectedNetwork]

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp className="text-red-400" size={16} />
    if (trend === 'down') return <TrendingDown className="text-green-400" size={16} />
    return <span className="text-gray-400">—</span>
  }

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-red-400'
    if (trend === 'down') return 'text-green-400'
    return 'text-gray-400'
  }

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'slow': return 'border-blue-500/30 bg-blue-500/5'
      case 'standard': return 'border-green-500/30 bg-green-500/5'
      case 'fast': return 'border-yellow-500/30 bg-yellow-500/5'
      case 'instant': return 'border-red-500/30 bg-red-500/5'
      default: return 'border-gray-500/30 bg-gray-500/5'
    }
  }

  return (
    <div className="card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded">
            <Zap className="text-yellow-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Gas Price Tracker</h3>
            <p className="text-sm text-gray-400">Real-time gas prices & cost estimates</p>
          </div>
        </div>
        <button
          onClick={() => setShowChart(!showChart)}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
        >
          <BarChart3 size={16} />
          {showChart ? 'Hide' : 'Show'} Chart
        </button>
      </div>

      {/* Network Selector */}
      <div className="flex gap-2">
        {Object.keys(gasData).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedNetwork(key)}
            className={`px-4 py-2 rounded border text-sm font-medium transition-all ${
              selectedNetwork === key
                ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                : 'border-gray-800 text-gray-400 hover:border-gray-700'
            }`}
          >
            {gasData[key].network}
          </button>
        ))}
      </div>

      {/* Gas Prices Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['slow', 'standard', 'fast', 'instant'].map((speed) => (
          <div key={speed} className={`card p-4 border ${getSpeedColor(speed)}`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase">{speed}</span>
                <Clock className="text-gray-500" size={12} />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">
                  {current[speed as keyof typeof current]?.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">Gwei</span>
              </div>
              <div className="text-xs text-gray-500">
                {speed === 'slow' && '~5 min'}
                {speed === 'standard' && '~2 min'}
                {speed === 'fast' && '~30 sec'}
                {speed === 'instant' && '~15 sec'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trend Indicator */}
      <div className="flex items-center justify-between p-3 border border-gray-800 rounded">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">24h Trend:</span>
          <div className="flex items-center gap-1">
            {getTrendIcon(current.trend)}
            <span className={`text-sm font-semibold ${getTrendColor(current.trend)}`}>
              {current.trend === 'up' && 'Rising'}
              {current.trend === 'down' && 'Falling'}
              {current.trend === 'stable' && 'Stable'}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Updated just now
        </div>
      </div>

      {/* Historical Chart (Simple) */}
      {showChart && (
        <div className="space-y-3 fade-in">
          <div className="border border-gray-800 rounded p-4 bg-gray-900/20">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-white">24 Hour History</h4>
              <span className="text-xs text-gray-500">Gas Price (Gwei)</span>
            </div>
            <div className="h-24 flex items-end justify-between gap-1">
              {historicalData.map((point, index) => {
                const maxPrice = Math.max(...historicalData.map(p => p.price))
                const height = (point.price / maxPrice) * 100
                return (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500/30 hover:bg-blue-500/50 transition-all cursor-pointer rounded-t"
                    style={{ height: `${height}%` }}
                    title={`${point.price.toFixed(1)} Gwei`}
                  />
                )
              })}
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>24h ago</span>
              <span>Now</span>
            </div>
          </div>
        </div>
      )}

      {/* Cost Estimator */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <DollarSign size={16} className="text-green-400" />
          Estimated Costs
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-gray-800 rounded p-3 bg-gray-900/20">
            <p className="text-xs text-gray-400 mb-1">Contract Verification</p>
            <p className="text-lg font-bold text-white">
              ${current.estimatedCost.verification.toFixed(4)} <span className="text-xs font-normal text-gray-500">ETH</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">~${(current.estimatedCost.verification * 2500).toFixed(2)} USD</p>
          </div>
          <div className="border border-gray-800 rounded p-3 bg-gray-900/20">
            <p className="text-xs text-gray-400 mb-1">Contract Deployment</p>
            <p className="text-lg font-bold text-white">
              ${current.estimatedCost.deployment.toFixed(4)} <span className="text-xs font-normal text-gray-500">ETH</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">~${(current.estimatedCost.deployment * 2500).toFixed(2)} USD</p>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="text-xs text-gray-500 text-center p-2 border-t border-gray-800">
        Gas prices update every 15 seconds • Estimates based on standard operations
      </div>
    </div>
  )
}
