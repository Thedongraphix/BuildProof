"use client"

import { useState } from 'react'
import { Download, FileText, FileJson, Table, Share2, Link as LinkIcon, Copy, Badge } from 'lucide-react'

export function ExportPanel() {
  const [shareLink, setShareLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)

  const generateShareLink = () => {
    const link = `${window.location.origin}/share/${Math.random().toString(36).slice(2, 10)}`
    setShareLink(link)
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const exportFormats = [
    {
      name: 'PDF Report',
      description: 'Comprehensive verification report',
      icon: FileText,
      color: 'red',
      action: () => alert('Exporting PDF...')
    },
    {
      name: 'JSON Data',
      description: 'Machine-readable format',
      icon: FileJson,
      color: 'blue',
      action: () => alert('Exporting JSON...')
    },
    {
      name: 'CSV Table',
      description: 'Spreadsheet compatible',
      icon: Table,
      color: 'green',
      action: () => alert('Exporting CSV...')
    },
    {
      name: 'Verification Badge',
      description: 'Embed on website',
      icon: Badge,
      color: 'purple',
      action: () => alert('Generating badge...')
    }
  ]

  return (
    <div className="card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-500/10 rounded">
          <Download className="text-green-400" size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Export & Share</h3>
          <p className="text-sm text-gray-400">Download reports and share results</p>
        </div>
      </div>

      {/* Export Formats */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-white mb-3">Export Formats</h4>
        <div className="grid grid-cols-2 gap-3">
          {exportFormats.map((format, index) => {
            const Icon = format.icon
            return (
              <button
                key={index}
                onClick={format.action}
                className="card p-4 border border-gray-800 hover:border-blue-500/30 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 bg-${format.color}-500/10 rounded group-hover:bg-${format.color}-500/20 transition-colors`}>
                    <Icon className={`text-${format.color}-400`} size={20} />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-white mb-1">{format.name}</h5>
                    <p className="text-xs text-gray-400">{format.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Share Link */}
      <div className="space-y-3 border-t border-gray-800 pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Share2 size={16} className="text-blue-400" />
            Share Verification
          </h4>
          {!shareLink && (
            <button
              onClick={generateShareLink}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Generate Link
            </button>
          )}
        </div>

        {shareLink && (
          <div className="fade-in">
            <div className="flex items-center gap-2 p-3 border border-gray-800 rounded bg-gray-900/20">
              <LinkIcon className="text-gray-400 flex-shrink-0" size={16} />
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 bg-transparent text-sm text-white outline-none font-mono"
              />
              <button
                onClick={copyShareLink}
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <Copy size={14} />
                {linkCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this link to give others access to this verification report
            </p>
          </div>
        )}
      </div>

      {/* Embed Badge */}
      <div className="space-y-3 border-t border-gray-800 pt-4">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Badge size={16} className="text-purple-400" />
          Verification Badge
        </h4>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-full">
          <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
          </svg>
          <span className="text-sm font-semibold text-white">Verified by BuildProof</span>
        </div>
        <p className="text-xs text-gray-500">
          Add this badge to your website or documentation to show verification status
        </p>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 text-center pt-3 border-t border-gray-800">
        Exports available in PDF, JSON, and CSV formats • Share links valid for 30 days
      </div>
    </div>
  )
}
