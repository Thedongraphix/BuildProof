"use client"

import { useState } from 'react'
import { FileCode, Rocket, Shield, Users, Coins, Lock, Trophy, ArrowRight } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: 'token' | 'nft' | 'defi' | 'governance' | 'security'
  icon: React.ComponentType<{ className?: string; size?: number }>
  verified: boolean
  deployments: number
  features: string[]
  securityScore: number
}

export function ContractTemplates() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const templates: Template[] = [
    {
      id: 'erc20',
      name: 'ERC-20 Token',
      description: 'Standard fungible token with mint, burn, and transfer capabilities',
      category: 'token',
      icon: Coins,
      verified: true,
      deployments: 15420,
      features: ['Mintable', 'Burnable', 'Pausable', 'Access Control'],
      securityScore: 98
    },
    {
      id: 'erc721',
      name: 'ERC-721 NFT',
      description: 'Non-fungible token standard with enumerable and URI storage',
      category: 'nft',
      icon: Trophy,
      verified: true,
      deployments: 8950,
      features: ['Enumerable', 'URI Storage', 'Royalty', 'Batch Minting'],
      securityScore: 96
    },
    {
      id: 'multisig',
      name: 'Multi-Signature Wallet',
      description: 'Secure wallet requiring multiple confirmations for transactions',
      category: 'security',
      icon: Lock,
      verified: true,
      deployments: 3240,
      features: ['Multiple Owners', 'Threshold Voting', 'Transaction Queue'],
      securityScore: 99
    },
    {
      id: 'staking',
      name: 'Staking Contract',
      description: 'Lock tokens to earn rewards over time with flexible periods',
      category: 'defi',
      icon: Shield,
      verified: true,
      deployments: 6780,
      features: ['Flexible Periods', 'Reward Distribution', 'Emergency Withdraw'],
      securityScore: 94
    },
    {
      id: 'dao',
      name: 'DAO Governance',
      description: 'Decentralized voting system with proposal and execution',
      category: 'governance',
      icon: Users,
      verified: true,
      deployments: 2150,
      features: ['Proposal Creation', 'Voting Power', 'Timelock', 'Execution'],
      securityScore: 97
    },
    {
      id: 'airdrop',
      name: 'Token Airdrop',
      description: 'Efficient batch token distribution with merkle tree verification',
      category: 'token',
      icon: Rocket,
      verified: true,
      deployments: 4320,
      features: ['Merkle Proof', 'Batch Claims', 'Time Windows'],
      securityScore: 95
    }
  ]

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'token', name: 'Tokens', count: templates.filter(t => t.category === 'token').length },
    { id: 'nft', name: 'NFTs', count: templates.filter(t => t.category === 'nft').length },
    { id: 'defi', name: 'DeFi', count: templates.filter(t => t.category === 'defi').length },
    { id: 'governance', name: 'Governance', count: templates.filter(t => t.category === 'governance').length },
    { id: 'security', name: 'Security', count: templates.filter(t => t.category === 'security').length }
  ]

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory)

  const getSecurityColor = (score: number) => {
    if (score >= 95) return 'text-green-400'
    if (score >= 85) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const handleDeploy = (template: Template) => {
    alert(`Deploying ${template.name}... (This is a demo)`)
  }

  return (
    <div className="card p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded">
            <FileCode className="text-purple-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Contract Templates</h3>
            <p className="text-sm text-gray-400">Verified, production-ready smart contracts</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded border text-sm font-medium transition-all ${
              selectedCategory === category.id
                ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                : 'border-gray-800 text-gray-400 hover:border-gray-700'
            }`}
          >
            {category.name}
            <span className="ml-2 text-xs opacity-70">({category.count})</span>
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const Icon = template.icon
          return (
            <div
              key={template.id}
              className="card p-5 border border-gray-800 hover:border-purple-500/30 transition-all group"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded group-hover:bg-purple-500/20 transition-colors">
                      <Icon className="text-purple-400" size={20} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{template.name}</h4>
                      {template.verified && (
                        <div className="flex items-center gap-1 mt-1">
                          <Shield className="text-green-400" size={12} />
                          <span className="text-xs text-green-400">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`text-right ${getSecurityColor(template.securityScore)}`}>
                    <div className="text-lg font-bold">{template.securityScore}</div>
                    <div className="text-xs text-gray-500">Security</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 leading-relaxed">
                  {template.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1.5">
                  {template.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Stats & Action */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                  <div className="text-xs text-gray-500">
                    <span className="font-semibold text-white">{template.deployments.toLocaleString()}</span> deployments
                  </div>
                  <button
                    onClick={() => handleDeploy(template)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded transition-colors group"
                  >
                    Deploy
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="text-center pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          All templates are audited and follow OpenZeppelin standards • Gas optimized
        </p>
      </div>
    </div>
  )
}
