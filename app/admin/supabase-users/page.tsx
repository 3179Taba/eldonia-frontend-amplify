'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'

import { useRouter } from 'next/navigation'
import { checkEnvironmentVariables } from '../../../lib/envHelper'
import {
  Users,
  Search,
  Trash2,
  Eye,
  Shield,
  Activity,
  TrendingUp,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Lock,
  EyeOff,
  User,
  Crown,
  CreditCard,
  Settings,
  AlertCircle,
  Info
} from 'lucide-react'

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  user_metadata: any
  app_metadata: any
}

interface Plan {
  id: string
  name: string
  price_monthly: number
  price_yearly: number
  stripe_price_id: string | null
  created_at: string
}

interface UserWithPlan extends User {
  plan?: Plan
  wallet_balance?: number
  total_posts?: number
  total_purchases?: number
}

export default function SupabaseUserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserWithPlan[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState<UserWithPlan | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  // 管理者認証チェック
  useEffect(() => {
    const run = async () => {
      try {
        setAuthLoading(true)

        // 現在のセッションを取得
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          console.error('認証エラー:', error)
          router.push('/admin/login')
          return
        }

        // ユーザーのロールを確認
        const userRole = session.user.app_metadata?.role

        if (userRole !== 'admin') {
          console.error('管理者権限がありません')
          router.push('/admin/login')
          return
        }

        setIsAdmin(true)
        // ここでデータ取得をインライン化（依存関係を安定化）
        try {
          setLoading(true)
          const [usersResult, plansResult] = await Promise.all([
            fetchUsers(),
            fetchPlans()
          ])
          const usersWithPlans = await enrichUsersWithPlans(usersResult)
          setUsers(usersWithPlans)
          setPlans(plansResult)
        } catch (error) {
          console.error('データ取得エラー:', error)
        } finally {
          setLoading(false)
        }
      } catch (error) {
        console.error('認証チェックエラー:', error)
        router.push('/admin/login')
      } finally {
        setAuthLoading(false)
      }
    }
    run()
  }, [router])

  // 削除: checkAdminAuth と fetchData（副作用内で代替実装済み）

  const fetchUsers = async (): Promise<User[]> => {
    try {
      // 現在のセッションからトークンを取得
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No access token available')
      }

      // サーバーサイドAPIを使用してユーザー一覧を取得
      const response = await fetch('/api/admin/users', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.users || []
    } catch (error) {
      console.error('ユーザー取得エラー:', error)
      return []
    }
  }

  const fetchPlans = async (): Promise<Plan[]> => {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price_monthly', { ascending: true })

    if (error) {
      console.error('プラン取得エラー:', error)
      return []
    }

    return data || []
  }

  const enrichUsersWithPlans = async (users: User[]): Promise<UserWithPlan[]> => {
    // 各ユーザーの追加情報を取得
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        try {
          // ウォレット情報を取得
          const { data: walletData } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single()

          // 投稿数を取得
          const { count: postsCount } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          // 購入数を取得
          const { count: purchasesCount } = await supabase
            .from('purchases')
            .select('*', { count: 'exact', head: true })
            .eq('buyer_id', user.id)

          return {
            ...user,
            wallet_balance: walletData?.balance || 0,
            total_posts: postsCount || 0,
            total_purchases: purchasesCount || 0
          }
        } catch (error) {
          console.error(`ユーザー ${user.id} の情報取得エラー:`, error)
          return {
            ...user,
            wallet_balance: 0,
            total_posts: 0,
            total_purchases: 0
          }
        }
      })
    )

    return enrichedUsers
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.user_metadata?.username || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && user.last_sign_in_at) ||
      (filterStatus === 'inactive' && !user.last_sign_in_at) ||
      (filterStatus === 'admin' && user.app_metadata?.role === 'admin')

    return matchesSearch && matchesFilter
  })

  const handleUserAction = async (userId: string, action: string) => {
    try {
      // 現在のセッションからトークンを取得
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No access token available')
      }

      if (action === 'delete') {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      } else if (action === 'make_admin') {
        const response = await fetch(`/api/admin/users/${userId}/promote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      } else if (action === 'remove_admin') {
        const response = await fetch(`/api/admin/users/${userId}/demote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        })
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      }

      // データを再取得
      fetchData()
    } catch (error) {
      console.error('アクション実行エラー:', error)
    }
  }



  const getStatusBadge = (user: UserWithPlan) => {
    if (user.app_metadata?.role === 'admin') {
      return <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
        <Crown className="w-3 h-3" />
        管理者
      </span>
    }
    if (user.last_sign_in_at) {
      return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">アクティブ</span>
    }
    return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">非アクティブ</span>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount)
  }

  // ローディング中または認証中
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証確認中...</p>
        </div>
      </div>
    )
  }

  // 環境変数の設定状況をチェック
  const envStatus = checkEnvironmentVariables()

  // 環境変数が設定されていない場合
  if (!envStatus.allConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Info className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">環境変数が設定されていません</h2>
          <p className="text-gray-600 mb-4">
            管理者機能を使用するには、必要な環境変数を設定してください。
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
            <h3 className="font-semibold text-yellow-800 mb-2">設定が必要な環境変数:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {envStatus.missingVars.map(varName => (
                <li key={varName}>• {varName}</li>
              ))}
            </ul>
          </div>
          <div className="text-sm text-gray-500">
            <p>📝 .env.localファイルに環境変数を設定してから</p>
            <p>サーバーを再起動してください。</p>
          </div>
        </div>
      </div>
    )
  }

  // 管理者でない場合
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">アクセス拒否</h2>
          <p className="text-gray-600 mb-4">このページにアクセスするには管理者権限が必要です。</p>
          <button
            onClick={() => router.push('/admin/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ログインページへ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Supabase ユーザー管理
          </h1>
          <p className="text-gray-600 mt-2">
            ユーザーとプランの管理、統計情報の確認
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">アクティブユーザー</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.last_sign_in_at).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">管理者</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.app_metadata?.role === 'admin').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">プラン数</p>
                <p className="text-2xl font-bold text-gray-900">{plans.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* フィルターと検索 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 検索 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="ユーザーを検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* フィルター */}
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">すべて</option>
                  <option value="active">アクティブ</option>
                  <option value="inactive">非アクティブ</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ユーザーリスト */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">ユーザー一覧</h2>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="bg-gray-200 rounded-full w-10 h-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
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
                      登録日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最終ログイン
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      統計
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.user_metadata?.username || user.email}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : '未ログイン'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>投稿: {user.total_posts}</div>
                          <div>購入: {user.total_purchases}</div>
                          <div>残高: {formatCurrency(user.wallet_balance || 0)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
                              setShowUserDetail(true)
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, user.app_metadata?.role === 'admin' ? 'remove_admin' : 'make_admin')}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            {user.app_metadata?.role === 'admin' ? <UserX className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* プラン管理セクション */}
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">プラン管理</h2>
            <button
              onClick={() => {
                setSelectedPlan(null)
                setShowPlanModal(true)
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              新規プラン作成
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                    <button
                      onClick={() => {
                        setSelectedPlan(plan)
                        setShowPlanModal(true)
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">月額:</span>
                      <span className="font-semibold">{formatCurrency(plan.price_monthly)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">年額:</span>
                      <span className="font-semibold">{formatCurrency(plan.price_yearly)}</span>
                    </div>
                    {plan.stripe_price_id && (
                      <div className="text-xs text-gray-500">
                        Stripe ID: {plan.stripe_price_id}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ユーザー詳細モーダル */}
      {showUserDetail && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">ユーザー詳細</h2>
              <button
                onClick={() => setShowUserDetail(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ユーザーID</label>
                <p className="text-sm text-gray-900">{selectedUser.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <p className="text-sm text-gray-900">{selectedUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ユーザー名</label>
                <p className="text-sm text-gray-900">{selectedUser.user_metadata?.username || '未設定'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">登録日</label>
                <p className="text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">最終ログイン</label>
                <p className="text-sm text-gray-900">
                  {selectedUser.last_sign_in_at ? formatDate(selectedUser.last_sign_in_at) : '未ログイン'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">統計情報</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">投稿数</div>
                    <div className="text-lg font-semibold">{selectedUser.total_posts}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">購入数</div>
                    <div className="text-lg font-semibold">{selectedUser.total_purchases}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">ウォレット残高</div>
                    <div className="text-lg font-semibold">{formatCurrency(selectedUser.wallet_balance || 0)}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">ロール</div>
                    <div className="text-lg font-semibold">{selectedUser.app_metadata?.role || 'user'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* プラン編集モーダル */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {selectedPlan ? 'プラン編集' : '新規プラン作成'}
              </h2>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">プラン名</label>
                <input
                  type="text"
                  defaultValue={selectedPlan?.name || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">月額料金</label>
                <input
                  type="number"
                  defaultValue={selectedPlan?.price_monthly || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Stripe Price ID</label>
                <input
                  type="text"
                  defaultValue={selectedPlan?.stripe_price_id || ''}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {selectedPlan ? '更新' : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
