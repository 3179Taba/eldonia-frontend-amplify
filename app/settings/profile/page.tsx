'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { apiClient } from '../../lib/api'
import { useI18n } from '../../lib/i18n-provider'
import { IntegratedUserProfile, UserSettings } from '../../lib/api'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Twitter,
  Instagram,
  MessageCircle,
  Camera,
  Save,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react'

export default function ProfileSettingsPage() {
  const { isAuthenticated } = useAuth()
  const { t } = useI18n()
  const [profile, setProfile] = useState<IntegratedUserProfile | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
      fetchSettings()
    }
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      const response = await apiClient.getUserProfile()
      if (response.success) {
        setProfile(response.data)
      }
    } catch (error) {
      console.error('プロフィール取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await apiClient.getUserSettings('all')
      if (response.success) {
        setSettings(response.data)
      }
    } catch (error) {
      console.error('設定取得エラー:', error)
    }
  }

  const handleProfileUpdate = async (field: string, value: any) => {
    if (!profile) return

    setProfile(prev => prev ? { ...prev, [field]: value } : null)
  }

  const saveProfile = async () => {
    if (!profile) return

    setSaving(true)
    try {
      const updateData = {
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        cover_image_url: profile.cover_image_url,
        website: profile.website,
        hobbies: profile.hobbies,
        location: profile.location,
        twitter: profile.twitter,
        instagram: profile.instagram,
        discord: profile.discord,
      }

      const response = await apiClient.updateUserProfile(updateData)
      if (response.success) {
        alert('プロフィールを更新しました')
      }
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      alert('プロフィールの更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = async (type: 'notification' | 'language' | 'visibility', settings: any) => {
    try {
      const response = await apiClient.updateUserSettings({ type, settings })
      if (response.success) {
        alert('設定を更新しました')
        fetchSettings()
      }
    } catch (error) {
      console.error('設定更新エラー:', error)
      alert('設定の更新に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">ログインが必要です</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">プロフィール設定</h1>

          {profile && (
            <div className="space-y-8">
              {/* 基本情報 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  基本情報
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ユーザー名
                    </label>
                    <input
                      type="text"
                      value={profile.username}
                      disabled
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      メールアドレス
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      自己紹介
                    </label>
                    <textarea
                      value={profile.bio || ''}
                      onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="自己紹介を入力してください"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      所在地
                    </label>
                    <input
                      type="text"
                      value={profile.location || ''}
                      onChange={(e) => handleProfileUpdate('location', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="所在地を入力してください"
                    />
                  </div>
                </div>
              </div>

              {/* ソーシャルメディア */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  ソーシャルメディア
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      ウェブサイト
                    </label>
                    <input
                      type="url"
                      value={profile.website || ''}
                      onChange={(e) => handleProfileUpdate('website', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </label>
                    <input
                      type="text"
                      value={profile.twitter || ''}
                      onChange={(e) => handleProfileUpdate('twitter', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="@username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={profile.instagram || ''}
                      onChange={(e) => handleProfileUpdate('instagram', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="username"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Discord
                    </label>
                    <input
                      type="text"
                      value={profile.discord || ''}
                      onChange={(e) => handleProfileUpdate('discord', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="username#1234"
                    />
                  </div>
                </div>
              </div>

              {/* 統計情報 */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-6">統計情報</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{profile.posts_count}</div>
                    <div className="text-sm text-gray-400">投稿数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{profile.followers_count}</div>
                    <div className="text-sm text-gray-400">フォロワー</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{profile.following_count}</div>
                    <div className="text-sm text-gray-400">フォロー</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{profile.likes_received}</div>
                    <div className="text-sm text-gray-400">いいね</div>
                  </div>
                </div>
              </div>

              {/* 保存ボタン */}
              <div className="flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
