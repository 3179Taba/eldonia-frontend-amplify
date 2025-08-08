'use client'

import { useAuth } from '../lib/auth-context'
import Link from 'next/link'
import Logo from './Logo'
import { X, LogOut, User, Search, Globe, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../lib/i18n-provider'
import { Language } from '../i18n/translations'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const languages = [
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
]

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const [isLangOpen, setLangOpen] = useState(false)
  const { locale, setLocale } = useI18n()
  const selectedLanguage = languages.find(l => l.code === locale) || languages[0]

  const handleLogout = () => {
    logout()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 3xl:hidden"
      onClick={onClose}
    >
      <div 
        className="absolute top-0 right-0 h-full w-full max-w-sm bg-slate-900 shadow-2xl p-6 flex flex-col transition-transform duration-300 transform translate-x-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <Logo size="sm" />
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="w-full h-12 px-4 pr-12 rounded-lg border border-white/20 bg-white/10 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500/50"
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
        </div>

        <div className="mb-6">
          <button
            onClick={() => setLangOpen(!isLangOpen)}
            className="w-full flex items-center justify-between py-3 px-4 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span className="font-medium">{selectedLanguage.name}</span>
            </div>
            <ChevronDown className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
          </button>
          {isLangOpen && (
            <div className="mt-2 space-y-1 pl-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLocale(lang.code as Language)
                    setLangOpen(false)
                  }}
                  className="w-full text-left py-2 px-4 rounded-lg hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <nav className="flex-grow space-y-2 mb-6">
          <Link href="/" className="block py-3 px-4 rounded-lg header-link font-semibold text-lg hover:bg-white/10 transition-colors text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400" onClick={onClose}>HOME</Link>
          
          <Link href="/gallery" className="block py-3 px-4 rounded-lg header-link font-semibold text-lg hover:bg-white/10 transition-colors text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400" onClick={onClose}>GALLERY</Link>
          
          <Link href="/shop" className="block py-3 px-4 rounded-lg header-link font-semibold text-lg hover:bg-white/10 transition-colors text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400" onClick={onClose}>SHOP</Link>
          <Link href="/events" className="block py-3 px-4 rounded-lg header-link font-semibold text-lg hover:bg-white/10 transition-colors text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400" onClick={onClose}>EVENTS</Link>
          <Link href="/community" className="block py-3 px-4 rounded-lg header-link font-semibold text-lg hover:bg-white/10 transition-colors text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400" onClick={onClose}>COMMUNITY</Link>
          <Link href="/works" className="block py-3 px-4 rounded-lg header-link font-semibold text-lg hover:bg-white/10 transition-colors text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400" onClick={onClose}>WORKS</Link>
        </nav>

        <div className="border-t border-slate-700 pt-6 space-y-4">
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 py-3 px-4 rounded-lg bg-white/5">
                <User className="h-5 w-5" />
                <span className="header-link font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400">{user?.username}</span>
              </div>
              
              <Link
                href="/settings"
                className="w-full flex items-center justify-center py-3 px-4 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                onClick={onClose}
              >
                <User className="mr-2" size={18} />
                設定
              </Link>
              
              <Link
                href="/post/rules"
                className="w-full flex items-center justify-center py-3 px-4 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                onClick={onClose}
              >
                <svg className="mr-2" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                投稿
              </Link>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center py-3 px-4 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="mr-2" size={18} />
                Logout
              </button>
            </div>
          ) : (
            <Link 
                              href="/auth/login" 
              className="magic-button w-full text-center py-3 px-4"
              onClick={onClose}
            >
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </div>
  )
} 