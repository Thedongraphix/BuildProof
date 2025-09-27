"use client"

import { useState } from 'react'
import { ContractInfo } from "@/lib/contract-verification"
import { Code, Download, Copy, Check } from "lucide-react"

interface SourceCodeViewerProps {
  contractInfo: ContractInfo
}

export function SourceCodeViewer({ contractInfo }: SourceCodeViewerProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'source' | 'abi' | 'bytecode'>('source')

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatSourceCode = (sourceCode: string) => {
    // Basic Solidity syntax highlighting
    return sourceCode
      .replace(/(pragma|contract|function|modifier|event|struct|enum|mapping|address|uint|bytes|string|bool)\b/g, '<span class="text-blue-400">$1</span>')
      .replace(/(public|private|internal|external|view|pure|payable|constant)\b/g, '<span class="text-green-400">$1</span>')
      .replace(/(if|else|for|while|do|require|assert|revert|return)\b/g, '<span class="text-yellow-400">$1</span>')
      .replace(/\/\/.*/g, '<span class="text-gray-500">$&</span>')
      .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500">$&</span>')
  }

  if (!contractInfo.isVerified && !contractInfo.bytecode) {
    return (
      <div className="card p-6">
        <div className="text-center text-gray-400">
          <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Source code not available for this contract</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center">
          <Code className="w-5 h-5 mr-2 accent-blue" />
          Contract Code
        </h3>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {contractInfo.sourceCode && (
            <button
              onClick={() => setActiveTab('source')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'source'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Source
            </button>
          )}
          {contractInfo.abi && (
            <button
              onClick={() => setActiveTab('abi')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeTab === 'abi'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ABI
            </button>
          )}
          <button
            onClick={() => setActiveTab('bytecode')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activeTab === 'bytecode'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Bytecode
          </button>
        </div>
      </div>

      {/* Source Code Tab */}
      {activeTab === 'source' && contractInfo.sourceCode && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">
              <span className="font-medium">Contract:</span> {contractInfo.contractName || 'Unknown'}
              {contractInfo.compiler && (
                <span className="ml-4">
                  <span className="font-medium">Compiler:</span> {contractInfo.compiler}
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleCopy(contractInfo.sourceCode!)}
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleDownload(contractInfo.sourceCode!, `${contractInfo.contractName || 'contract'}.sol`)}
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
              <code
                dangerouslySetInnerHTML={{
                  __html: formatSourceCode(contractInfo.sourceCode)
                }}
              />
            </pre>
          </div>
        </div>
      )}

      {/* ABI Tab */}
      {activeTab === 'abi' && contractInfo.abi && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">
              Application Binary Interface (ABI)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleCopy(JSON.stringify(contractInfo.abi, null, 2))}
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleDownload(JSON.stringify(contractInfo.abi, null, 2), `${contractInfo.contractName || 'contract'}-abi.json`)}
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
              {JSON.stringify(contractInfo.abi, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Bytecode Tab */}
      {activeTab === 'bytecode' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-400">
              Contract Bytecode ({contractInfo.bytecode.length} characters)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleCopy(contractInfo.bytecode)}
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                onClick={() => handleDownload(contractInfo.bytecode, `${contractInfo.contractName || 'contract'}-bytecode.txt`)}
                className="flex items-center space-x-1 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono break-all">
              {contractInfo.bytecode}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}