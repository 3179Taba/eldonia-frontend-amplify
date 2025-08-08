'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { useI18n } from '../../lib/i18n-provider'
import {
  Settings,
  Database,
  Shield,
  Globe,
  Mail,
  Bell,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Server,
  HardDrive,
  Cpu
} from 'lucide-react'

interface SystemStatus {
  cpu: number
  memory: number
  disk: number
  network: {
    in: number
    out: number
  }
  uptime: number
  activeConnections: number
}

interface SystemSettings {
  siteName: string
  siteDescription: string
  maintenanceMode: boolean
  debugMode: boolean
  emailNotifications: boolean
  autoBackup: boolean
  maxUploadSize: number
  allowedFileTypes: string[]
}

export default function SystemPage() {
  const { isAuthenticated } = useAuth()
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchSystemData()
    }
  }, [isAuthenticated])

  const fetchSystemData = async () => {
    try {
      // モックデータ
      const mockStatus: SystemStatus = {
        cpu: 23.5,
        memory: 67.8,
        disk: 45.2,
        network: {
          in: 1024,
          out: 512
        },
        uptime: 86400, // 24時間
        activeConnections: 156
      }

      const mockSettings: SystemSettings = {
        siteName: 'Eldonia',
        siteDescription: 'アートコミュニティプラットフォーム',
        maintenanceMode: false,
        debugMode: false,
        emailNotifications: true,
        autoBackup: true,
        maxUploadSize: 10,
        allowedFileTypes: ['jpg', 'png', 'gif', 'mp4', 'mp3']
      }

      setSystemStatus(mockStatus)
      setSettings(mockSettings)
    } catch (error) {
      console.error('システムデータの取得に失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: keyof SystemSettings, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        [key]: value
      })
    }
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // 実際のAPI呼び出しをここに追加
      await new Promise(resolve => setTimeout(resolve, 1000)) // モック遅延

      setMessage({
        type: 'success',
        text: '設定が正常に保存されました。'
      })
    } catch {
      setMessage({
        type: 'error',
        text: '設定の保存に失敗しました。'
      })
    } finally {
      setSaving(false)
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (days > 0) {
      return `${days}日 ${hours}時間 ${minutes}分`
    } else if (hours > 0) {
      return `${hours}時間 ${minutes}分`
    } else {
      return `${minutes}分`
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">アクセス拒否</h2>
            <p className="text-red-600">このページにアクセスするには管理者権限が必要です。</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">⚙️ システム設定</h1>
              <p className="text-gray-600 mt-1">システム設定とメンテナンス</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? '保存中...' : '設定を保存'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* メッセージ */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* システムステータス */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Server className="h-5 w-5" />
                システムステータス
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">CPU使用率</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{systemStatus?.cpu}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${systemStatus?.cpu}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-gray-600">ディスク使用率</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{systemStatus?.disk}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${systemStatus?.disk}%` }}
                  ></div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">稼働時間</span>
                      <span className="font-medium">{systemStatus && formatUptime(systemStatus.uptime)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">アクティブ接続</span>
                      <span className="font-medium">{systemStatus?.activeConnections}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">ネットワーク受信</span>
                      <span className="font-medium">{systemStatus && formatBytes(systemStatus.network.in)}/s</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">ネットワーク送信</span>
                      <span className="font-medium">{systemStatus && formatBytes(systemStatus.network.out)}/s</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 設定フォーム */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">システム設定</h3>

              {settings && (
                <div className="space-y-6">
                  {/* 基本設定 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      基本設定
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          サイト名
                        </label>
                        <input
                          type="text"
                          value={settings.siteName}
                          onChange={(e) => handleSettingChange('siteName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          サイト説明
                        </label>
                        <input
                          type="text"
                          value={settings.siteDescription}
                          onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* システム設定 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      システム設定
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">メンテナンスモード</label>
                          <p className="text-xs text-gray-500">サイトを一時的に無効化</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">デバッグモード</label>
                          <p className="text-xs text-gray-500">開発用の詳細エラー表示</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.debugMode}
                            onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 通知設定 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      通知設定
                    </h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">メール通知</label>
                          <p className="text-xs text-gray-500">システム通知をメールで送信</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">自動バックアップ</label>
                          <p className="text-xs text-gray-500">定期的なデータベースバックアップ</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.autoBackup}
                            onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ファイル設定 */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      ファイル設定
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          最大アップロードサイズ (MB)
                        </label>
                        <input
                          type="number"
                          value={settings.maxUploadSize}
                          onChange={(e) => handleSettingChange('maxUploadSize', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          許可されたファイル形式
                        </label>
                        <input
                          type="text"
                          value={settings.allowedFileTypes.join(', ')}
                          onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value.split(', '))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="jpg, png, gif, mp4"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
