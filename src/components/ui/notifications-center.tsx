'use client'

import { useState } from 'react'
import { Bell, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

interface Notification {
  id: string
  type: 'success' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  read: boolean
  action?: { label: string; onClick: () => void }
}

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Verification Complete',
      message: 'Contract 0x742d...9c7a verified successfully',
      timestamp: Date.now() - 120000,
      read: false,
      action: { label: 'View Report', onClick: () => alert('View Report') },
    },
    {
      id: '2',
      type: 'warning',
      title: 'Security Alert',
      message: '2 critical vulnerabilities detected in recent verification',
      timestamp: Date.now() - 300000,
      read: false,
      action: { label: 'Review', onClick: () => alert('Review') },
    },
    {
      id: '3',
      type: 'info',
      title: 'New Template Available',
      message: 'ERC-1155 Multi-Token template is now available',
      timestamp: Date.now() - 600000,
      read: true,
    },
  ])

  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-400" size={18} />
      case 'warning':
        return <AlertTriangle className="text-yellow-400" size={18} />
      case 'info':
        return <Info className="text-blue-400" size={18} />
      default:
        return null
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5'
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5'
      case 'info':
        return 'border-blue-500/30 bg-blue-500/5'
      default:
        return 'border-gray-500/30 bg-gray-500/5'
    }
  }

  const formatTime = (timestamp: number) => {
    const mins = Math.floor((Date.now() - timestamp) / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    return `${hours}h ago`
  }

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-900/20 rounded transition-colors"
      >
        <Bell className="text-gray-400 hover:text-white transition-colors" size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 card p-4 space-y-3 z-50 fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">No notifications</div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`border rounded p-3 ${getColor(notification.type)} ${!notification.read ? 'border-l-4' : ''} cursor-pointer hover:bg-gray-900/20 transition-colors`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-white">{notification.title}</h4>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="text-gray-500 hover:text-white transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.timestamp)}
                        </span>
                        {notification.action && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              notification.action!.onClick()
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                          >
                            {notification.action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
