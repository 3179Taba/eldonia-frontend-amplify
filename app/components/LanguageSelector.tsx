'use client'

import { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown } from 'lucide-react'
import { useI18n } from '../lib/i18n-provider'
import type { Language } from '../i18n/translations'

export default function LanguageSelector({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ドロップダウンの外側をクリックした時に閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const languages = [
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === locale);

  const handleLanguageChange = (languageCode: string) => {
    setLocale(languageCode as Language);
    // ローカルストレージにも保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('eldonia_language', languageCode);
    }
    setIsOpen(false);
  };

  return (
    <div className={`language-selector ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg 
                 border border-white/20 bg-white/10 backdrop-blur-sm 
                 hover:bg-white/20 transition-all duration-300
                 hover:border-white/30 hover:shadow-lg hover:shadow-magic-500/20
                 focus:outline-none focus:ring-2 focus:ring-magic-400/50"
        aria-label="言語を選択"
      >
        <Globe className="h-5 w-5" />
        <span className="text-sm">{currentLanguage?.flag}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 glass-effect rounded-lg 
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
                         focus:outline-none focus:bg-white/10 ${locale === language.code ? 'active' : ''}`}
              >
                <span className="flex items-center space-x-2">
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.name}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 