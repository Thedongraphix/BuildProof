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

export type NetworkConfig = {
  name: string
  rpcUrl: string
  explorerApiUrl: string
  explorerApiKey: string
  chainId: number
}

export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/demo',
    explorerApiUrl: 'https://api.etherscan.io/api',
    explorerApiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '',
    chainId: 1
  },
  arbitrum: {
    name: 'Arbitrum One',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb-mainnet.g.alchemy.com/v2/demo',
    explorerApiUrl: 'https://api.arbiscan.io/api',
    explorerApiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '',
    chainId: 42161
  },
  polygon: {
    name: 'Polygon Mainnet',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/demo',
    explorerApiUrl: 'https://api.polygonscan.com/api',
    explorerApiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '',
    chainId: 137
  }
}

export class ContractVerificationService {
  private network: NetworkConfig

  constructor(networkName: string = 'ethereum') {
    this.network = SUPPORTED_NETWORKS[networkName] || SUPPORTED_NETWORKS.ethereum
  }

  async getContractInfo(address: string): Promise<ContractInfo> {
    try {
      // Fetch bytecode from RPC
      const bytecodeResponse = await fetch(this.network.rpcUrl, {
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

      // Try to get verified contract info from block explorer
      let contractInfo: ContractInfo = {
        address,
        bytecode,
        isVerified: false
      }

      if (this.network.explorerApiKey && this.network.explorerApiKey !== 'YourEtherscanApiKey') {
        try {
          const explorerResponse = await fetch(
            `${this.network.explorerApiUrl}?module=contract&action=getsourcecode&address=${address}&apikey=${this.network.explorerApiKey}`
          )
          const explorerData = await explorerResponse.json()

          if (explorerData.result && explorerData.result[0] && explorerData.result[0].SourceCode) {
            contractInfo.isVerified = true
            contractInfo.contractName = explorerData.result[0].ContractName
            contractInfo.compiler = explorerData.result[0].CompilerVersion
            contractInfo.sourceCode = explorerData.result[0].SourceCode
            try {
              contractInfo.abi = JSON.parse(explorerData.result[0].ABI)
            } catch (e) {
              // ABI parsing failed, continue without it
            }
          }
        } catch (error) {
          console.warn(`${this.network.name} API request failed:`, error)
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

    // Check for inline assembly
    if (bytecode.includes('7f') && bytecode.includes('52')) { // PUSH32 + MSTORE pattern (common in assembly)
      vulnerabilities.push({
        type: 'INLINE_ASSEMBLY_DETECTED',
        severity: 'MEDIUM',
        description: 'Contract contains inline assembly which bypasses Solidity safety checks',
        recommendation: 'Review assembly code carefully for memory safety and reentrancy issues'
      })
    }

    // Check for CREATE2 usage (deterministic contract creation)
    if (bytecode.includes('f5')) { // CREATE2 opcode
      vulnerabilities.push({
        type: 'CREATE2_USAGE',
        severity: 'LOW',
        description: 'Contract uses CREATE2 for deterministic contract deployment',
        recommendation: 'Ensure salt values are properly randomized and access-controlled'
      })
    }

    // Check for STATICCALL usage
    if (bytecode.includes('fa')) { // STATICCALL opcode
      vulnerabilities.push({
        type: 'STATIC_CALL_USAGE',
        severity: 'LOW',
        description: 'Contract uses staticcall for view-only external calls',
        recommendation: 'Good practice - staticcall prevents state changes in external calls'
      })
    }

    // Check for large bytecode (potential complexity issue)
    if (bytecode.length > 50000) {
      const severity = bytecode.length > 100000 ? 'MEDIUM' : 'LOW'
      vulnerabilities.push({
        type: 'LARGE_CONTRACT_SIZE',
        severity,
        description: `Contract bytecode is unusually large (${Math.round(bytecode.length/1000)}KB)`,
        recommendation: 'Consider code optimization or splitting into multiple contracts'
      })
    }

    // Check for potential proxy patterns
    if (bytecode.includes('3d') && bytecode.includes('f3') && bytecode.length < 200) {
      vulnerabilities.push({
        type: 'MINIMAL_PROXY_PATTERN',
        severity: 'LOW',
        description: 'Contract appears to be a minimal proxy (EIP-1167)',
        recommendation: 'Verify the implementation contract being proxied to'
      })
    }

    // Check for EXTCODECOPY usage (code copying)
    if (bytecode.includes('3c')) { // EXTCODECOPY opcode
      vulnerabilities.push({
        type: 'EXTERNAL_CODE_COPY',
        severity: 'MEDIUM',
        description: 'Contract copies code from external contracts',
        recommendation: 'Ensure copied code is from trusted sources and properly validated'
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

    // Check for tx.origin usage
    if (sourceCode.includes('tx.origin')) {
      vulnerabilities.push({
        type: 'TX_ORIGIN_USAGE',
        severity: 'HIGH',
        description: 'Contract uses tx.origin which is vulnerable to phishing attacks',
        recommendation: 'Use msg.sender instead of tx.origin for authorization'
      })
    }

    // Check for block.timestamp dependency
    if (sourceCode.includes('block.timestamp') || sourceCode.includes('now')) {
      vulnerabilities.push({
        type: 'TIMESTAMP_DEPENDENCY',
        severity: 'MEDIUM',
        description: 'Contract relies on block timestamp which can be manipulated by miners',
        recommendation: 'Use block.number or external oracle for time-sensitive operations'
      })
    }

    // Check for unchecked arithmetic (pre-0.8.0)
    if (sourceCode.includes('pragma solidity') && !sourceCode.includes('0.8') && !sourceCode.includes('SafeMath')) {
      vulnerabilities.push({
        type: 'UNCHECKED_ARITHMETIC',
        severity: 'HIGH',
        description: 'Contract may be vulnerable to integer overflow/underflow',
        recommendation: 'Use SafeMath library or upgrade to Solidity 0.8.0+'
      })
    }

    // Check for missing input validation
    if (!sourceCode.includes('require(') && !sourceCode.includes('revert(')) {
      vulnerabilities.push({
        type: 'MISSING_INPUT_VALIDATION',
        severity: 'MEDIUM',
        description: 'Contract may lack proper input validation',
        recommendation: 'Add require statements to validate function parameters'
      })
    }

    // Check for access control
    if (!sourceCode.includes('onlyOwner') && !sourceCode.includes('AccessControl') && !sourceCode.includes('msg.sender')) {
      vulnerabilities.push({
        type: 'MISSING_ACCESS_CONTROL',
        severity: 'MEDIUM',
        description: 'Contract may lack proper access control mechanisms',
        recommendation: 'Implement role-based access control for sensitive functions'
      })
    }

    // Check for hardcoded addresses
    const addressPattern = /0x[a-fA-F0-9]{40}/g
    const addresses = sourceCode.match(addressPattern)
    if (addresses && addresses.length > 3) {
      vulnerabilities.push({
        type: 'HARDCODED_ADDRESSES',
        severity: 'LOW',
        description: 'Contract contains multiple hardcoded addresses',
        recommendation: 'Consider using configurable addresses for better flexibility'
      })
    }

    // Check for unsafe assembly
    if (sourceCode.includes('assembly {')) {
      vulnerabilities.push({
        type: 'UNSAFE_ASSEMBLY',
        severity: 'MEDIUM',
        description: 'Contract uses inline assembly which bypasses safety checks',
        recommendation: 'Review assembly code for memory safety and overflow protection'
      })
    }

    // Check for deprecated functions
    if (sourceCode.includes('suicide(') || sourceCode.includes('sha3(')) {
      vulnerabilities.push({
        type: 'DEPRECATED_FUNCTIONS',
        severity: 'LOW',
        description: 'Contract uses deprecated Solidity functions',
        recommendation: 'Replace suicide() with selfdestruct() and sha3() with keccak256()'
      })
    }

    // Check for missing events
    if (!sourceCode.includes('emit ') && !sourceCode.includes('event ')) {
      vulnerabilities.push({
        type: 'MISSING_EVENTS',
        severity: 'LOW',
        description: 'Contract lacks events for important state changes',
        recommendation: 'Add events to track important contract interactions'
      })
    }

    // Check for floating pragma
    if (sourceCode.includes('pragma solidity ^')) {
      vulnerabilities.push({
        type: 'FLOATING_PRAGMA',
        severity: 'LOW',
        description: 'Contract uses floating pragma which may cause compilation issues',
        recommendation: 'Use a specific compiler version for production contracts'
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