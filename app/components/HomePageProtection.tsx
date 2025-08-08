'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from '../lib/useTranslation'

interface HomePageProtectionProps {
  children: React.ReactNode
}

export default function HomePageProtection({ children }: HomePageProtectionProps) {
  const [isTranslationReady, setIsTranslationReady] = useState(true) // デフォルトでtrueに変更
  const [translationError, setTranslationError] = useState<string | null>(null)
  const { currentLanguage } = useTranslation()

  useEffect(() => {
    // 翻訳機能の初期化を高速化（タイムアウトを短縮）
    const initializeTranslation = async () => {
      try {
        // 翻訳機能の準備が完了するまで少し待つ（100msから50msに短縮）
        await new Promise(resolve => setTimeout(resolve, 50))
        setIsTranslationReady(true)
      } catch (error) {
        console.warn('Translation initialization failed, but continuing:', error)
        setTranslationError('翻訳機能の初期化に失敗しましたが、ページは正常に表示されます')
        setIsTranslationReady(true) // エラーがあってもページは表示する
      }
    }

    // 即座に初期化を開始
    initializeTranslation()
  }, [])

  // 翻訳エラーをグローバルに通知
  useEffect(() => {
    if (translationError) {
      const event = new CustomEvent('translation-error', {
        detail: {
          type: 'translation_error',
          message: translationError
        }
      })
      window.dispatchEvent(event)
    }
  }, [translationError])

  // 翻訳機能が準備できていなくても、ページは表示する
  return (
    <div className="home-page-protection">
      {children}
      
      {/* 翻訳エラー表示（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && translationError && (
        <div className="fixed top-4 right-4 bg-yellow-500 text-black p-3 rounded-lg shadow-lg z-50 max-w-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm">⚠️ {translationError}</span>
            <button
              onClick={() => setTranslationError(null)}
              className="ml-2 text-black hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 