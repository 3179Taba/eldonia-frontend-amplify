'use client'

import { useState } from 'react'
import { Bell, Calendar, Video, MessageCircle, Star, User, Settings, Save, X } from 'lucide-react'
import Link from 'next/link'

interface NotificationSettings {
  creator_events: boolean
  creator_videos: boolean
  creator_posts: boolean
  system_announcements: boolean
  friend_messages: boolean
  email_notifications: boolean
  push_notifications: boolean
  quiet_hours: {
    enabled: boolean
    start: string
    end: string
  }
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSettings>({
    creator_events: true,
    creator_videos: true,
    creator_posts: false,
    system_announcements: true,
    friend_messages: true,
    email_notifications: true,
    push_notifications: true,
    quiet_hours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  })

  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleQuietHoursToggle = () => {
    setSettings(prev => ({
      ...prev,
      quiet_hours: {
        ...prev.quiet_hours,
        enabled: !prev.quiet_hours.enabled
      }
    }))
  }

  const handleQuietHoursChange = (field: 'start' | 'end', value: string) => {
    setSettings(prev => ({
      ...prev,
      quiet_hours: {
        ...prev.quiet_hours,
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // 実際のAPI呼び出しをここに追加
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const notificationTypes = [
    {
      key: 'creator_events' as keyof NotificationSettings,
      title: '作者のイベント',
      description: '登録している作者が新しいイベントを開催した時',
      icon: Calendar,
      color: 'text-orange-500'
    },
    {
      key: 'creator_videos' as keyof NotificationSettings,
      title: '作者の動画',
      description: '登録している作者が新しい動画をアップロードした時',
      icon: Video,
      color: 'text-red-500'
    },
    {
      key: 'creator_posts' as keyof NotificationSettings,
      title: '作者の投稿',
      description: '登録している作者が新しい作品を投稿した時',
      icon: User,
      color: 'text-green-500'
    },
    {
      key: 'system_announcements' as keyof NotificationSettings,
      title: 'システムお知らせ',
      description: 'Eldonia-Nexからの重要なお知らせ',
      icon: Star,
      color: 'text-yellow-500'
    },
    {
      key: 'friend_messages' as keyof NotificationSettings,
      title: '友達からのメッセージ',
      description: '友達からメッセージが届いた時',
      icon: MessageCircle,
      color: 'text-blue-500'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="p-2 text-white/70 hover:text-white transition-colors hover-glow"
            >
              <X className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-playfair font-bold golden-text">通知設定</h1>
              <p className="text-white/70 mt-1">通知の種類と配信方法を管理できます</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-magic-500 to-magic-600 text-white rounded-lg font-semibold hover:from-magic-600 hover:to-magic-700 transition-all duration-300 hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存
              </>
            )}
          </button>
        </div>

        {/* 成功メッセージ */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 font-semibold">設定が正常に保存されました</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 通知の種類 */}
          <div className="glass-effect rounded-lg p-6 cosmic-border">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-magic-400" />
              <h2 className="text-xl font-semibold text-white">通知の種類</h2>
            </div>
            
            <div className="space-y-4">
              {notificationTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <div
                    key={type.key}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-5 h-5 ${type.color}`} />
                      <div>
                        <h3 className="font-medium text-white">{type.title}</h3>
                        <p className="text-sm text-white/70">{type.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[type.key] as boolean}
                        onChange={() => handleToggle(type.key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-magic-500"></div>
                    </label>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 配信方法 */}
          <div className="glass-effect rounded-lg p-6 cosmic-border">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="w-6 h-6 text-magic-400" />
              <h2 className="text-xl font-semibold text-white">配信方法</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h3 className="font-medium text-white">アプリ内通知</h3>
                  <p className="text-sm text-white/70">ブラウザ内で通知を表示</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.push_notifications}
                    onChange={() => handleToggle('push_notifications')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-magic-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                <div>
                  <h3 className="font-medium text-white">メール通知</h3>
                  <p className="text-sm text-white/70">重要な通知をメールで送信</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.email_notifications}
                    onChange={() => handleToggle('email_notifications')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-magic-500"></div>
                </label>
              </div>
            </div>

            {/* 静寂時間設定 */}
            <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-white">静寂時間</h3>
                  <p className="text-sm text-white/70">指定した時間帯は通知を停止</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.quiet_hours.enabled}
                    onChange={handleQuietHoursToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-magic-500"></div>
                </label>
              </div>
              
              {settings.quiet_hours.enabled && (
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1">開始時間</label>
                    <input
                      type="time"
                      value={settings.quiet_hours.start}
                      onChange={(e) => handleQuietHoursChange('start', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-magic-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1">終了時間</label>
                    <input
                      type="time"
                      value={settings.quiet_hours.end}
                      onChange={(e) => handleQuietHoursChange('end', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-magic-400 transition-colors"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="mt-8 glass-effect rounded-lg p-6 cosmic-border">
          <h2 className="text-xl font-semibold text-white mb-4">通知統計</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-magic-400">24</div>
              <div className="text-sm text-white/70">今週の通知</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-magic-400">3</div>
              <div className="text-sm text-white/70">未読通知</div>
            </div>
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="text-2xl font-bold text-magic-400">85%</div>
              <div className="text-sm text-white/70">通知開封率</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 