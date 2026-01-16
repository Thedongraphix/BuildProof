import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { contracts } from '@/lib/contracts'
import { parseEther } from 'viem'

export function useTeamsContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Create Team
  const createTeam = async (name: string, members: `0x${string}`[], shares: number[]) => {
    return writeContract({
      address: contracts.builderTeams.address,
      abi: contracts.builderTeams.abi,
      functionName: 'createTeam',
      args: [name, members, shares],
    })
  }

  // Add Member
  const addMember = async (teamId: number, member: `0x${string}`, share: number) => {
    return writeContract({
      address: contracts.builderTeams.address,
      abi: contracts.builderTeams.abi,
      functionName: 'addMember',
      args: [BigInt(teamId), member, BigInt(share)],
    })
  }

  // Remove Member
  const removeMember = async (teamId: number, member: `0x${string}`) => {
    return writeContract({
      address: contracts.builderTeams.address,
      abi: contracts.builderTeams.abi,
      functionName: 'removeMember',
      args: [BigInt(teamId), member],
    })
  }

  // Update Member Share
  const updateMemberShare = async (teamId: number, member: `0x${string}`, newShare: number) => {
    return writeContract({
      address: contracts.builderTeams.address,
      abi: contracts.builderTeams.abi,
      functionName: 'updateMemberShare',
      args: [BigInt(teamId), member, BigInt(newShare)],
    })
  }

  // Distribute Reward
  const distributeReward = async (teamId: number, amountInEth: string) => {
    return writeContract({
      address: contracts.builderTeams.address,
      abi: contracts.builderTeams.abi,
      functionName: 'distributeReward',
      args: [BigInt(teamId)],
      value: parseEther(amountInEth),
    })
  }

  // Record Bounty Completion
  const recordBountyCompletion = async (teamId: number, earnings: bigint) => {
    return writeContract({
      address: contracts.builderTeams.address,
      abi: contracts.builderTeams.abi,
      functionName: 'recordBountyCompletion',
      args: [BigInt(teamId), earnings],
    })
  }

  // Deactivate Team
  const deactivateTeam = async (teamId: number) => {
    return writeContract({
      address: contracts.builderTeams.address,
      abi: contracts.builderTeams.abi,
      functionName: 'deactivateTeam',
      args: [BigInt(teamId)],
    })
  }

  return {
    createTeam,
    addMember,
    removeMember,
    updateMemberShare,
    distributeReward,
    recordBountyCompletion,
    deactivateTeam,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

// Hook to read team info
export function useTeamInfo(teamId: number | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.builderTeams.address,
    abi: contracts.builderTeams.abi,
    functionName: 'getTeamInfo',
    args: teamId !== undefined ? [BigInt(teamId)] : undefined,
    query: {
      enabled: teamId !== undefined,
    },
  })

  return { teamInfo: data, isLoading, error, refetch }
}

// Hook to read member shares
export function useMemberShares(teamId: number | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: contracts.builderTeams.address,
    abi: contracts.builderTeams.abi,
    functionName: 'getMemberShares',
    args: teamId !== undefined ? [BigInt(teamId)] : undefined,
    query: {
      enabled: teamId !== undefined,
    },
  })

  return { memberShares: data, isLoading, error }
}

// Hook to read member teams
export function useMemberTeams(address: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: contracts.builderTeams.address,
    abi: contracts.builderTeams.abi,
    functionName: 'getMemberTeams',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return { memberTeams: data as bigint[] | undefined, isLoading, error }
}

// Hook to read created teams
export function useCreatedTeams(address: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: contracts.builderTeams.address,
    abi: contracts.builderTeams.abi,
    functionName: 'getCreatedTeams',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return { createdTeams: data as bigint[] | undefined, isLoading, error }
}

// Hook to check if member
export function useIsMember(teamId: number | undefined, address: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: contracts.builderTeams.address,
    abi: contracts.builderTeams.abi,
    functionName: 'isMember',
    args: teamId !== undefined && address ? [BigInt(teamId), address] : undefined,
    query: {
      enabled: teamId !== undefined && !!address,
    },
  })

  return { isMember: data as boolean | undefined, isLoading, error }
}

// Hook to read total teams
export function useTotalTeams() {
  const { data, isLoading, error } = useReadContract({
    address: contracts.builderTeams.address,
    abi: contracts.builderTeams.abi,
    functionName: 'totalTeams',
  })

  return { totalTeams: data ? Number(data) : 0, isLoading, error }
}
