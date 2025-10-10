"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign, User, FileText } from "lucide-react"
import { formatEther } from "viem"

interface BountyCardProps {
  bountyId: number
  title: string
  description: string
  reward: bigint
  deadline: number
  status: number
  creator: string
  claimer?: string
  onClaim?: () => void
  onSubmit?: () => void
  onApprove?: () => void
}

const statusLabels = ["Open", "Claimed", "Under Review", "Completed", "Cancelled"]
const statusColors = [
  "text-green-400 bg-green-400/10",
  "text-blue-400 bg-blue-400/10",
  "text-yellow-400 bg-yellow-400/10",
  "text-gray-400 bg-gray-400/10",
  "text-red-400 bg-red-400/10"
]

export function BountyCard({
  title,
  description,
  reward,
  deadline,
  status,
  creator,
  claimer,
  onClaim,
  onSubmit,
  onApprove
}: BountyCardProps) {
  const deadlineDate = new Date(deadline * 1000)
  const isExpired = Date.now() > deadline * 1000
  const rewardInEth = formatEther(reward)

  return (
    <Card className="hover:border-blue-500/30 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl text-white mb-2">{title}</CardTitle>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${statusColors[status]}`}>
              {statusLabels[status]}
            </span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-blue-400 font-bold text-xl">
              <DollarSign size={20} />
              {rewardInEth} ETH
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-400 text-sm line-clamp-2">{description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <User size={16} />
            <span className="truncate">
              Creator: {creator.slice(0, 6)}...{creator.slice(-4)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <Clock size={16} className={isExpired ? "text-red-400" : ""} />
            <span className={isExpired ? "text-red-400" : ""}>
              {isExpired ? "Expired" : deadlineDate.toLocaleDateString()}
            </span>
          </div>

          {claimer && (
            <div className="flex items-center gap-2 text-gray-400 col-span-2">
              <FileText size={16} />
              <span className="truncate">
                Claimer: {claimer.slice(0, 6)}...{claimer.slice(-4)}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        {status === 0 && !isExpired && onClaim && (
          <Button onClick={onClaim} className="flex-1">
            Claim Bounty
          </Button>
        )}

        {status === 1 && onSubmit && (
          <Button onClick={onSubmit} variant="outline" className="flex-1">
            Submit Work
          </Button>
        )}

        {status === 2 && onApprove && (
          <Button onClick={onApprove} className="flex-1">
            Approve & Pay
          </Button>
        )}

        {status === 3 && (
          <div className="flex-1 text-center text-sm text-gray-400">
            Bounty Completed
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
