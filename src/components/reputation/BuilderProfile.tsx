"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white mb-1">{username}</CardTitle>
                <p className="text-sm text-gray-400">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    isActive ? "text-green-400 bg-green-400/10" : "text-gray-400 bg-gray-400/10"
                  }`}>
                    {isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-xs text-gray-500">
                    Joined {joinedDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-blue-400 text-3xl font-bold mb-1">
                <Star size={28} />
                {reputationScore}
              </div>
              <p className="text-sm text-gray-400">Reputation</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-400 text-3xl font-bold mb-1">
                <Briefcase size={28} />
                {completedProjects}
              </div>
              <p className="text-sm text-gray-400">Projects</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-yellow-400 text-3xl font-bold mb-1">
                <TrendingUp size={28} />
                {earningsInEth}
              </div>
              <p className="text-sm text-gray-400">ETH Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      {skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-sm font-medium"
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Award className="text-yellow-400" size={20} />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-900/50 border border-gray-800 rounded-lg"
                >
                  <Award className="text-yellow-400 mt-1" size={20} />
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{achievement.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(achievement.earnedAt * 1000).toLocaleDateString()}
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
