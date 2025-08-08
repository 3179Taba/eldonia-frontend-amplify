'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User, Settings, LogOut, Shield, ChevronDown } from 'lucide-react'
import { useAuth } from '../lib/auth-context'
import { useRouter } from 'next/navigation'

interface UserActionsProps {
  onMobileMenuToggle?: () => void
}

export default function UserActions({ onMobileMenuToggle }: UserActionsProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ドロップダウンの外側をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/')
    setIsDropdownOpen(false)
  }

  // モバイル用のバーガーメニューボタンのみを表示
  if (onMobileMenuToggle) {
    return (
      <button
        onClick={onMobileMenuToggle}
        className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        aria-expanded="false"
      >
        <span className="sr-only">Open main menu</span>
        {/* Icon when menu is closed. */}
        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    )
  }

  // デスクトップ用のユーザー情報を表示
  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg 
                     bg-white/10 backdrop-blur-sm 
                     hover:bg-white/20 transition-all duration-300
                     hover:shadow-lg hover:shadow-magic-500/20
                     focus:outline-none focus:ring-2 focus:ring-magic-400/50"
            aria-label="ユーザーメニュー"
          >
            <User className="h-5 w-5" />
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 glass-effect rounded-lg 
                          shadow-2xl shadow-magic-500/20 z-50 cosmic-border
                          backdrop-blur-xl
                          animate-fade-in-down">
              <div className="py-2">
                {/* ユーザー名表示 */}
                <div className="px-4 py-3">
                  <div className="text-sm font-semibold">
                    {user?.username}
                  </div>
                  <div className="text-xs text-white/60">
                    {user?.email}
                  </div>
                </div>
                
                {/* 管理ページへのリンク（管理者のみ） */}
                {user?.profile?.is_staff && (
                  <Link 
                    href="/admin/translations" 
                    className="flex items-center px-4 py-3 text-sm hover:bg-white/10 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Shield className="h-4 w-4 mr-3" />
                    管理ページ
                  </Link>
                )}
                
                {/* ユーザー設定リンク */}
                <Link 
                  href="/settings" 
                  className="flex items-center px-4 py-3 text-sm hover:bg-white/10 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="h-4 w-4 mr-3" />
                  設定
                </Link>
                
                {/* 投稿リンク */}
                <Link 
                  href="/post/rules" 
                  className="flex items-center px-4 py-3 text-sm hover:bg-white/10 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  投稿
                </Link>
                
                {/* ログアウトボタン */}
                <button 
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 text-sm hover:bg-white/10 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  ログアウト
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <Link href="/auth/login" className="text-white/70 hover:text-white transition-colors text-sm">
            ログイン
          </Link>
          <Link href="/plans" className="magic-button text-sm">
            新規登録
          </Link>
        </div>
      )}
    </div>
  )
} 