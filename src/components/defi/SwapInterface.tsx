"use client"

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ArrowDownUp, ArrowLeftRight, Zap } from 'lucide-react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, parseEther } from 'viem'

const BPROOF_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_BPROOF_TOKEN_ADDRESS as `0x${string}` || '0x0d9c6536BcF92932558E6bFF19151bb41d336e55'
const LIQUIDITY_POOL_ADDRESS = process.env.NEXT_PUBLIC_LIQUIDITY_POOL_ADDRESS as `0x${string}` || '0x7AEa0d4279C5601a7a745937Babb41391e04A5a7'

const POOL_ABI = [
  {
    "inputs": [{"internalType": "uint256","name": "bproofAmount","type": "uint256"}],
    "name": "getQuoteBproofToEth",
    "outputs": [{"internalType": "uint256","name": "ethOut","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "ethAmount","type": "uint256"}],
    "name": "getQuoteEthToBproof",
    "outputs": [{"internalType": "uint256","name": "bproofOut","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "bproofAmount","type": "uint256"},
      {"internalType": "uint256","name": "minEthOut","type": "uint256"}
    ],
    "name": "swapBproofForEth",
    "outputs": [{"internalType": "uint256","name": "ethOut","type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "minBproofOut","type": "uint256"}],
    "name": "swapEthForBproof",
    "outputs": [{"internalType": "uint256","name": "bproofOut","type": "uint256"}],
    "stateMutability": "payable",
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

export function SwapInterface() {
  const { address, isConnected } = useAccount()
  const [fromToken, setFromToken] = useState<'ETH' | 'BPROOF'>('ETH')
  const [inputAmount, setInputAmount] = useState('')
  const [outputAmount, setOutputAmount] = useState('')
  const [slippage, setSlippage] = useState('0.5')

  // Get quote based on direction
  const { data: quote } = useReadContract({
    address: LIQUIDITY_POOL_ADDRESS,
    abi: POOL_ABI,
    functionName: fromToken === 'ETH' ? 'getQuoteEthToBproof' : 'getQuoteBproofToEth',
    args: inputAmount ? [parseEther(inputAmount)] : undefined,
    query: { enabled: !!inputAmount && parseFloat(inputAmount) > 0 }
  })

  // Update output when quote changes
  useEffect(() => {
    if (quote) {
      setOutputAmount(formatEther(quote))
    } else {
      setOutputAmount('')
    }
  }, [quote])

  // Approve tokens
  const { writeContract: approve, data: approveHash, isPending: isApproving } = useWriteContract()
  const { isLoading: isApproveConfirming } = useWaitForTransactionReceipt({ hash: approveHash })

  // Swap
  const { writeContract: swap, data: swapHash, isPending: isSwapping } = useWriteContract()
  const { isLoading: isSwapConfirming } = useWaitForTransactionReceipt({ hash: swapHash })

  const handleFlip = () => {
    setFromToken(fromToken === 'ETH' ? 'BPROOF' : 'ETH')
    setInputAmount(outputAmount)
    setOutputAmount(inputAmount)
  }

  const handleApprove = async () => {
    if (!inputAmount || fromToken !== 'BPROOF') return

    try {
      await approve({
        address: BPROOF_TOKEN_ADDRESS,
        abi: TOKEN_ABI,
        functionName: 'approve',
        args: [LIQUIDITY_POOL_ADDRESS, parseEther(inputAmount)]
      })
    } catch (error) {
      console.error('Approval failed:', error)
    }
  }

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputAmount || !outputAmount) return

    try {
      const minOutput = parseEther(outputAmount) * BigInt(10000 - parseFloat(slippage) * 100) / 10000n

      if (fromToken === 'ETH') {
        await swap({
          address: LIQUIDITY_POOL_ADDRESS,
          abi: POOL_ABI,
          functionName: 'swapEthForBproof',
          args: [minOutput],
          value: parseEther(inputAmount)
        })
      } else {
        await swap({
          address: LIQUIDITY_POOL_ADDRESS,
          abi: POOL_ABI,
          functionName: 'swapBproofForEth',
          args: [parseEther(inputAmount), minOutput]
        })
      }

      setInputAmount('')
      setOutputAmount('')
    } catch (error) {
      console.error('Swap failed:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="card p-12 text-center">
        <ArrowLeftRight className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Connect Wallet</h3>
        <p className="text-gray-400">Connect your wallet to swap tokens</p>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Swap Card */}
      <div className="card p-6 fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <ArrowLeftRight className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Swap Tokens</h3>
              <p className="text-gray-400 text-sm">Trade BPROOF and ETH</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-400">0.3% fee</span>
          </div>
        </div>

        <form onSubmit={handleSwap} className="space-y-4">
          {/* From */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-300">From</label>
            <div className="card p-4">
              <div className="flex justify-between items-center mb-2">
                <input
                  type="number"
                  step="0.0001"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="0.0"
                  className="bg-transparent text-2xl font-bold text-white outline-none w-full"
                />
                <div className="px-4 py-2 bg-gray-900 border border-gray-800 font-semibold text-white">
                  {fromToken}
                </div>
              </div>
            </div>
          </div>

          {/* Flip Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleFlip}
              className="w-10 h-10 bg-blue-500 hover:bg-blue-600 border-4 border-black flex items-center justify-center transition-all hover:scale-110"
            >
              <ArrowDownUp className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* To */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-300">To</label>
            <div className="card p-4">
              <div className="flex justify-between items-center mb-2">
                <input
                  type="text"
                  value={outputAmount}
                  readOnly
                  placeholder="0.0"
                  className="bg-transparent text-2xl font-bold text-white outline-none w-full"
                />
                <div className="px-4 py-2 bg-gray-900 border border-gray-800 font-semibold text-white">
                  {fromToken === 'ETH' ? 'BPROOF' : 'ETH'}
                </div>
              </div>
            </div>
          </div>

          {/* Slippage Settings */}
          <div className="card p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-300">Slippage Tolerance</span>
              <span className="text-sm text-blue-400">{slippage}%</span>
            </div>
            <div className="flex gap-2">
              {['0.1', '0.5', '1.0'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSlippage(value)}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-all ${
                    slippage === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {value}%
                </button>
              ))}
              <input
                type="number"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-900 text-white text-sm text-center border border-gray-800 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Swap Details */}
          {quote && (
            <div className="card p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Rate</span>
                <span className="text-white">
                  1 {fromToken} = {(parseFloat(outputAmount) / parseFloat(inputAmount || '1')).toFixed(4)} {fromToken === 'ETH' ? 'BPROOF' : 'ETH'}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Price Impact</span>
                <span className="text-white">&lt; 0.01%</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Minimum Received</span>
                <span className="text-white">
                  {(parseFloat(outputAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {fromToken === 'ETH' ? 'BPROOF' : 'ETH'}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {fromToken === 'BPROOF' && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={!inputAmount || isApproving || isApproveConfirming}
                className="flex-1 btn-primary px-6 py-4 font-semibold disabled:cursor-not-allowed text-lg"
              >
                {isApproving || isApproveConfirming ? 'Approving...' : 'Approve'}
              </button>
            )}
            <button
              type="submit"
              disabled={!inputAmount || !outputAmount || isSwapping || isSwapConfirming}
              className="flex-1 btn-primary px-6 py-4 font-semibold disabled:cursor-not-allowed text-lg"
            >
              {isSwapping || isSwapConfirming ? 'Swapping...' : 'Swap'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4 fade-in stagger-1">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Trading Fee</h4>
          <p className="text-2xl font-bold text-white">0.3%</p>
          <p className="text-xs text-gray-500 mt-1">Goes to liquidity providers</p>
        </div>
        <div className="card p-4 fade-in stagger-2">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Network</h4>
          <p className="text-2xl font-bold text-white">Base</p>
          <p className="text-xs text-gray-500 mt-1">Sepolia Testnet</p>
        </div>
      </div>

      {/* Contract Info */}
      <div className="card p-4 fade-in">
        <h4 className="text-sm font-semibold text-white mb-3">Contract Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Pool Contract</span>
            <a
              href={`https://sepolia.basescan.org/address/${LIQUIDITY_POOL_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-mono"
            >
              {LIQUIDITY_POOL_ADDRESS.slice(0, 6)}...{LIQUIDITY_POOL_ADDRESS.slice(-4)}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">BPROOF Token</span>
            <a
              href={`https://sepolia.basescan.org/address/${BPROOF_TOKEN_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 font-mono"
            >
              {BPROOF_TOKEN_ADDRESS.slice(0, 6)}...{BPROOF_TOKEN_ADDRESS.slice(-4)}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
