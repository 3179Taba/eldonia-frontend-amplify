'use client'

import { useState, useEffect, ReactNode, useCallback } from 'react'
import { useTranslation } from '../lib/useTranslation'
import { useAuth } from '../lib/auth-context'

interface UserLanguageMatcherProps {
  content: string
  contentLanguage: string
  className?: string
  children?: ReactNode
  autoTranslate?: boolean
  showLanguageInfo?: boolean
  onTranslationComplete?: (translatedContent: string) => void
  fallback?: string
}

export default function UserLanguageMatcher({
  content,
  contentLanguage,
  className = '',
  children,
  autoTranslate = true,
  showLanguageInfo = false,
  onTranslationComplete,
  fallback
}: UserLanguageMatcherProps) {
  const { user, isAuthenticated } = useAuth()
  const {
    currentLanguage,
    translateText,
    shouldTranslate,
    userLanguage,
    syncWithUserLanguage
  } = useTranslation()

  const [translatedContent, setTranslatedContent] = useState<string>('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationError, setTranslationError] = useState<string | null>(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [userMatchedLanguage, setUserMatchedLanguage] = useState<string | null>(null)

  // ユーザーの言語設定を取得
  const getUserPreferredLanguage = useCallback((): string => {
    if (isAuthenticated && user?.profile?.language) {
      return user.profile.language
    }
    return currentLanguage
  }, [isAuthenticated, user, currentLanguage])

  // 翻訳が必要かどうかを判定
  const needsTranslation = shouldTranslate(contentLanguage)

  // 表示するコンテンツを決定
  const displayContent = showTranslation && translatedContent
    ? translatedContent
    : content

  // 自動翻訳の実行
  useEffect(() => {
    if (autoTranslate && needsTranslation && content.trim() && isAuthenticated) {
      performTranslation()
    }
  }, [autoTranslate, needsTranslation, content, currentLanguage, isAuthenticated, performTranslation])

  // ユーザー言語設定との同期
  useEffect(() => {
    const userLang = getUserPreferredLanguage()
    setUserMatchedLanguage(userLang)

    if (userLanguage && userLanguage !== currentLanguage) {
      syncWithUserLanguage()
    }
  }, [userLanguage, currentLanguage, isAuthenticated, user, getUserPreferredLanguage, syncWithUserLanguage])

  const performTranslation = useCallback(async () => {
    if (!content.trim() || isTranslating) return

    setIsTranslating(true)
    setTranslationError(null)

    try {
      const targetLanguage = getUserPreferredLanguage()
      const result = await translateText(`content_${Date.now()}`, content)
      if (result.success && result.translatedText) {
        setTranslatedContent(result.translatedText)
        setShowTranslation(true)
        onTranslationComplete?.(result.translatedText)
        console.log(`投稿を翻訳: ${contentLanguage} → ${targetLanguage}`)
      } else {
        throw new Error(result.error || '翻訳に失敗しました')
      }
    } catch (error) {
      console.error('投稿翻訳エラー:', error)
      setTranslationError(error instanceof Error ? error.message : '翻訳に失敗しました')
      setShowTranslation(false)
    } finally {
      setIsTranslating(false)
    }
  }, [content, isTranslating, getUserPreferredLanguage, translateText, onTranslationComplete, contentLanguage])

  const handleManualTranslation = () => {
    if (!showTranslation && translatedContent) {
      setShowTranslation(true)
    } else if (showTranslation) {
      setShowTranslation(false)
    } else {
      performTranslation()
    }
  }

  const handleSyncWithUserLanguage = () => {
    syncWithUserLanguage()
    // 言語が変更された場合、再度翻訳を実行
    if (needsTranslation) {
      setTimeout(() => {
        performTranslation()
      }, 100)
    }
  }

  // 翻訳ボタンの表示判定
  const showTranslateButton = needsTranslation && !autoTranslate && !isTranslating && isAuthenticated

  return (
    <div className={`user-language-matcher ${className}`}>
      {/* メインコンテンツ */}
      <div className="content-display">
        {children || displayContent}

        {/* 翻訳中のインジケーター */}
        {isTranslating && (
          <span className="inline-block ml-2 text-xs text-blue-500 animate-pulse">
            🔄 ユーザー言語に翻訳中...
          </span>
        )}

        {/* 翻訳エラー */}
        {translationError && (
          <span className="inline-block ml-2 text-xs text-red-500">
            ❌ {translationError}
          </span>
        )}
      </div>

      {/* 翻訳ボタン */}
      {showTranslateButton && (
        <button
          onClick={handleManualTranslation}
          className="inline-block ml-2 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          title={`${contentLanguage} → ${userMatchedLanguage} に翻訳`}
        >
          🌐 ユーザー言語に翻訳
        </button>
      )}

      {/* 翻訳切り替えボタン（翻訳済みの場合） */}
      {translatedContent && !autoTranslate && (
        <button
          onClick={handleManualTranslation}
          className="inline-block ml-2 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          title={showTranslation ? '原文を表示' : '翻訳を表示'}
        >
          {showTranslation ? '📖 原文' : '🌐 翻訳'}
        </button>
      )}

      {/* 言語情報表示 */}
      {showLanguageInfo && (
        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">投稿言語:</span> {getLanguageName(contentLanguage)}
            </div>
            <div>
              <span className="font-medium">ユーザー言語:</span> {getLanguageName(userMatchedLanguage || 'ja')}
            </div>
            {translatedContent && (
              <div className="col-span-2">
                <span className="font-medium">翻訳言語:</span> {getLanguageName(currentLanguage)}
              </div>
            )}
          </div>

          {/* 翻訳状態 */}
          <div className="mt-1">
            <span className="font-medium">翻訳状態:</span>
            {needsTranslation ? (
              <span className="text-orange-600">翻訳が必要</span>
            ) : (
              <span className="text-green-600">翻訳不要</span>
            )}
          </div>
        </div>
      )}

      {/* ユーザー言語設定情報 */}
      {isAuthenticated && userMatchedLanguage && userMatchedLanguage !== currentLanguage && (
        <div className="mt-1 text-xs text-blue-500">
          💡 ユーザー設定言語: {getLanguageName(userMatchedLanguage)}
          <button
            onClick={handleSyncWithUserLanguage}
            className="ml-1 underline hover:no-underline"
          >
            同期して翻訳
          </button>
        </div>
      )}

      {/* 非ログインユーザー向けメッセージ */}
      {!isAuthenticated && needsTranslation && (
        <div className="mt-1 text-xs text-gray-500">
          💡 ログインすると、あなたの言語設定に合わせて自動翻訳されます
        </div>
      )}
    </div>
  )
}

// 言語名を取得するヘルパー関数
function getLanguageName(langCode: string): string {
  const languageNames: Record<string, string> = {
    'ja': '日本語',
    'en': 'English',
    'zh': '中文',
    'ko': '한국어'
  }
  return languageNames[langCode] || langCode
}
