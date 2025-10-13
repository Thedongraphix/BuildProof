"use client"

import { useState } from "react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { BuilderProfile } from "@/components/reputation/BuilderProfile"
import { Github, Search, Wallet, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useReputationContract, useBuilderProfile, useBuilderSkills, useBuilderAchievements } from "@/hooks/useReputationContract"

export default function ReputationPage() {
  const [searchAddress, setSearchAddress] = useState("")
  const [lookupAddress, setLookupAddress] = useState<`0x${string}` | undefined>(undefined)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [username, setUsername] = useState("")

  const { address, isConnected } = useAccount()
  const { registerBuilder, isPending, isConfirming, isSuccess } = useReputationContract()

  // Fetch profile data for lookup address
  const { profile, isLoading: profileLoading, refetch } = useBuilderProfile(lookupAddress)
  const { skills, isLoading: skillsLoading } = useBuilderSkills(lookupAddress)
  const { achievements, isLoading: achievementsLoading } = useBuilderAchievements(lookupAddress)

  // Sample profile data - in production, fetch from contract
  const sampleProfile = {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
    username: "alice_builder",
    reputationScore: 850,
    completedProjects: 12,
    totalEarnings: BigInt("2500000000000000000"), // 2.5 ETH
    joinedAt: Math.floor(Date.now() / 1000) - 180 * 24 * 60 * 60, // 6 months ago
    isActive: true,
    skills: ["Solidity", "React", "TypeScript", "Web3.js", "Smart Contract Security"],
    achievements: [
      {
        title: "First Smart Contract",
        description: "Deployed and verified your first smart contract on mainnet",
        earnedAt: Math.floor(Date.now() / 1000) - 150 * 24 * 60 * 60,
      },
      {
        title: "Top Contributor",
        description: "Completed 10+ bounties with 5-star ratings",
        earnedAt: Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60,
      },
      {
        title: "Security Expert",
        description: "Found and reported critical vulnerabilities in multiple projects",
        earnedAt: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
      },
    ],
  }

  const handleSearch = () => {
    if (searchAddress && isValidAddress(searchAddress)) {
      setLookupAddress(searchAddress as `0x${string}`)
    }
  }

  const handleRegisterBuilder = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    if (!username.trim()) {
      alert("Please enter a username")
      return
    }
    try {
      await registerBuilder(username)
      setShowRegisterForm(false)
      setUsername("")
      // Refresh profile data
      if (address) {
        setLookupAddress(address)
      }
    } catch (error) {
      console.error("Error registering builder:", error)
    }
  }

  const displayAddress = lookupAddress || address

  // Type guard to check if profile is valid array-like structure
  const profileData = profile as readonly [string, string, bigint, bigint, bigint, bigint, boolean] | undefined

  const displayProfile = profileData && Array.isArray(profileData) && profileData[0] !== '0x0000000000000000000000000000000000000000' ? {
    address: profileData[0] as string,
    username: profileData[1] as string,
    reputationScore: Number(profileData[2]),
    completedProjects: Number(profileData[3]),
    totalEarnings: profileData[4] as bigint,
    joinedAt: Number(profileData[5]),
    isActive: profileData[6] as boolean,
    skills: skills || [],
    achievements: achievements as Array<{title: string; description: string; earnedAt: number}> || [],
  } : null

  const isValidAddress = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  return (
    <div className="min-h-screen bg-black clean-bg fade-in">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-8 py-6 nav-border slide-in-left">
        <div className="flex items-center space-x-4">
          <Link href="/" className="w-10 h-10 bg-black border border-gray-800 flex items-center justify-center hover-lift">
            <span className="text-white font-bold text-base tracking-wider">BP</span>
          </Link>
          <div className="flex flex-col">
            <span className="text-white font-semibold text-lg md:text-xl tracking-tight">BuildProof</span>
            <span className="text-gray-500 text-xs font-medium">Builder Reputation</span>
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
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Bounties
          </Link>
          <Link
            href="/reputation"
            className="text-blue-400 font-medium text-sm"
          >
            Reputation
          </Link>
          <Link
            href="/teams"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Teams
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
        <div className="w-full max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Builder
              <span className="accent-blue ml-4">Reputation</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Track on-chain reputation, skills, and achievements for builders
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <label className="block text-sm font-medium text-gray-400 mb-3">
                  Search Builder Address
                </label>
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="0x742d35c6d46ad0c8f121d0c0e98f5e6e9d8b9c7a"
                  className="contract-input w-full px-6 py-4 text-white text-base border-gray-800 rounded-lg"
                />
                {!isValidAddress(searchAddress) && searchAddress && (
                  <div className="absolute top-full mt-2 text-red-400 text-sm">
                    Invalid address format
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-end">
                <Button
                  onClick={handleSearch}
                  disabled={!searchAddress || !isValidAddress(searchAddress)}
                  className="px-8 py-4"
                >
                  <Search className="inline mr-2" size={18} />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Wallet Connection Alert */}
          {!isConnected && (
            <div className="card p-4 border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center gap-3 text-blue-400">
                <Wallet size={20} />
                <p className="text-sm">
                  Connect your wallet to view and register your builder profile
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="card p-4 border-green-500/30 bg-green-500/5">
              <p className="text-green-400 text-sm">
                ✓ Registration successful! Your builder profile has been created.
              </p>
            </div>
          )}

          {/* Profile Display */}
          {(profileLoading || skillsLoading || achievementsLoading) && (
            <div className="text-center py-8">
              <p className="text-gray-400">Loading profile...</p>
            </div>
          )}

          {displayProfile && !profileLoading && (
            <div className="fade-in">
              <BuilderProfile {...displayProfile} />
            </div>
          )}

          {!displayProfile && !profileLoading && displayAddress && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No profile found for this address</p>
            </div>
          )}

          {/* Registration Form */}
          {!displayProfile && isConnected && !showRegisterForm && (
            <div className="max-w-3xl mx-auto text-center space-y-4 py-8">
              <div className="card p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Not Registered Yet?
                </h3>
                <p className="text-gray-400 mb-6">
                  Register as a builder to start earning reputation, showcasing your skills, and receiving achievements for your contributions.
                </p>
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => setShowRegisterForm(true)}
                >
                  <UserPlus size={18} />
                  Register as Builder
                </Button>
              </div>
            </div>
          )}

          {/* Register Form */}
          {showRegisterForm && (
            <div className="max-w-md mx-auto card p-6 fade-in">
              <h3 className="text-xl font-bold text-white mb-4">Register Builder Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g., alice_builder"
                    maxLength={32}
                    className="contract-input w-full px-4 py-3 text-white text-base border-gray-800 rounded-lg"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleRegisterBuilder}
                    disabled={isPending || isConfirming || !username.trim()}
                    className="flex-1"
                  >
                    {isPending || isConfirming ? "Registering..." : "Register"}
                  </Button>
                  <Button
                    onClick={() => setShowRegisterForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Sample Profile for Demo */}
          {!isConnected && !displayProfile && (
            <div className="fade-in">
              <div className="mb-6 text-center">
                <p className="text-gray-500 text-sm">
                  Sample Profile - Connect wallet to view your profile
                </p>
              </div>
              <BuilderProfile {...sampleProfile} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="nav-border px-4 md:px-8 py-8 mt-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm font-medium">
            © 2025 BuildProof. On-chain reputation system.
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
