'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useTranslation } from './useTranslation'

interface TranslationContextType {
  isTranslationEnabled: boolean
  toggleTranslation: () => void
  translationError: string | null
  clearTranslationError: () => void
  currentLanguage: string
  translateText: (text: string, fromLang: string, toLang: string) => Promise<string>
  t: (key: string) => string
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function useTranslationContext() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error('useTranslationContext must be used within a TranslationProvider')
  }
  return context
}

interface TranslationProviderProps {
  children: ReactNode
}

export default function TranslationProvider({ children }: TranslationProviderProps) {
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(true)
  const [translationError, setTranslationError] = useState<string | null>(null)
  const { currentLanguage, translateTextDirect, t } = useTranslation()

  // ローカルストレージから翻訳設定を読み込み
  useEffect(() => {
    try {
      const saved = localStorage.getItem('translationEnabled')
      if (saved !== null) {
        setIsTranslationEnabled(JSON.parse(saved))
      }
    } catch (error) {
      console.warn('Failed to load translation settings from localStorage:', error)
      // エラーが発生した場合はデフォルトで有効にする
      setIsTranslationEnabled(true)
    }
  }, [])

  // 翻訳設定をローカルストレージに保存
  const toggleTranslation = () => {
    try {
      const newValue = !isTranslationEnabled
      setIsTranslationEnabled(newValue)
      localStorage.setItem('translationEnabled', JSON.stringify(newValue))
      setTranslationError(null) // エラーをクリア
    } catch (error) {
      console.warn('Failed to save translation settings to localStorage:', error)
      // エラーが発生しても状態は更新する
      setIsTranslationEnabled(!isTranslationEnabled)
    }
  }

  const clearTranslationError = () => {
    setTranslationError(null)
  }

  // 翻訳エラーをグローバルに監視
  useEffect(() => {
    const handleTranslationError = (event: CustomEvent) => {
      if (event.detail?.type === 'translation_error') {
        setTranslationError(event.detail.message || '翻訳エラーが発生しました')
      }
    }

    window.addEventListener('translation-error' as any, handleTranslationError)

    return () => {
      window.removeEventListener('translation-error' as any, handleTranslationError)
    }
  }, [])

  const value: TranslationContextType = {
    isTranslationEnabled,
    toggleTranslation,
    translationError,
    clearTranslationError,
    currentLanguage,
    translateText: translateTextDirect,
    t
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
      {/* 翻訳エラー表示（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && translationError && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm">翻訳エラー: {translationError}</span>
            <button
              onClick={clearTranslationError}
              className="ml-2 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </TranslationContext.Provider>
  )
}
