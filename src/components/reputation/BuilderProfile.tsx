'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Star, Briefcase, TrendingUp, User, QrCode, Share2 } from 'lucide-react'
import { formatEther } from 'viem'
import { QRCode } from '@/components/ui/qr-code'

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
  achievements = [],
}: BuilderProfileProps) {
  const joinedDate = new Date(joinedAt * 1000)
  const earningsInEth = formatEther(totalEarnings)

  // Generate profile URL for QR code
  const profileUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/reputation?address=${address}` : ''

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-blue-500 flex items-center justify-center border border-blue-500">
                <User size={40} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl text-white mb-2 font-bold">{username}</CardTitle>
                <p className="text-sm text-gray-400 font-mono">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span
                    className={`inline-flex items-center px-3 py-1 text-xs font-semibold ${
                      isActive
                        ? 'text-blue-400 border border-blue-500'
                        : 'text-gray-400 border border-gray-400'
                    }`}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-500 border border-gray-800 px-3 py-1">
                    Joined {joinedDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile QR Code */}
            {profileUrl && (
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500">
                  <Share2 className="text-blue-400" size={14} />
                  <span className="text-blue-400 text-xs font-semibold">SHARE PROFILE</span>
                </div>
                <div className="relative">
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                    <QrCode size={14} />
                  </div>
                  <QRCode
                    value={profileUrl}
                    size={120}
                    title={`${username}'s Profile`}
                    description="Scan to view this builder's profile"
                  />
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="stat-item text-center p-4 border border-blue-500">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star size={24} className="text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">{reputationScore}</div>
              <p className="text-xs text-gray-400 font-medium uppercase">Reputation</p>
            </div>

            <div className="stat-item text-center p-4 border border-blue-500">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Briefcase size={24} className="text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">{completedProjects}</div>
              <p className="text-xs text-gray-400 font-medium uppercase">Projects</p>
            </div>

            <div className="stat-item text-center p-4 border border-blue-500">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp size={24} className="text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">{earningsInEth}</div>
              <p className="text-xs text-gray-400 font-medium uppercase">ETH Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Section */}
      {skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-white font-bold">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 border border-blue-500 text-blue-400 text-sm font-semibold"
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
            <CardTitle className="text-xl text-white font-bold flex items-center gap-2">
              <Award className="text-blue-400" size={24} />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-blue-500">
                  <div className="p-3 border border-blue-500">
                    <Award className="text-blue-400" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-lg mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed mb-2">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-gray-500 border border-gray-800 inline-block px-3 py-1">
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
