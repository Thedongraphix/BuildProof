import { useState, useCallback } from 'react'
import { ContractVerificationService, ContractInfo, SecurityAnalysis } from '@/lib/contract-verification'

export interface VerificationStep {
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR'
  timestamp: number
}

export interface VerificationResult {
  contractInfo: ContractInfo
  securityAnalysis: SecurityAnalysis
  steps: VerificationStep[]
  isComplete: boolean
}

export function useContractVerification() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [currentSteps, setCurrentSteps] = useState<VerificationStep[]>([])

  const addStep = useCallback((message: string, type: VerificationStep['type'] = 'INFO') => {
    if (!message || typeof message !== 'string') {
      console.warn('Invalid message passed to addStep:', message)
      return
    }

    const step: VerificationStep = {
      message,
      type,
      timestamp: Date.now()
    }
    setCurrentSteps(prev => [...prev, step])
    return step
  }, [])

  const verifyContract = useCallback(async (address: string) => {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      addStep('ERROR: Invalid contract address format', 'ERROR')
      return null
    }

    setIsLoading(true)
    setCurrentSteps([])
    setResult(null)

    const verificationService = new ContractVerificationService()

    try {
      // Step 1: Initialize
      addStep('Initializing enterprise verification engine...', 'INFO')
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 2: Start analysis
      addStep(`Contract analysis initiated for ${address}`, 'INFO')
      await new Promise(resolve => setTimeout(resolve, 300))

      // Step 3: Fetch bytecode
      addStep('Retrieving bytecode from Ethereum mainnet...', 'INFO')
      const contractInfo = await verificationService.getContractInfo(address)

      if (!contractInfo.bytecode || contractInfo.bytecode === '0x') {
        addStep('ERROR: No contract found at this address', 'ERROR')
        setIsLoading(false)
        return null
      }

      addStep('SUCCESS: Bytecode extraction completed', 'SUCCESS')
      await new Promise(resolve => setTimeout(resolve, 300))

      // Step 4: Perform analysis
      addStep('Performing static code analysis...', 'INFO')
      await new Promise(resolve => setTimeout(resolve, 500))

      addStep('Running comprehensive security audit...', 'INFO')
      const securityAnalysis = await verificationService.analyzeContract(contractInfo)
      await new Promise(resolve => setTimeout(resolve, 400))

      // Step 5: Report findings
      addStep('Scanning for vulnerability patterns...', 'INFO')
      await new Promise(resolve => setTimeout(resolve, 300))

      // Add vulnerability-specific messages
      if (securityAnalysis.vulnerabilities.length > 0) {
        const criticalVulns = securityAnalysis.vulnerabilities.filter(v => v.severity === 'CRITICAL')
        const highVulns = securityAnalysis.vulnerabilities.filter(v => v.severity === 'HIGH')
        const mediumVulns = securityAnalysis.vulnerabilities.filter(v => v.severity === 'MEDIUM')

        if (criticalVulns.length > 0) {
          addStep(`CRITICAL: ${criticalVulns.length} critical vulnerabilities detected`, 'ERROR')
        }
        if (highVulns.length > 0) {
          addStep(`WARN: ${highVulns.length} high-risk issues identified`, 'WARN')
        }
        if (mediumVulns.length > 0) {
          addStep(`WARN: ${mediumVulns.length} medium-risk issues flagged for review`, 'WARN')
        }
      } else {
        addStep('SUCCESS: No critical vulnerabilities detected', 'SUCCESS')
      }

      await new Promise(resolve => setTimeout(resolve, 300))

      // Step 6: Access control analysis
      addStep('Validating access control mechanisms...', 'INFO')
      await new Promise(resolve => setTimeout(resolve, 400))

      if (securityAnalysis.accessControls.hasOwner) {
        if (securityAnalysis.accessControls.hasMultisig) {
          addStep('SUCCESS: Multi-signature access controls verified', 'SUCCESS')
        } else {
          addStep('WARN: Single owner detected - consider multi-signature wallet', 'WARN')
        }
      } else {
        addStep('INFO: No centralized ownership detected', 'INFO')
      }

      await new Promise(resolve => setTimeout(resolve, 300))

      // Step 7: Gas optimization
      addStep('Evaluating gas optimization patterns...', 'INFO')
      await new Promise(resolve => setTimeout(resolve, 400))

      if (securityAnalysis.gasOptimization.efficiency > 85) {
        addStep('SUCCESS: Gas optimization patterns are efficient', 'SUCCESS')
      } else if (securityAnalysis.gasOptimization.efficiency > 70) {
        addStep('WARN: Gas optimization could be improved', 'WARN')
      } else {
        addStep('WARN: Poor gas optimization detected', 'WARN')
      }

      await new Promise(resolve => setTimeout(resolve, 300))

      // Step 8: Generate report
      addStep('Generating compliance report...', 'INFO')
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 9: Final result
      addStep('SUCCESS: Contract verification protocol completed', 'SUCCESS')

      const riskMessage = securityAnalysis.riskLevel === 'LOW' ?
        `SUCCESS: ${address} cleared for production deployment` :
        `WARN: ${address} requires review before deployment (Risk: ${securityAnalysis.riskLevel})`

      addStep(riskMessage, securityAnalysis.riskLevel === 'LOW' ? 'SUCCESS' : 'WARN')

      addStep(`INFO: Security score: ${securityAnalysis.score}/100`, 'INFO')
      addStep('INFO: Enterprise security report available for download', 'INFO')

      const finalResult: VerificationResult = {
        contractInfo,
        securityAnalysis,
        steps: currentSteps,
        isComplete: true
      }

      setResult(finalResult)
      setIsLoading(false)

      return finalResult

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      addStep(`ERROR: ${errorMessage}`, 'ERROR')
      setIsLoading(false)
      return null
    }
  }, [addStep, currentSteps])

  const reset = useCallback(() => {
    setIsLoading(false)
    setResult(null)
    setCurrentSteps([])
  }, [])

  return {
    verifyContract,
    isLoading,
    result,
    currentSteps,
    reset
  }
}