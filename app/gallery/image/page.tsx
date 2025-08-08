'use client'

import { useIntersectionObserver } from '../../lib/useIntersectionObserver'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import PageWithSidebars from '../../components/PageWithSidebars'

export default function ImageGalleryPage() {
  const { elementRef, isVisible } = useIntersectionObserver({ triggerOnce: false })

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
                🖼️ 画像ギャラリー
              </h1>
              <p className="section-subtitle">
                イラスト、写真、デジタルアート作品をお楽しみください
              </p>
            </div>

            {/* フィルター */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button className="magic-button text-sm">すべて</button>
              <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300">イラスト</button>
              <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300">写真</button>
              <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300">デジタルアート</button>
            </div>

            {/* 画像作品グリッド */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
                <div key={item} className="cosmic-card group cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-emerald-500/20 to-amber-500/20 rounded-lg mb-4 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl mb-2">🖼️</div>
                      <p className="text-white/60">画像 {item}</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-playfair font-bold mb-2 golden-text">ファンタジーイラスト #{item}</h3>
                  <p className="text-white/70 mb-3 text-sm">美しいファンタジー世界を描いたイラスト作品</p>
                  <div className="flex items-center justify-between text-sm text-white/50">
                    <span>作者: Artist{item}</span>
                    <span>解像度: 4K</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </PageWithSidebars>
  )
} 