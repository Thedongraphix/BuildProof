"use client"

import { useState } from "react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { Github, Users, Plus, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTeamsContract, useCreatedTeams, useMemberTeams, useTeamInfo } from "@/hooks/useTeamsContract"

interface TeamMember {
  address: string
  share: number
}

export default function TeamsPage() {
  const [teamName, setTeamName] = useState("")
  const [members, setMembers] = useState<TeamMember[]>([{ address: "", share: 0 }])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<number | undefined>(undefined)

  const { address, isConnected } = useAccount()
  const { createTeam, isPending, isConfirming, isSuccess } = useTeamsContract()
  const { createdTeams } = useCreatedTeams(address)
  const { memberTeams } = useMemberTeams(address)
  const { teamInfo, isLoading: teamInfoLoading } = useTeamInfo(selectedTeamId)

  const handleAddMember = () => {
    setMembers([...members, { address: "", share: 0 }])
  }

  const handleRemoveMember = (index: number) => {
    const newMembers = members.filter((_, i) => i !== index)
    setMembers(newMembers)
  }

  const handleMemberChange = (index: number, field: 'address' | 'share', value: string) => {
    const newMembers = [...members]
    if (field === 'address') {
      newMembers[index].address = value
    } else {
      newMembers[index].share = parseInt(value) || 0
    }
    setMembers(newMembers)
  }

  const handleCreateTeam = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    if (!teamName.trim()) {
      alert("Please enter a team name")
      return
    }

    // Validate members
    const validMembers = members.filter(m => m.address && m.share > 0)
    if (validMembers.length === 0) {
      alert("Please add at least one member with a share")
      return
    }

    const totalShares = validMembers.reduce((sum, m) => sum + m.share, 0)
    if (totalShares !== 10000) {
      alert(`Total shares must equal 10000 (100%). Current total: ${totalShares}`)
      return
    }

    try {
      const addresses = validMembers.map(m => m.address as `0x${string}`)
      const shares = validMembers.map(m => m.share)

      await createTeam(teamName, addresses, shares)

      // Reset form
      setTeamName("")
      setMembers([{ address: "", share: 0 }])
      setShowCreateForm(false)
    } catch (error) {
      console.error("Error creating team:", error)
    }
  }

  // Type guard for team info
  const teamData = teamInfo as readonly [bigint, string, string, readonly string[], bigint, boolean, bigint, bigint, bigint] | undefined

  const displayTeamInfo = teamData && Array.isArray(teamData) ? {
    teamId: Number(teamData[0]),
    name: teamData[1] as string,
    creator: teamData[2] as string,
    members: teamData[3] as readonly string[],
    totalShares: Number(teamData[4]),
    isActive: teamData[5] as boolean,
    createdAt: Number(teamData[6]),
    completedBounties: Number(teamData[7]),
    totalEarnings: teamData[8] as bigint,
  } : null

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
            <span className="text-gray-500 text-xs font-medium">Builder Teams</span>
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
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Reputation
          </Link>
          <Link
            href="/teams"
            className="text-blue-400 font-medium text-sm"
          >
            Teams
          </Link>
          <Link
            href="/referrals"
            className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Referrals
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
        <div className="w-full max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-6 fade-in">
            <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/20 mb-2">
              <span className="text-blue-400 text-sm font-medium">Collaborative Development</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-white">Builder</span>
              <span className="text-blue-500 ml-4">Teams</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Form collaborative teams, split rewards automatically, and track collective achievements on-chain
            </p>
          </div>

          {/* Wallet Connection Alert */}
          {!isConnected && (
            <div className="card p-5 border-blue-500/30 bg-blue-500/5">
              <div className="flex items-center gap-3 text-blue-400">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Wallet size={20} />
                </div>
                <p className="text-sm font-medium">
                  Connect your wallet to create and manage teams
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="card p-5 border-green-500/30 bg-green-500/5">
              <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                <span className="text-lg">✓</span> Team created successfully!
              </p>
            </div>
          )}

          {/* Create Team Button */}
          {isConnected && !showCreateForm && (
            <div className="flex justify-center">
              <Button
                onClick={() => setShowCreateForm(true)}
                size="lg"
                className="gap-2"
              >
                <Plus size={18} />
                Create New Team
              </Button>
            </div>
          )}

          {/* Create Team Form */}
          {showCreateForm && (
            <div className="max-w-3xl mx-auto card p-8 fade-in">
              <h3 className="text-2xl font-bold text-white mb-6">Create New Team</h3>

              <div className="space-y-6">
                {/* Team Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="e.g., DevSquad"
                    className="contract-input w-full px-4 py-3 text-white text-base border-gray-700 bg-black"
                  />
                </div>

                {/* Members */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Team Members & Shares (Total must equal 10000 = 100%)
                  </label>
                  <div className="space-y-3">
                    {members.map((member, index) => (
                      <div key={index} className="flex gap-3">
                        <input
                          type="text"
                          value={member.address}
                          onChange={(e) => handleMemberChange(index, 'address', e.target.value)}
                          placeholder="0x..."
                          className="contract-input flex-1 px-4 py-3 text-white text-sm border-gray-800 rounded-lg"
                        />
                        <input
                          type="number"
                          value={member.share || ''}
                          onChange={(e) => handleMemberChange(index, 'share', e.target.value)}
                          placeholder="Share (e.g., 5000 = 50%)"
                          className="contract-input w-48 px-4 py-3 text-white text-sm border-gray-800 rounded-lg"
                        />
                        {members.length > 1 && (
                          <Button
                            onClick={() => handleRemoveMember(index)}
                            variant="outline"
                            size="sm"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <Button
                      onClick={handleAddMember}
                      variant="outline"
                      size="sm"
                    >
                      <Plus size={16} className="mr-1" />
                      Add Member
                    </Button>
                    <span className="text-sm text-gray-400">
                      Total: {members.reduce((sum, m) => sum + (m.share || 0), 0)} / 10000
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCreateTeam}
                    disabled={isPending || isConfirming}
                    className="flex-1"
                  >
                    {isPending || isConfirming ? "Creating..." : "Create Team"}
                  </Button>
                  <Button
                    onClick={() => setShowCreateForm(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Your Teams */}
          {isConnected && (createdTeams?.length || memberTeams?.length) && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Your Teams</h2>

              {/* Created Teams */}
              {createdTeams && createdTeams.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Created by You</h3>
                  <div className="grid gap-4">
                    {createdTeams.map((teamId) => (
                      <button
                        key={teamId.toString()}
                        onClick={() => setSelectedTeamId(Number(teamId))}
                        className="card p-4 hover:border-blue-500/50 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Users size={20} className="text-blue-400" />
                            <span className="text-white font-medium">Team #{teamId.toString()}</span>
                          </div>
                          <span className="text-gray-400 text-sm">Click to view details</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Teams */}
              {memberTeams && memberTeams.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">Member Of</h3>
                  <div className="grid gap-4">
                    {memberTeams.map((teamId) => (
                      <button
                        key={teamId.toString()}
                        onClick={() => setSelectedTeamId(Number(teamId))}
                        className="card p-4 hover:border-blue-500/50 transition-colors text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Users size={20} className="text-gray-400" />
                            <span className="text-white font-medium">Team #{teamId.toString()}</span>
                          </div>
                          <span className="text-gray-400 text-sm">Click to view details</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Team Details */}
          {selectedTeamId !== undefined && (
            <div className="card p-6 fade-in">
              {teamInfoLoading ? (
                <p className="text-gray-400 text-center">Loading team details...</p>
              ) : displayTeamInfo ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">{displayTeamInfo.name}</h3>
                    <span className={`px-3 py-1 rounded text-sm ${displayTeamInfo.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {displayTeamInfo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Team ID</p>
                      <p className="text-white font-semibold">#{displayTeamInfo.teamId}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Members</p>
                      <p className="text-white font-semibold">{displayTeamInfo.members.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Bounties</p>
                      <p className="text-white font-semibold">{displayTeamInfo.completedBounties}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Earnings</p>
                      <p className="text-white font-semibold">{(Number(displayTeamInfo.totalEarnings) / 1e18).toFixed(4)} ETH</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-2">Creator</p>
                    <p className="text-white font-mono text-sm">{displayTeamInfo.creator}</p>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-3">Team Members</p>
                    <div className="space-y-2">
                      {displayTeamInfo.members.map((member, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                          <span className="text-white font-mono text-sm">{member}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => setSelectedTeamId(undefined)}
                    variant="outline"
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              ) : (
                <p className="text-gray-400 text-center">Team not found</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="nav-border px-4 md:px-8 py-8 mt-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-gray-500 text-sm font-medium">
            © 2025 BuildProof. Collaborative team management.
          </div>
          <div className="flex items-center gap-4 md:gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
              <span>Base Sepolia</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
