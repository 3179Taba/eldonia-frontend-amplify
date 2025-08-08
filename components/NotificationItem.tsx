'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bell, Heart, MessageCircle, UserPlus, Star, Eye } from 'lucide-react'

interface NotificationItemProps {
  notification: {
    id: string
    type: 'like' | 'comment' | 'follow' | 'mention' | 'system' | 'event' | 'achievement'
    title: string
    message: string
    is_read: boolean
    created_at: string
    sender?: {
      id: string
      username: string
      profile?: {
        first_name: string
        last_name: string
        avatar_url?: string
      }
    }
    target_url?: string
    metadata?: {
      post_id?: string
      event_id?: string
      achievement_type?: string
    }
  }
  onMarkAsRead?: (id: string) => void
}

export default function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const getNotificationIcon = (type: string) => {
    const icons = {
      like: <Heart className="w-5 h-5 text-red-500" />,
      comment: <MessageCircle className="w-5 h-5 text-blue-500" />,
      follow: <UserPlus className="w-5 h-5 text-green-500" />,
      mention: <Bell className="w-5 h-5 text-yellow-500" />,
      system: <Bell className="w-5 h-5 text-gray-500" />,
      event: <Star className="w-5 h-5 text-purple-500" />,
      achievement: <Star className="w-5 h-5 text-yellow-500" />
    }
    return icons[type as keyof typeof icons] || <Bell className="w-5 h-5 text-gray-500" />
  }

  const formatTime = (dateString: string) => {
    const now = new Date()
    const notificationDate = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return '今'
    if (diffInMinutes < 60) return `${diffInMinutes}分前`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}日前`
    
    return notificationDate.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
  }

  const handleClick = () => {
    if (!notification.is_read && onMarkAsRead) {
      onMarkAsRead(notification.id)
    }
  }

  return (
    <div 
      className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.is_read ? 'bg-blue-50' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-3">
        {/* アイコン */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(notification.type)}
        </div>

        {/* 通知内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* 送信者情報 */}
              {notification.sender && (
                <div className="flex items-center space-x-2 mb-1">
                  {notification.sender.profile?.avatar_url ? (
                    <Image
                      src={notification.sender.profile.avatar_url}
                      alt={notification.sender.username}
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {notification.sender.username.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {notification.sender.profile ? 
                      `${notification.sender.profile.first_name} ${notification.sender.profile.last_name}` :
                      notification.sender.username
                    }
                  </span>
                </div>
              )}

              {/* タイトル */}
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {notification.title}
              </h4>

              {/* メッセージ */}
              <p className="text-sm text-gray-600 mb-2">
                {notification.message}
              </p>

              {/* 時間 */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {formatTime(notification.created_at)}
                </span>
                
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      {notification.target_url && (
        <div className="mt-3 flex space-x-2">
          <Link
            href={notification.target_url}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            詳細を見る
          </Link>
          
          {notification.metadata?.post_id && (
            <Link
              href={`/post/${notification.metadata.post_id}`}
              className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              投稿を見る
            </Link>
          )}
          
          {notification.metadata?.event_id && (
            <Link
              href={`/events/${notification.metadata.event_id}`}
              className="px-3 py-1 text-xs border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              イベントを見る
            </Link>
          )}
        </div>
      )}
    </div>
  )
} 