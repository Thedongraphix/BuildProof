"use client"

import { useState, useEffect } from 'react'

interface TerminalProps {
  output: string[]
  isLoading?: boolean
}

export function Terminal({ output, isLoading }: TerminalProps) {
  const [displayedOutput, setDisplayedOutput] = useState<string[]>([])

  useEffect(() => {
    if (output.length === 0) {
      setDisplayedOutput([])
      return
    }

    // Animate output line by line
    let currentIndex = 0
    setDisplayedOutput([])

    const interval = setInterval(() => {
      if (currentIndex < output.length) {
        setDisplayedOutput(prev => [...prev, output[currentIndex]])
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [output])

  const getLineIcon = (line: string) => {
    if (line.startsWith('ERROR') || line.includes('CRITICAL')) return '✖'
    if (line.startsWith('SUCCESS')) return '✓'
    if (line.startsWith('WARN')) return '⚠'
    if (line.startsWith('INFO')) return '●'
    return '›'
  }

  const getLineColor = (line: string) => {
    if (line.startsWith('ERROR') || line.includes('CRITICAL')) return 'text-red-400'
    if (line.startsWith('SUCCESS')) return 'text-blue-400'
    if (line.startsWith('WARN')) return 'text-yellow-400'
    if (line.startsWith('INFO')) return 'text-gray-400'
    return 'text-gray-500'
  }

  return (
    <div className="terminal-output card border border-gray-800 p-6 min-h-96 overflow-y-auto font-mono text-sm" role="log" aria-live="polite">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
        <div className="flex items-center">
          <span className="text-blue-400 mr-3 font-bold" aria-hidden="true">$</span>
          <span className="text-blue-400 font-semibold tracking-wide">BuildProof Security Verifier</span>
          <span className="ml-3 text-gray-600 text-xs">v2.1.0</span>
        </div>
        <div className="flex items-center gap-2" role="presentation">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500/60"></div>
        </div>
      </div>

      <div className="space-y-1.5" role="log">
        {displayedOutput.filter(line => line && typeof line === 'string').map((line, index) => (
          <div key={index} className="flex items-start gap-3 py-1.5 hover:bg-gray-900/20 transition-colors px-2 -mx-2">
            <span className={`${getLineColor(line)} text-sm mt-0.5 font-bold w-4 flex-shrink-0`} aria-hidden="true">
              {getLineIcon(line)}
            </span>
            <span
              className={`${getLineColor(line)} leading-relaxed`}
              role={line.startsWith('ERROR') ? 'alert' : 'status'}
            >
              {line}
            </span>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center text-blue-400 mt-6 py-3 border-t border-gray-800">
          <span className="mr-3 font-bold">●</span>
          <span>Processing contract verification</span>
          <div className="ml-3 flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}

      {displayedOutput.length > 0 && !isLoading && (
        <div className="flex items-center text-blue-400 mt-6 py-3 border-t border-gray-800">
          <span className="mr-3 font-bold">$</span>
          <span className="terminal-cursor">&nbsp;</span>
          <span className="text-gray-600 text-xs ml-3">Ready for next verification</span>
        </div>
      )}
    </div>
  )
}