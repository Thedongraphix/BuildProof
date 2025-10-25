"use client"

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Vote, Users, TrendingUp, Clock } from 'lucide-react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'

const BPROOF_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BPROOF_TOKEN_ADDRESS as `0x${string}` || '0x0d9c6536BcF92932558E6bFF19151bb41d336e55'
const TIMELOCK_ADDRESS = process.env.NEXT_PUBLIC_TIMELOCK_ADDRESS as `0x${string}` || '0xdAc134B725be453A9Ef2de4383066ea7CDc50DaD'

const TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address","name": "account","type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "owner","type": "address"}],
    "name": "getVotes",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "account","type": "address"}],
    "name": "delegates",
    "outputs": [{"internalType": "address","name": "","type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "delegatee","type": "address"}],
    "name": "delegate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export function GovernancePanel() {
  const { address, isConnected } = useAccount()
  const [delegateAddress, setDelegateAddress] = useState('')

  // Read token balance
  const { data: balance } = useReadContract({
    address: BPROOF_TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Read voting power
  const { data: votingPower } = useReadContract({
    address: BPROOF_TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'getVotes',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Read current delegate
  const { data: currentDelegate } = useReadContract({
    address: BPROOF_TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'delegates',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Delegate voting power
  const { writeContract: delegate, data: delegateHash, isPending: isDelegating } = useWriteContract()
  const { isLoading: isDelegateConfirming } = useWaitForTransactionReceipt({ hash: delegateHash })

  const handleDelegate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!delegateAddress) return

    try {
      await delegate({
        address: BPROOF_TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'delegate',
        args: [delegateAddress as `0x${string}`]
      })
      setDelegateAddress('')
    } catch (error) {
      console.error('Delegation failed:', error)
    }
  }

  const handleSelfDelegate = async () => {
    if (!address) return

    try {
      await delegate({
        address: BPROOF_TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'delegate',
        args: [address]
      })
    } catch (error) {
      console.error('Self-delegation failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="card p-12 text-center">
        <Vote className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Connect Wallet</h3>
        <p className="text-gray-400">Connect your wallet to participate in governance</p>
      </div>
    )
  }

  const isDelegated = currentDelegate && currentDelegate !== '0x0000000000000000000000000000000000000000'
  const isSelfDelegated = currentDelegate && currentDelegate.toLowerCase() === address?.toLowerCase()

  return (
    <div className="space-y-6">
      {/* Governance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 fade-in stagger-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Your Balance</p>
              <p className="text-3xl font-bold text-white">
                {balance ? parseFloat(formatEther(balance)).toFixed(2) : '0.00'}
              </p>
              <p className="text-blue-400 text-sm mt-1">BPROOF</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="card p-6 fade-in stagger-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Voting Power</p>
              <p className="text-3xl font-bold text-white">
                {votingPower ? parseFloat(formatEther(votingPower)).toFixed(2) : '0.00'}
              </p>
              <p className="text-blue-400 text-sm mt-1">Votes</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Vote className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="card p-6 fade-in stagger-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Timelock Delay</p>
              <p className="text-3xl font-bold text-white">2</p>
              <p className="text-blue-400 text-sm mt-1">Days</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Delegation Status */}
      <div className="card p-6 fade-in">
        <h3 className="text-xl font-bold text-white mb-4">Delegation Status</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-900/50 border border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Currently Delegated To</p>
                  {isDelegated ? (
                    <p className="text-white font-mono text-sm mt-1">
                      {isSelfDelegated ? 'Self (Active)' : `${currentDelegate?.slice(0, 6)}...${currentDelegate?.slice(-4)}`}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm mt-1">Not delegated</p>
                  )}
                </div>
              </div>
              <div className={`px-3 py-1 text-xs font-semibold ${
                isSelfDelegated ? 'bg-blue-500/20 text-blue-400' :
                isDelegated ? 'bg-gray-700 text-gray-300' :
                'bg-red-500/20 text-red-400'
              }`}>
                {isSelfDelegated ? 'Active' : isDelegated ? 'Delegated' : 'Inactive'}
              </div>
            </div>
          </div>

          {!isSelfDelegated && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-yellow-400 text-sm">
                ⚠️ Your voting power is inactive. Delegate to yourself to activate it and participate in governance.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Self Delegate */}
        <div className="card p-6 fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Vote className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Activate Voting</h3>
              <p className="text-gray-400 text-sm">Delegate to yourself</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Activate your voting power by delegating to your own address. This allows you to vote on proposals.
          </p>
          <button
            onClick={handleSelfDelegate}
            disabled={isSelfDelegated || isDelegating || isDelegateConfirming}
            className="btn-primary w-full px-6 py-3 font-semibold disabled:cursor-not-allowed"
          >
            {isSelfDelegated ? 'Already Active' : isDelegating || isDelegateConfirming ? 'Activating...' : 'Activate Now'}
          </button>
        </div>

        {/* Delegate to Others */}
        <div className="card p-6 fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Delegate Voting</h3>
              <p className="text-gray-400 text-sm">Delegate to another address</p>
            </div>
          </div>
          <form onSubmit={handleDelegate} className="space-y-4">
            <div>
              <input
                type="text"
                value={delegateAddress}
                onChange={(e) => setDelegateAddress(e.target.value)}
                placeholder="0x..."
                className="contract-input w-full px-4 py-3 text-white text-base border-gray-700 bg-black"
              />
            </div>
            <button
              type="submit"
              disabled={!delegateAddress || isDelegating || isDelegateConfirming}
              className="btn-primary w-full px-6 py-3 font-semibold disabled:cursor-not-allowed"
            >
              {isDelegating || isDelegateConfirming ? 'Delegating...' : 'Delegate'}
            </button>
          </form>
        </div>
      </div>

      {/* How Governance Works */}
      <div className="card p-6 fade-in">
        <h3 className="text-lg font-bold text-white mb-4">How Governance Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-900/50 border border-gray-800">
            <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-3">
              <span className="text-blue-400 font-bold">1</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Delegate</h4>
            <p className="text-gray-400 text-sm">
              Delegate your voting power to yourself or another address to participate
            </p>
          </div>
          <div className="p-4 bg-gray-900/50 border border-gray-800">
            <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-3">
              <span className="text-blue-400 font-bold">2</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Propose</h4>
            <p className="text-gray-400 text-sm">
              Create proposals for protocol upgrades or parameter changes
            </p>
          </div>
          <div className="p-4 bg-gray-900/50 border border-gray-800">
            <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-3">
              <span className="text-blue-400 font-bold">3</span>
            </div>
            <h4 className="text-white font-semibold mb-2">Execute</h4>
            <p className="text-gray-400 text-sm">
              After 2-day timelock, passed proposals are executed on-chain
            </p>
          </div>
        </div>
      </div>

      {/* Contract Info */}
      <div className="card p-6 fade-in">
        <h3 className="text-lg font-bold text-white mb-4">Governance Contracts</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Governance Token</span>
            <a
              href={`https://sepolia.basescan.org/address/${BPROOF_TOKEN_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-mono text-sm"
            >
              {BPROOF_TOKEN_ADDRESS.slice(0, 6)}...{BPROOF_TOKEN_ADDRESS.slice(-4)}
            </a>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Timelock Controller</span>
            <a
              href={`https://sepolia.basescan.org/address/${TIMELOCK_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-mono text-sm"
            >
              {TIMELOCK_ADDRESS.slice(0, 6)}...{TIMELOCK_ADDRESS.slice(-4)}
            </a>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-400">Network</span>
            <span className="text-white">Base Sepolia</span>
          </div>
        </div>
      </div>
    </div>
  )
}
