'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './auth-context'
import { apiClient } from './api'
import { useI18n } from './i18n-provider'

export type Language = 'ja' | 'en' | 'zh' | 'ko'
export type TranslationStyle = 'formal' | 'casual' | 'business' | 'creative'

interface TranslationElement {
  key: string
  text: string
}

interface TranslationResponse {
  success: boolean
  translations: Record<string, string>
  translated_translations?: Record<string, string>
  language: Language
  style: TranslationStyle
  page_type: string
}

interface UseTranslationReturn {
  // 状態
  currentLanguage: Language
  currentStyle: TranslationStyle
  translations: Record<string, string>
  isLoading: boolean
  error: string | null
  userLanguage: Language | null

  // アクション
  setLanguage: (lang: Language) => void
  setStyle: (style: TranslationStyle) => void
  translatePage: (pageType: string) => Promise<void>
  translateElements: (elements: TranslationElement[]) => Promise<Record<string, string>>
  translateText: (translationKey: string, fallbackText: string) => Promise<{ success: boolean; translatedText?: string; error?: string }>
  translateTextDirect: (text: string, fromLang: string, toLang: string) => Promise<string>
  syncWithUserLanguage: () => void

  // ユーティリティ
  t: (key: string) => string
  getTranslation: (key: string) => string
  shouldTranslate: (contentLanguage: string) => boolean
}

export function useTranslation(): UseTranslationReturn {
  const { user, isAuthenticated } = useAuth()
  const { locale } = useI18n()
  const [currentLanguage, setCurrentLanguage] = useState<Language>(locale)
  const [currentStyle, setCurrentStyle] = useState<TranslationStyle>('formal')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userLanguage, setUserLanguage] = useState<Language | null>(null)

  // localeが変わったらcurrentLanguageも変える
  useEffect(() => {
    if (locale !== currentLanguage) {
      setCurrentLanguage(locale)
    }
  }, [locale, currentLanguage])

  // ユーザーの言語設定を取得
  const getUserLanguage = useCallback((): Language | null => {
    if (!isAuthenticated || !user?.profile?.language) {
      return null
    }

    const userLang = user.profile.language as Language
    // サポートされている言語かチェック
    if (['ja', 'en', 'zh', 'ko'].includes(userLang)) {
      return userLang
    }
    return null
  }, [isAuthenticated, user])

  // ユーザー言語設定と同期
  const syncWithUserLanguage = useCallback(() => {
    const userLang = getUserLanguage()
    if (userLang && userLang !== currentLanguage) {
      setCurrentLanguage(userLang)
      setUserLanguage(userLang)
      localStorage.setItem('eldonia_language', userLang)
      console.log(`ユーザー言語設定と同期: ${userLang}`)
    }
  }, [getUserLanguage, currentLanguage])

  // 言語設定を変更
  const setLanguage = useCallback(async (newLanguage: Language) => {
    setCurrentLanguage(newLanguage)

    // ローカルストレージに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem('eldonia_language', newLanguage)
    }

    // 認証されている場合のみAPIを呼び出し
    if (isAuthenticated) {
      try {
        console.log('言語設定更新を開始:', newLanguage)
        await apiClient.updateLanguage(newLanguage)
        console.log('言語設定がAPIで更新されました:', newLanguage)
      } catch (error) {
        console.error('APIでの言語設定更新に失敗しました:', error)

        // エラーの詳細をログに出力
        if (error instanceof Error) {
          console.error('エラー詳細:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          })
        }

        // 認証エラーの場合はローカル設定のみで続行
        if (error instanceof Error && (
          error.message.includes('認証情報が無効') ||
          error.message.includes('401') ||
          error.message.includes('Unauthorized')
        )) {
          console.log('認証エラーのため、ローカル設定のみで続行します')
          return
        }

        // ネットワークエラーの場合
        if (error instanceof Error && (
          error.message.includes('fetch') ||
          error.message.includes('network') ||
          error.message.includes('Failed to fetch')
        )) {
          console.log('ネットワークエラーのため、ローカル設定のみで続行します')
          return
        }

        // その他のエラーはユーザーに通知
        console.error('言語設定更新エラー:', error)
        // alertは削除して、コンソールログのみに変更
        // alert('言語設定の更新に失敗しました。ローカル設定のみが適用されます。')
      }
    } else {
      console.log('未認証のため、ローカル設定のみで続行します')
    }
  }, [isAuthenticated])

  // 翻訳スタイルを変更
  const setStyle = useCallback((style: TranslationStyle) => {
    setCurrentStyle(style)
    // ローカルストレージに保存
    localStorage.setItem('eldonia_translation_style', style)
  }, [])

  // 翻訳が必要かどうかを判定
  const shouldTranslate = useCallback((contentLanguage: string): boolean => {
    // コンテンツの言語とユーザーの言語が異なる場合に翻訳
    return contentLanguage !== currentLanguage
  }, [currentLanguage])

  // ページ全体の翻訳を取得
  const translatePage = useCallback(async (pageType: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // サンプルの翻訳データを作成
      const sampleTranslations = {
        'page_title': 'ページタイトル',
        'welcome_message': 'ようこそ',
        'description': 'これはサンプルの説明文です',
        'button_text': 'クリックしてください'
      }

      const response = await fetch('/api/ai/site-translation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translations: sampleTranslations,
          target_language: currentLanguage
        })
      })

      if (!response.ok) {
        console.warn(`翻訳APIエラー: ${response.status} - 翻訳をスキップします`);
        setError(null) // エラーをクリアして静かに失敗
        return
      }

      const data: TranslationResponse = await response.json()

      if (data.success) {
        setTranslations(data.translated_translations || data.translations)
      } else {
        console.warn('翻訳データの取得に失敗しました - 翻訳をスキップします');
        setError(null) // エラーをクリアして静かに失敗
      }
    } catch {
      console.warn('翻訳API接続エラー - 翻訳をスキップします')
      setError(null) // エラーをクリアして静かに失敗
    } finally {
      setIsLoading(false)
    }
  }, [currentLanguage])

  // 特定の要素を翻訳
  const translateElements = useCallback(async (elements: TranslationElement[]): Promise<Record<string, string>> => {
    try {
      // 要素を翻訳データの形式に変換
      const translations: Record<string, string> = {}
      elements.forEach(element => {
        translations[element.key] = element.text
      })

      const response = await fetch('/api/ai/site-translation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          translations: translations,
          target_language: currentLanguage
        })
      })

      if (!response.ok) {
        console.warn(`翻訳APIエラー: ${response.status} - 翻訳をスキップします`);
        return {}
      }

      const data: TranslationResponse = await response.json()

      if (data.success) {
        return data.translated_translations || data.translations
      } else {
        console.warn('要素翻訳データの取得に失敗しました - 翻訳をスキップします');
        return {}
      }
    } catch {
      console.warn('翻訳API接続エラー - 翻訳をスキップします')
      return {}
    }
  }, [currentLanguage])

  // 単一テキスト翻訳（TranslatableText用）
  const translateText = useCallback(async (translationKey: string, fallbackText: string): Promise<{ success: boolean; translatedText?: string; error?: string }> => {
    if (!translationKey.trim() || !fallbackText.trim()) {
      return { success: false, translatedText: fallbackText, error: '翻訳キーまたはフォールバックテキストが空です' }
    }

    // 現在の言語が日本語の場合は翻訳不要
    if (currentLanguage === 'ja') {
      return { success: true, translatedText: fallbackText }
    }

    try {
      const response = await fetch('/api/ai/single-translation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: fallbackText.trim(),
          from_lang: 'ja',
          to_lang: currentLanguage,
        }),
      });

      if (!response.ok) {
        console.warn(`翻訳APIエラー: ${response.status} - フォールバックテキストを使用します`);
        return { success: false, translatedText: fallbackText, error: `API Response: ${response.status}` };
      }

      const data = await response.json();

      if (data.success && data.translated_text) {
        return { success: true, translatedText: data.translated_text }
      } else {
        console.warn(`翻訳データエラー: ${data.error} - フォールバックテキストを使用します`);
        return { success: false, translatedText: fallbackText, error: data.error || '翻訳に失敗しました' };
      }
    } catch {
      console.warn('翻訳API接続エラー - フォールバックテキストを使用します');
      return { success: false, translatedText: fallbackText, error: '翻訳に失敗しました' }
    }
  }, [currentLanguage])

  // 直接テキスト翻訳（従来のAPI用）
  const translateTextDirect = useCallback(async (text: string, fromLang: string, toLang: string): Promise<string> => {
    if (!text.trim()) return text;

    try {
      const response = await fetch('/api/ai/single-translation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          from_lang: fromLang,
          to_lang: toLang,
        }),
      });

      if (!response.ok) {
        console.warn(`翻訳APIエラー: ${response.status} - 元のテキストを使用します`);
        return text;
      }

      const data = await response.json();

      if (data.success && data.translated_text) {
        return data.translated_text;
      } else {
        console.warn(`翻訳データエラー: ${data.error} - 元のテキストを使用します`);
        return text;
      }
    } catch (error) {
      console.warn('翻訳API接続エラー - 元のテキストを使用します:', error);
      return text;
    }
  }, []);

  // 翻訳キーからテキストを取得
  const t = useCallback((key: string): string => {
    // まず静的翻訳（i18n）を確認
    const staticTranslations = {
      // イベントページ関連
      'eventsPageTitle': {
        'ja': 'イベント',
        'en': 'Events',
        'zh': '活动',
        'ko': '이벤트'
      },
      'eventsSubtitle': {
        'ja': 'エルドニアの最新イベントを発見',
        'en': 'Discover the latest events in Eldonia',
        'zh': '发现艾尔多尼亚的最新活动',
        'ko': '엘도니아의 최신 이벤트를 발견하세요'
      },
      'searchEvents': {
        'ja': 'イベントを検索',
        'en': 'Search Events',
        'zh': '搜索活动',
        'ko': '이벤트 검색'
      },
      'searchEventsPlaceholder': {
        'ja': 'イベントを検索...',
        'en': 'Search events...',
        'zh': '搜索活动...',
        'ko': '이벤트 검색...'
      },
      'filterByCategory': {
        'ja': 'カテゴリで絞り込み',
        'en': 'Filter by Category',
        'zh': '按类别筛选',
        'ko': '카테고리별 필터'
      },
      'sortBy': {
        'ja': '並び順',
        'en': 'Sort by',
        'zh': '排序方式',
        'ko': '정렬 기준'
      },
      'dateAsc': {
        'ja': '開催日が近い順',
        'en': 'Date: Earliest First',
        'zh': '日期从早到晚',
        'ko': '날짜 빠른 순'
      },
      'dateDesc': {
        'ja': '開催日が遠い順',
        'en': 'Date: Latest First',
        'zh': '日期从晚到早',
        'ko': '날짜 늦은 순'
      },
      'nameAsc': {
        'ja': '名前順（A-Z）',
        'en': 'Name: A-Z',
        'zh': '名称A-Z',
        'ko': '이름순 (A-Z)'
      },
      'nameDesc': {
        'ja': '名前順（Z-A）',
        'en': 'Name: Z-A',
        'zh': '名称Z-A',
        'ko': '이름순 (Z-A)'
      },
      'allCategories': {
        'ja': 'すべてのカテゴリ',
        'en': 'All Categories',
        'zh': '所有类别',
        'ko': '모든 카테고리'
      },
      'gaming': {
        'ja': 'ゲーム',
        'en': 'Gaming',
        'zh': '游戏',
        'ko': '게임'
      },
      'music': {
        'ja': '音楽',
        'en': 'Music',
        'zh': '音乐',
        'ko': '음악'
      },
      'art': {
        'ja': 'アート',
        'en': 'Art',
        'zh': '艺术',
        'ko': '아트'
      },
      'technology': {
        'ja': 'テクノロジー',
        'en': 'Technology',
        'zh': '技术',
        'ko': '기술'
      },
      'education': {
        'ja': '教育',
        'en': 'Education',
        'zh': '教育',
        'ko': '교육'
      },
      'social': {
        'ja': 'ソーシャル',
        'en': 'Social',
        'zh': '社交',
        'ko': '소셜'
      },
      'online': {
        'ja': 'オンライン',
        'en': 'Online',
        'zh': '在线',
        'ko': '온라인'
      },
      'offline': {
        'ja': 'オフライン',
        'en': 'Offline',
        'zh': '线下',
        'ko': '오프라인'
      },
      'featured': {
        'ja': '注目',
        'en': 'Featured',
        'zh': '精选',
        'ko': '주목'
      },
      'participants': {
        'ja': '参加者',
        'en': 'Participants',
        'zh': '参与者',
        'ko': '참가자'
      },
      'organizer': {
        'ja': '主催者',
        'en': 'Organizer',
        'zh': '主办方',
        'ko': '주최자'
      },
      'viewDetails': {
        'ja': '詳細を見る',
        'en': 'View Details',
        'zh': '查看详情',
        'ko': '상세 보기'
      },
      'joinEvent': {
        'ja': '参加する',
        'en': 'Join Event',
        'zh': '参加活动',
        'ko': '이벤트 참가'
      },
      'eventDate': {
        'ja': '開催日',
        'en': 'Event Date',
        'zh': '活动日期',
        'ko': '이벤트 날짜'
      },
      'eventTime': {
        'ja': '開催時間',
        'en': 'Event Time',
        'zh': '活动时间',
        'ko': '이벤트 시간'
      },
      'eventLocation': {
        'ja': '開催場所',
        'en': 'Event Location',
        'zh': '活动地点',
        'ko': '이벤트 장소'
      },
      'eventDescription': {
        'ja': 'イベント説明',
        'en': 'Event Description',
        'zh': '活动描述',
        'ko': '이벤트 설명'
      },
      'noEventsFound': {
        'ja': 'イベントが見つかりません',
        'en': 'No Events Found',
        'zh': '未找到活动',
        'ko': '이벤트를 찾을 수 없습니다'
      },
      'noEventsFoundDesc': {
        'ja': '検索条件に一致するイベントがありません。',
        'en': 'No events match your search criteria.',
        'zh': '没有符合搜索条件的活动。',
        'ko': '검색 조건에 맞는 이벤트가 없습니다.'
      },
      'upcoming': {
        'ja': '開催予定',
        'en': 'Upcoming',
        'zh': '即将举行',
        'ko': '예정'
      },
      'ongoing': {
        'ja': '開催中',
        'en': 'Ongoing',
        'zh': '进行中',
        'ko': '진행 중'
      },
      'completed': {
        'ja': '終了',
        'en': 'Completed',
        'zh': '已结束',
        'ko': '완료'
      },
      'free': {
        'ja': '無料',
        'en': 'Free',
        'zh': '免费',
        'ko': '무료'
      },
      'favorite': {
        'ja': 'お気に入り',
        'en': 'Favorite',
        'zh': '收藏',
        'ko': '즐겨찾기'
      },
      'share': {
        'ja': '共有',
        'en': 'Share',
        'zh': '分享',
        'ko': '공유'
      },
      'previous': {
        'ja': '前へ',
        'en': 'Previous',
        'zh': '上一页',
        'ko': '이전'
      },
      'next': {
        'ja': '次へ',
        'en': 'Next',
        'zh': '下一页',
        'ko': '다음'
      },
      // ショップページ関連
      'shopPageTitle': {
        'ja': 'エルドニアオンラインストア',
        'en': 'Eldonia Online Store',
        'zh': '艾尔多尼亚奇幻商店',
        'ko': '엘도니아 판타지 스토어'
      },
      'shopSubtitle': {
        'ja': 'ファンタジーとSFの世界を体験するオンラインストア',
        'en': 'Online store to experience fantasy and sci-fi worlds',
        'zh': '体验奇幻与科幻世界的在线商店',
        'ko': '판타지와 SF 세계를 경험하는 온라인 스토어'
      },
      'searchProducts': {
        'ja': '検索する',
        'en': 'Search',
        'zh': '搜索',
        'ko': '검색'
      },
      'searchPlaceholder': {
        'ja': '商品を検索...',
        'en': 'Search products...',
        'zh': '搜索商品...',
        'ko': '상품 검색...'
      },
      'inStockOnly': {
        'ja': '在庫がある商品のみ',
        'en': 'In Stock Only',
        'zh': '仅显示有库存',
        'ko': '재고 있는 상품만'
      },
      'stock': {
        'ja': '在庫',
        'en': 'Stock',
        'zh': '库存',
        'ko': '재고'
      },
      'itemsFound': {
        'ja': '件の商品が見つかりました',
        'en': 'items found',
        'zh': '件商品',
        'ko': '개의 상품'
      },
      'currentStock': {
        'ja': '現在の在庫',
        'en': 'Current Stock',
        'zh': '当前库存',
        'ko': '현재 재고'
      },
      'recommended': {
        'ja': 'おすすめ',
        'en': 'Recommended',
        'zh': '推荐',
        'ko': '추천'
      },
      'priceLowToHigh': {
        'ja': '価格が安い順',
        'en': 'Price: Low to High',
        'zh': '价格从低到高',
        'ko': '가격 낮은 순'
      },
      'priceHighToLow': {
        'ja': '価格が高い順',
        'en': 'Price: High to Low',
        'zh': '价格从高到低',
        'ko': '가격 높은 순'
      },
      'rating': {
        'ja': '評価順',
        'en': 'Rating',
        'zh': '评分',
        'ko': '평점'
      },
      'newestFirst': {
        'ja': '新着順',
        'en': 'Newest First',
        'zh': '最新优先',
        'ko': '최신순'
      },
      'outOfStock': {
        'ja': '在庫切れ',
        'en': 'Out of Stock',
        'zh': '缺货',
        'ko': '품절'
      },
      'lowStock': {
        'ja': '在庫わずか',
        'en': 'Low Stock',
        'zh': '库存不足',
        'ko': '재고 부족'
      },
      'inStock': {
        'ja': '在庫あり',
        'en': 'In Stock',
        'zh': '有库存',
        'ko': '재고 있음'
      },
      'adminPanel': {
        'ja': '管理パネル',
        'en': 'Admin Panel',
        'zh': '管理面板',
        'ko': '관리 패널'
      },
      'addToCart': {
        'ja': 'カートに追加',
        'en': 'Add to Cart',
        'zh': '添加到购物车',
        'ko': '장바구니에 추가'
      },
      'noProductsFound': {
        'ja': '商品が見つかりません',
        'en': 'No Products Found',
        'zh': '未找到商品',
        'ko': '상품을 찾을 수 없습니다'
      },
      'noProductsFoundDesc': {
        'ja': '検索条件に一致する商品がありません。',
        'en': 'No products match your search criteria.',
        'zh': '没有符合搜索条件的商品。',
        'ko': '검색 조건에 맞는 상품이 없습니다.'
      },
      'recommendedProducts': {
        'ja': 'おすすめ商品',
        'en': 'Recommended Products',
        'zh': '推荐商品',
        'ko': '추천 상품'
      },
      'storeStatistics': {
        'ja': 'ストア統計',
        'en': 'Store Statistics',
        'zh': '商店统计',
        'ko': '스토어 통계'
      },
      'totalProducts': {
        'ja': '総商品数',
        'en': 'Total Products',
        'zh': '总商品数',
        'ko': '총 상품 수'
      },
      'totalSellers': {
        'ja': '総出品者数',
        'en': 'Total Sellers',
        'zh': '总卖家数',
        'ko': '총 판매자 수'
      },
      'averageRating': {
        'ja': '平均評価',
        'en': 'Average Rating',
        'zh': '平均评分',
        'ko': '평균 평점'
      },
      'totalSales': {
        'ja': '総売上',
        'en': 'Total Sales',
        'zh': '总销售额',
        'ko': '총 매출'
      },
      'workshop': {
        'ja': 'ワークショップ',
        'en': 'Workshop',
        'zh': '工作坊',
        'ko': '워크숍'
      },
      'neon': {
        'ja': 'ネオン',
        'en': 'Neon',
        'zh': '霓虹',
        'ko': '네온'
      },
      'design': {
        'ja': 'デザイン',
        'en': 'Design',
        'zh': '设计',
        'ko': '디자인'
      },
      'fantasy': {
        'ja': 'ファンタジー',
        'en': 'Fantasy',
        'zh': '奇幻',
        'ko': '판타지'
      },
      'ai': {
        'ja': 'AI',
        'en': 'AI',
        'zh': '人工智能',
        'ko': 'AI'
      },
      'contest': {
        'ja': 'コンテスト',
        'en': 'Contest',
        'zh': '竞赛',
        'ko': '콘테스트'
      },
      'prize': {
        'ja': '賞金',
        'en': 'Prize',
        'zh': '奖金',
        'ko': '상금'
      },
      'live': {
        'ja': 'ライブ',
        'en': 'Live',
        'zh': '直播',
        'ko': '라이브'
      },
      'new_song': {
        'ja': '新曲',
        'en': 'New Song',
        'zh': '新歌',
        'ko': '신곡'
      },
      'digital_art': {
        'ja': 'デジタルアート',
        'en': 'Digital Art',
        'zh': '数字艺术',
        'ko': '디지털 아트'
      },
      'exhibition': {
        'ja': '展示',
        'en': 'Exhibition',
        'zh': '展览',
        'ko': '전시'
      },
      'beginner': {
        'ja': '初心者',
        'en': 'Beginner',
        'zh': '初学者',
        'ko': '초보자'
      },
      'learning': {
        'ja': '学習',
        'en': 'Learning',
        'zh': '学习',
        'ko': '학습'
      },
      'real_time': {
        'ja': 'リアルタイム',
        'en': 'Real Time',
        'zh': '实时',
        'ko': '실시간'
      },
      'cosmic': {
        'ja': 'コスミック',
        'en': 'Cosmic',
        'zh': '宇宙',
        'ko': '코스믹'
      },
      'rpg': {
        'ja': 'RPG',
        'en': 'RPG',
        'zh': '角色扮演',
        'ko': 'RPG'
      }
    }

    // 静的翻訳から取得を試行
    if (staticTranslations[key as keyof typeof staticTranslations]) {
      const langTranslations = staticTranslations[key as keyof typeof staticTranslations]
      if (langTranslations[currentLanguage]) {
        return langTranslations[currentLanguage]
      }
    }

    // 動的翻訳（API）から取得を試行
    if (translations[key]) {
      return translations[key]
    }

    // 翻訳が見つからない場合はキーをそのまま返す
    return key
  }, [translations, currentLanguage])

  // 翻訳キーからテキストを取得（エイリアス）
  const getTranslation = useCallback((key: string): string => {
    return t(key)
  }, [t])

  // 初期化時にローカルストレージから設定を読み込み
  useEffect(() => {
    const savedLanguage = localStorage.getItem('eldonia_language') as Language
    const savedStyle = localStorage.getItem('eldonia_translation_style') as TranslationStyle

    if (savedLanguage) {
      setCurrentLanguage(savedLanguage)
    }
    if (savedStyle) {
      setCurrentStyle(savedStyle)
    }
  }, [])

  // ユーザー言語設定の監視と同期
  useEffect(() => {
    const userLang = getUserLanguage()
    setUserLanguage(userLang)

    // ユーザーがログインしていて、ローカルストレージに言語設定がない場合は
    // ユーザーの言語設定を使用
    if (userLang && !localStorage.getItem('eldonia_language')) {
      setCurrentLanguage(userLang)
      localStorage.setItem('eldonia_language', userLang)
      console.log(`ユーザー言語設定を適用: ${userLang}`)
    }
  }, [getUserLanguage, isAuthenticated, user])

  return {
    // 状態
    currentLanguage,
    currentStyle,
    translations,
    isLoading,
    error,
    userLanguage,

    // アクション
    setLanguage,
    setStyle,
    translatePage,
    translateElements,
    translateText,
    translateTextDirect,
    syncWithUserLanguage,

    // ユーティリティ
    t,
    getTranslation,
    shouldTranslate
  }
}
