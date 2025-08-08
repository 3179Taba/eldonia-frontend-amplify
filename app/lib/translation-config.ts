// 翻訳機能の設定
export const TRANSLATION_CONFIG = {
  // トップページの保護設定
  homePage: {
    // 翻訳に失敗してもページを表示する
    fallbackToOriginal: true,
    // 翻訳エラーをコンソールに表示する
    showErrorsInConsole: true,
    // 翻訳エラーをUIに表示する（開発環境のみ）
    showErrorsInUI: process.env.NODE_ENV === 'development',
    // 翻訳のタイムアウト（ミリ秒）
    timeout: 5000,
    // 翻訳のリトライ回数
    maxRetries: 2,
  },

  // 翻訳APIの設定
  api: {
    // ベースURL
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    // 翻訳エンドポイント
    endpoints: {
      siteTranslation: '/api/ai/site-translation/',
      singleTranslation: '/api/ai/single-translation/',
      userLanguageUpdate: '/api/ai/update-user-language/',
    },
    // リクエストのタイムアウト
    timeout: 10000,
    // リトライ設定
    retry: {
      maxAttempts: 3,
      delay: 1000,
      backoffMultiplier: 2,
    },
  },

  // 翻訳の品質設定
  quality: {
    // 翻訳スタイル
    defaultStyle: 'formal' as const,
    // 翻訳の信頼度閾値
    confidenceThreshold: 0.7,
    // 翻訳の最大文字数
    maxTextLength: 1000,
  },

  // キャッシュ設定
  cache: {
    // 翻訳結果をキャッシュする
    enabled: true,
    // キャッシュの有効期限（ミリ秒）
    ttl: 24 * 60 * 60 * 1000, // 24時間
    // キャッシュの最大サイズ
    maxSize: 1000,
  },

  // エラーハンドリング設定
  errorHandling: {
    // 翻訳エラーを無視してフォールバックテキストを使用
    fallbackOnError: true,
    // エラーをコンソールに記録
    logErrors: true,
    // エラーをユーザーに通知
    notifyUser: false,
    // エラー時のリトライ
    retryOnError: true,
  },

  // パフォーマンス設定
  performance: {
    // 翻訳の遅延実行
    debounceDelay: 300,
    // バッチ翻訳の最大サイズ
    batchSize: 10,
    // 並行翻訳の最大数
    maxConcurrent: 3,
  },
}

// 翻訳キーのマッピング
export const TRANSLATION_KEY_MAPPING = {
  // トップページの翻訳キー
  homePage: {
    heroSubtitle: 'heroSubtitle',
    postWork: 'postWork',
    exploreGallery: 'exploreGallery',
  },
  
  // ヘッダーの翻訳キー
  header: {
    siteName: 'siteName',
    gallery: 'gallery',
    shop: 'shop',
    events: 'events',
    community: 'community',
    works: 'works',
    login: 'login',
  },
  
  // フッターの翻訳キー
  footer: {
    footerDesc: 'footerDesc',
    technologies: 'technologies',
    siteMap: 'siteMap',
    navigation: 'navigation',
    support: 'support',
    partners: 'partners',
  },
}

// 翻訳の優先度設定
export const TRANSLATION_PRIORITY = {
  // 高優先度（ページの主要な要素）
  HIGH: ['heroSubtitle', 'postWork', 'exploreGallery', 'siteName'],
  
  // 中優先度（ナビゲーション要素）
  MEDIUM: ['gallery', 'shop', 'events', 'community', 'works', 'login'],
  
  // 低優先度（補助的な要素）
  LOW: ['footerDesc', 'technologies', 'siteMap', 'navigation', 'support'],
}

// 翻訳の除外設定
export const TRANSLATION_EXCLUSIONS = {
  // 翻訳しない要素
  excludeElements: [
    'logo',
    'brand-name',
    'technical-terms',
    'email-addresses',
    'urls',
    'numbers',
    'dates',
  ],
  
  // 翻訳しないクラス名
  excludeClasses: [
    'no-translate',
    'brand',
    'technical',
    'code',
  ],
  
  // 翻訳しない属性
  excludeAttributes: [
    'alt',
    'title',
    'placeholder',
    'aria-label',
  ],
} 