'use client'

import { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react'
import { translations, Language, TranslationKey, TranslationStyle, translationStyles } from '../i18n/translations'

interface I18nContextType {
  locale: Language
  setLocale: (lang: Language) => void
  translationStyle: TranslationStyle
  setTranslationStyle: (style: TranslationStyle) => void
  t: (key: TranslationKey) => string
  getStyleName: (style: TranslationStyle) => string
  getStyleDescription: (style: TranslationStyle) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // ローカルストレージから言語設定を読み込み、デフォルトは日本語
  const [locale, setLocale] = useState<Language>('ja')
  const [translationStyle, setTranslationStyle] = useState<TranslationStyle>('formal')

  // 初期化時にローカルストレージから言語設定を読み込み
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('eldonia_language') as Language
      const savedStyle = localStorage.getItem('eldonia_translation_style') as TranslationStyle
      
      if (savedLanguage && ['ja', 'en', 'zh', 'ko'].includes(savedLanguage)) {
        setLocale(savedLanguage)
      }
      
      if (savedStyle && ['formal', 'casual', 'business', 'creative'].includes(savedStyle)) {
        setTranslationStyle(savedStyle)
      }
    }
  }, [])

  const t = useMemo(() => (key: TranslationKey): string => {
    // 翻訳辞書から該当する言語の翻訳を取得
    const translation = translations[locale]?.[key]
    if (translation) {
      return translation
    }
    
    // 翻訳が見つからない場合は英語版を試す
    const englishTranslation = translations.en?.[key]
    if (englishTranslation) {
      return englishTranslation
    }
    
    // それでも見つからない場合はキーをそのまま返す
    return key
  }, [locale, translationStyle])

  const getStyleName = useMemo(() => (style: TranslationStyle): string => {
    return translationStyles[style].name[locale] || translationStyles[style].name.en
  }, [locale])

  const getStyleDescription = useMemo(() => (style: TranslationStyle): string => {
    return translationStyles[style].description[locale] || translationStyles[style].description.en
  }, [locale])

  const value = {
    locale,
    setLocale,
    translationStyle,
    setTranslationStyle,
    t,
    getStyleName,
    getStyleDescription,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
} 