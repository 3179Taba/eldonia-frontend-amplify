'use client'
import { useState } from 'react'
import { useAuth } from '../../lib/auth-context'
import Link from 'next/link'

export default function PrivacySettingsPage() {
  const { token } = useAuth()
  interface PrivacyData {
    profile_visibility: 'public' | 'friends' | 'private'
    search_visibility: boolean
    activity_visibility: boolean
    contact_visibility: boolean
    data_sharing: boolean
  }
  const [privacyData, setPrivacyData] = useState<PrivacyData>({
    profile_visibility: 'public',
    search_visibility: true,
    activity_visibility: true,
    contact_visibility: true,
    data_sharing: false,
  })
  const handleChange = (field: keyof PrivacyData, value: any) => {
    setPrivacyData(prev => ({ ...prev, [field]: value }))
  }
  const save = async () => {
    if (!token) return
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/update_profile/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ privacy_settings: privacyData }),
    })
    alert('保存しました')
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <Link href="/settings" className="text-white/70 hover:text-white mb-6 inline-flex items-center gap-2">← 戻る</Link>
      <h1 className="text-3xl font-playfair font-bold golden-text mb-8">プライバシー設定</h1>
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* プロフィール */}
        <div className="glass-effect rounded-lg p-6 cosmic-border">
          <h2 className="text-lg font-semibold text-white mb-4">プロフィールの公開範囲</h2>
          <select value={privacyData.profile_visibility} onChange={e=>handleChange('profile_visibility', e.target.value as any)} className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg">
            <option value="public">公開</option>
            <option value="friends">友達のみ</option>
            <option value="private">非公開</option>
          </select>
        </div>
        {/* チェックボックス共通 */}
        {[
          {field:'search_visibility', label:'検索結果に表示'},
          {field:'activity_visibility', label:'アクティビティの表示'},
          {field:'contact_visibility', label:'連絡先の表示'},
          {field:'data_sharing', label:'匿名データの共有'},
        ].map(item=> (
          <div key={item.field} className="glass-effect rounded-lg p-6 cosmic-border flex items-center justify-between">
            <span className="text-white/70">{item.label}</span>
            <input type="checkbox" checked={privacyData[item.field as keyof PrivacyData] as boolean} onChange={e=>handleChange(item.field as keyof PrivacyData, e.target.checked)} />
          </div>
        ))}
        <div className="text-right">
          <button onClick={save} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">保存</button>
        </div>
      </div>
    </div>
  )
} 