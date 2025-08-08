'use client'

import { useState, useEffect } from 'react'
import { Bell, Calendar, Video, MessageCircle, Star, User, Trash2, Check, Filter, Search } from 'lucide-react'
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  // デモ用の通知データ
  useEffect(() => {
    const demoNotifications: Notification[] = [
      {
        id: '1',
        type: 'creator_event',
        title: '新イベント開催',
        message: '登録している作者「ファンタジーアート」が新しいイベントを開催します。詳細はこちらからご確認ください。',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
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
        message: '「コスミックデザイン」が新しい動画をアップロードしました。最新の作品をお楽しみください。',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
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
        message: '新しい機能「AI翻訳」がリリースされました。多言語対応がさらに向上しました。',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
        link: '/announcements/ai-translation-release'
      },
      {
        id: '4',
        type: 'friend_message',
        title: '友達からのメッセージ',
        message: 'ユーザー「マジックワールド」からメッセージが届いています。返信をお待ちしています。',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        read: false,
        link: '/messages/friend-message'
      },
      {
        id: '5',
        type: 'creator_post',
        title: '新投稿',
        message: '「ネオンデザイン」が新しい作品を投稿しました。美しいアートワークをご覧ください。',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        read: true,
        creator: {
          id: 'creator3',
          name: 'ネオンデザイン',
          avatar: '/images/avatars/creator3.jpg'
        },
        link: '/posts/neon-design-new-work'
      },
      {
        id: '6',
        type: 'creator_event',
        title: 'ライブ配信開始',
        message: '「サイバーパンクアート」がライブ配信を開始しました。リアルタイムで作品制作をお楽しみください。',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
        read: true,
        creator: {
          id: 'creator4',
          name: 'サイバーパンクアート',
          avatar: '/images/avatars/creator4.jpg'
        },
        link: '/live/cyberpunk-art-stream'
      }
    ]

    setNotifications(demoNotifications)
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' ||
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read)

    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.creator?.name.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markSelectedAsRead = () => {
    setNotifications(prev =>
      prev.map(notification =>
        selectedNotifications.includes(notification.id)
          ? { ...notification, read: true }
          : notification
      )
    )
    setSelectedNotifications([])
  }

  const deleteSelected = () => {
    setNotifications(prev =>
      prev.filter(notification => !selectedNotifications.includes(notification.id))
    )
    setSelectedNotifications([])
  }

  const toggleSelection = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    )
  }



  const clearSelection = () => {
    setSelectedNotifications([])
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'creator_event':
        return <Calendar className="h-5 w-5 text-orange-500" />
      case 'creator_video':
        return <Video className="h-5 w-5 text-red-500" />
      case 'system_announcement':
        return <Star className="h-5 w-5 text-yellow-500" />
      case 'friend_message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'creator_post':
        return <User className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
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

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 text-white/70 hover:text-white transition-colors hover-glow"
            >
              <Bell className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-playfair font-bold golden-text">通知</h1>
              <p className="text-white/70 mt-1">
                {unreadCount}件の未読通知があります
              </p>
            </div>
          </div>
          <Link
            href="/settings/notifications"
            className="px-4 py-2 bg-gradient-to-r from-magic-500 to-magic-600 text-white rounded-lg font-semibold hover:from-magic-600 hover:to-magic-700 transition-all duration-300 hover-glow"
          >
            設定
          </Link>
        </div>

        {/* フィルターと検索 */}
        <div className="glass-effect rounded-lg p-6 cosmic-border mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* 検索 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input
                type="text"
                placeholder="通知を検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-magic-400 transition-colors"
              />
            </div>

            {/* フィルター */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/50" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread' | 'read')}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-magic-400 transition-colors"
              >
                <option value="all">すべて</option>
                <option value="unread">未読</option>
                <option value="read">既読</option>
              </select>
            </div>
          </div>

          {/* 選択アクション */}
          {selectedNotifications.length > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
              <span className="text-sm text-white/70">
                {selectedNotifications.length}件選択中
              </span>
              <button
                onClick={markSelectedAsRead}
                className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                <Check className="w-4 h-4" />
                既読にする
              </button>
              <button
                onClick={deleteSelected}
                className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                削除
              </button>
              <button
                onClick={clearSelection}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                選択解除
              </button>
            </div>
          )}
        </div>

        {/* 通知リスト */}
        <div className="glass-effect rounded-lg cosmic-border">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">通知がありません</h3>
              <p className="text-white/70">
                {searchTerm ? '検索条件に一致する通知が見つかりませんでした' : '新しい通知が届くとここに表示されます'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-white/5 transition-colors ${
                    !notification.read ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* 選択チェックボックス */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => toggleSelection(notification.id)}
                      className="mt-2 w-4 h-4 text-magic-500 bg-white/10 border-white/20 rounded focus:ring-magic-500 focus:ring-2"
                    />

                    {/* 通知アイコン */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* 通知内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {notification.title}
                          </h3>
                          <p className="text-white/70 mb-3 leading-relaxed">
                            {notification.message}
                          </p>

                          {notification.creator && (
                            <div className="flex items-center gap-2 mb-3">
                              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <span className="text-xs text-white font-bold">
                                  {notification.creator.name.charAt(0)}
                                </span>
                              </div>
                              <span className="text-sm text-magic-400 font-medium">
                                {notification.creator.name}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm text-white/50">
                            <span>{getTimeAgo(notification.timestamp)}</span>
                            {!notification.read && (
                              <span className="px-2 py-1 bg-magic-500/20 text-magic-400 rounded-full text-xs">
                                未読
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex items-center gap-3 mt-4">
                        {notification.link && (
                          <Link
                            href={notification.link}
                            className="px-4 py-2 bg-gradient-to-r from-magic-500 to-magic-600 text-white rounded-lg text-sm font-medium hover:from-magic-600 hover:to-magic-700 transition-all duration-300 hover-glow"
                            onClick={() => markAsRead(notification.id)}
                          >
                            詳細を見る
                          </Link>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="px-4 py-2 bg-white/10 text-white/70 rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                          >
                            既読にする
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ページネーション */}
        {filteredNotifications.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <p className="text-white/70 text-sm">
              {filteredNotifications.length}件の通知を表示中
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors">
                前へ
              </button>
              <span className="px-3 py-1 text-white">1</span>
              <button className="px-3 py-1 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors">
                次へ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
