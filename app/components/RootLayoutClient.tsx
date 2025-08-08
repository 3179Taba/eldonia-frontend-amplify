'use client';

import { useEffect, useState } from 'react'
import { useAuth } from '../lib/auth-context'
import FeedbackButton from './FeedbackButton'
import BackToTopButton from './BackToTopButton'

interface RootLayoutClientProps {
  children: React.ReactNode
  fontVariables: string
  bodyClass: string
}

export default function RootLayoutClient({ children, fontVariables, bodyClass }: RootLayoutClientProps) {
  const [isClient, setIsClient] = useState(false)
  const { loading: authLoading } = useAuth()

  useEffect(() => {
    // クライアントサイドの初期化を即座に完了させる
    setIsClient(true)
  }, [])

  // 認証のローディング中またはクライアントサイド初期化中の場合
  if (!isClient || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {children}
      {/* フィードバックボタン（全ページで表示） */}
      <FeedbackButton />
      {/* トップに戻るボタン（全ページで表示） */}
      <BackToTopButton />
    </div>
  )
} 