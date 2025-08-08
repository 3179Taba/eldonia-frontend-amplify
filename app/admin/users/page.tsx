'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { useI18n } from '../../lib/i18n-provider'
import { usePrivilegedOperation } from '../../../lib/hooks/usePrivilegedOperation'
import UserImportPanel from './UserImportPanel'
import {
  Users,
  Search,
  Edit,
  Trash2,
  Eye,
  Shield,
  Mail,
  Calendar,
  Activity,
  TrendingUp,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Lock,
  EyeOff,
  User,
  Filter,
  MoreVertical
} from 'lucide-react'

interface UserProfile {
  id: number
  user: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_verified: boolean
  is_public: boolean
  is_active: boolean
  date_joined: string
  total_artworks: number
  total_followers: number
  total_following: number
  total_interests: number
  total_searches: number
  total_interactions: number
  created_at: string
  updated_at: string
  last_login: string
}

export default function UserManagementPage() {
  const { isAuthenticated } = useAuth()
  const { manageUsers, loading: privilegedLoading } = usePrivilegedOperation()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)

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
      fetchUsers()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, fetchUsers])

  const fetchUsers = React.useCallback(async () => {
    try {
      // 特権操作フックを使用してユーザー一覧を取得
      const result = await manageUsers('list')

      if (result.error) {
        console.error('ユーザー取得エラー:', result.error)
        return
      }

      setUsers(Array.isArray(result.data) ? result.data : result.data?.results || result.data?.users || []);
    } catch (err) {
      console.error('ユーザー取得エラー:', err)
    } finally {
      setLoading(false)
    }
  }, [manageUsers])

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active) ||
      (filterStatus === 'verified' && user.is_verified) ||
      (filterStatus === 'unverified' && !user.is_verified)

    return matchesSearch && matchesFilter
  })

  const handleUserAction = async (userId: number, action: string) => {
    try {
      // 特権操作フックを使用してユーザーアクションを実行
      const result = await manageUsers(action as 'create' | 'update' | 'delete', {
        userId,
        action
      })

      if (result.error) {
        console.error('アクション実行エラー:', result.error)
        return
      }

      fetchUsers() // ユーザーリストを再取得
    } catch (err) {
      console.error('アクション実行エラー:', err)
    }
  }

  const getStatusBadge = (user: UserProfile) => {
    if (!user.is_active) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">非アクティブ</span>
    }
    if (user.is_verified) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">認証済み</span>
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">未認証</span>
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
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      const data = await response.json()

      if (response.ok) {
        setLoginSuccess('ログインに成功しました。ユーザー管理画面を読み込み中...')

        // ログイン処理
        await login(data.user, data.token)

        // 統計を取得
        setTimeout(() => {
          fetchUsers()
        }, 1500)
      } else {
        setLoginError(data.error || 'ログインに失敗しました。ユーザー名とパスワードを確認してください。')
      }
    } catch {
      setLoginError('ネットワークエラーが発生しました。接続を確認してください。')
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
      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLoginSuccess('デモログインに成功しました。ユーザー管理画面を読み込み中...')

        // ログイン処理
        await login(data.user, data.token)

        // 統計を取得
        setTimeout(() => {
          fetchUsers()
        }, 1500)
      } else {
        setLoginError('デモログインに失敗しました。')
      }
    } catch {
      setLoginError('デモログインでエラーが発生しました。')
    } finally {
      setLoginLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* ロゴ・ヘッダー */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              管理画面ログイン
            </h1>
            <p className="text-gray-600">
              Eldonia システムの管理画面にアクセス
            </p>
          </div>

          {/* ログインフォーム */}
          <div className="bg-white rounded-xl shadow-lg border p-8">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
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
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
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
              <h1 className="text-3xl font-bold text-gray-900">👥 ユーザー管理</h1>
              <p className="text-gray-600 mt-1">ユーザーアカウントとプロフィールの管理</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {filteredUsers.length} 人のユーザー
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                新規ユーザー作成
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 特権操作エラー表示 */}
        {privilegedError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-800 font-medium">特権操作エラー</span>
            </div>
            <p className="text-red-700 mt-2">{privilegedError}</p>
          </div>
        )}

        {/* ユーザーインポート機能 */}
        <UserImportPanel />

        {/* 検索とフィルター */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ユーザーを検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべてのユーザー</option>
                <option value="active">アクティブ</option>
                <option value="inactive">非アクティブ</option>
                <option value="verified">認証済み</option>
                <option value="unverified">未認証</option>
              </select>
            </div>
          </div>
        </div>

        {/* ユーザー一覧 */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    統計
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最終ログイン
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Activity className="h-4 w-4" />
                            {user.total_interactions}
                          </span>
                          <span className="flex items-center gap-1">
                            <Search className="h-4 w-4" />
                            {user.total_searches}
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {user.total_interests}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.date_joined).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString('ja-JP')
                        : '未ログイン'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserDetail(true)
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user.user, user.is_active ? 'deactivate' : 'activate')}
                          className={`p-1 ${
                            user.is_active
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ユーザー詳細モーダル */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">ユーザー詳細</h3>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">基本情報</h4>
                  <p className="text-sm text-gray-600">名前: {selectedUser.first_name} {selectedUser.last_name}</p>
                  <p className="text-sm text-gray-600">ユーザー名: @{selectedUser.username}</p>
                  <p className="text-sm text-gray-600">メール: {selectedUser.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">統計情報</h4>
                  <p className="text-sm text-gray-600">相互作用: {selectedUser.total_interactions}</p>
                  <p className="text-sm text-gray-600">検索回数: {selectedUser.total_searches}</p>
                  <p className="text-sm text-gray-600">興味数: {selectedUser.total_interests}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900">アカウント情報</h4>
                <p className="text-sm text-gray-600">登録日: {new Date(selectedUser.date_joined).toLocaleString('ja-JP')}</p>
                <p className="text-sm text-gray-600">最終更新: {new Date(selectedUser.updated_at).toLocaleString('ja-JP')}</p>
                <p className="text-sm text-gray-600">最終ログイン: {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString('ja-JP') : '未ログイン'}</p>
              </div>

              <div className="flex gap-2 pt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  編集
                </button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
