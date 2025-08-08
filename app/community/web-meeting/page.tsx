'use client'

import Link from 'next/link'

export default function WebMeetingPage(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <Link href="/community" className="mb-6 inline-flex items-center gap-2 hover:opacity-80">
        <img src="/images/icons/logo.png" alt="Eldonia-Nex Logo" width={32} height={32} className="rounded-lg" />
      </Link>
      <h1 className="text-3xl font-playfair font-bold golden-text mb-8">🎥 WEB会議</h1>

      <p className="text-lg text-white/80 mb-8 max-w-2xl">ブラウザ上でビデオ会議を開催し、コミュニティメンバーと顔を合わせて交流しましょう。（デモページ）</p>

      <div className="bg-white/10 p-6 rounded-lg border border-white/20 text-center">
        <p className="text-white/70">WEB会議機能は現在開発中です。近日公開予定！</p>
      </div>
    </div>
  )
} 