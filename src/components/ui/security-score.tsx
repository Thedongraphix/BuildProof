"use client"

import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react'

interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  count: number
}

interface SecurityScoreProps {
  score: number
  issues?: SecurityIssue[]
}

export function SecurityScore({ score = 85, issues = [] }: SecurityScoreProps) {
  const defaultIssues: SecurityIssue[] = issues.length > 0 ? issues : [
    {
      severity: 'critical',
      title: 'Reentrancy Vulnerabilities',
      description: 'Functions vulnerable to reentrancy attacks',
      count: 0
    },
    {
      severity: 'high',
      title: 'Unchecked External Calls',
      description: 'External calls without proper validation',
      count: 1
    },
    {
      severity: 'medium',
      title: 'Gas Optimization Issues',
      description: 'Functions that could be optimized',
      count: 3
    },
    {
      severity: 'low',
      title: 'Code Quality Issues',
      description: 'Minor code style and documentation issues',
      count: 5
    },
    {
      severity: 'info',
      title: 'Informational Findings',
      description: 'Best practice suggestions',
      count: 8
    }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 70) return 'text-yellow-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-500'
    if (score >= 70) return 'from-yellow-500 to-orange-500'
    if (score >= 50) return 'from-orange-500 to-red-500'
    return 'from-red-500 to-rose-500'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 95) return 'Excellent'
    if (score >= 85) return 'Good'
    if (score >= 70) return 'Fair'
    if (score >= 50) return 'Poor'
    return 'Critical'
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="text-red-400" size={16} />
      case 'high':
        return <AlertTriangle className="text-orange-400" size={16} />
      case 'medium':
        return <AlertTriangle className="text-yellow-400" size={16} />
      case 'low':
        return <Info className="text-blue-400" size={16} />
      case 'info':
        return <CheckCircle className="text-gray-400" size={16} />
      default:
        return null
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/30 bg-red-500/5 text-red-400'
      case 'high':
        return 'border-orange-500/30 bg-orange-500/5 text-orange-400'
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
      case 'low':
        return 'border-blue-500/30 bg-blue-500/5 text-blue-400'
      case 'info':
        return 'border-gray-500/30 bg-gray-500/5 text-gray-400'
      default:
        return ''
    }
  }

  const totalIssues = defaultIssues.reduce((sum, issue) => sum + issue.count, 0)
  const criticalCount = defaultIssues.filter(i => i.severity === 'critical' || i.severity === 'high').reduce((sum, i) => sum + i.count, 0)

  return (
    <div className="card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded">
          <Shield className="text-blue-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Security Analysis</h3>
          <p className="text-sm text-gray-400">Comprehensive security assessment</p>
        </div>
      </div>

      {/* Score Circle */}
      <div className="relative flex items-center justify-center">
        <div className="relative w-48 h-48">
          {/* Background Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="12"
              fill="none"
              className="text-gray-800"
            />
            {/* Progress Circle */}
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - score / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className={`stop-color-${getScoreGradient(score).split(' ')[0]}`} />
                <stop offset="100%" className={`stop-color-${getScoreGradient(score).split(' ')[2]}`} />
              </linearGradient>
            </defs>
          </svg>

          {/* Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-5xl font-bold ${getScoreColor(score)}`}>{score}</div>
            <div className="text-sm text-gray-500 mt-1">/ 100</div>
            <div className={`text-xs font-semibold uppercase mt-2 ${getScoreColor(score)}`}>
              {getScoreLabel(score)}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 border border-gray-800 rounded bg-gray-900/20">
          <div className="text-2xl font-bold text-white">{totalIssues}</div>
          <div className="text-xs text-gray-500 mt-1">Total Issues</div>
        </div>
        <div className="text-center p-3 border border-red-500/30 rounded bg-red-500/5">
          <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
          <div className="text-xs text-gray-500 mt-1">Critical/High</div>
        </div>
        <div className="text-center p-3 border border-green-500/30 rounded bg-green-500/5">
          <div className="text-2xl font-bold text-green-400">{100 - criticalCount}</div>
          <div className="text-xs text-gray-500 mt-1">Passed Checks</div>
        </div>
      </div>

      {/* Issues Breakdown */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-white mb-3">Security Issues</h4>
        {defaultIssues.map((issue, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 border rounded ${getSeverityColor(issue.severity)}`}
          >
            <div className="flex items-center gap-3 flex-1">
              {getSeverityIcon(issue.severity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{issue.title}</span>
                  <span className="text-xs uppercase font-bold opacity-70">
                    {issue.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{issue.description}</p>
              </div>
            </div>
            <div className="text-right ml-3">
              <div className="text-lg font-bold">{issue.count}</div>
              <div className="text-xs text-gray-500">found</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {criticalCount > 0 && (
        <div className="border border-orange-500/30 rounded p-4 bg-orange-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-orange-400 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h5 className="text-sm font-semibold text-orange-400 mb-1">Action Required</h5>
              <p className="text-xs text-gray-400">
                {criticalCount} critical or high severity issues detected. Review and fix these vulnerabilities before deployment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center pt-3 border-t border-gray-800">
        Analysis powered by BuildProof Security Engine • Last updated just now
      </div>
    </div>
  )
}
