'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'

import { apiClient } from '../../lib/api'
import {
  Settings,
  BarChart3,
  Activity,
  TrendingUp,
  MessageCircle,
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  LogOut
} from 'lucide-react'

interface AIServiceStats {
  total_suggestions: number
  total_translations: number
  active_users: number
  accuracy_rate: number
  response_time_avg: number
  daily_requests: number
  weekly_growth: number
  error_rate: number
}

interface ServiceStatus {
  name: string
  status: 'active' | 'inactive' | 'error'
  uptime: string
  response_time: number
  requests_today: number
  last_error?: string
}



export default function AIServicesManagementPage() {
  const { isAuthenticated, login, logout, user } = useAuth()
  const [stats, setStats] = useState<AIServiceStats | null>(null)
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // ログインフォーム用の状態
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')



  useEffect(() => {
    if (isAuthenticated) {
      fetchAIServiceData()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const fetchAIServiceData = async () => {
    try {
      // モックデータ（実際のAPIに置き換える）
      const mockStats: AIServiceStats = {
        total_suggestions: 15420,
        total_translations: 8920,
        active_users: 156,
        accuracy_rate: 94.2,
        response_time_avg: 1.8,
        daily_requests: 2340,
        weekly_growth: 12.5,
        error_rate: 2.1
      }

      const mockServices: ServiceStatus[] = [
        {
          name: 'パーソナライズサジェスト',
          status: 'active',
          uptime: '99.9%',
          response_time: 0.8,
          requests_today: 1240
        },
        {
          name: '翻訳サービス',
          status: 'active',
          uptime: '99.7%',
          response_time: 2.1,
          requests_today: 890
        },
        {
          name: 'コンテンツ分析',
          status: 'active',
          uptime: '99.5%',
          response_time: 3.2,
          requests_today: 210
        },
        {
          name: '感情分析',
          status: 'error',
          uptime: '95.2%',
          response_time: 5.8,
          requests_today: 0,
          last_error: 'API接続エラー'
        }
      ]

      setStats(mockStats)
      setServices(mockServices)
    } catch (error) {
      console.error('AIサービスデータの取得に失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"><CheckCircle className="h-3 w-3" />アクティブ</span>
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex items-center gap-1"><Pause className="h-3 w-3" />停止中</span>
      case 'error':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1"><AlertTriangle className="h-3 w-3" />エラー</span>
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1"><Clock className="h-3 w-3" />不明</span>
    }
  }

  const handleServiceAction = async (serviceName: string, action: string) => {
    try {
      console.log(`${serviceName}の${action}を実行中...`)
      // 実際のAPIコールをここに実装
      await new Promise(resolve => setTimeout(resolve, 1000)) // モック遅延
      fetchAIServiceData() // データを再取得
    } catch (error) {
      console.error('サービスアクションエラー:', error)
    }
  }

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }))
    if (loginError) setLoginError('')
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    setLoginSuccess('')

    try {
      const data = await apiClient.login(loginData)

      setLoginSuccess('ログインに成功しました。AIサービス管理画面を読み込み中...')

      // ログイン処理 - 認証コンテキストのlogin関数に合わせて修正
      login(data.user, data.token)

      // データを取得
      setTimeout(() => {
        fetchAIServiceData()
      }, 1500)
    } catch (err: any) {
      setLoginError(err.message || 'ログインに失敗しました。ユーザー名とパスワードを確認してください。')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setLoginData({
      username: 'admin',
      password: 'admin123'
    })

    setLoginLoading(true)
    setLoginError('')
    setLoginSuccess('')

    try {
      const data = await apiClient.login({
        username: 'admin',
        password: 'admin123'
      })

      setLoginSuccess('デモログインに成功しました。AIサービス管理画面を読み込み中...')

      // ログイン処理 - 認証コンテキストのlogin関数に合わせて修正
      login(data.user, data.token)

      // データを取得
      setTimeout(() => {
        fetchAIServiceData()
      }, 1500)
    } catch (err: any) {
      setLoginError(err.message || 'デモログインに失敗しました。')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      // ログアウト後は自動的にログインフォームが表示される
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">総サジェスト数</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_suggestions.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+{stats?.weekly_growth}% 今週</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">翻訳リクエスト</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.total_translations.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1">今日: {stats?.daily_requests}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg text-white">
              <MessageCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">精度率</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.accuracy_rate}%</p>
              <p className="text-sm text-purple-600 mt-1">高精度</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg text-white">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">平均応答時間</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.response_time_avg}s</p>
              <p className="text-sm text-orange-600 mt-1">高速</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg text-white">
              <Activity className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* サービスステータス */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">サービスステータス</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{service.name}</h4>
                {getStatusBadge(service.status)}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>稼働率:</span>
                  <span className="font-medium">{service.uptime}</span>
                </div>
                <div className="flex justify-between">
                  <span>応答時間:</span>
                  <span className="font-medium">{service.response_time}s</span>
                </div>
                <div className="flex justify-between">
                  <span>今日のリクエスト:</span>
                  <span className="font-medium">{service.requests_today}</span>
                </div>
                {service.last_error && (
                  <div className="text-red-600 text-xs">
                    エラー: {service.last_error}
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => handleServiceAction(service.name, 'restart')}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  再起動
                </button>
                <button
                  onClick={() => handleServiceAction(service.name, service.status === 'active' ? 'stop' : 'start')}
                  className={`px-3 py-1 text-xs rounded transition-colors flex items-center gap-1 ${
                    service.status === 'active'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {service.status === 'active' ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {service.status === 'active' ? '停止' : '開始'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">AIサービス設定</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">パーソナライズ設定</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                サジェスト精度
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>高精度（遅い）</option>
                <option selected>バランス</option>
                <option>高速（低精度）</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最大サジェスト数
              </label>
              <input
                type="number"
                defaultValue="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">翻訳設定</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                翻訳エンジン
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option selected>Gemini</option>
                <option>OpenAI</option>
                <option>Azure</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                キャッシュ有効期限
              </label>
              <input
                type="number"
                defaultValue="3600"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            設定を保存
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            リセット
          </button>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">使用量トレンド</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">チャートがここに表示されます</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">精度分析</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">チャートがここに表示されます</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview()
      case 'settings':
        return renderSettings()
      case 'analytics':
        return renderAnalytics()
      default:
        return renderOverview()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* ヘッダー */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">管理画面ログイン</h2>
            <p className="mt-2 text-sm text-gray-600">
              Eldonia システムの管理画面にアクセスするにはログインしてください
            </p>
          </div>

          {/* ログインフォーム */}
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {/* エラーメッセージ */}
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{loginError}</p>
                </div>
              )}

              {/* 成功メッセージ */}
              {loginSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-700 text-sm">{loginSuccess}</p>
                </div>
              )}

              {/* ユーザー名 */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  ユーザー名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={loginData.username}
                    onChange={handleLoginInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white placeholder-gray-500"
                    placeholder="ユーザー名を入力"
                    disabled={loginLoading}
                  />
                </div>
              </div>

              {/* パスワード */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginData.password}
                    onChange={handleLoginInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white placeholder-gray-500"
                    placeholder="パスワードを入力"
                    disabled={loginLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={loginLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* ログインボタン */}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loginLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ログイン中...
                  </div>
                ) : (
                  'ログイン'
                )}
              </button>

              {/* デモログインボタン */}
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loginLoading}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                デモログイン（admin/admin123）
              </button>
            </form>

            {/* 追加情報 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  管理画面へのアクセスには管理者権限が必要です
                </p>
                <a
                  href="/"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← メインサイトに戻る
                </a>
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              © 2024 Eldonia. All rights reserved.
            </p>
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
              <h1 className="text-3xl font-bold text-gray-900">⚡ AIサービス管理</h1>
              <p className="text-gray-600 mt-1">AI機能と推奨システムの管理</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                最終更新: {new Date().toLocaleString('ja-JP')}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>管理者: {user?.username || 'Unknown'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                ログアウト
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                全サービス再起動
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">管理メニュー</h3>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left ${
                    activeTab === 'overview'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="h-5 w-5" />
                  <div>
                    <div>概要</div>
                    <div className="text-xs text-gray-500 font-normal">サービス状況と統計</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                  <div>
                    <div>設定</div>
                    <div className="text-xs text-gray-500 font-normal">AIサービス設定</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left ${
                    activeTab === 'analytics'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TrendingUp className="h-5 w-5" />
                  <div>
                    <div>分析</div>
                    <div className="text-xs text-gray-500 font-normal">使用量と精度分析</div>
                  </div>
                </button>
              </nav>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  )
}
