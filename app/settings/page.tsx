'use client';

import { useState, useEffect } from 'react'
import {
  User,
  Shield,
  Bell,
  CreditCard,
  Receipt,
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  FileText,
  Package,
  Upload,
  QrCode,
  Copy,
  Check,
  X
} from 'lucide-react'
import Link from 'next/link'
import Logo from '../components/Logo'
import { useAuth } from '../lib/auth-context'
import QRCode from 'qrcode'

const settingsSections = [
  {
    title: 'アカウント',
    items: [
      {
        title: 'プロフィール',
        description: '個人情報とアバターの管理',
        icon: User,
        href: '/settings/profile',
        color: 'text-blue-400'
      },
      {
        title: '投稿一覧',
        description: 'あなたの投稿の管理・編集',
        icon: FileText,
        href: '/settings/posts',
        color: 'text-purple-400'
      },
      {
        title: '商品出品',
        description: '商品を出品して売り上げを得る',
        icon: Package,
        href: '/settings/products',
        color: 'text-green-400'
      },
      {
        title: 'プライバシー',
        description: 'プライバシー設定とセキュリティ',
        icon: Shield,
        href: '/settings/privacy',
        color: 'text-green-400'
      },
      {
        title: '通知設定',
        description: '通知の種類と配信方法の管理',
        icon: Bell,
        href: '/settings/notifications',
        color: 'text-yellow-400'
      },
      {
        title: 'カスタマイズ',
        description: 'テーマと言語の設定',
        icon: Palette,
        href: '/settings/customize',
        color: 'text-pink-400'
      },
      {
        title: '今のプラン',
        description: 'ご利用プランの確認・変更',
        icon: Star,
        href: '/plans',
        color: 'text-yellow-400'
      }
    ]
  },
  {
    title: '購入・支払い',
    items: [
      {
        title: '支払い方法',
        description: 'クレジットカードと決済設定',
        icon: CreditCard,
        href: '/settings/payment',
        color: 'text-purple-400'
      },
      {
        title: '領収書',
        description: '購入履歴と領収書の確認',
        icon: Receipt,
        href: '/settings/receipts',
        color: 'text-orange-400'
      }
    ]
  },
  {
    title: 'サポート',
    items: [
      {
        title: 'ヘルプ・サポート',
        description: 'よくある質問とサポート',
        icon: HelpCircle,
        href: '/support',
        color: 'text-indigo-400'
      }
    ]
  }
]

interface UserApi {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile?: {
    id: number;
    full_name?: string | null;
    bio?: string | null;
    avatar?: string | null;
    avatar_url?: string | null;
    is_premium?: boolean;
    premium_start_date?: string | null;
    premium_end_date?: string | null;
    plan?: string;
    referral_code?: string | null;
    referral_count?: number;
    referral_revenue?: number;
  }
}

export default function SettingsPage() {
  const { token, logout, isAuthenticated, refreshAuth } = useAuth()
  const [userData, setUserData] = useState<UserApi | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [showReferralRules, setShowReferralRules] = useState(false)
  const [referralError, setReferralError] = useState('')

  // プラン情報を取得する関数
  const getCurrentPlan = () => {
    if (!userData?.profile) return 'free'

    // バックエンドのplanフィールドを優先
    if (userData.profile.plan) {
      return userData.profile.plan
    }

    // フォールバック: is_premiumフラグを使用
    if (userData.profile.is_premium) {
      // プレミアムプランの期限をチェック
      if (userData.profile.premium_end_date) {
        const endDate = new Date(userData.profile.premium_end_date)
        const now = new Date()
        if (endDate > now) {
          return 'premium'
        }
      }
      return 'premium'
    }

    return 'free'
  }

  // プラン名を日本語で表示
  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'free': return 'Free'
      case 'standard': return 'Standard'
      case 'premium': return 'Premium'
      case 'business': return 'Business'
      default: return 'Free'
    }
  }

  // プラン選択用のstateを追加
  const [selectedPlan, setSelectedPlan] = useState<string>('free')
  const [savingPlan, setSavingPlan] = useState(false)
  const [planMessage, setPlanMessage] = useState<string|null>(null)

  // ユーザーデータ取得時に現在のプランを反映
  useEffect(() => {
    if (userData?.profile?.plan) {
      setSelectedPlan(userData.profile.plan)
    }
    // 紹介コードが設定されている場合は入力欄に表示
    if (userData?.profile?.referral_code) {
      setReferralCode(userData.profile.referral_code)
    }
  }, [userData])

  // ランダムな紹介コードを生成
  const generateRandomReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setReferralCode(result)
  }

  // QRコードを生成
  const generateQRCode = async (text: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(text, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeDataUrl(dataUrl)
    } catch (err) {
      console.error('QRコード生成エラー:', err)
    }
  }

  // QRモーダルを開く
  const openQRModal = async () => {
    const code = userData?.profile?.referral_code || `REF${userData?.id}`

    // 紹介コードがない場合はエラーを表示
    if (!userData?.profile?.referral_code) {
      alert('紹介コードが設定されていません。先に紹介コードを設定してください。')
      return
    }

    try {
      await generateQRCode(code)
      setShowQRModal(true)
    } catch (error) {
      console.error('QRコード生成エラー:', error)
      alert('QRコードの生成に失敗しました。')
    }
  }

  // アバター画像アップロード処理
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !token) return

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください。')
      return
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。')
      return
    }

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/update_profile/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData
      })

      if (!res.ok) {
        const err = await res.json()
        alert('アバターアップロードに失敗しました: ' + (err?.error || ''))
        return
      }

      const data = await res.json()
      setUserData((prev) => ({ ...prev, profile: { ...prev?.profile, ...data.profile } }))
      alert('アバターを更新しました')
    } catch (e) {
      alert('アップロード中にエラーが発生しました')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // 紹介コードをコピー
  const copyReferralCode = async () => {
    const code = userData?.profile?.referral_code || `REF${userData?.id}`
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(true)
      setTimeout(() => setCopiedCode(false), 2000)
    } catch (err) {
      alert('コピーに失敗しました')
    }
  }

  // 紹介コードを入力
  const submitReferralCode = async () => {
    if (!referralCode.trim() || !token) return

    setReferralError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/update_profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ referral_code: referralCode.trim() })
      })

      if (!res.ok) {
        const err = await res.json()
        setReferralError(err?.error || '紹介コードの適用に失敗しました')
        return
      }

      alert('紹介コードを適用しました')
      setReferralCode('')
      // ユーザーデータ再取得
      const data = await res.json()
      setUserData((prev) => ({ ...prev, profile: { ...prev?.profile, ...data.profile } }))
    } catch (e) {
      setReferralError('通信エラーが発生しました')
    }
  }

  // プラン変更保存処理
  const savePlan = async () => {
    if (!token) return
    setSavingPlan(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/users/update_profile/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan: selectedPlan })
      })
      if (!res.ok) {
        const err = await res.json()
        setPlanMessage('プラン変更に失敗しました: ' + (err?.error || ''))
        setSavingPlan(false)
        return
      }
      setPlanMessage('プランを変更しました')
      // ユーザーデータ再取得
      const data = await res.json()
      setUserData((prev) => ({ ...prev, profile: { ...prev?.profile, ...data.profile } }))
    } catch (e) {
      setPlanMessage('通信エラーが発生しました')
    } finally {
      setSavingPlan(false)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoadingProfile(false)
        setErrorMessage('ログインが必要です。')
        return
      }
      try {
        // API URLの設定
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

        const res = await fetch(`${apiUrl}/users/me/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (res.status === 401) {
          logout()
          setErrorMessage('セッションの有効期限が切れました。再度ログインしてください。')
          return
        }

        if (!res.ok) {
          try {
            const errJson = await res.json()
            const detail = errJson?.error || errJson?.detail || 'プロフィール取得に失敗しました'
            setErrorMessage(`プロフィール取得に失敗しました: ${detail}`)
          } catch {
            setErrorMessage('プロフィール取得に失敗しました')
          }
          return
        }

        const data = await res.json()
        setUserData(data)

        // 認証コンテキストのユーザー情報も更新
        if (data && data.username) {
          // 認証コンテキストを更新
          await refreshAuth()
        }
      } catch (err) {
        console.error('プロフィール取得エラー:', err)
        if (!errorMessage) {
          const errorMsg = err instanceof Error ? err.message : '不明なエラー'
          setErrorMessage(`プロフィール情報の取得中にエラーが発生しました: ${errorMsg}`)
        }
      } finally {
        setLoadingProfile(false)
      }
    }
    fetchProfile()
  }, [token, errorMessage, logout, refreshAuth])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ヘッダー */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Logo size="lg" showText={true} />
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* エラーメッセージ */}
        {errorMessage && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-400">⚠️</span>
              <span className="text-red-300">{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage('')}
              className="mt-2 text-red-400 hover:text-red-300 text-sm"
            >
              閉じる
            </button>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold golden-text mb-4">
            設定
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Eldonia-Nexの設定を管理し、アカウント情報や購入履歴を確認できます
          </p>
        </div>

        {/* プロフィール基本情報 */}
        {loadingProfile ? (
          <div className="text-center mb-8 text-white/70">読み込み中...</div>
        ) : isAuthenticated && userData && !errorMessage ? (
          <div className="glass-effect rounded-lg p-6 cosmic-border mb-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl overflow-hidden shadow-lg">
                  {userData.profile?.avatar_url ? (
                    <img
                      src={userData.profile.avatar_url}
                      alt="ユーザーアバター"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // アバター画像の読み込みに失敗した場合、フォールバック
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-white font-bold text-2xl ${userData.profile?.avatar_url ? 'hidden' : ''}`}>
                    {userData.profile?.full_name ?
                      userData.profile.full_name.charAt(0).toUpperCase() :
                      userData.username.charAt(0).toUpperCase()
                    }
                  </div>
                </div>
                <label className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                  <Upload className="w-3 h-3 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-1">{userData.profile?.full_name || userData.username}</h2>
                <p className="text-white/70 text-sm mb-1">{userData.email}</p>
                {userData.profile?.bio && <p className="text-white/60 text-sm mb-2">{userData.profile.bio}</p>}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">プラン:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    getCurrentPlan() === 'premium' || getCurrentPlan() === 'business'
                      ? 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30'
                      : 'bg-gray-600/20 text-gray-300 border border-gray-500/30'
                  }`}>
                    {getPlanDisplayName(getCurrentPlan())}
                  </span>
                </div>
              </div>
            </div>

            {/* アバターアップロード説明 */}
            {uploadingAvatar && (
              <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-sm">アバターをアップロード中...</p>
              </div>
            )}

            {/* IDと紹介コードセクション */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* ユーザーID */}
              <div className="glass-effect rounded-lg p-4 cosmic-border">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-blue-400" />
                  ユーザーID
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-white/70 text-sm">ID:</span>
                  <span className="text-white font-mono">{userData.id}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(userData.id.toString())
                      setCopiedCode(true)
                      setTimeout(() => setCopiedCode(false), 2000)
                    }}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                  </button>
                </div>
              </div>

              {/* 紹介コード */}
              <div className="glass-effect rounded-lg p-4 cosmic-border">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-green-400" />
                  紹介コード
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-white/70 text-sm">コード:</span>
                  <span className="text-white font-mono">{userData.profile?.referral_code || `REF${userData.id}`}</span>
                  <button
                    onClick={copyReferralCode}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                  </button>
                </div>
                {userData.profile?.referral_code ? (
                  <button
                    onClick={openQRModal}
                    className="text-green-400 hover:text-green-300 text-sm"
                  >
                    QRコードを表示
                  </button>
                ) : (
                  <span className="text-red-400 text-sm">紹介コードを入力してください</span>
                )}

                {/* 紹介報酬情報 */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70 text-sm">紹介数:</span>
                    <span className="text-white font-semibold">{userData.profile?.referral_count || 0}人</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">累計報酬:</span>
                    <span className="text-yellow-400 font-semibold">¥{userData.profile?.referral_revenue || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 紹介報酬詳細 */}
            <div className="mt-6 glass-effect rounded-lg p-4 cosmic-border">
              <h3 className="text-lg font-semibold text-white mb-3">紹介報酬システム</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <h4 className="text-green-400 font-medium mb-2">報酬率</h4>
                  <p className="text-green-300 text-sm">有料プラン獲得で10%還元</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <h4 className="text-blue-400 font-medium mb-2">対象プラン</h4>
                  <p className="text-blue-300 text-sm">Standard: ¥80, Premium: ¥150, Business: ¥1000</p>
                </div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <h4 className="text-yellow-400 font-medium mb-2">あなたの実績</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-yellow-300 text-sm">紹介数:</span>
                    <span className="text-white font-semibold ml-2">{userData.profile?.referral_count || 0}人</span>
                  </div>
                  <div>
                    <span className="text-yellow-300 text-sm">累計報酬:</span>
                    <span className="text-yellow-400 font-semibold ml-2">¥{userData.profile?.referral_revenue || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 紹介コード入力（常に表示） */}
            <div className="mt-6 glass-effect rounded-lg p-4 cosmic-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">紹介コードを入力</h3>
                <button
                  onClick={() => setShowReferralRules(!showReferralRules)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {showReferralRules ? 'ルールを隠す' : 'ルールを表示'}
                </button>
              </div>

              {showReferralRules && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h4 className="text-blue-300 font-medium mb-2">紹介コードのルール</h4>
                  <ul className="text-blue-200 text-sm space-y-1">
                    <li>• 3文字以上20文字以下</li>
                    <li>• 英数字とハイフンのみ使用可能</li>
                    <li>• 他のユーザーと重複しない一意なコード</li>
                    <li>• 例: ABC123, MY-CODE, REF2024</li>
                  </ul>

                  <h4 className="text-green-300 font-medium mb-2 mt-4">紹介報酬システム</h4>
                  <ul className="text-green-200 text-sm space-y-1">
                    <li>• 有料プラン獲得で10%の還元</li>
                    <li>• Standardプラン: ¥80報酬</li>
                    <li>• Premiumプラン: ¥150報酬</li>
                    <li>• Businessプラン: ¥1000報酬</li>
                    <li>• 紹介数と累計報酬が記録されます</li>
                  </ul>
                </div>
              )}

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder={userData?.profile?.referral_code ? "現在の紹介コード" : "紹介コードを入力してください"}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                />
                <button
                  onClick={generateRandomReferralCode}
                  className="px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  title="ランダムな紹介コードを生成"
                >
                  生成
                </button>
                <button
                  onClick={submitReferralCode}
                  disabled={!referralCode.trim()}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  適用
                </button>
              </div>

              {referralError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{referralError}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-effect rounded-lg p-6 cosmic-border mb-8 text-center text-white/70">
            ログイン情報がありません。ログインするとプロフィールが表示されます。
          </div>
        )}

        {isAuthenticated && userData && (
          <div className="glass-effect rounded-lg p-6 cosmic-border mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">プラン変更</h3>
            <div className="flex items-center gap-4 mb-4">
              <label className="text-white/70">プランを選択:</label>
              <select
                className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                value={selectedPlan}
                onChange={e => setSelectedPlan(e.target.value)}
                disabled={savingPlan}
              >
                <option value="free">Free</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="business">Business</option>
              </select>
              <button
                className="ml-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={savePlan}
                disabled={savingPlan || selectedPlan === userData.profile?.plan}
              >
                {savingPlan ? '保存中...' : '保存'}
              </button>
            </div>
            {planMessage && <div className="text-sm text-white/80 mt-2">{planMessage}</div>}
          </div>
        )}

        <div className="space-y-8">
          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="glass-effect rounded-lg p-6 cosmic-border">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-magic-400 to-magic-600 rounded-full"></span>
                {section.title}
              </h2>

              <div className="grid gap-4">
                {section.items.map((item, itemIndex) => {
                  const IconComponent = item.icon
                  // プラン選択ボタンの場合は動的なタイトルを表示
                  const displayTitle = item.title === '今のプラン'
                    ? `今のプラン: ${getPlanDisplayName(getCurrentPlan())}`
                    : item.title

                  return (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className="group p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 hover:border-magic-400/30 transition-all duration-300 hover-glow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors`}>
                            <IconComponent className={`w-5 h-5 ${item.color}`} />
                          </div>
                          <div>
                            <h3 className="font-medium text-white group-hover:text-magic-300 transition-colors">
                              {displayTitle}
                            </h3>
                            <p className="text-sm text-white/70 mt-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-magic-400 transition-colors" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ログアウトボタン */}
        {isAuthenticated && (
          <div className="mt-8 glass-effect rounded-lg p-6 cosmic-border">
            <button onClick={logout} className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-all duration-300 hover-glow">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">ログアウト</span>
            </button>
          </div>
        )}

        {/* バージョン情報 */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-sm">
            Eldonia-Nex v0.1.3
          </p>
        </div>
      </div>

      {/* QRコードモーダル */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">紹介コードQR</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            <div className="flex flex-col items-center">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="紹介コードQR"
                  className="w-48 h-48 bg-white rounded-lg p-2"
                />
              ) : (
                <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                  <p className="text-black text-sm">QRコード生成中...</p>
                </div>
              )}
              <p className="text-white/70 text-sm mt-4 text-center">
                このQRコードをスキャンして紹介コードを共有できます
              </p>

              {/* QRコードスキャン機能 */}
              <div className="mt-4 w-full">
                <button
                  onClick={() => {
                    const code = userData?.profile?.referral_code || `REF${userData?.id}`;
                    const signupUrl = `http://localhost:3000/auth/signup?plan=Standard&referral=${encodeURIComponent(code)}`;
                    window.open(signupUrl, '_blank');
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  紹介リンクを開く
                </button>
                <p className="text-white/50 text-xs mt-2 text-center">
                  紹介リンクをクリックすると、新しいユーザーがスタンダードプランで登録できます
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
