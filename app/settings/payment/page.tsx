'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface CardForm {
  holder: string
  number: string
  expMonth: string
  expYear: string
  cvc: string
}

export default function PaymentSettingsPage() {
  const [form, setForm] = useState<CardForm>({ holder: '', number: '', expMonth: '', expYear: '', cvc: '' })
  const [saved, setSaved] = useState<CardForm | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('dummy_card')
    if (stored) setSaved(JSON.parse(stored))
  }, [])

  const handleChange = (field: keyof CardForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const save = () => {
    // 簡易バリデーション
    if (!/^\d{16}$/.test(form.number.replace(/ /g, ''))) {
      alert('カード番号を16桁で入力してください')
      return
    }
    if (!/^\d{3,4}$/.test(form.cvc)) {
      alert('CVCを正しく入力してください')
      return
    }
    localStorage.setItem('dummy_card', JSON.stringify(form))
    setSaved(form)
    alert('ダミーカード情報を保存しました (ローカルストレージ)')
  }

  const remove = () => {
    localStorage.removeItem('dummy_card')
    setSaved(null)
    alert('カード情報を削除しました')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <Link href="/settings" className="text-white/70 hover:text-white mb-6 inline-flex items-center gap-2">← 戻る</Link>
      <h1 className="text-3xl font-playfair font-bold golden-text mb-8">支払い方法</h1>

      {saved ? (
        <div className="glass-effect rounded-lg p-6 cosmic-border max-w-xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">登録済みカード</h2>
          <p className="mb-2">カード名義: {saved.holder}</p>
          <p className="mb-2">番号: **** **** **** {saved.number.slice(-4)}</p>
          <p className="mb-4">有効期限: {saved.expMonth}/{saved.expYear}</p>
          <button onClick={remove} className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700">削除</button>
        </div>
      ) : (
        <div className="glass-effect rounded-lg p-6 cosmic-border max-w-xl mx-auto">
          <h2 className="text-lg font-semibold mb-4">クレジットカードを追加</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-white/70">カード名義</label>
              <input value={form.holder} onChange={e=>handleChange('holder', e.target.value)} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block mb-1 text-white/70">カード番号 (16桁)</label>
              <input value={form.number} onChange={e=>handleChange('number', e.target.value)} maxLength={16} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-white/70">有効期限 月(MM)</label>
                <input value={form.expMonth} onChange={e=>handleChange('expMonth', e.target.value)} maxLength={2} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
              </div>
              <div>
                <label className="block mb-1 text-white/70">有効期限 年(YY)</label>
                <input value={form.expYear} onChange={e=>handleChange('expYear', e.target.value)} maxLength={2} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-white/70">CVC</label>
              <input value={form.cvc} onChange={e=>handleChange('cvc', e.target.value)} maxLength={4} className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" />
            </div>
            <div className="text-right">
              <button onClick={save} className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
