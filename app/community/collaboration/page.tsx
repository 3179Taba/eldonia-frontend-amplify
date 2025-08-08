'use client'

import Link from 'next/link'

export default function CollaborationPage(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-rose-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <Link href="/community" className="mb-6 inline-flex items-center gap-3 hover:opacity-80">
        <img src="/images/icons/logo.png" alt="Eldonia-Nex Logo" width={40} height={40} className="rounded-lg" />
        <span className="golden-text font-playfair text-xl sm:text-2xl font-bold">Eldonia-Nex</span>
      </Link>
      <h1 className="text-3xl font-playfair font-bold golden-text mb-8">🤝 コラボレーション</h1>

      <p className="text-lg text-white/80 mb-8 max-w-2xl">クリエーター同士で共同制作プロジェクトを企画・管理できるエリアです。（デモページ）</p>

      <div className="bg-white/10 p-6 rounded-lg border border-white/20 text-center">
        <p className="text-white/70">コラボレーション機能は現在開発中です。近日公開予定！</p>
      </div>
    </div>
  )
} 