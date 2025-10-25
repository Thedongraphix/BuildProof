"use client"

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Droplet, Plus, Minus, TrendingUp, Percent } from 'lucide-react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, parseEther } from 'viem'

const BPROOF_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BPROOF_TOKEN_ADDRESS as `0x${string}` || '0x0d9c6536BcF92932558E6bFF19151bb41d336e55'
const LIQUIDITY_POOL_ADDRESS = process.env.NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS as `0x${string}` || '0x7AEa0d4279C5601a7a745937Babb41391e04A5a7'

const POOL_ABI = [
  {
    "inputs": [],
    "name": "reserveBproof",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "reserveEth",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "provider","type": "address"}],
    "name": "getLiquidityInfo",
    "outputs": [
      {"internalType": "uint256","name": "liquidityShares","type": "uint256"},
      {"internalType": "uint256","name": "bproofValue","type": "uint256"},
      {"internalType": "uint256","name": "ethValue","type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "bproofAmount","type": "uint256"},
      {"internalType": "uint256","name": "minLiquidity","type": "uint256"}
    ],
    "name": "addLiquidity",
    "outputs": [{"internalType": "uint256","name": "liquidityMinted","type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "liquidityAmount","type": "uint256"},
      {"internalType": "uint256","name": "minBproof","type": "uint256"},
      {"internalType": "uint256","name": "minEth","type": "uint256"}
    ],
    "name": "removeLiquidity",
    "outputs": [
      {"internalType": "uint256","name": "bproofAmount","type": "uint256"},
      {"internalType": "uint256","name": "ethAmount","type": "uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

const TOKEN_ABI = [
  {
    "inputs": [
      {"internalType": "address","name": "spender","type": "address"},
      {"internalType": "uint256","name": "amount","type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool","name": "","type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

export function LiquidityPool() {
  const { address, isConnected } = useAccount()
  const [mode, setMode] = useState<'add' | 'remove'>('add')
  const [bproofAmount, setBproofAmount] = useState('')
  const [ethAmount, setEthAmount] = useState('')
  const [liquidityAmount, setLiquidityAmount] = useState('')

  // Read pool reserves
  const { data: reserveBproof } = useReadContract({
    address: LIQUIDITY_POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: 'reserveBproof'
  })

  const { data: reserveEth } = useReadContract({
    address: LIQUIDITY_POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: 'reserveEth'
  })

  // Read user liquidity info
  const { data: liquidityInfo } = useReadContract({
    address: LIQUIDITY_POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: 'getLiquidityInfo',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  })

  // Approve tokens
  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract()
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveHash })

  // Add liquidity
  const { writeContract: addLiquidity, data: addHash, isPending: isAdding } = useWriteContract()
  const { isLoading: isAddConfirming } = useWaitForTransactionReceipt({ hash: addHash })

  // Remove liquidity
  const { writeContract: removeLiquidity, data: removeHash, isPending: isRemoving } = useWriteContract()
  const { isLoading: isRemoveConfirming } = useWaitForTransactionReceipt({ hash: removeHash })

  const handleApprove = async () => {
    if (!bproofAmount) return

    try {
      await approve({
        address: BPROOF_TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'approve',
        args: [LIQUIDITY_POOL_ADDRESS, parseEther(bproofAmount)]
      })
    } catch (error) {
      console.error('Approval failed:', error)
    }
  }

  const handleAddLiquidity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bproofAmount || !ethAmount) return

    try {
      await addLiquidity({
        address: LIQUIDITY_POOL_ADDRESS,
        abi: POOL_ABI,
        functionName: 'addLiquidity',
        args: [parseEther(bproofAmount), 0n],
        value: parseEther(ethAmount)
      })
      setBproofAmount('')
      setEthAmount('')
    } catch (error) {
      console.error('Add liquidity failed:', error)
    }
  }

  const handleRemoveLiquidity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!liquidityAmount) return

    try {
      await removeLiquidity({
        address: LIQUIDITY_POOL_ADDRESS,
        abi: POOL_ABI,
        functionName: 'removeLiquidity',
        args: [parseEther(liquidityAmount), 0n, 0n]
      })
      setLiquidityAmount('')
    } catch (error) {
      console.error('Remove liquidity failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="card p-12 text-center">
        <Droplet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Connect Wallet</h3>
        <p className="text-gray-400">Connect your wallet to provide liquidity and earn trading fees</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pool Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 fade-in stagger-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Total Value Locked</p>
              <p className="text-3xl font-bold text-white">
                {reserveEth ? parseFloat(formatEther(reserveEth)).toFixed(4) : '0.00'}
              </p>
              <p className="text-blue-400 text-sm mt-1">ETH</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="card p-6 fade-in stagger-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">BPROOF Reserve</p>
              <p className="text-3xl font-bold text-white">
                {reserveBproof ? parseFloat(formatEther(reserveBproof)).toFixed(2) : '0.00'}
              </p>
              <p className="text-blue-400 text-sm mt-1">BPROOF</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Droplet className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="card p-6 fade-in stagger-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-2">Trading Fee</p>
              <p className="text-3xl font-bold text-white">0.3</p>
              <p className="text-blue-400 text-sm mt-1">Percent</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Percent className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Your Liquidity */}
      {liquidityInfo && liquidityInfo[0] > 0 && (
        <div className="card p-6 fade-in">
          <h3 className="text-lg font-bold text-white mb-4">Your Liquidity Position</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-900/50 border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">LP Tokens</p>
              <p className="text-xl font-bold text-white">{parseFloat(formatEther(liquidityInfo[0])).toFixed(4)}</p>
            </div>
            <div className="p-4 bg-gray-900/50 border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">BPROOF Value</p>
              <p className="text-xl font-bold text-white">{parseFloat(formatEther(liquidityInfo[1])).toFixed(2)}</p>
            </div>
            <div className="p-4 bg-gray-900/50 border border-gray-800">
              <p className="text-gray-400 text-sm mb-1">ETH Value</p>
              <p className="text-xl font-bold text-white">{parseFloat(formatEther(liquidityInfo[2])).toFixed(4)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="card p-2 flex gap-2 max-w-md mx-auto">
        <button
          onClick={() => setMode('add')}
          className={`flex-1 px-6 py-3 font-semibold transition-all ${
            mode === 'add'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-900/20'
          }`}
        >
          <Plus className="inline mr-2" size={18} />
          Add Liquidity
        </button>
        <button
          onClick={() => setMode('remove')}
          className={`flex-1 px-6 py-3 font-semibold transition-all ${
            mode === 'remove'
              ? 'bg-blue-500 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-900/20'
          }`}
        >
          <Minus className="inline mr-2" size={18} />
          Remove Liquidity
        </button>
      </div>

      {/* Add Liquidity Form */}
      {mode === 'add' && (
        <div className="card p-6 fade-in">
          <h3 className="text-xl font-bold text-white mb-6">Add Liquidity to Pool</h3>

          <form onSubmit={handleAddLiquidity} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                BPROOF Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={bproofAmount}
                onChange={(e) => setBproofAmount(e.target.value)}
                placeholder="0.00"
                className="contract-input w-full px-4 py-3 text-white text-base border-gray-700 bg-black"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                ETH Amount
              </label>
              <input
                type="number"
                step="0.0001"
                value={ethAmount}
                onChange={(e) => setEthAmount(e.target.value)}
                placeholder="0.0000"
                className="contract-input w-full px-4 py-3 text-white text-base border-gray-700 bg-black"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleApprove}
                disabled={!bproofAmount || isApproving || isApproveConfirming}
                className="flex-1 btn-primary px-6 py-3 font-semibold disabled:cursor-not-allowed"
              >
                {isApproving || isApproveConfirming ? 'Approving...' : '1. Approve BPROOF'}
              </button>
              <button
                type="submit"
                disabled={!bproofAmount || !ethAmount || isAdding || isAddConfirming}
                className="flex-1 btn-primary px-6 py-3 font-semibold disabled:cursor-not-allowed"
              >
                {isAdding || isAddConfirming ? 'Adding...' : '2. Add Liquidity'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Remove Liquidity Form */}
      {mode === 'remove' && (
        <div className="card p-6 fade-in">
          <h3 className="text-xl font-bold text-white mb-6">Remove Liquidity from Pool</h3>

          <form onSubmit={handleRemoveLiquidity} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                LP Token Amount
              </label>
              <input
                type="number"
                step="0.0001"
                value={liquidityAmount}
                onChange={(e) => setLiquidityAmount(e.target.value)}
                placeholder="0.0000"
                className="contract-input w-full px-4 py-3 text-white text-base border-gray-700 bg-black"
              />
              {liquidityInfo && (
                <p className="text-gray-400 text-sm mt-2">
                  Available: {parseFloat(formatEther(liquidityInfo[0])).toFixed(4)} LP
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!liquidityAmount || isRemoving || isRemoveConfirming}
              className="btn-primary w-full px-6 py-3 font-semibold disabled:cursor-not-allowed"
            >
              {isRemoving || isRemoveConfirming ? 'Removing...' : 'Remove Liquidity'}
            </button>
          </form>
        </div>
      )}

      {/* Pool Info */}
      <div className="card p-6 fade-in">
        <h3 className="text-lg font-bold text-white mb-4">Pool Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Trading Fee</span>
            <span className="text-white font-semibold">0.3%</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-800">
            <span className="text-gray-400">Pool Contract</span>
            <a
              href={`https://sepolia.basescan.org/address/${LIQUIDITY_POOL_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-mono text-sm"
            >
              {LIQUIDITY_POOL_ADDRESS.slice(0, 6)}...{LIQUIDITY_POOL_ADDRESS.slice(-4)}
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
