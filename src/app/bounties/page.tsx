"use client"

import { useState } from "react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { BountyCard } from "@/components/bounty/BountyCard"
import { CreateBountyForm } from "@/components/bounty/CreateBountyForm"
import { Github, Plus, Filter, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBountyContract, useTotalBounties } from "@/hooks/useBountyContract"

export default function BountiesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<number | null>(null)

  const { address, isConnected } = useAccount()
  const { createBounty, claimBounty, submitWork, approveBounty, isPending, isConfirming, isSuccess } = useBountyContract()
  const { totalBounties } = useTotalBounties()

  // Sample bounties - in production, fetch from contract
  const sampleBounties = [
    {
      bountyId: 0,
      title: "Build DeFi Dashboard",
      description: "Create a comprehensive dashboard for tracking DeFi positions across multiple protocols with real-time data updates and portfolio analytics.",
      reward: BigInt("100000000000000000"), // 0.1 ETH
      deadline: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      status: 0,
      creator: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    },
    {
      bountyId: 1,
      title: "Smart Contract Audit Tool",
      description: "Develop an automated tool for detecting common vulnerabilities in Solidity smart contracts.",
      reward: BigInt("250000000000000000"), // 0.25 ETH
      deadline: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60,
      status: 1,
      creator: "0x1234567890123456789012345678901234567890",
      claimer: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    },
    {
      bountyId: 2,
      title: "NFT Marketplace Integration",
      description: "Integrate OpenSea and Blur APIs for NFT price tracking and metadata fetching.",
      reward: BigInt("150000000000000000"), // 0.15 ETH
      deadline: Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60,
      status: 2,
      creator: "0x9876543210987654321098765432109876543210",
      claimer: "0xfedcbafedcbafedcbafedcbafedcbafedcbafed",
    },
  ]

  const handleCreateBounty = async (data: { title: string; description: string; reward: string; deadline: number }) => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    try {
      await createBounty(data.title, data.description, data.deadline, data.reward)
      setShowCreateForm(false)
    } catch (error) {
      console.error("Error creating bounty:", error)
    }
  }

  const handleClaimBounty = async (bountyId: number) => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    try {
      await claimBounty(bountyId)
    } catch (error) {
      console.error("Error claiming bounty:", error)
    }
  }

  const handleSubmitWork = async (bountyId: number) => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    const ipfsHash = prompt("Enter IPFS hash of your submission:")
    if (ipfsHash) {
      try {
        await submitWork(bountyId, ipfsHash)
      } catch (error) {
        console.error("Error submitting work:", error)
      }
    }
  }

  const handleApproveBounty = async (bountyId: number) => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    try {
      await approveBounty(bountyId)
    } catch (error) {
      console.error("Error approving bounty:", error)
    }
  }

  const filteredBounties = statusFilter !== null
    ? sampleBounties.filter(b => b.status === statusFilter)
    : sampleBounties

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
            <span className="text-gray-500 text-xs font-medium">Bounty Platform</span>
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
            className="text-blue-400 font-medium text-sm"
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
            href="/dashboard"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
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
          <div className="text-center space-y-6 fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">Builder</span>
              <span className="text-blue-500 ml-4">Bounties</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Post bounties and reward talented builders for completing your tasks
            </p>
          </div>

          {/* Wallet Connection Alert */}
          {!isConnected && (
            <div className="card p-4 border-blue-500">
              <div className="flex items-center gap-3 text-blue-400">
                <Wallet size={20} />
                <p className="text-sm font-medium">
                  Connect your wallet to create, claim, and manage bounties
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="card p-4 border-blue-500">
              <p className="text-blue-400 text-sm font-medium">
                Transaction successful
              </p>
            </div>
          )}

          {/* Total Bounties Counter */}
          {totalBounties > 0 && (
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Total Bounties: <span className="text-blue-400 font-semibold">{totalBounties}</span>
              </p>
            </div>
          )}

          {/* Actions Bar */}
          <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter size={18} className="text-gray-400" />
              <select
                value={statusFilter === null ? "all" : statusFilter}
                onChange={(e) => setStatusFilter(e.target.value === "all" ? null : parseInt(e.target.value))}
                className="contract-input px-4 py-2.5 text-sm border-gray-700 bg-black cursor-pointer"
              >
                <option value="all">All Bounties</option>
                <option value="0">Open</option>
                <option value="1">Claimed</option>
                <option value="2">Under Review</option>
                <option value="3">Completed</option>
              </select>
            </div>

            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="gap-2"
            >
              <Plus size={18} />
              {showCreateForm ? "Close Form" : "Create Bounty"}
            </Button>
          </div>

          {/* Create Bounty Form */}
          {showCreateForm && (
            <div className="fade-in">
              <CreateBountyForm
                onSubmit={handleCreateBounty}
                isLoading={isPending || isConfirming}
              />
            </div>
          )}

          {/* Bounties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBounties.map((bounty) => (
              <BountyCard
                key={bounty.bountyId}
                {...bounty}
                onClaim={() => handleClaimBounty(bounty.bountyId)}
                onSubmit={() => handleSubmitWork(bounty.bountyId)}
                onApprove={() => handleApproveBounty(bounty.bountyId)}
              />
            ))}
          </div>

          {filteredBounties.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No bounties found with the selected filter.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="nav-border px-4 md:px-8 py-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm font-medium">
            © 2025 BuildProof. Decentralized bounty platform.
          </div>
          <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Base Sepolia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
