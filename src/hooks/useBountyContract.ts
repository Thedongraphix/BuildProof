import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther } from 'viem'
import { contracts } from '@/lib/contracts'

export function useBountyContract() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Create Bounty
  const createBounty = async (
    title: string,
    description: string,
    deadline: number,
    rewardInEth: string
  ) => {
    return writeContract({
      address: contracts.builderBounty.address,
      abi: contracts.builderBounty.abi,
      functionName: 'createBounty',
      args: [title, description, BigInt(deadline)],
      value: parseEther(rewardInEth),
    })
  }

  // Claim Bounty
  const claimBounty = async (bountyId: number) => {
    return writeContract({
      address: contracts.builderBounty.address,
      abi: contracts.builderBounty.abi,
      functionName: 'claimBounty',
      args: [BigInt(bountyId)],
    })
  }

  // Submit Work
  const submitWork = async (bountyId: number, ipfsHash: string) => {
    return writeContract({
      address: contracts.builderBounty.address,
      abi: contracts.builderBounty.abi,
      functionName: 'submitWork',
      args: [BigInt(bountyId), ipfsHash],
    })
  }

  // Approve Bounty
  const approveBounty = async (bountyId: number) => {
    return writeContract({
      address: contracts.builderBounty.address,
      abi: contracts.builderBounty.abi,
      functionName: 'approveBounty',
      args: [BigInt(bountyId)],
    })
  }

  // Cancel Bounty
  const cancelBounty = async (bountyId: number) => {
    return writeContract({
      address: contracts.builderBounty.address,
      abi: contracts.builderBounty.abi,
      functionName: 'cancelBounty',
      args: [BigInt(bountyId)],
    })
  }

  return {
    createBounty,
    claimBounty,
    submitWork,
    approveBounty,
    cancelBounty,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

// Hook to read bounty data
export function useReadBounty(bountyId: number) {
  const { data, isLoading, error } = useReadContract({
    address: contracts.builderBounty.address,
    abi: contracts.builderBounty.abi,
    functionName: 'getBounty',
    args: [BigInt(bountyId)],
  })

  return { bounty: data, isLoading, error }
}

// Hook to read total bounties count
export function useTotalBounties() {
  const { data, isLoading, error } = useReadContract({
    address: contracts.builderBounty.address,
    abi: contracts.builderBounty.abi,
    functionName: 'totalBounties',
  })

  return { totalBounties: data ? Number(data) : 0, isLoading, error }
}
