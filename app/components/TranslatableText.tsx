'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from '../lib/useTranslation'
import { useI18n } from '../lib/i18n-provider'
import { translations } from '../i18n/translations'

interface TranslatableTextProps {
  translationKey: string
  fallbackText: string
  className?: string
  autoTranslate?: boolean
  children?: React.ReactNode
}

export default function TranslatableText({
  translationKey,
  fallbackText,
  className = '',
  autoTranslate = true,
  children
}: TranslatableTextProps) {
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { translateText, currentLanguage } = useTranslation()
  const { locale } = useI18n()

  useEffect(() => {
    // まず静的な翻訳辞書から翻訳を試す
    const staticTranslation = translations[locale]?.[translationKey as keyof typeof translations[typeof locale]]
    if (staticTranslation) {
      setTranslatedText(staticTranslation)
      return
    }

    // 静的な翻訳が見つからない場合、AI翻訳を試す
    const performAITranslation = async () => {
      if (!autoTranslate || !translationKey) {
        setTranslatedText(null)
        return
      }

      try {
        setIsTranslating(true)
        setError(null)

        const result = await translateText(translationKey, fallbackText)

        if (result.success && result.translatedText) {
          setTranslatedText(result.translatedText)
        } else {
          // 翻訳に失敗した場合はフォールバックテキストを使用
          setTranslatedText(null)
          console.warn(`Translation failed for key: ${translationKey}`, result.error)
        }
      } catch (err) {
        console.error('Translation error:', err)
        setError(err instanceof Error ? err.message : 'Translation failed')
        setTranslatedText(null)
      } finally {
        setIsTranslating(false)
      }
    }

    performAITranslation()
  }, [translationKey, fallbackText, autoTranslate, currentLanguage, translateText, locale])

  // 翻訳中またはエラーの場合はフォールバックテキストを表示
  const displayText = translatedText || fallbackText

  return (
    <span className={className}>
      {children || displayText}
      {isTranslating && (
        <span className="inline-block ml-1 text-xs text-gray-400 animate-pulse">
          ...
        </span>
      )}
    </span>
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

// 翻訳可能な見出しコンポーネント
export function TranslatableHeading({
  level = 1,
  text,
  translationKey,
  className = "",
  autoTranslate,
  ...props
}: {
  level?: 1 | 2 | 3 | 4 | 5 | 6
  text: string
  translationKey?: string
  className?: string
  autoTranslate?: boolean
  [key: string]: any
}) {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements

  return (
    <Tag className={className} {...props}>
      <TranslatableText
        translationKey={translationKey}
        fallbackText={text}
        autoTranslate={autoTranslate}
      />
    </Tag>
  ) as React.JSX.Element
}

// 翻訳可能な段落コンポーネント
export function TranslatableParagraph({
  text,
  translationKey,
  className = "",
  autoTranslate,
  ...props
}: {
  text: string
  translationKey?: string
  className?: string
  autoTranslate?: boolean
  [key: string]: any
}) {
  return (
    <p className={className} {...props}>
      <TranslatableText
        translationKey={translationKey}
        fallbackText={text}
        autoTranslate={autoTranslate}
      />
    </p>
  )
}

// 翻訳可能なボタンテキストコンポーネント
export function TranslatableButton({
  text,
  translationKey,
  className = "",
  autoTranslate,
  ...props
}: {
  text: string
  translationKey?: string
  className?: string
  autoTranslate?: boolean
  [key: string]: any
}) {
  return (
    <button className={className} {...props}>
      <TranslatableText
        translationKey={translationKey}
        fallbackText={text}
        autoTranslate={autoTranslate}
      />
    </button>
  )
}
