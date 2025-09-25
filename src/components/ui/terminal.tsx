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
    <div className="terminal-output rounded-lg p-6 h-96 overflow-y-auto font-mono text-sm">
      <div className="flex items-center mb-4 text-green-400">
        <span className="mr-2">$</span>
        <span className="typing-animation">BuildProof Contract Verifier v1.0.0</span>
      </div>

      {displayedOutput.map((line, index) => (
        <div key={index} className="mb-1">
          <span className="text-gray-500 mr-2">›</span>
          <span className={
            line.startsWith('ERROR') ? 'text-red-400' :
            line.startsWith('SUCCESS') ? 'text-green-400' :
            line.startsWith('WARN') ? 'text-yellow-400' :
            line.startsWith('INFO') ? 'text-blue-400' :
            'text-gray-300'
          }>
            {line}
          </span>
        </div>
      ))}

      {isLoading && (
        <div className="flex items-center text-green-400">
          <span className="mr-2">›</span>
          <span>Verifying contract</span>
          <span className="animate-pulse ml-1">...</span>
        </div>
      )}

      {displayedOutput.length > 0 && !isLoading && (
        <div className="flex items-center text-green-400 mt-2">
          <span className="mr-2">$</span>
          <span className="terminal-cursor">&nbsp;</span>
        </div>
      )}
    </div>
  )
}