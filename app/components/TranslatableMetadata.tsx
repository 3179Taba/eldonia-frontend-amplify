'use client'

import { useEffect } from 'react'
import { useTranslationContext } from '../lib/translation-provider'

interface TranslatableMetadataProps {
  title: string
  titleKey?: string
  description?: string
  descriptionKey?: string
  keywords?: string
  keywordsKey?: string
  autoTranslate?: boolean
}

export default function TranslatableMetadata({
  title,
  titleKey,
  description,
  descriptionKey,
  keywords,
  keywordsKey,
  autoTranslate = false
}: TranslatableMetadataProps) {
  const { currentLanguage, translateText, t } = useTranslationContext()

  useEffect(() => {
    const updateMetadata = async () => {
      let finalTitle = title
      let finalDescription = description || ''
      let finalKeywords = keywords || ''

      // 翻訳キーがある場合は翻訳辞書から取得
      if (titleKey) {
        const translatedTitle = t(titleKey)
        if (translatedTitle && translatedTitle !== titleKey) {
          finalTitle = translatedTitle
        }
      }

      if (descriptionKey) {
        const translatedDescription = t(descriptionKey)
        if (translatedDescription && translatedDescription !== descriptionKey) {
          finalDescription = translatedDescription
        }
      }

      if (keywordsKey) {
        const translatedKeywords = t(keywordsKey)
        if (translatedKeywords && translatedKeywords !== keywordsKey) {
          finalKeywords = translatedKeywords
        }
      }

      // 自動翻訳が有効な場合
      if (autoTranslate && currentLanguage !== 'ja') {
        try {
          if (!titleKey) {
            finalTitle = await translateText(title, 'ja', currentLanguage)
          }
          if (!descriptionKey && description) {
            finalDescription = await translateText(description, 'ja', currentLanguage)
          }
          if (!keywordsKey && keywords) {
            finalKeywords = await translateText(keywords, 'ja', currentLanguage)
          }
        } catch (error) {
          console.error('Metadata translation failed:', error)
        }
      }

      // メタデータを更新
      document.title = finalTitle
      
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', finalDescription)
      }

      const metaKeywords = document.querySelector('meta[name="keywords"]')
      if (metaKeywords) {
        metaKeywords.setAttribute('content', finalKeywords)
      }

      // Open Graph メタデータを更新
      const ogTitle = document.querySelector('meta[property="og:title"]')
      if (ogTitle) {
        ogTitle.setAttribute('content', finalTitle)
      }

      const ogDescription = document.querySelector('meta[property="og:description"]')
      if (ogDescription) {
        ogDescription.setAttribute('content', finalDescription)
      }

      // Twitter メタデータを更新
      const twitterTitle = document.querySelector('meta[name="twitter:title"]')
      if (twitterTitle) {
        twitterTitle.setAttribute('content', finalTitle)
      }

      const twitterDescription = document.querySelector('meta[name="twitter:description"]')
      if (twitterDescription) {
        twitterDescription.setAttribute('content', finalDescription)
      }
    }

    updateMetadata()
  }, [title, titleKey, description, descriptionKey, keywords, keywordsKey, autoTranslate, currentLanguage, translateText, t])

  return null // このコンポーネントは何もレンダリングしない
} 