export interface ContractInfo {
  address: string
  bytecode: string
  isVerified: boolean
  contractName?: string
  compiler?: string
  sourceCode?: string
  abi?: any[]
}

export interface SecurityAnalysis {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  vulnerabilities: Vulnerability[]
  score: number
  gasOptimization: GasAnalysis
  accessControls: AccessControlAnalysis
}

export interface Vulnerability {
  type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  location?: string
  recommendation: string
}

export interface GasAnalysis {
  efficiency: number
  recommendations: string[]
}

export interface AccessControlAnalysis {
  hasOwner: boolean
  hasMultisig: boolean
  hasTimelock: boolean
  risks: string[]
}

export class ContractVerificationService {
  private etherscanApiKey: string
  private rpcUrl: string

  constructor(etherscanApiKey: string = '', rpcUrl: string = '') {
    this.etherscanApiKey = etherscanApiKey || process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || ''
    this.rpcUrl = rpcUrl || process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo'
  }

  async getContractInfo(address: string): Promise<ContractInfo> {
    try {
      // Fetch bytecode from RPC
      const bytecodeResponse = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getCode',
          params: [address, 'latest'],
          id: 1
        })
      })

      const bytecodeData = await bytecodeResponse.json()
      const bytecode = bytecodeData.result

      if (!bytecode || bytecode === '0x') {
        throw new Error('No contract found at this address')
      }

      // Try to get verified contract info from Etherscan
      let contractInfo: ContractInfo = {
        address,
        bytecode,
        isVerified: false
      }

      if (this.etherscanApiKey && this.etherscanApiKey !== 'YourEtherscanApiKey') {
        try {
          const etherscanResponse = await fetch(
            `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${this.etherscanApiKey}`
          )
          const etherscanData = await etherscanResponse.json()

          if (etherscanData.result && etherscanData.result[0] && etherscanData.result[0].SourceCode) {
            contractInfo.isVerified = true
            contractInfo.contractName = etherscanData.result[0].ContractName
            contractInfo.compiler = etherscanData.result[0].CompilerVersion
            contractInfo.sourceCode = etherscanData.result[0].SourceCode
            try {
              contractInfo.abi = JSON.parse(etherscanData.result[0].ABI)
            } catch (e) {
              // ABI parsing failed, continue without it
            }
          }
        } catch (error) {
          console.warn('Etherscan API request failed:', error)
        }
      }

      return contractInfo
    } catch (error) {
      throw new Error(`Failed to fetch contract info: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async analyzeContract(contractInfo: ContractInfo): Promise<SecurityAnalysis> {
    const vulnerabilities: Vulnerability[] = []
    let riskLevel: SecurityAnalysis['riskLevel'] = 'LOW'

    // Bytecode analysis patterns
    if (contractInfo.bytecode) {
      // Check for common vulnerability patterns in bytecode
      vulnerabilities.push(...this.analyzeBytecode(contractInfo.bytecode))
    }

    // Source code analysis if available
    if (contractInfo.sourceCode) {
      vulnerabilities.push(...this.analyzeSourceCode(contractInfo.sourceCode))
    }

    // Determine risk level based on vulnerabilities
    const criticalCount = vulnerabilities.filter(v => v.severity === 'CRITICAL').length
    const highCount = vulnerabilities.filter(v => v.severity === 'HIGH').length
    const mediumCount = vulnerabilities.filter(v => v.severity === 'MEDIUM').length

    if (criticalCount > 0) {
      riskLevel = 'CRITICAL'
    } else if (highCount > 0) {
      riskLevel = 'HIGH'
    } else if (mediumCount > 0) {
      riskLevel = 'MEDIUM'
    }

    // Calculate security score (0-100)
    const score = Math.max(0, 100 - (criticalCount * 30 + highCount * 20 + mediumCount * 10))

    return {
      riskLevel,
      vulnerabilities,
      score,
      gasOptimization: this.analyzeGasEfficiency(contractInfo),
      accessControls: this.analyzeAccessControls(contractInfo)
    }
  }

  private analyzeBytecode(bytecode: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = []

    // Check for delegatecall (potential proxy vulnerability)
    if (bytecode.includes('f4')) { // DELEGATECALL opcode
      vulnerabilities.push({
        type: 'DELEGATECALL_USAGE',
        severity: 'MEDIUM',
        description: 'Contract uses delegatecall which could be risky if not properly implemented',
        recommendation: 'Ensure delegatecall targets are validated and trusted'
      })
    }

    // Check for selfdestruct
    if (bytecode.includes('ff')) { // SELFDESTRUCT opcode
      vulnerabilities.push({
        type: 'SELFDESTRUCT_PRESENT',
        severity: 'HIGH',
        description: 'Contract can be destroyed using selfdestruct',
        recommendation: 'Ensure selfdestruct is properly protected and only callable by authorized parties'
      })
    }

    // Check for large bytecode (potential complexity issue)
    if (bytecode.length > 50000) {
      vulnerabilities.push({
        type: 'LARGE_CONTRACT_SIZE',
        severity: 'LOW',
        description: 'Contract bytecode is unusually large',
        recommendation: 'Consider code optimization or splitting into multiple contracts'
      })
    }

    return vulnerabilities
  }

  private analyzeSourceCode(sourceCode: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = []

    // Check for reentrancy patterns
    if (sourceCode.includes('.call(') && !sourceCode.includes('nonReentrant')) {
      vulnerabilities.push({
        type: 'POTENTIAL_REENTRANCY',
        severity: 'HIGH',
        description: 'Contract uses external calls without reentrancy protection',
        recommendation: 'Use ReentrancyGuard or checks-effects-interactions pattern'
      })
    }

    // Check for unchecked external calls
    if (sourceCode.includes('.call(') && !sourceCode.includes('require(')) {
      vulnerabilities.push({
        type: 'UNCHECKED_EXTERNAL_CALL',
        severity: 'MEDIUM',
        description: 'External calls may not be properly checked for success',
        recommendation: 'Always check return values of external calls'
      })
    }

    // Check for access control
    if (!sourceCode.includes('onlyOwner') && !sourceCode.includes('AccessControl')) {
      vulnerabilities.push({
        type: 'MISSING_ACCESS_CONTROL',
        severity: 'MEDIUM',
        description: 'Contract may lack proper access control mechanisms',
        recommendation: 'Implement role-based access control for sensitive functions'
      })
    }

    return vulnerabilities
  }

  private analyzeGasEfficiency(contractInfo: ContractInfo): GasAnalysis {
    const recommendations: string[] = []
    let efficiency = 80 // Base efficiency score

    if (contractInfo.sourceCode) {
      // Check for gas optimization patterns
      if (contractInfo.sourceCode.includes('memory') && contractInfo.sourceCode.includes('storage')) {
        recommendations.push('Consider using memory instead of storage for temporary variables')
        efficiency -= 5
      }

      if (contractInfo.sourceCode.includes('string') && !contractInfo.sourceCode.includes('bytes')) {
        recommendations.push('Consider using bytes instead of string for gas optimization')
        efficiency -= 3
      }

      if (contractInfo.sourceCode.includes('require(') && !contractInfo.sourceCode.includes('custom error')) {
        recommendations.push('Use custom errors instead of require strings in Solidity 0.8.4+')
        efficiency -= 2
      }
    }

    return {
      efficiency: Math.max(0, efficiency),
      recommendations
    }
  }

  private analyzeAccessControls(contractInfo: ContractInfo): AccessControlAnalysis {
    const risks: string[] = []
    let hasOwner = false
    let hasMultisig = false
    let hasTimelock = false

    if (contractInfo.sourceCode) {
      hasOwner = contractInfo.sourceCode.includes('owner') || contractInfo.sourceCode.includes('Ownable')
      hasMultisig = contractInfo.sourceCode.includes('multisig') || contractInfo.sourceCode.includes('MultiSig')
      hasTimelock = contractInfo.sourceCode.includes('timelock') || contractInfo.sourceCode.includes('TimeLock')

      if (hasOwner && !hasMultisig) {
        risks.push('Single owner control - consider implementing multisig')
      }

      if (!hasTimelock && hasOwner) {
        risks.push('No timelock for administrative functions')
      }
    }

    return {
      hasOwner,
      hasMultisig,
      hasTimelock,
      risks
    }
  }
}