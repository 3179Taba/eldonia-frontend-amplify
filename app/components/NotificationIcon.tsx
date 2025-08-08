'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Settings, User, Video, Calendar, MessageCircle, Star } from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'creator_event' | 'creator_video' | 'system_announcement' | 'friend_message' | 'creator_post'
  title: string
  message: string
  timestamp: Date
  read: boolean
  creator?: {
    id: string
    name: string
    avatar: string
  }
  link?: string
}

export default function NotificationIcon() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // デモ用の通知データ
  useEffect(() => {
    const demoNotifications: Notification[] = [
      {
        id: '1',
        type: 'creator_event',
        title: '新イベント開催',
        message: '登録している作者「ファンタジーアート」が新しいイベントを開催します',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30分前
        read: false,
        creator: {
          id: 'creator1',
          name: 'ファンタジーアート',
          avatar: '/images/avatars/creator1.jpg'
        },
        link: '/events/new-fantasy-event'
      },
      {
        id: '2',
        type: 'creator_video',
        title: '新動画アップロード',
        message: '「コスミックデザイン」が新しい動画をアップロードしました',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2時間前
        read: false,
        creator: {
          id: 'creator2',
          name: 'コスミックデザイン',
          avatar: '/images/avatars/creator2.jpg'
        },
        link: '/videos/new-cosmic-video'
      },
      {
        id: '3',
        type: 'system_announcement',
        title: 'Eldonia-Nexからのお知らせ',
        message: '新しい機能「AI翻訳」がリリースされました',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1日前
        read: true,
        link: '/announcements/ai-translation-release'
      },
      {
        id: '4',
        type: 'friend_message',
        title: '友達からのメッセージ',
        message: 'ユーザー「マジックワールド」からメッセージが届いています',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2日前
        read: false,
        link: '/messages/friend-message'
      },
      {
        id: '5',
        type: 'creator_post',
        title: '新投稿',
        message: '「ネオンデザイン」が新しい作品を投稿しました',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3日前
        read: true,
        creator: {
          id: 'creator3',
          name: 'ネオンデザイン',
          avatar: '/images/avatars/creator3.jpg'
        },
        link: '/posts/neon-design-new-work'
      }
    ]

    setNotifications(demoNotifications)
    setUnreadCount(demoNotifications.filter(n => !n.read).length)
  }, [])

  // ドロップダウンの外側をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'creator_event':
        return <Calendar className="h-4 w-4 text-orange-500" />
      case 'creator_video':
        return <Video className="h-4 w-4 text-red-500" />
      case 'system_announcement':
        return <Star className="h-4 w-4 text-yellow-500" />
      case 'friend_message':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'creator_post':
        return <User className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}分前`
    } else if (hours < 24) {
      return `${hours}時間前`
    } else {
      return `${days}日前`
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 通知ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white/70 hover:text-white transition-colors cursor-pointer hover-glow"
        aria-label="通知を開く"
      >
        <Bell className="w-6 h-6" />
        {/* 未読通知数バッジ */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知ドロップダウン */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-black/80 rounded-lg shadow-2xl shadow-magic-500/20 z-50 backdrop-blur-xl animate-fade-in-down">
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 bg-transparent">
            <h3 className="text-lg font-semibold text-white">通知</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-magic-400 hover:text-magic-300 transition-colors"
                >
                  すべて既読
                </button>
              )}
              <Link
                href="/settings?tab=notifications"
                className="text-xs text-magic-400 hover:text-magic-300 transition-colors"
              >
                設定
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 通知リスト */}
          <div className="max-h-96 overflow-y-auto bg-transparent">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-white/50 mx-auto mb-2" />
                <p className="text-white/70 text-sm">通知はありません</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-white/5' : ''
                    }`}
                    onClick={() => {
                      markAsRead(notification.id)
                      if (notification.link) {
                        window.location.href = notification.link
                      }
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-white truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-magic-400 rounded-full flex-shrink-0 ml-2"></div>
                          )}
                        </div>
                        <p className="text-xs text-white/70 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.creator && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                              <span className="text-xs text-white font-bold">
                                {notification.creator.name.charAt(0)}
                              </span>
                            </div>
                            <span className="text-xs text-magic-400">
                              {notification.creator.name}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-white/50 mt-2">
                          {getTimeAgo(notification.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* フッター */}
          {notifications.length > 0 && (
            <div className="p-3 bg-transparent">
              <Link
                href="/notifications"
                className="block text-center text-sm text-magic-400 hover:text-magic-300 transition-colors"
              >
                すべての通知を見る
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 