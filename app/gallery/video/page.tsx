'use client'

import { useIntersectionObserver } from '../../lib/useIntersectionObserver'
import { useState, useEffect } from 'react'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import PageWithSidebars from '../../components/PageWithSidebars'

import { Settings } from 'lucide-react'

export default function VideoGalleryPage() {
  const { elementRef, isVisible } = useIntersectionObserver({ triggerOnce: false })
  const [likes, setLikes] = useState<{ [key: number]: boolean }>({})
  const [subs, setSubs] = useState<{ [key: number]: boolean }>({})
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // APIから動画データを取得
    const fetchVideos = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/gallery/items?category=video&page=1&page_size=30')
        const data = await res.json()
        if (data.items) {
          // IDを正しい投稿IDに変換（例：'17-12' → 17）
          const processedVideos = data.items.map((item: any) => ({
            ...item,
            id: typeof item.id === 'string' && item.id.includes('-')
              ? parseInt(item.id.split('-')[0])
              : (typeof item.id === 'string' ? parseInt(item.id) : item.id)
          }))
          // 新しい投稿が先頭になるように（APIはcreated_at降順なのでそのまま）
          setVideos(processedVideos)
        }
      } catch {
        setVideos([])
      } finally {
        setLoading(false)
      }
    }
    fetchVideos()
  }, [])

  const toggleLike = (id: number) => {
    setLikes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleSub = (id: number) => {
    setSubs(prev => ({ ...prev, [id]: !prev[id] }))
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
                🎬 動画ギャラリー
              </h1>
              <p className="section-subtitle">
                アニメーション、ショートムービー、VFX作品をお楽しみください
              </p>
            </div>

            {/* フィルター */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button className="magic-button text-sm">すべて</button>
              <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300">アニメーション</button>
              <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300">ショートムービー</button>
              <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300">VFX</button>
            </div>

            {/* 動画作品グリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {loading ? (
                <div className="col-span-3 text-center text-white/70">読み込み中...</div>
              ) : videos.length === 0 ? (
                <div className="col-span-3 text-center text-white/70">動画がありません</div>
              ) : (
                videos.map((item) => (
                  <div key={item.id} className="cosmic-card group cursor-pointer flex flex-col h-full">
                    <div className="aspect-video bg-gradient-to-br from-magic-500/20 to-cosmic-500/20 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {item.file_url && item.type === 'video' ? (
                        <div className="relative">
                          <video
                            src={item.file_url}
                            className="max-w-full max-h-full object-contain rounded-lg"
                            autoPlay
                          />
                          {/* カスタムコントロール（再生・一時停止・音量・シーク・歯車）をここに配置 */}
                          <div className="absolute bottom-4 right-4">
                            <button className="p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors">
                              <Settings className="w-6 h-6" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-6xl mb-2">🎬</div>
                          <p className="text-white/60">動画作品</p>
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-playfair font-bold mb-2 golden-text">{item.title}</h3>
                    <p className="text-white/70 mb-4">{item.description}</p>
                    <div className="flex items-center justify-between text-sm text-white/50">
                      <span>作者: {item.author}</span>
                      <span>投稿日: {item.created_at ? item.created_at.slice(0, 10) : ''}</span>
                    </div>

                    {/* いいね・チャンネル登録ボタン */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(item.id)
                        }}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm transition-colors duration-200 ${likes[item.id] ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        ❤️ {likes[item.id] ? 'いいね済み' : 'いいね'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSub(item.id)
                        }}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-md text-sm transition-colors duration-200 ${subs[item.id] ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        🔔 {subs[item.id] ? '登録済み' : '登録'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </PageWithSidebars>
  )
}
