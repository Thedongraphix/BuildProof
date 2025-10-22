"use client"

import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle, Filter, ExternalLink, Copy, Shield } from 'lucide-react'

interface Verification {
  id: string
  address: string
  network: string
  chainId: number
  status: 'success' | 'failed' | 'pending'
  timestamp: number
  contractType: string
  securityScore?: number
  verifier: string
}

export function RecentVerifications() {
  const [verifications, setVerifications] = useState<Verification[]>([
    {
      id: '1',
      address: '0x742d35c6d46ad0c8f121d0c0e98f5e6e9d8b9c7a',
      network: 'Ethereum',
      chainId: 1,
      status: 'success',
      timestamp: Date.now() - 120000,
      contractType: 'ERC20',
      securityScore: 95,
      verifier: '0x1234...5678'
    },
    {
      id: '2',
      address: '0x5b73c5498c1e3b4dba84de0f1833c4a029d90519',
      network: 'Base Sepolia',
      chainId: 84532,
      status: 'success',
      timestamp: Date.now() - 300000,
      contractType: 'ERC721',
      securityScore: 88,
      verifier: '0xabcd...ef01'
    },
    {
      id: '3',
      address: '0x812daccf0691e7116ecf536e46426baf3ce90177',
      network: 'Celo Sepolia',
      chainId: 11142220,
      status: 'failed',
      timestamp: Date.now() - 600000,
      contractType: 'Custom',
      verifier: '0x9876...5432'
    },
    {
      id: '4',
      address: '0xbedc1f6351776b5073580372b553158de85ae53d',
      network: 'Ethereum',
      chainId: 1,
      status: 'pending',
      timestamp: Date.now() - 30000,
      contractType: 'MultiSig',
      verifier: '0x5555...6666'
    }
  ])

  const [filterNetwork, setFilterNetwork] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    // Simulate new verifications arriving
    const interval = setInterval(() => {
      const statuses: Array<'success' | 'failed' | 'pending'> = ['success', 'failed', 'pending']
      const newVerification: Verification = {
        id: Date.now().toString(),
        address: `0x${Math.random().toString(16).slice(2, 42)}`,
        network: ['Ethereum', 'Base Sepolia', 'Celo Sepolia'][Math.floor(Math.random() * 3)],
        chainId: [1, 84532, 11142220][Math.floor(Math.random() * 3)],
        status: statuses[Math.floor(Math.random() * 3)],
        timestamp: Date.now(),
        contractType: ['ERC20', 'ERC721', 'Custom', 'MultiSig'][Math.floor(Math.random() * 4)],
        securityScore: Math.random() > 0.3 ? Math.floor(Math.random() * 30) + 70 : undefined,
        verifier: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`
      }

      setVerifications(prev => [newVerification, ...prev].slice(0, 10))
    }, 20000) // New verification every 20 seconds

    return () => clearInterval(interval)
  }, [])

  const filteredVerifications = verifications.filter(v => {
    if (filterNetwork !== 'all' && v.network !== filterNetwork) return false
    if (filterStatus !== 'all' && v.status !== filterStatus) return false
    return true
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-400" size={18} />
      case 'failed':
        return <XCircle className="text-red-400" size={18} />
      case 'pending':
        return <Clock className="text-yellow-400 animate-pulse" size={18} />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5'
      case 'failed':
        return 'border-red-500/30 bg-red-500/5'
      case 'pending':
        return 'border-yellow-500/30 bg-yellow-500/5'
      default:
        return 'border-gray-500/30 bg-gray-500/5'
    }
  }

  const getSecurityColor = (score?: number) => {
    if (!score) return 'text-gray-400'
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-red-400'
  }

  const formatTimestamp = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  return (
    <div className="card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Recent Verifications</h3>
          <p className="text-sm text-gray-400">Live feed of contract verifications</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-400">Live</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
        <Filter className="text-gray-400" size={16} />
        <select
          value={filterNetwork}
          onChange={(e) => setFilterNetwork(e.target.value)}
          className="contract-input px-3 py-1.5 text-sm border-gray-700 rounded bg-black cursor-pointer"
        >
          <option value="all">All Networks</option>
          <option value="Ethereum">Ethereum</option>
          <option value="Base Sepolia">Base Sepolia</option>
          <option value="Celo Sepolia">Celo Sepolia</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="contract-input px-3 py-1.5 text-sm border-gray-700 rounded bg-black cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Verification List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredVerifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No verifications match your filters
          </div>
        ) : (
          filteredVerifications.map((verification) => (
            <div
              key={verification.id}
              className={`border rounded p-3 hover:border-blue-500/30 transition-all ${getStatusColor(verification.status)}`}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left Section */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(verification.status)}
                    <span className="text-sm font-mono text-white truncate">
                      {verification.address.slice(0, 10)}...{verification.address.slice(-8)}
                    </span>
                    <button
                      onClick={() => copyAddress(verification.address)}
                      className="text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400">
                      {verification.network}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-800 rounded text-gray-400">
                      {verification.contractType}
                    </span>
                    {verification.securityScore && (
                      <div className="flex items-center gap-1">
                        <Shield size={12} className={getSecurityColor(verification.securityScore)} />
                        <span className={`font-semibold ${getSecurityColor(verification.securityScore)}`}>
                          {verification.securityScore}/100
                        </span>
                      </div>
                    )}
                    <span className="text-gray-500">
                      by {verification.verifier}
                    </span>
                  </div>
                </div>

                {/* Right Section */}
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs text-gray-500">{formatTimestamp(verification.timestamp)}</span>
                  <a
                    href={`https://etherscan.io/address/${verification.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800 text-xs text-gray-500">
        <span>{filteredVerifications.length} verifications displayed</span>
        <span>Auto-refreshes every 20s</span>
      </div>
    </div>
  )
}
