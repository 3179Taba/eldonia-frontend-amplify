'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react'
import { useAuth } from '../lib/auth-context'
import Link from 'next/link'

interface RightSidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

export default function RightSidebar({ isOpen = true, onToggle }: RightSidebarProps) {
  return (
    <div className={`bg-black/20 backdrop-blur-md h-[calc(100vh-5rem)] fixed right-0 top-20 z-30 overflow-y-auto transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <RightSidebarContent isOpen={isOpen} onToggle={onToggle} />
    </div>
  )
}

export function RightSidebarContent({ isOpen, onToggle }: { isOpen?: boolean; onToggle?: () => void }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [language, setLanguage] = useState('ja')
  const [openSection, setOpenSection] = useState<string | null>('notifications')

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={`p-6 ${isOpen ? '' : 'p-2'}`}>
      <div className={`flex items-center justify-between mb-6 ${isOpen ? '' : 'mb-4'}`}>
        {isOpen && <h2 className="text-xl font-playfair font-bold golden-text">ユーザー設定</h2>}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label={isOpen ? "設定を最小化" : "設定を展開"}
          >
            {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        )}
      </div>
      
      {!isOpen && (
        <div className="space-y-2">
          <div className="flex justify-center p-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <PlusCircle />
          </div>
          <div className="flex justify-center p-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <span className="text-xl">👤</span>
          </div>
          <div className="flex justify-center p-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <span className="text-xl">⚙️</span>
          </div>
          <div className="flex justify-center p-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            <span className="text-xl">📊</span>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-magic-500/30 to-cosmic-500/30 rounded-full flex items-center justify-center">
              <div className="text-xl">👤</div>
            </div>
            <div>
              <h3 className="font-playfair font-bold golden-text">{user?.username || 'ゲスト'}</h3>
            </div>
          </div>
          <Link href="/settings" className="w-full magic-button text-sm">プロフィール編集</Link>
        </div>
      )}

      {isOpen && (
        <div className="space-y-4">
          <div>
            <button type="button" onClick={() => setOpenSection(openSection === 'notifications' ? null : 'notifications')} className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors mb-1">
              <span className="font-bold">通知設定</span>
              {openSection === 'notifications' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {openSection === 'notifications' && (
              <div className="space-y-3 px-2 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">プッシュ通知</span>
                  <button
                    onClick={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                      isNotificationsEnabled ? 'bg-magic-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      isNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">メール通知</span>
                  <button className="w-12 h-6 rounded-full bg-white/20">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-1" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">新着作品通知</span>
                  <button className="w-12 h-6 rounded-full bg-magic-500">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <button type="button" onClick={() => setOpenSection(openSection === 'display' ? null : 'display')} className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors mb-1">
              <span className="font-bold">表示設定</span>
              {openSection === 'display' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {openSection === 'display' && (
              <div className="space-y-3 px-2 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">ダークモード</span>
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`w-12 h-6 rounded-full transition-colors duration-300 ${
                      isDarkMode ? 'bg-magic-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      isDarkMode ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">アニメーション</span>
                  <button className="w-12 h-6 rounded-full bg-magic-500">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">コンパクト表示</span>
                  <button className="w-12 h-6 rounded-full bg-white/20">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-1" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <button type="button" onClick={() => setOpenSection(openSection === 'language' ? null : 'language')} className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors mb-1">
              <span className="font-bold">言語設定</span>
              {openSection === 'language' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {openSection === 'language' && (
              <div className="space-y-3 px-2 pb-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:border-magic-500"
                >
                  <option value="ja">🇯🇵 日本語</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="zh">🇨🇳 中文</option>
                  <option value="ko">🇰🇷 한국어</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <button type="button" onClick={() => setOpenSection(openSection === 'privacy' ? null : 'privacy')} className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors mb-1">
              <span className="font-bold">プライバシー</span>
              {openSection === 'privacy' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {openSection === 'privacy' && (
              <div className="space-y-3 px-2 pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">プロフィール公開</span>
                  <button className="w-12 h-6 rounded-full bg-magic-500">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">作品公開</span>
                  <button className="w-12 h-6 rounded-full bg-magic-500">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70 text-sm">メッセージ受信</span>
                  <button className="w-12 h-6 rounded-full bg-white/20">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-1" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <button type="button" onClick={() => setOpenSection(openSection === 'account' ? null : 'account')} className="w-full flex items-center justify-between py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors mb-1">
              <span className="font-bold">アカウント</span>
              {openSection === 'account' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {openSection === 'account' && (
              <div className="space-y-2 px-2 pb-2">
                <button className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm">
                  パスワード変更
                </button>
                <button className="w-full px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm">
                  アカウント削除
                </button>
                <button className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-500/30 transition-all duration-300 text-sm" onClick={handleLogout}>
                  ログアウト
                </button>
              </div>
            )}
          </div>
          <Link href="/post/rules" className="w-full px-4 py-2 bg-gradient-to-r from-magic-500 to-cosmic-500 text-white font-bold rounded-lg shadow-lg hover:from-magic-600 hover:to-cosmic-600 transition-all duration-300 text-sm flex items-center justify-center">
            <PlusCircle className="mr-2" size={18} /> 投稿する
          </Link>
        </div>
      )}

      {isOpen && (
        <div className="mt-8 pt-6">
          <h4 className="text-lg font-playfair font-bold golden-text mb-3">統計</h4>
          <div className="space-y-2 text-sm text-white/50">
            <div className="flex justify-between">
              <span>投稿作品</span>
              <span>12</span>
            </div>
            <div className="flex justify-between">
              <span>フォロワー</span>
              <span>234</span>
            </div>
            <div className="flex justify-between">
              <span>いいね</span>
              <span>1.2K</span>
            </div>
            <div className="flex justify-between">
              <span>コメント</span>
              <span>89</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 