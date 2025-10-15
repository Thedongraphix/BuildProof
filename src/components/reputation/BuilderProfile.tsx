"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Star, Briefcase, TrendingUp, User } from "lucide-react"
import { formatEther } from "viem"

interface BuilderProfileProps {
  address: string
  username: string
  reputationScore: number
  completedProjects: number
  totalEarnings: bigint
  joinedAt: number
  isActive: boolean
  skills?: string[]
  achievements?: Array<{
    title: string
    description: string
    earnedAt: number
  }>
}

export function BuilderProfile({
  address,
  username,
  reputationScore,
  completedProjects,
  totalEarnings,
  joinedAt,
  isActive,
  skills = [],
  achievements = []
}: BuilderProfileProps) {
  const joinedDate = new Date(joinedAt * 1000)
  const earningsInEth = formatEther(totalEarnings)

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="relative">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20"></div>
          <div className="relative flex items-start justify-between pt-8">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-black">
                <User size={40} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl text-white mb-2 font-bold">{username}</CardTitle>
                <p className="text-sm text-gray-400 font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    isActive ? "text-green-400 bg-green-400/10 border border-green-400/30" : "text-gray-400 bg-gray-400/10 border border-gray-400/30"
                  }`}>
                    {isActive ? "● Active" : "○ Inactive"}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full">
                    Joined {joinedDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-item text-center p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl hover:bg-blue-500/10 transition-all">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star size={24} className="text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">{reputationScore}</div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Reputation</p>
            </div>

            <div className="stat-item text-center p-4 bg-green-500/5 border border-green-500/20 rounded-xl hover:bg-green-500/10 transition-all">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Briefcase size={24} className="text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">{completedProjects}</div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Projects</p>
            </div>

            <div className="stat-item text-center p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl hover:bg-yellow-500/10 transition-all">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp size={24} className="text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">{earningsInEth}</div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">ETH Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      {skills.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl text-white font-bold">Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-500/20 hover:border-blue-500/50 transition-all cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl text-white font-bold flex items-center gap-2">
              <Award className="text-yellow-400" size={24} />
              Achievements & Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="feature-card flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-500/5 to-transparent border border-yellow-500/20 rounded-xl hover:border-yellow-500/40 transition-all"
                >
                  <div className="p-3 bg-yellow-500/10 rounded-xl">
                    <Award className="text-yellow-400" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-lg mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed mb-2">{achievement.description}</p>
                    <p className="text-xs text-gray-500 bg-gray-900/50 inline-block px-3 py-1 rounded-full">
                      Earned {new Date(achievement.earnedAt * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
