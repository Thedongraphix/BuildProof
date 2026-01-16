import { VerificationResult } from '@/hooks/useContractVerification'

export interface ExportOptions {
  format: 'json' | 'pdf' | 'csv'
  includeSourceCode: boolean
  includeBytecode: boolean
  includeFullABI: boolean
}

export class ReportExporter {
  static exportAsJSON(result: VerificationResult, options: ExportOptions): void {
    const report = this.generateJSONReport(result, options)
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    this.downloadBlob(blob, `contract-verification-report-${result.contractInfo.address}.json`)
  }

  static exportAsCSV(result: VerificationResult): void {
    const csvContent = this.generateCSVReport(result)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    this.downloadBlob(blob, `contract-verification-report-${result.contractInfo.address}.csv`)
  }

  static exportAsPDF(result: VerificationResult): void {
    // For PDF export, we'll generate an HTML version that can be printed as PDF
    const htmlContent = this.generateHTMLReport(result)
    const blob = new Blob([htmlContent], { type: 'text/html' })
    this.downloadBlob(blob, `contract-verification-report-${result.contractInfo.address}.html`)
  }

  private static generateJSONReport(
    result: VerificationResult,
    options: ExportOptions
  ): Record<string, unknown> {
    const { contractInfo, securityAnalysis, steps } = result

    const report: Record<string, unknown> = {
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        toolVersion: 'BuildProof v1.0',
        contractAddress: contractInfo.address,
        networkUsed: 'Ethereum Mainnet', // TODO: Get from context
      },
      contractInfo: {
        address: contractInfo.address,
        isVerified: contractInfo.isVerified,
        contractName: contractInfo.contractName,
        compiler: contractInfo.compiler,
      },
      securityAnalysis: {
        riskLevel: securityAnalysis.riskLevel,
        score: securityAnalysis.score,
        vulnerabilities: securityAnalysis.vulnerabilities,
        gasOptimization: securityAnalysis.gasOptimization,
        accessControls: securityAnalysis.accessControls,
      },
      verificationSteps: steps.map(step => ({
        message: step.message,
        type: step.type,
        timestamp: new Date(step.timestamp).toISOString(),
      })),
    }

    if (options.includeSourceCode && contractInfo.sourceCode) {
      ;(report.contractInfo as Record<string, unknown>).sourceCode = contractInfo.sourceCode
    }

    if (options.includeBytecode && contractInfo.bytecode) {
      ;(report.contractInfo as Record<string, unknown>).bytecode = contractInfo.bytecode
    }

    if (options.includeFullABI && contractInfo.abi) {
      ;(report.contractInfo as Record<string, unknown>).abi = contractInfo.abi
    }

    return report
  }

  private static generateCSVReport(result: VerificationResult): string {
    const { contractInfo, securityAnalysis } = result

    let csv = 'Field,Value\n'
    csv += `Contract Address,${contractInfo.address}\n`
    csv += `Verification Status,${contractInfo.isVerified ? 'Verified' : 'Unverified'}\n`
    csv += `Contract Name,${contractInfo.contractName || 'Unknown'}\n`
    csv += `Compiler Version,${contractInfo.compiler || 'Unknown'}\n`
    csv += `Risk Level,${securityAnalysis.riskLevel}\n`
    csv += `Security Score,${securityAnalysis.score}/100\n`
    csv += `Total Vulnerabilities,${securityAnalysis.vulnerabilities.length}\n`

    // Add vulnerabilities
    csv += '\nVulnerability Type,Severity,Description,Recommendation\n'
    securityAnalysis.vulnerabilities.forEach(vuln => {
      csv += `"${vuln.type}","${vuln.severity}","${vuln.description.replace(/"/g, '""')}","${vuln.recommendation.replace(/"/g, '""')}"\n`
    })

    // Add access controls
    csv += '\nAccess Control,Status\n'
    csv += `Owner Controls,${securityAnalysis.accessControls.hasOwner ? 'Yes' : 'No'}\n`
    csv += `Multi-signature,${securityAnalysis.accessControls.hasMultisig ? 'Yes' : 'No'}\n`
    csv += `Timelock,${securityAnalysis.accessControls.hasTimelock ? 'Yes' : 'No'}\n`

    // Add gas optimization
    csv += '\nGas Optimization\n'
    csv += `Efficiency Score,${securityAnalysis.gasOptimization.efficiency}%\n`
    securityAnalysis.gasOptimization.recommendations.forEach((rec, index) => {
      csv += `Recommendation ${index + 1},"${rec.replace(/"/g, '""')}"\n`
    })

    return csv
  }

  private static generateHTMLReport(result: VerificationResult): string {
    const { contractInfo, securityAnalysis, steps } = result

    const riskColors = {
      LOW: '#10b981',
      MEDIUM: '#f59e0b',
      HIGH: '#f97316',
      CRITICAL: '#ef4444',
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contract Verification Report - ${contractInfo.address}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f9fafb;
        }
        .header {
            background: linear-gradient(135deg, #1e40af, #3b82f6);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .section {
            background: white;
            padding: 25px;
            margin-bottom: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .section h2 {
            color: #1e40af;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .risk-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            color: white;
            font-weight: bold;
            margin: 5px 0;
        }
        .vulnerability {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .vulnerability h4 {
            margin: 0 0 10px 0;
            color: #1f2937;
        }
        .severity {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
            color: white;
        }
        .score {
            font-size: 3em;
            font-weight: bold;
            text-align: center;
            margin: 20px 0;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        .stat {
            text-align: center;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 8px;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #1e40af;
        }
        .stat-label {
            color: #6b7280;
            font-size: 0.9em;
        }
        @media print {
            body { background: white; }
            .section { box-shadow: none; border: 1px solid #e5e7eb; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 BuildProof Security Report</h1>
        <p>Smart Contract Verification & Security Analysis</p>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>

    <div class="section">
        <h2>Contract Overview</h2>
        <div class="grid">
            <div class="stat">
                <div class="stat-value">${contractInfo.isVerified ? '✓' : '✗'}</div>
                <div class="stat-label">Verification Status</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: ${riskColors[securityAnalysis.riskLevel]}">${securityAnalysis.score}</div>
                <div class="stat-label">Security Score</div>
            </div>
            <div class="stat">
                <div class="stat-value">${securityAnalysis.vulnerabilities.length}</div>
                <div class="stat-label">Issues Found</div>
            </div>
        </div>

        <p><strong>Contract Address:</strong> <code>${contractInfo.address}</code></p>
        <p><strong>Contract Name:</strong> ${contractInfo.contractName || 'Unknown'}</p>
        <p><strong>Compiler Version:</strong> ${contractInfo.compiler || 'Unknown'}</p>

        <div style="margin-top: 20px;">
            <span class="risk-badge" style="background-color: ${riskColors[securityAnalysis.riskLevel]}">
                ${securityAnalysis.riskLevel} RISK
            </span>
        </div>
    </div>

    ${
      securityAnalysis.vulnerabilities.length > 0
        ? `
    <div class="section">
        <h2>Security Vulnerabilities (${securityAnalysis.vulnerabilities.length})</h2>
        ${securityAnalysis.vulnerabilities
          .map(
            vuln => `
            <div class="vulnerability">
                <h4>${vuln.type.replace(/_/g, ' ')}</h4>
                <span class="severity" style="background-color: ${riskColors[vuln.severity]}">${vuln.severity}</span>
                <p><strong>Description:</strong> ${vuln.description}</p>
                <p><strong>Recommendation:</strong> ${vuln.recommendation}</p>
            </div>
        `
          )
          .join('')}
    </div>
    `
        : ''
    }

    <div class="section">
        <h2>Access Control Analysis</h2>
        <div class="grid">
            <div class="stat">
                <div class="stat-value">${securityAnalysis.accessControls.hasOwner ? '✓' : '✗'}</div>
                <div class="stat-label">Owner Controls</div>
            </div>
            <div class="stat">
                <div class="stat-value">${securityAnalysis.accessControls.hasMultisig ? '✓' : '✗'}</div>
                <div class="stat-label">Multi-signature</div>
            </div>
            <div class="stat">
                <div class="stat-value">${securityAnalysis.accessControls.hasTimelock ? '✓' : '✗'}</div>
                <div class="stat-label">Timelock</div>
            </div>
        </div>

        ${
          securityAnalysis.accessControls.risks.length > 0
            ? `
            <h3>Recommendations:</h3>
            <ul>
                ${securityAnalysis.accessControls.risks.map(risk => `<li>${risk}</li>`).join('')}
            </ul>
        `
            : ''
        }
    </div>

    <div class="section">
        <h2>Gas Optimization</h2>
        <p><strong>Efficiency Score:</strong> ${securityAnalysis.gasOptimization.efficiency}%</p>

        ${
          securityAnalysis.gasOptimization.recommendations.length > 0
            ? `
            <h3>Optimization Recommendations:</h3>
            <ul>
                ${securityAnalysis.gasOptimization.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        `
            : ''
        }
    </div>

    <div class="section">
        <h2>Verification Process</h2>
        <div style="font-family: monospace; background: #f3f4f6; padding: 15px; border-radius: 8px;">
            ${steps
              .map(
                step => `
                <div style="margin-bottom: 5px;">
                    <span style="color: ${step.type === 'ERROR' ? '#ef4444' : step.type === 'SUCCESS' ? '#10b981' : step.type === 'WARN' ? '#f59e0b' : '#6b7280'}">[${step.type}]</span>
                    ${step.message}
                </div>
            `
              )
              .join('')}
        </div>
    </div>

    <div class="section">
        <h2>Disclaimer</h2>
        <p><small>
            This report is generated by BuildProof automated security analysis tools. While comprehensive,
            it should not replace professional security audits for production systems. The analysis is based
            on publicly available contract bytecode and source code (if verified). Results may vary based on
            contract complexity and deployment context.
        </small></p>
    </div>
</body>
</html>
    `
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
