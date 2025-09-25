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

  return (
    <div className="terminal-output card p-8 min-h-96 overflow-y-auto font-mono text-sm" role="log" aria-live="polite">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
        <div className="flex items-center accent-blue">
          <span className="mr-3" aria-hidden="true">$</span>
          <span className="typing-animation font-medium">BuildProof Enterprise Verifier v2.1.0</span>
        </div>
        <div className="flex items-center gap-2" role="presentation">
          <div className="w-3 h-3 rounded-full bg-red-500" aria-label="Close"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500" aria-label="Minimize"></div>
          <div className="w-3 h-3 rounded-full bg-green-500" aria-label="Maximize"></div>
        </div>
      </div>

      <div className="space-y-2" role="log">
        {displayedOutput.map((line, index) => (
          <div key={index} className="flex items-start gap-3 py-1">
            <span className="text-gray-600 text-xs mt-0.5 font-mono w-4" aria-hidden="true">›</span>
            <span
              className={
                line.startsWith('ERROR') ? 'status-error' :
                line.startsWith('SUCCESS') ? 'status-success' :
                line.startsWith('WARN') ? 'status-warning' :
                line.startsWith('INFO') ? 'status-info' :
                'text-gray-300'
              }
              role={line.startsWith('ERROR') ? 'alert' : 'status'}
            >
              {line}
            </span>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center status-info mt-4 py-2 border-t border-gray-800">
          <span className="mr-3 text-gray-600">›</span>
          <span>Processing contract verification</span>
          <div className="ml-2 flex gap-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
      )}

      {displayedOutput.length > 0 && !isLoading && (
        <div className="flex items-center accent-blue mt-4 py-2 border-t border-gray-800">
          <span className="mr-3">$</span>
          <span className="terminal-cursor">&nbsp;</span>
          <span className="text-gray-600 text-xs ml-2">Ready for next verification</span>
        </div>
      )}
    </div>
  )
}