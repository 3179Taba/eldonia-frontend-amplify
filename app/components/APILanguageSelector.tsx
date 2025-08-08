'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown, Loader2 } from 'lucide-react'
import { useTranslation } from '../lib/useTranslation'
import type { Language, TranslationStyle } from '../lib/useTranslation'

export default function APILanguageSelector({ className = "" }: { className?: string }) {
  const { 
    currentLanguage, 
    setLanguage, 
    currentStyle, 
    setStyle, 
    isLoading 
  } = useTranslation()
  
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ドロップダウンの外側をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const languages = [
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
  ]

  const styles: { code: TranslationStyle; name: Record<Language, string> }[] = [
    { 
      code: 'formal', 
      name: {
        ja: '丁寧語',
        en: 'Formal',
        zh: '正式',
        ko: '정중한'
      }
    },
    { 
      code: 'casual', 
      name: {
        ja: 'カジュアル',
        en: 'Casual',
        zh: '随意',
        ko: '친근한'
      }
    },
    { 
      code: 'business', 
      name: {
        ja: 'ビジネス',
        en: 'Business',
        zh: '商务',
        ko: '비즈니스'
      }
    },
    { 
      code: 'creative', 
      name: {
        ja: 'クリエイティブ',
        en: 'Creative',
        zh: '创意',
        ko: '창의적'
      }
    },
  ]

  const currentLanguageData = languages.find(lang => lang.code === currentLanguage)
  const currentStyleData = styles.find(style => style.code === currentStyle)

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as Language)
    setIsOpen(false)
  }

  const handleStyleChange = (styleCode: TranslationStyle) => {
    setStyle(styleCode)
    setIsOpen(false)
  }

  return (
    <div className={`api-language-selector ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg 
                 border border-white/20 bg-white/10 backdrop-blur-sm 
                 hover:bg-white/20 transition-all duration-300
                 hover:border-white/30 hover:shadow-lg hover:shadow-magic-500/20
                 focus:outline-none focus:ring-2 focus:ring-magic-400/50
                 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="言語・翻訳スタイルを選択"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Globe className="h-5 w-5" />
        )}
        <span className="text-sm">{currentLanguageData?.flag}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 glass-effect rounded-lg 
                      shadow-2xl shadow-magic-500/20 z-50 cosmic-border
                      border border-white/20 backdrop-blur-xl
                      animate-fade-in-down p-2">
          <div className="mb-2">
            <div className="font-bold text-xs text-white/70 mb-1">言語</div>
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 text-sm rounded-md 
                         transition-all duration-200 font-exo2
                         hover:bg-white/10
                         focus:outline-none focus:bg-white/10 
                         ${currentLanguage === language.code ? 'bg-white/20' : ''}`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.name}</span>
                  {currentLanguage === language.code && (
                    <span className="ml-auto text-xs text-magic-400">✓</span>
                  )}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-2">
            <div className="font-bold text-xs text-white/70 mb-1">翻訳スタイル</div>
            {styles.map((style) => (
              <button
                key={style.code}
                onClick={() => handleStyleChange(style.code)}
                className={`w-full text-left px-4 py-2 text-sm rounded-md 
                         transition-all duration-200 font-exo2
                         hover:bg-white/10
                         focus:outline-none focus:bg-white/10 
                         ${currentStyle === style.code ? 'bg-white/20' : ''}`}
              >
                <span className="flex items-center justify-between">
                  <span>{style.name[currentLanguage] || style.name.en}</span>
                  {currentStyle === style.code && (
                    <span className="text-xs text-magic-400">✓</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 