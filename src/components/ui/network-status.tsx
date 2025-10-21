"use client"

import { useState, useEffect } from 'react'
import { Activity, Zap, Clock, TrendingUp, TrendingDown } from 'lucide-react'

interface NetworkMetrics {
  name: string
  chainId: number
  status: 'healthy' | 'degraded' | 'down'
  gasPrice: string
  blockTime: number
  congestion: number
  lastUpdated: number
}

export function NetworkStatus() {
  const [networks, setNetworks] = useState<NetworkMetrics[]>([
    {
      name: 'Ethereum',
      chainId: 1,
      status: 'healthy',
      gasPrice: '25',
      blockTime: 12.5,
      congestion: 45,
      lastUpdated: Date.now()
    },
    {
      name: 'Base Sepolia',
      chainId: 84532,
      status: 'healthy',
      gasPrice: '0.5',
      blockTime: 2.0,
      congestion: 22,
      lastUpdated: Date.now()
    },
    {
      name: 'Celo Sepolia',
      chainId: 11142220,
      status: 'healthy',
      gasPrice: '0.1',
      blockTime: 5.0,
      congestion: 18,
      lastUpdated: Date.now()
    }
  ])

  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    // Simulate real-time updates every 10 seconds
    const interval = setInterval(() => {
      setNetworks(prev => prev.map(network => ({
        ...network,
        gasPrice: (parseFloat(network.gasPrice) + (Math.random() - 0.5) * 2).toFixed(1),
        congestion: Math.max(0, Math.min(100, network.congestion + (Math.random() - 0.5) * 10)),
        lastUpdated: Date.now()
      })))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400 border-green-500/30 bg-green-500/10'
      case 'degraded':
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10'
      case 'down':
        return 'text-red-400 border-red-500/30 bg-red-500/10'
      default:
        return 'text-gray-400 border-gray-500/30 bg-gray-500/10'
    }
  }

  const getCongestionColor = (congestion: number) => {
    if (congestion < 30) return 'bg-green-500'
    if (congestion < 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getGasTrend = (gasPrice: string) => {
    const price = parseFloat(gasPrice)
    // Simulate trend (in production, compare with historical data)
    const trend = Math.random() > 0.5 ? 'up' : 'down'
    return trend === 'up' ? (
      <TrendingUp className="text-red-400" size={14} />
    ) : (
      <TrendingDown className="text-green-400" size={14} />
    )
  }

  return (
    <div className="w-full">
      {/* Collapsed View */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="card p-4 cursor-pointer hover:border-blue-500/30 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded">
              <Activity className="text-blue-400" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Network Status</h3>
              <p className="text-xs text-gray-400">
                {networks.filter(n => n.status === 'healthy').length} of {networks.length} networks operational
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {networks.slice(0, 3).map((network, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  network.status === 'healthy' ? 'bg-green-500' :
                  network.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                } animate-pulse`}
              />
            ))}
            <span className="text-xs text-gray-400">
              {expanded ? '▼' : '▶'}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded View */}
      {expanded && (
        <div className="mt-2 space-y-2 fade-in">
          {networks.map((network, index) => (
            <div
              key={index}
              className={`card p-4 border ${getStatusColor(network.status)}`}
            >
              <div className="space-y-3">
                {/* Network Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      network.status === 'healthy' ? 'bg-green-500' :
                      network.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    } animate-pulse`} />
                    <div>
                      <h4 className="text-white font-semibold text-sm">{network.name}</h4>
                      <p className="text-xs text-gray-500">Chain ID: {network.chainId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-semibold uppercase ${
                      network.status === 'healthy' ? 'text-green-400' :
                      network.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {network.status}
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Gas Price */}
                  <div className="flex items-center gap-2">
                    <Zap className="text-yellow-400" size={14} />
                    <div>
                      <p className="text-xs text-gray-400">Gas Price</p>
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-white font-semibold">{network.gasPrice}</p>
                        <span className="text-xs text-gray-500">Gwei</span>
                        {getGasTrend(network.gasPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Block Time */}
                  <div className="flex items-center gap-2">
                    <Clock className="text-blue-400" size={14} />
                    <div>
                      <p className="text-xs text-gray-400">Block Time</p>
                      <p className="text-sm text-white font-semibold">{network.blockTime}s</p>
                    </div>
                  </div>

                  {/* Congestion */}
                  <div className="flex items-center gap-2">
                    <Activity className="text-purple-400" size={14} />
                    <div>
                      <p className="text-xs text-gray-400">Congestion</p>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getCongestionColor(network.congestion)} transition-all duration-500`}
                            style={{ width: `${network.congestion}%` }}
                          />
                        </div>
                        <span className="text-xs text-white font-semibold">{Math.round(network.congestion)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="text-xs text-gray-500 text-right">
                  Updated {Math.floor((Date.now() - network.lastUpdated) / 1000)}s ago
                </div>
              </div>
            </div>
          ))}

          {/* Info Footer */}
          <div className="text-xs text-gray-500 text-center py-2">
            Auto-refreshes every 10 seconds • Real-time network monitoring
          </div>
        </div>
      )}
    </div>
  )
}
