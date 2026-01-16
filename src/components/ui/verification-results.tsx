'use client'

import { VerificationResult } from '@/hooks/useContractVerification'
import { SourceCodeViewer } from './source-code-viewer'
import { ExportButton } from './export-button'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Shield,
  Key,
  AlertOctagon,
  Info,
  TrendingUp,
  Activity,
} from 'lucide-react'

interface VerificationResultsProps {
  result: VerificationResult
}

export function VerificationResults({ result }: VerificationResultsProps) {
  const { contractInfo, securityAnalysis } = result

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'text-blue-400'
      case 'MEDIUM':
        return 'text-yellow-400'
      case 'HIGH':
        return 'text-orange-400'
      case 'CRITICAL':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const getRiskBgColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'MEDIUM':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'HIGH':
        return 'bg-orange-500/10 border-orange-500/20'
      case 'CRITICAL':
        return 'bg-red-500/10 border-red-500/20'
      default:
        return 'bg-gray-500/10 border-gray-500/20'
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return <Shield className="w-6 h-6 text-blue-400" />
      case 'MEDIUM':
        return <AlertTriangle className="w-6 h-6 text-yellow-400" />
      case 'HIGH':
        return <AlertOctagon className="w-6 h-6 text-orange-400" />
      case 'CRITICAL':
        return <XCircle className="w-6 h-6 text-red-400" />
      default:
        return <Info className="w-6 h-6 text-gray-400" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-blue-400'
    if (score >= 70) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBarColor = (score: number) => {
    if (score >= 90) return 'bg-blue-500'
    if (score >= 70) return 'bg-yellow-500'
    if (score >= 50) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'HIGH':
        return <AlertOctagon className="w-5 h-5 text-orange-400" />
      case 'MEDIUM':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      case 'LOW':
        return <Info className="w-5 h-5 text-blue-400" />
      default:
        return <Info className="w-5 h-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6 mt-8 fade-in">
      {/* Export Button */}
      <div className="flex justify-end">
        <ExportButton result={result} />
      </div>

      {/* Security Score - Hero Section */}
      <div className={`card border-2 p-8 ${getRiskBgColor(securityAnalysis.riskLevel)}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">{getRiskIcon(securityAnalysis.riskLevel)}</div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Security Assessment</h3>
              <p className={`text-lg font-semibold ${getRiskColor(securityAnalysis.riskLevel)}`}>
                {securityAnalysis.riskLevel} RISK LEVEL
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {securityAnalysis.vulnerabilities.length} issue
                {securityAnalysis.vulnerabilities.length !== 1 ? 's' : ''} detected
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div
              className={`text-5xl font-bold ${getScoreColor(securityAnalysis.score)} tabular-nums`}
            >
              {securityAnalysis.score}
            </div>
            <div className="text-gray-400 text-sm mt-1">Security Score</div>
            <div className="w-40 bg-gray-800/50 rounded-full h-3 mt-3">
              <div
                className={`h-3 rounded-full transition-all duration-1000 ${getScoreBarColor(securityAnalysis.score)}`}
                style={{ width: `${securityAnalysis.score}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Info */}
      <div className="card border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center border-b border-gray-800 pb-3">
          <Activity className="w-5 h-5 mr-2 text-blue-400" />
          Contract Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-gray-500 text-xs uppercase tracking-wide">Address</span>
            <p className="text-white font-mono text-sm break-all">{contractInfo.address}</p>
          </div>
          <div className="space-y-1">
            <span className="text-gray-500 text-xs uppercase tracking-wide">
              Verification Status
            </span>
            <div className="flex items-center gap-2">
              {contractInfo.isVerified ? (
                <CheckCircle className="w-4 h-4 text-blue-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
              )}
              <p
                className={
                  contractInfo.isVerified
                    ? 'text-blue-400 font-medium'
                    : 'text-yellow-400 font-medium'
                }
              >
                {contractInfo.isVerified ? 'Verified on Etherscan' : 'Unverified'}
              </p>
            </div>
          </div>
          {contractInfo.contractName && (
            <div className="space-y-1">
              <span className="text-gray-500 text-xs uppercase tracking-wide">Contract Name</span>
              <p className="text-white font-medium">{contractInfo.contractName}</p>
            </div>
          )}
          {contractInfo.compiler && (
            <div className="space-y-1">
              <span className="text-gray-500 text-xs uppercase tracking-wide">
                Compiler Version
              </span>
              <p className="text-white font-mono text-sm">{contractInfo.compiler}</p>
            </div>
          )}
        </div>
      </div>

      {/* Vulnerabilities */}
      {securityAnalysis.vulnerabilities.length > 0 && (
        <div className="card border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center justify-between border-b border-gray-800 pb-3">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-blue-400" />
              Security Issues
            </div>
            <span className="text-sm text-gray-400 font-normal">
              {securityAnalysis.vulnerabilities.length} found
            </span>
          </h3>
          <div className="space-y-3">
            {securityAnalysis.vulnerabilities.map((vuln, index) => (
              <div
                key={index}
                className={`border p-5 hover:bg-gray-900/30 transition-colors ${getRiskBgColor(vuln.severity)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">{getSeverityIcon(vuln.severity)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h4 className="font-semibold text-white text-base">
                        {vuln.type
                          .replace(/_/g, ' ')
                          .toLowerCase()
                          .replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <span
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wide ${getRiskColor(vuln.severity)} bg-black/30 whitespace-nowrap`}
                      >
                        {vuln.severity}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{vuln.description}</p>
                    <div className="bg-black/20 border-l-2 border-blue-500/50 pl-4 py-2">
                      <span className="text-gray-500 text-xs uppercase tracking-wide block mb-1">
                        Recommendation
                      </span>
                      <p className="text-gray-300 text-sm leading-relaxed">{vuln.recommendation}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Access Controls & Gas Optimization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Access Controls */}
        <div className="card border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center border-b border-gray-800 pb-3">
            <Key className="w-5 h-5 mr-2 text-blue-400" />
            Access Control
          </h3>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-900/30 border border-gray-800">
              <span className="text-gray-300 text-sm">Owner Controls</span>
              {securityAnalysis.accessControls.hasOwner ? (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-900/30 border border-gray-800">
              <span className="text-gray-300 text-sm">Multi-signature</span>
              {securityAnalysis.accessControls.hasMultisig ? (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-900/30 border border-gray-800">
              <span className="text-gray-300 text-sm">Timelock Protection</span>
              {securityAnalysis.accessControls.hasTimelock ? (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-600" />
              )}
            </div>
          </div>

          {securityAnalysis.accessControls.risks.length > 0 && (
            <div className="border-t border-gray-800 pt-4">
              <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                Recommendations
              </h4>
              <ul className="space-y-2">
                {securityAnalysis.accessControls.risks.map((risk, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Gas Optimization */}
        <div className="card border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center border-b border-gray-800 pb-3">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Gas Optimization
          </h3>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Efficiency Score</span>
              <span
                className={`text-2xl font-bold tabular-nums ${getScoreColor(securityAnalysis.gasOptimization.efficiency)}`}
              >
                {securityAnalysis.gasOptimization.efficiency}%
              </span>
            </div>
            <div className="w-full bg-gray-800/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${getScoreBarColor(securityAnalysis.gasOptimization.efficiency)}`}
                style={{ width: `${securityAnalysis.gasOptimization.efficiency}%` }}
              ></div>
            </div>
          </div>

          {securityAnalysis.gasOptimization.recommendations.length > 0 && (
            <div className="border-t border-gray-800 pt-4">
              <h4 className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                Optimization Suggestions
              </h4>
              <ul className="space-y-2">
                {securityAnalysis.gasOptimization.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Source Code Viewer */}
      <SourceCodeViewer contractInfo={contractInfo} />
    </div>
  )
}
