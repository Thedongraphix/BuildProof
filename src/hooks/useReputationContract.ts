import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { contracts } from '@/lib/contracts'

export function useReputationContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Register Builder
  const registerBuilder = async (username: string) => {
    return writeContract({
      address: contracts.builderReputation.address,
      abi: contracts.builderReputation.abi,
      functionName: 'registerBuilder',
      args: [username],
    })
  }

  // Add Skill
  const addSkill = async (skill: string) => {
    return writeContract({
      address: contracts.builderReputation.address,
      abi: contracts.builderReputation.abi,
      functionName: 'addSkill',
      args: [skill],
    })
  }

  // Endorse Skill
  const endorseSkill = async (builder: `0x${string}`, skill: string) => {
    return writeContract({
      address: contracts.builderReputation.address,
      abi: contracts.builderReputation.abi,
      functionName: 'endorseSkill',
      args: [builder, skill],
    })
  }

  // Update Username
  const updateUsername = async (newUsername: string) => {
    return writeContract({
      address: contracts.builderReputation.address,
      abi: contracts.builderReputation.abi,
      functionName: 'updateUsername',
      args: [newUsername],
    })
  }

  return {
    registerBuilder,
    addSkill,
    endorseSkill,
    updateUsername,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

// Hook to read builder profile
export function useBuilderProfile(address: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.builderReputation.address,
    abi: contracts.builderReputation.abi,
    functionName: 'getBuilderProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return { profile: data, isLoading, error, refetch }
}

// Hook to read builder skills
export function useBuilderSkills(address: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: contracts.builderReputation.address,
    abi: contracts.builderReputation.abi,
    functionName: 'getBuilderSkills',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return { skills: data as string[] | undefined, isLoading, error }
}

// Hook to read builder achievements
export function useBuilderAchievements(address: `0x${string}` | undefined) {
  const { data, isLoading, error } = useReadContract({
    address: contracts.builderReputation.address,
    abi: contracts.builderReputation.abi,
    functionName: 'getBuilderAchievements',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  return { achievements: data, isLoading, error }
}

// Hook to read skill endorsements
export function useSkillEndorsements(address: `0x${string}` | undefined, skill: string) {
  const { data, isLoading, error } = useReadContract({
    address: contracts.builderReputation.address,
    abi: contracts.builderReputation.abi,
    functionName: 'getSkillEndorsements',
    args: address && skill ? [address, skill] : undefined,
    query: {
      enabled: !!address && !!skill,
    },
  })

  return { endorsements: data ? Number(data) : 0, isLoading, error }
}

// Hook to read total builders
export function useTotalBuilders() {
  const { data, isLoading, error } = useReadContract({
    address: contracts.builderReputation.address,
    abi: contracts.builderReputation.abi,
    functionName: 'totalBuilders',
  })

  return { totalBuilders: data ? Number(data) : 0, isLoading, error }
}
