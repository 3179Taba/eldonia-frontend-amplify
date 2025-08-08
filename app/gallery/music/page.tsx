'use client'

import { useState, useEffect } from 'react'
import { useIntersectionObserver } from '../../lib/useIntersectionObserver'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import PageWithSidebars from '../../components/PageWithSidebars'

interface MusicItem {
  id: number
  title: string
  description: string
  author: string
  author_id: number
  created_at: string
  category: string
  type: string
  file_url: string
  thumbnail_url: string
  cover_image_url: string
  file_size: number
  file_name: string
  likes_count: number
  comments_count: number
  tags: string[]
  has_cover: boolean
}

export default function MusicGalleryPage() {
  const { elementRef, isVisible } = useIntersectionObserver({ triggerOnce: false })
  const [musicItems, setMusicItems] = useState<MusicItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // 音楽アイテムを取得
  const fetchMusicItems = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)

      // 環境変数からAPIベースURLを取得
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
      const response = await fetch(`${apiBaseUrl}/gallery/?category=music&page=${page}&page_size=12`)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`音楽データの取得に失敗しました: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // IDを正しい投稿IDに変換（例：'17-12' → 17）
      const processedItems = (data.items || []).map((item: any) => ({
        ...item,
        id: typeof item.id === 'string' && item.id.includes('-')
          ? parseInt(item.id.split('-')[0])
          : (typeof item.id === 'string' ? parseInt(item.id) : item.id)
      }))

      if (page === 1) {
        setMusicItems(processedItems)
      } else {
        setMusicItems(prev => [...prev, ...processedItems])
      }

      setHasMore(data.pagination?.has_next || false)
      setCurrentPage(page)
    } catch {
      console.error('音楽データ取得エラー:')
      setError('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMusicItems(1)
  }, [])

  // ファイルサイズを読みやすい形式に変換
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 日付を読みやすい形式に変換
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return '日付不明'
    }
  }

  return (
    <PageWithSidebars showRightSidebar={false}>
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="relative z-20">
        <div
          ref={elementRef}
          className={`pt-20 transition-all duration-1000 ${
            isVisible ? 'scroll-visible' : 'scroll-hidden'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* ヘッダーセクション */}
            <div className="text-center mb-16">
              <h1 className="section-title mb-6">
                🎵 音楽ギャラリー
              </h1>
              <p className="section-subtitle">
                オリジナル楽曲、サウンドトラックをお楽しみください
              </p>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="text-center mb-8">
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-4 rounded-lg">
                  <div className="font-semibold mb-2">エラーが発生しました</div>
                  <div className="text-sm">{error}</div>
                  <button
                    onClick={() => fetchMusicItems(1)}
                    className="mt-3 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded hover:bg-red-500/30 transition-colors"
                  >
                    再試行
                  </button>
                </div>
              </div>
            )}

            {/* 音楽作品グリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {musicItems.map((item) => (
                <div key={item.id} className="cosmic-card group cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-rose-500/20 to-neon-500/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {item.thumbnail_url || item.cover_image_url ? (
                      <img
                        src={item.thumbnail_url || item.cover_image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // 画像読み込みエラー時のフォールバック
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          target.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`text-center ${item.thumbnail_url || item.cover_image_url ? 'hidden' : ''}`}>
                      <div className="text-6xl mb-2">🎵</div>
                      <p className="text-white/60">ジャケットなし</p>
                    </div>
                  </div>
                  <h3 className="text-xl font-playfair font-bold mb-2 golden-text">{item.title}</h3>
                  <p className="text-white/70 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between text-sm text-white/50 mb-3">
                    <span>作曲: {item.author}</span>
                    <span>ジャンル: {item.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/50 mb-3">
                    <span>ファイルサイズ: {formatFileSize(item.file_size)}</span>
                    <span>いいね: {item.likes_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-white/50">
                    <span>投稿日: {formatDate(item.created_at)}</span>
                    <span>コメント: {item.comments_count}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ローディング */}
            {loading && (
              <div className="text-center mb-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
                <p className="text-white/60">音楽データを読み込み中...</p>
              </div>
            )}

            {/* もっと見るボタン */}
            {hasMore && !loading && (
              <div className="text-center mb-16">
                <button
                  onClick={() => fetchMusicItems(currentPage + 1)}
                  className="magic-button"
                >
                  もっと見る
                </button>
              </div>
            )}

            {/* データがない場合 */}
            {!loading && musicItems.length === 0 && !error && (
              <div className="text-center mb-16">
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-2xl font-playfair font-bold mb-4 golden-text">
                  音楽作品がありません
                </h3>
                <p className="text-white/60">
                  まだ音楽作品が投稿されていません。最初の音楽作品を投稿してみませんか？
                </p>
              </div>
            )}

            {/* プレイリスト */}
            <div className="mb-16">
              <h2 className="text-3xl font-playfair font-bold mb-8 text-center golden-text">
                おすすめプレイリスト
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['ファンタジー冒険', '神秘的な森', '古代の城'].map((playlist, index) => (
                  <div key={index} className="cosmic-card group cursor-pointer">
                    <div className="p-6">
                      <div className="text-4xl mb-4">🎼</div>
                      <h3 className="text-xl font-playfair font-bold mb-2 golden-text">{playlist}</h3>
                      <p className="text-white/70 mb-4">テーマに合わせた楽曲のコレクション</p>
                      <div className="text-sm text-white/50">楽曲数: {index + 8}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </PageWithSidebars>
  )
}
