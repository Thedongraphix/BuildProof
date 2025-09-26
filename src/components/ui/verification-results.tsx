"use client"

import { VerificationResult } from "@/hooks/useContractVerification"
import { CheckCircle, AlertTriangle, XCircle, Shield, Gauge, Key } from "lucide-react"

interface VerificationResultsProps {
  result: VerificationResult
}

export function VerificationResults({ result }: VerificationResultsProps) {
  const { contractInfo, securityAnalysis } = result

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'HIGH': return 'text-orange-400'
      case 'CRITICAL': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'LOW': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'MEDIUM': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'HIGH': return <AlertTriangle className="w-5 h-5 text-orange-400" />
      case 'CRITICAL': return <XCircle className="w-5 h-5 text-red-400" />
      default: return <Shield className="w-5 h-5 text-gray-400" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Contract Info */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 accent-blue" />
          Contract Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Address:</span>
            <p className="text-white font-mono break-all">{contractInfo.address}</p>
          </div>
          <div>
            <span className="text-gray-400">Verification Status:</span>
            <p className={contractInfo.isVerified ? 'text-green-400' : 'text-yellow-400'}>
              {contractInfo.isVerified ? 'Verified on Etherscan' : 'Unverified'}
            </p>
          </div>
          {contractInfo.contractName && (
            <div>
              <span className="text-gray-400">Contract Name:</span>
              <p className="text-white">{contractInfo.contractName}</p>
            </div>
          )}
          {contractInfo.compiler && (
            <div>
              <span className="text-gray-400">Compiler:</span>
              <p className="text-white">{contractInfo.compiler}</p>
            </div>
          )}
        </div>
      </div>

      {/* Security Score */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Gauge className="w-5 h-5 mr-2 accent-blue" />
          Security Assessment
        </h3>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {getRiskIcon(securityAnalysis.riskLevel)}
            <span className={`ml-2 font-semibold ${getRiskColor(securityAnalysis.riskLevel)}`}>
              {securityAnalysis.riskLevel} RISK
            </span>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${getScoreColor(securityAnalysis.score)}`}>
              {securityAnalysis.score}/100
            </div>
            <div className="text-gray-400 text-sm">Security Score</div>
          </div>
        </div>

        {/* Risk Level Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              securityAnalysis.score >= 90 ? 'bg-green-400' :
              securityAnalysis.score >= 70 ? 'bg-yellow-400' :
              securityAnalysis.score >= 50 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            style={{ width: `${securityAnalysis.score}%` }}
          ></div>
        </div>
      </div>

      {/* Vulnerabilities */}
      {securityAnalysis.vulnerabilities.length > 0 && (
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 accent-blue" />
            Security Issues ({securityAnalysis.vulnerabilities.length})
          </h3>
          <div className="space-y-4">
            {securityAnalysis.vulnerabilities.map((vuln, index) => (
              <div key={index} className="border border-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-white">{vuln.type.replace(/_/g, ' ')}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(vuln.severity)} bg-gray-800`}>
                    {vuln.severity}
                  </span>
                </div>
                <p className="text-gray-300 mb-2">{vuln.description}</p>
                <div className="text-sm">
                  <span className="text-gray-400">Recommendation: </span>
                  <span className="text-gray-300">{vuln.recommendation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Access Controls */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Key className="w-5 h-5 mr-2 accent-blue" />
          Access Control Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center">
            {securityAnalysis.accessControls.hasOwner ?
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" /> :
              <XCircle className="w-4 h-4 text-gray-400 mr-2" />
            }
            <span className="text-gray-300">Owner Controls</span>
          </div>
          <div className="flex items-center">
            {securityAnalysis.accessControls.hasMultisig ?
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" /> :
              <XCircle className="w-4 h-4 text-gray-400 mr-2" />
            }
            <span className="text-gray-300">Multi-signature</span>
          </div>
          <div className="flex items-center">
            {securityAnalysis.accessControls.hasTimelock ?
              <CheckCircle className="w-4 h-4 text-green-400 mr-2" /> :
              <XCircle className="w-4 h-4 text-gray-400 mr-2" />
            }
            <span className="text-gray-300">Timelock</span>
          </div>
        </div>

        {securityAnalysis.accessControls.risks.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Recommendations:</h4>
            <ul className="space-y-1">
              {securityAnalysis.accessControls.risks.map((risk, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start">
                  <span className="text-yellow-400 mr-2">•</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Gas Optimization */}
      <div className="card p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Gauge className="w-5 h-5 mr-2 accent-blue" />
          Gas Optimization
        </h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-300">Efficiency Score</span>
          <span className={`font-semibold ${getScoreColor(securityAnalysis.gasOptimization.efficiency)}`}>
            {securityAnalysis.gasOptimization.efficiency}%
          </span>
        </div>

        {securityAnalysis.gasOptimization.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-2">Optimization Suggestions:</h4>
            <ul className="space-y-1">
              {securityAnalysis.gasOptimization.recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}