"use client"

import { useAuth } from '../../lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AffiliateBanner from '../../components/AffiliateBanner'

export default function AffiliateAdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // スーパーユーザーまたはスタッフのみ許可
      if (!user || !(user.profile.is_staff)) {
        router.replace('/admin')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="p-8 text-center text-lg">認証情報を確認中...</div>
  }
  if (!user || !(user.profile.is_staff)) {
    return <div className="p-8 text-center text-red-500">権限がありません</div>
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">アフィリエイト管理（管理者専用）</h1>
      <AffiliateBanner />
      <div className="mt-8 p-6 bg-white/10 rounded-xl border border-emerald-400/30">
        <h2 className="text-xl font-semibold mb-4">今後追加予定の機能</h2>
        <ul className="list-disc pl-6 text-white/80">
          <li>アフィリエイトリンクの発行・管理</li>
          <li>成果レポート（クリック数・報酬額など）</li>
          <li>アフィリエイター申請・承認管理</li>
          <li>報酬の出金申請・履歴管理</li>
          <li>バナー素材の配布・HTMLコード生成</li>
        </ul>
        <p className="mt-4 text-sm text-white/60">※このページはスーパーユーザーまたは管理者のみアクセス可能です。</p>
      </div>
    </div>
  )
} 