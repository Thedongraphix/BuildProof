'use client'

import { useState } from 'react'
import { Bookmark, Star, Trash2, ExternalLink, Copy, Tag } from 'lucide-react'

interface BookmarkedContract {
  id: string
  address: string
  name: string
  network: string
  tags: string[]
  addedAt: number
}

export function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedContract[]>([
    {
      id: '1',
      address: '0x742d35c6d46ad0c8f121d0c0e98f5e6e9d8b9c7a',
      name: 'USDC Token',
      network: 'Ethereum',
      tags: ['ERC20', 'Stablecoin'],
      addedAt: Date.now() - 86400000,
    },
    {
      id: '2',
      address: '0x5b73c5498c1e3b4dba84de0f1833c4a029d90519',
      name: 'My NFT Collection',
      network: 'Base Sepolia',
      tags: ['ERC721', 'NFT'],
      addedAt: Date.now() - 172800000,
    },
  ])

  const [isExpanded, setIsExpanded] = useState(false)

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
  }

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
  }

  return (
    <div className="card p-6 space-y-4">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded">
            <Star className="text-yellow-400" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Bookmarked Contracts</h3>
            <p className="text-sm text-gray-400">{bookmarks.length} contracts saved</p>
          </div>
        </div>
        <span className="text-xs text-gray-400">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {/* Bookmarks List */}
      {isExpanded && (
        <div className="space-y-2 fade-in">
          {bookmarks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              No bookmarks yet. Add contracts to quickly access them later.
            </div>
          ) : (
            bookmarks.map(bookmark => (
              <div
                key={bookmark.id}
                className="border border-gray-800 rounded p-3 hover:border-yellow-500/30 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Bookmark className="text-yellow-400" size={14} />
                      <h4 className="text-sm font-semibold text-white">{bookmark.name}</h4>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-400">
                        {bookmark.address.slice(0, 10)}...{bookmark.address.slice(-8)}
                      </span>
                      <button
                        onClick={() => copyAddress(bookmark.address)}
                        className="text-gray-500 hover:text-blue-400 transition-colors"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                        {bookmark.network}
                      </span>
                      {bookmark.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400 flex items-center gap-1"
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        window.open(`https://etherscan.io/address/${bookmark.address}`, '_blank')
                      }
                      className="text-gray-500 hover:text-blue-400 transition-colors"
                    >
                      <ExternalLink size={16} />
                    </button>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
