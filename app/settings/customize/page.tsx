'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CustomizeSettingsPage() {
  const [theme, setTheme] = useState('light')
  const [accent, setAccent] = useState('magic')
  const [animations, setAnimations] = useState(true)
  const [subs, setSubs] = useState<{id:number; name:string; avatar:string; subscribed:boolean}[]>([
    { id:1, name:'AliceTheWizard', avatar:'🧙‍♀️', subscribed:true },
    { id:2, name:'BobTheAdventurer', avatar:'🗡️', subscribed:true },
    { id:3, name:'CarolTheMusician', avatar:'🎵', subscribed:false }
  ])

  useEffect(() => {
    const storedTheme = localStorage.getItem('custom_theme')
    const storedAccent = localStorage.getItem('custom_accent')
    const storedAnim = localStorage.getItem('custom_animate')
    if (storedTheme) setTheme(storedTheme)
    if (storedAccent) setAccent(storedAccent)
    if (storedAnim) setAnimations(storedAnim === 'true')
  }, [])

  const save = () => {
    localStorage.setItem('custom_theme', theme)
    localStorage.setItem('custom_accent', accent)
    localStorage.setItem('custom_animate', String(animations))
    localStorage.setItem('custom_subs', JSON.stringify(subs))
    alert('カスタマイズ設定を保存しました')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <Link href="/settings" className="text-white/70 hover:text-white mb-6 inline-flex items-center gap-2">← 戻る</Link>
      <h1 className="text-3xl font-playfair font-bold golden-text mb-8">カスタマイズ</h1>
      <div className="max-w-xl mx-auto glass-effect rounded-lg p-6 cosmic-border space-y-6">
        <div>
          <label className="block mb-1">テーマ</label>
          <select value={theme} onChange={e=>setTheme(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg">
            <option value="light">ライト</option>
            <option value="dark">ダーク</option>
            <option value="auto">自動</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">アクセントカラー</label>
          <select value={accent} onChange={e=>setAccent(e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg">
            <option value="magic">Magic (Purple)</option>
            <option value="cosmic">Cosmic (Cyan)</option>
            <option value="neon">Neon (Teal)</option>
            <option value="emerald">Emerald (Green)</option>
            <option value="amber">Amber (Orange)</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <span className="block mb-1">アニメーションを有効化</span>
          <input type="checkbox" checked={animations} onChange={e=>setAnimations(e.target.checked)} />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">チャンネル登録ユーザー</h2>
          <div className="space-y-2">
            {subs.map(sub => (
              <div key={sub.id} className="flex items-center justify-between bg-white/10 px-3 py-2 rounded-lg">
                <span className="flex items-center gap-2">
                  <span className="text-xl">{sub.avatar}</span>
                  {sub.name}
                </span>
                <button onClick={()=>setSubs(prev=>prev.map(s=>s.id===sub.id?{...s, subscribed:!s.subscribed}:s))} className={`px-3 py-1 rounded-lg text-sm ${sub.subscribed? 'bg-red-600':'bg-green-600'}`}> {sub.subscribed?'解除':'登録'} </button>
              </div>
            ))}
          </div>
        </div>
        <div className="text-right">
          <button onClick={save} className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700">保存</button>
        </div>
      </div>
    </div>
  )
} 