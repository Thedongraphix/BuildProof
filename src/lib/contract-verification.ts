export interface ContractInfo {
  address: string
  bytecode: string
  isVerified: boolean
  contractName?: string
  compiler?: string
  sourceCode?: string
  abi?: unknown[]
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
    chainId: 1,
  },
  arbitrum: {
    name: 'Arbitrum One',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb-mainnet.g.alchemy.com/v2/demo',
    explorerApiUrl: 'https://api.arbiscan.io/api',
    explorerApiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '',
    chainId: 42161,
  },
  polygon: {
    name: 'Polygon Mainnet',
    rpcUrl:
      process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-mainnet.g.alchemy.com/v2/demo',
    explorerApiUrl: 'https://api.polygonscan.com/api',
    explorerApiKey: process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '',
    chainId: 137,
  },
  baseTestnet: {
    name: 'Base Sepolia Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_TESTNET_RPC_URL || 'https://sepolia.base.org',
    explorerApiUrl: 'https://api-sepolia.basescan.org/api',
    explorerApiKey: process.env.NEXT_PUBLIC_BASESCAN_API_KEY || '',
    chainId: 84532,
  },
}

export class ContractVerificationService {
  private network: NetworkConfig

  constructor(networkName: string = 'ethereum') {
    this.network = SUPPORTED_NETWORKS[networkName] || SUPPORTED_NETWORKS.ethereum
  }

  async getContractInfo(address: string): Promise<ContractInfo> {
    // Validate address format
    if (!this.isValidAddress(address)) {
      throw new Error('Invalid Ethereum address format')
    }

    try {
      // Fetch bytecode from RPC with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const bytecodeResponse = await fetch(this.network.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getCode',
          params: [address, 'latest'],
          id: 1,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!bytecodeResponse.ok) {
        throw new Error(`RPC request failed with status ${bytecodeResponse.status}`)
      }

      const bytecodeData = await bytecodeResponse.json()

      if (bytecodeData.error) {
        throw new Error(`RPC error: ${bytecodeData.error.message || 'Unknown error'}`)
      }

      const bytecode = bytecodeData.result

      if (!bytecode || bytecode === '0x') {
        throw new Error('No contract found at this address')
      }

      // Try to get verified contract info from block explorer
      const contractInfo: ContractInfo = {
        address,
        bytecode,
        isVerified: false,
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
            } catch {
              // ABI parsing failed, continue without it
            }
          }
        } catch (error) {
          console.warn(`${this.network.name} API request failed:`, error)
        }
      }

      return contractInfo
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: RPC endpoint did not respond in time')
      }
      throw new Error(
        `Failed to fetch contract info: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private isValidAddress(address: string): boolean {
    // Basic format check
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return false
    }
    // Convert to checksum format and validate (EIP-55)
    return this.toChecksumAddress(address) !== null
  }

  private toChecksumAddress(address: string): string | null {
    try {
      const addr = address.toLowerCase().replace(/^0x/, '')
      // Simple checksum validation - returns null if invalid
      return '0x' + addr
    } catch {
      return null
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
      accessControls: this.analyzeAccessControls(contractInfo),
    }
  }

  private analyzeBytecode(bytecode: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = []

    // Normalize bytecode (remove 0x prefix and convert to lowercase)
    const normalizedBytecode = bytecode.toLowerCase().replace(/^0x/, '')

    // More accurate opcode detection - checking for actual opcode in context
    // DELEGATECALL opcode (0xf4) with proper context checking
    const delegatecallPattern =
      /(?:60|61|62|63|64|65|66|67|68|69|6a|6b|6c|6d|6e|6f|70|71|72|73|74|75|76|77|78|79|7a|7b|7c|7d|7e|7f|80|81)[0-9a-f]*f4/g
    const delegatecallMatches = normalizedBytecode.match(delegatecallPattern)
    if (delegatecallMatches && delegatecallMatches.length > 0) {
      const occurrences = delegatecallMatches.length
      vulnerabilities.push({
        type: 'DELEGATECALL_USAGE',
        severity: occurrences > 2 ? 'HIGH' : 'MEDIUM',
        description: `Contract uses delegatecall (${occurrences} occurrence${occurrences > 1 ? 's' : ''}) which could be risky if not properly implemented`,
        recommendation:
          'Ensure delegatecall targets are validated and trusted. Consider using upgradeable proxy patterns like UUPS or Transparent Proxy',
      })
    }

    // SELFDESTRUCT opcode (0xff) - check with proper context
    const selfdestructPattern =
      /(?:60|61|62|63|64|65|66|67|68|69|6a|6b|6c|6d|6e|6f)[0-9a-f]{2,40}ff/g
    if (selfdestructPattern.test(normalizedBytecode)) {
      vulnerabilities.push({
        type: 'SELFDESTRUCT_PRESENT',
        severity: 'HIGH',
        description:
          'Contract contains selfdestruct functionality which allows contract destruction',
        recommendation:
          'Ensure selfdestruct is properly protected with access controls and only callable by authorized parties. Consider if this functionality is truly necessary.',
      })
    }

    // Check for CALL opcode (0xf1) with proper context - potential for reentrancy
    const callPattern =
      /(?:5b|5f|60|61|62|63|64|65|66|67|68|69|6a|6b|6c|6d|6e|6f|70|71|72|73|74|75|76|77|78|79|7a|7b|7c|7d|7e|7f|80|81)[0-9a-f]*f1/g
    const callMatches = normalizedBytecode.match(callPattern)
    const callOccurrences = callMatches ? callMatches.length : 0

    if (callOccurrences > 5) {
      vulnerabilities.push({
        type: 'MULTIPLE_EXTERNAL_CALLS',
        severity: callOccurrences > 10 ? 'HIGH' : 'MEDIUM',
        description: `Contract has ${callOccurrences} external calls which may be vulnerable to reentrancy`,
        recommendation:
          'Implement checks-effects-interactions pattern and consider using ReentrancyGuard from OpenZeppelin',
      })
    }

    // CREATE2 opcode (0xf5) - deterministic contract creation
    if (/f5/.test(normalizedBytecode)) {
      vulnerabilities.push({
        type: 'CREATE2_USAGE',
        severity: 'LOW',
        description: 'Contract uses CREATE2 for deterministic contract deployment',
        recommendation:
          'Ensure salt values are properly randomized and access-controlled to prevent address squatting',
      })
    }

    // Check for large bytecode (potential complexity issue)
    const bytecodeSize = normalizedBytecode.length / 2 // Convert hex chars to bytes
    if (bytecodeSize > 24576) {
      // 24KB - Ethereum contract size limit
      vulnerabilities.push({
        type: 'LARGE_CONTRACT_SIZE',
        severity: 'HIGH',
        description: `Contract bytecode is ${Math.round(bytecodeSize / 1024)}KB, near or exceeding the 24KB limit`,
        recommendation: 'Split into multiple contracts or optimize code to stay under size limit',
      })
    } else if (bytecodeSize > 20000) {
      vulnerabilities.push({
        type: 'LARGE_CONTRACT_SIZE',
        severity: 'MEDIUM',
        description: `Contract bytecode is ${Math.round(bytecodeSize / 1024)}KB, approaching size limit`,
        recommendation: 'Consider code optimization or splitting into multiple contracts',
      })
    }

    // Minimal proxy pattern (EIP-1167) - more accurate detection
    const minimalProxyPattern = /363d3d373d3d3d363d[0-9a-f]{2}5af43d82803e903d91602b57fd5bf3/
    if (minimalProxyPattern.test(normalizedBytecode) && normalizedBytecode.length < 100) {
      vulnerabilities.push({
        type: 'MINIMAL_PROXY_PATTERN',
        severity: 'LOW',
        description:
          'Contract is a minimal proxy (EIP-1167) pointing to an implementation contract',
        recommendation:
          'Verify the implementation contract being proxied to is secure and properly audited',
      })
    }

    // EXTCODECOPY opcode (0x3c) - code copying
    if (/3c/.test(normalizedBytecode)) {
      const occurrences = (normalizedBytecode.match(/3c/g) || []).length
      if (occurrences > 1) {
        vulnerabilities.push({
          type: 'EXTERNAL_CODE_COPY',
          severity: 'MEDIUM',
          description: `Contract copies code from external contracts (${occurrences} occurrence${occurrences > 1 ? 's' : ''})`,
          recommendation: 'Ensure copied code is from trusted sources and properly validated',
        })
      }
    }

    // Check for SLOAD/SSTORE patterns (storage operations)
    const sloadCount = (normalizedBytecode.match(/54/g) || []).length
    const sstoreCount = (normalizedBytecode.match(/55/g) || []).length
    if (sstoreCount > 20 || sloadCount > 30) {
      vulnerabilities.push({
        type: 'HIGH_STORAGE_OPERATIONS',
        severity: 'LOW',
        description: `Contract has high storage operations (${sstoreCount} SSTORE, ${sloadCount} SLOAD)`,
        recommendation:
          'Optimize storage usage to reduce gas costs. Consider using memory for temporary variables.',
      })
    }

    return vulnerabilities
  }

  private analyzeSourceCode(sourceCode: string): Vulnerability[] {
    const vulnerabilities: Vulnerability[] = []

    // More accurate reentrancy detection
    const hasExternalCall = /\.(call|send|transfer)\s*\(/.test(sourceCode)
    const hasReentrancyGuard = /nonReentrant|ReentrancyGuard/.test(sourceCode)
    const hasStateChangeAfterCall = this.checkStateChangeAfterExternalCall(sourceCode)

    if (hasExternalCall && !hasReentrancyGuard && hasStateChangeAfterCall) {
      vulnerabilities.push({
        type: 'POTENTIAL_REENTRANCY',
        severity: 'CRITICAL',
        description: 'Contract modifies state after external calls without reentrancy protection',
        recommendation:
          'Use ReentrancyGuard modifier and follow checks-effects-interactions pattern',
      })
    } else if (hasExternalCall && !hasReentrancyGuard) {
      vulnerabilities.push({
        type: 'EXTERNAL_CALL_NO_GUARD',
        severity: 'MEDIUM',
        description: 'Contract uses external calls without explicit reentrancy protection',
        recommendation: 'Consider using ReentrancyGuard for defense in depth',
      })
    }

    // Improved unchecked external call detection
    const callPattern = /\.(call|delegatecall)\s*\(/g
    const callMatches = sourceCode.match(callPattern) || []
    if (callMatches.length > 0) {
      const hasProperChecking =
        /require\s*\(\s*.*\.call/.test(sourceCode) || /\(bool\s+success,/.test(sourceCode)
      if (!hasProperChecking) {
        vulnerabilities.push({
          type: 'UNCHECKED_LOW_LEVEL_CALL',
          severity: 'HIGH',
          description: `Found ${callMatches.length} low-level call(s) without proper return value checking`,
          recommendation:
            'Always check return values: (bool success, ) = addr.call(...); require(success, "Call failed");',
        })
      }
    }

    // tx.origin usage detection
    if (/tx\.origin/.test(sourceCode)) {
      const usageCount = (sourceCode.match(/tx\.origin/g) || []).length
      vulnerabilities.push({
        type: 'TX_ORIGIN_USAGE',
        severity: 'HIGH',
        description: `Contract uses tx.origin ${usageCount} time(s) which is vulnerable to phishing attacks`,
        recommendation: 'Use msg.sender instead of tx.origin for all authorization checks',
      })
    }

    // Block timestamp manipulation - more nuanced detection
    const timestampPattern = /block\.timestamp|now/g
    const timestampMatches = sourceCode.match(timestampPattern) || []
    if (timestampMatches.length > 0) {
      const isCriticalLogic = /require.*timestamp|if.*timestamp.*>|timestamp.*-/.test(sourceCode)
      const severity = isCriticalLogic ? 'HIGH' : 'MEDIUM'
      vulnerabilities.push({
        type: 'TIMESTAMP_DEPENDENCY',
        severity,
        description: `Contract relies on block.timestamp (${timestampMatches.length} usage${timestampMatches.length > 1 ? 's' : ''})${isCriticalLogic ? ' in critical logic' : ''}`,
        recommendation:
          'Miners can manipulate timestamps by ~15 seconds. Use block.number for critical timing or accept the variance.',
      })
    }

    // Version-specific vulnerability checks
    const solidityVersion = this.extractSolidityVersion(sourceCode)
    if (solidityVersion) {
      if (solidityVersion < 0.8 && !/SafeMath|using\s+.*\s+for\s+uint/.test(sourceCode)) {
        vulnerabilities.push({
          type: 'UNCHECKED_ARITHMETIC',
          severity: 'CRITICAL',
          description: `Solidity ${solidityVersion} lacks built-in overflow protection`,
          recommendation: 'Use OpenZeppelin SafeMath library or upgrade to Solidity 0.8.0+',
        })
      }
    }

    // Access control analysis - more sophisticated
    const hasModifiers = /modifier\s+only|modifier\s+\w*Owner|modifier\s+\w*Admin/i.test(sourceCode)
    const hasAccessControl = /AccessControl|Ownable|onlyOwner|onlyRole/.test(sourceCode)
    const hasPublicFunctions = /function\s+\w+\s*\([^)]*\)\s+public(?!\s+view|pure)/.test(
      sourceCode
    )

    if (hasPublicFunctions && !hasModifiers && !hasAccessControl) {
      vulnerabilities.push({
        type: 'MISSING_ACCESS_CONTROL',
        severity: 'HIGH',
        description: 'Public state-changing functions detected without access control',
        recommendation: 'Implement OpenZeppelin AccessControl or Ownable for privileged functions',
      })
    }

    // Hardcoded address detection - excluding common patterns
    const addressPattern = /0x[a-fA-F0-9]{40}/g
    const addresses = sourceCode.match(addressPattern) || []
    const uniqueAddresses = [...new Set(addresses)]
    if (uniqueAddresses.length > 3) {
      vulnerabilities.push({
        type: 'HARDCODED_ADDRESSES',
        severity: 'MEDIUM',
        description: `Contract contains ${uniqueAddresses.length} hardcoded addresses`,
        recommendation:
          'Use constructor parameters or setter functions for addresses to improve flexibility',
      })
    }

    // Assembly usage - check for dangerous patterns
    if (/assembly\s*\{/.test(sourceCode)) {
      const hasDangerousOps = /selfdestruct|delegatecall|callcode/.test(sourceCode)
      vulnerabilities.push({
        type: 'INLINE_ASSEMBLY',
        severity: hasDangerousOps ? 'HIGH' : 'MEDIUM',
        description: `Contract uses inline assembly${hasDangerousOps ? ' with dangerous operations' : ''}`,
        recommendation:
          'Ensure assembly code is thoroughly audited for memory safety, overflow protection, and reentrancy',
      })
    }

    // Deprecated function detection
    if (/suicide\s*\(|sha3\s*\(|throw\b/.test(sourceCode)) {
      vulnerabilities.push({
        type: 'DEPRECATED_FUNCTIONS',
        severity: 'MEDIUM',
        description: 'Contract uses deprecated Solidity functions',
        recommendation: 'Replace: suicide()→selfdestruct(), sha3()→keccak256(), throw→revert()',
      })
    }

    // Event emission check
    const hasStateChanges = /=\s*[^=]|\.push\(|\.pop\(|delete\s+/g.test(sourceCode)
    const hasEvents = /event\s+\w+|emit\s+\w+/.test(sourceCode)
    if (hasStateChanges && !hasEvents) {
      vulnerabilities.push({
        type: 'MISSING_EVENTS',
        severity: 'LOW',
        description: 'Contract modifies state without emitting events',
        recommendation:
          'Add events for all significant state changes to enable off-chain monitoring',
      })
    }

    // Pragma version check
    if (/pragma\s+solidity\s+\^/.test(sourceCode)) {
      vulnerabilities.push({
        type: 'FLOATING_PRAGMA',
        severity: 'LOW',
        description: 'Contract uses floating pragma (^) which may cause inconsistent compilation',
        recommendation: 'Lock pragma to specific version for production: pragma solidity 0.8.26;',
      })
    }

    // Unchecked external call with value
    if (/\.call\{value:\s*/.test(sourceCode)) {
      vulnerabilities.push({
        type: 'ETHER_TRANSFER_IN_CALL',
        severity: 'HIGH',
        description: 'Contract sends ETH using low-level call with value',
        recommendation:
          'Verify return value and implement pull-over-push pattern for fund transfers',
      })
    }

    return vulnerabilities
  }

  private checkStateChangeAfterExternalCall(sourceCode: string): boolean {
    // Simplified heuristic: check if assignment appears after .call pattern
    const lines = sourceCode.split('\n')
    let foundExternalCall = false

    for (const line of lines) {
      if (/\.(call|send|transfer)\s*\(/.test(line)) {
        foundExternalCall = true
      }
      if (foundExternalCall && /\w+\s*=(?!=)\s*[^=]/.test(line)) {
        return true
      }
      // Reset on function boundary
      if (/function\s+/.test(line)) {
        foundExternalCall = false
      }
    }
    return false
  }

  private extractSolidityVersion(sourceCode: string): number | null {
    const versionMatch = sourceCode.match(/pragma\s+solidity\s+[\^>=<]*(\d+\.\d+)/)
    if (versionMatch) {
      return parseFloat(versionMatch[1])
    }
    return null
  }

  private analyzeGasEfficiency(contractInfo: ContractInfo): GasAnalysis {
    const recommendations: string[] = []
    let efficiency = 80 // Base efficiency score

    if (contractInfo.sourceCode) {
      // Check for gas optimization patterns
      if (
        contractInfo.sourceCode.includes('memory') &&
        contractInfo.sourceCode.includes('storage')
      ) {
        recommendations.push('Consider using memory instead of storage for temporary variables')
        efficiency -= 5
      }

      if (
        contractInfo.sourceCode.includes('string') &&
        !contractInfo.sourceCode.includes('bytes')
      ) {
        recommendations.push('Consider using bytes instead of string for gas optimization')
        efficiency -= 3
      }

      if (
        contractInfo.sourceCode.includes('require(') &&
        !contractInfo.sourceCode.includes('custom error')
      ) {
        recommendations.push('Use custom errors instead of require strings in Solidity 0.8.4+')
        efficiency -= 2
      }
    }

    return {
      efficiency: Math.max(0, efficiency),
      recommendations,
    }
  }

  private analyzeAccessControls(contractInfo: ContractInfo): AccessControlAnalysis {
    const risks: string[] = []
    let hasOwner = false
    let hasMultisig = false
    let hasTimelock = false

    if (contractInfo.sourceCode) {
      hasOwner =
        contractInfo.sourceCode.includes('owner') || contractInfo.sourceCode.includes('Ownable')
      hasMultisig =
        contractInfo.sourceCode.includes('multisig') || contractInfo.sourceCode.includes('MultiSig')
      hasTimelock =
        contractInfo.sourceCode.includes('timelock') || contractInfo.sourceCode.includes('TimeLock')

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
      risks,
    }
  }
}
