'use client'

import { useState, useEffect } from 'react'
import Logo from './Logo'
import Navigation from './Navigation'
import UserActions from './UserActions'
import MobileMenu from './MobileMenu'
import SearchBar from './SearchBar'
import LanguageSelector from './LanguageSelector'
import CartIcon from './CartIcon'
import NotificationIcon from './NotificationIcon'
import { LeftSidebarContent } from './LeftSidebar'
import { RightSidebarContent } from './RightSidebar'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <header className={`nav-container ${isScrolled ? 'scrolled' : ''}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 relative">
            
            {/* モバイル版・タブレット版 */}
            <div className="flex items-center justify-between w-full h-full lg:hidden">
              {/* 左端: 検索窓（タブレット版のみ） */}
              <div className="hidden md:flex items-center">
                <SearchBar />
              </div>
              
              {/* 中央: ロゴ */}
              <div className="flex items-center justify-center flex-1">
                <Logo size="lg" />
              </div>
              
              {/* 右端: 通知、カート、ログイン情報とハンバーガーメニュー */}
              <div className="flex items-center space-x-4">
                {/* 通知アイコン */}
                <NotificationIcon />
                
                {/* カートアイコン */}
                <CartIcon />
                
                {/* ログイン情報（タブレット版のみ） */}
                <div className="hidden md:flex">
                  <UserActions />
                </div>
                
                {/* ハンバーガーメニュー（全モバイル・タブレット版） */}
                <button
                  onClick={() => {
                    console.log('ハンバーガーメニューがクリックされました')
                    setIsMobileMenuOpen(!isMobileMenuOpen)
                  }}
                  className="p-2 text-white/70 hover:text-white transition-colors cursor-pointer z-10 relative hover-glow"
                  aria-label="メニューを開く"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* PC版: 全ての要素を表示 */}
            <div className="hidden lg:flex items-center justify-between w-full h-full">
              {/* 左側: タイトル */}
              <div className="flex items-center">
                <Logo size="xl" />
              </div>

              {/* 中央: ナビゲーションメニュー */}
              <div className="flex items-center justify-center">
                <Navigation />
              </div>

              {/* 右側: 検索、言語セレクター、通知、カート、ユーザーアクション */}
              <div className="flex items-center space-x-6">
                <SearchBar />
                <LanguageSelector className="hidden lg:flex" />
                <NotificationIcon />
                <CartIcon />
                <UserActions />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* モバイルメニュー */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      {/* モバイル左サイドバー */}
      {isLeftSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsLeftSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 glass-effect overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-playfair font-bold golden-text">メニュー</h2>
                <button
                  onClick={() => setIsLeftSidebarOpen(false)}
                  className="p-2 text-white/70 hover:text-white transition-colors hover-glow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <LeftSidebarContent isOpen={true} onToggle={() => setIsLeftSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}
      
      {/* モバイル右サイドバー */}
      {isRightSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsRightSidebarOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 glass-effect overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-playfair font-bold golden-text">設定</h2>
                <button
                  onClick={() => setIsRightSidebarOpen(false)}
                  className="p-2 text-white/70 hover:text-white transition-colors hover-glow"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <RightSidebarContent isOpen={true} onToggle={() => setIsRightSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}