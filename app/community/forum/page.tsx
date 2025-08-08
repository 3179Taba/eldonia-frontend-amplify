'use client'

import Link from 'next/link'

interface UserSuggestion {
  id:number; name:string; avatar:string; tagline:string;
}

const suggestions:UserSuggestion[]=[
  {id:1,name:'DragonSmith',avatar:'🐲',tagline:'鍛冶とドラゴンの物語を描く',},
  {id:2,name:'SpaceBard',avatar:'🚀',tagline:'宇宙を旅する吟遊詩人',},
  {id:3,name:'CyberNinja',avatar:'🤖',tagline:'近未来忍者物が得意',},
]

export default function ForumPage(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <Link href="/community" className="mb-6 inline-flex items-center gap-3 hover:opacity-80">
        <img src="/images/icons/logo.png" alt="Eldonia-Nex Logo" width={40} height={40} className="rounded-lg" />
        <span className="golden-text font-playfair text-xl sm:text-2xl font-bold">Eldonia-Nex</span>
      </Link>
      <h1 className="text-3xl font-playfair font-bold golden-text mb-8">👥 友達追加</h1>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">テーマ別トピック</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {['ファンタジー','SF','イラスト技法','3Dモデリング','執筆・ストーリー'].map((topic,i)=>(
            <div key={i} className="bg-white/10 p-4 rounded-lg border border-white/20">
              <h3 className="font-bold mb-1">{topic}</h3>
              <p className="text-sm text-gray-300">最新のディスカッションに参加しましょう</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">あなたにオススメのユーザー</h2>
        <div className="space-y-4">
          {suggestions.map(u=> (
            <div key={u.id} className="flex items-center justify-between bg-white/10 px-4 py-3 rounded-lg border border-white/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{u.avatar}</span>
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-sm text-gray-300">{u.tagline}</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-green-600 rounded-lg text-white text-sm hover:bg-green-700 transition-colors">+ 友達追加</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
} 