"use client"

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Coins, Send, User, TrendingUp, Info } from 'lucide-react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, parseEther } from 'viem'

const BPROOF_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BPROOF_TOKEN_ADDRESS as `0x${string}` || '0x0d9c6536BcF92932558E6bFF19151bb41d336e55'

const TOKEN_ABI = [
  {
    "inputs": [{"internalType": "address","name": "account","type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
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
    "inputs": [
      {"internalType": "address","name": "to","type": "address"},
      {"internalType": "uint256","name": "amount","type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool","name": "","type": "bool"}],
    "stateMutability": "nonpayable",
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

export function TokenDashboard() {
  const { address, isConnected } = useAccount()
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [delegatee, setDelegatee] = useState('')

  // Read token balance
  const { data: balance } = useReadContract({
    address: BPROOF_TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Read total supply
  const { data: totalSupply } = useReadContract({
    address: BPROOF_TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'totalSupply'
  })

  // Read voting power
  const { data: votingPower } = useReadContract({
    address: BPROOF_TOKEN_ADDRESS,
    abi: TOKEN_ABI,
    functionName: 'getVotes',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Transfer tokens
  const { writeContract: transfer, data: transferHash, isPending: isTransferring } = useWriteContract()
  const { isLoading: isTransferConfirming } = useWaitForTransactionReceipt({ hash: transferHash })

  // Delegate voting power
  const { writeContract: delegate, data: delegateHash, isPending: isDelegating } = useWriteContract()
  const { isLoading: isDelegateConfirming } = useWaitForTransactionReceipt({ hash: delegateHash })

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !amount) return

    try {
      await transfer({
        address: BPROOF_TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'transfer',
        args: [recipient as `0x${string}`, parseEther(amount)]
      })
      setRecipient('')
      setAmount('')
    } catch (error) {
      console.error('Transfer failed:', error)
    }
  }

  const handleDelegate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!delegatee) return

    try {
      await delegate({
        address: BPROOF_TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'delegate',
        args: [delegatee as `0x${string}`]
      })
      setDelegatee('')
    } catch (error) {
      console.error('Delegation failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="card p-12 text-center">
        <Coins className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Connect Wallet</h3>
        <p className="text-gray-400">Connect your wallet to view your BPROOF token balance and interact with the protocol</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Token Stats */}
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
              <Coins className="w-6 h-6 text-blue-500" />
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
              <p className="text-blue-400 text-sm mt-1">BPROOF</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="card p-6 fade-in stagger-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Total Supply</p>
              <p className="text-3xl font-bold text-white">
                {totalSupply ? (parseFloat(formatEther(totalSupply)) / 1_000_000).toFixed(2) : '0.00'}
              </p>
              <p className="text-blue-400 text-sm mt-1">Million</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Info className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Tokens */}
      <div className="card p-6 fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Send className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Transfer Tokens</h3>
            <p className="text-gray-400 text-sm">Send BPROOF to another address</p>
          </div>
        </div>

        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="0x..."
              className="contract-input w-full px-4 py-3 text-white text-base border-gray-700 bg-black"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="contract-input w-full px-4 py-3 text-white text-base border-gray-700 bg-black pr-20"
              />
              <button
                type="button"
                onClick={() => balance && setAmount(formatEther(balance))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 text-sm font-semibold"
              >
                MAX
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!recipient || !amount || isTransferring || isTransferConfirming}
            className="btn-primary w-full px-6 py-3 font-semibold disabled:cursor-not-allowed"
          >
            {isTransferring || isTransferConfirming ? 'Transferring...' : 'Transfer Tokens'}
          </button>
        </form>
      </div>

      {/* Delegate Voting Power */}
      <div className="card p-6 fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <User className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Delegate Voting Power</h3>
            <p className="text-gray-400 text-sm">Delegate your voting power to another address</p>
          </div>
        </div>

        <form onSubmit={handleDelegate} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Delegatee Address
            </label>
            <input
              type="text"
              value={delegatee}
              onChange={(e) => setDelegatee(e.target.value)}
              placeholder="0x..."
              className="contract-input w-full px-4 py-3 text-white text-base border-gray-700 bg-black"
            />
            <p className="text-gray-500 text-xs mt-2">
              Tip: Enter your own address to activate your voting power
            </p>
          </div>

          <button
            type="submit"
            disabled={!delegatee || isDelegating || isDelegateConfirming}
            className="btn-primary w-full px-6 py-3 font-semibold disabled:cursor-not-allowed"
          >
            {isDelegating || isDelegateConfirming ? 'Delegating...' : 'Delegate Voting Power'}
          </button>
        </form>
      </div>

      {/* Contract Info */}
      <div className="card p-6 fade-in">
        <h3 className="text-lg font-bold text-white mb-4">Contract Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Token Name</span>
            <span className="text-white font-mono">BuildProof Token</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Symbol</span>
            <span className="text-white font-mono">BPROOF</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Contract Address</span>
            <a
              href={`https://sepolia.basescan.org/address/${BPROOF_TOKEN_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-mono text-sm"
            >
              {BPROOF_TOKEN_ADDRESS.slice(0, 6)}...{BPROOF_TOKEN_ADDRESS.slice(-4)}
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
