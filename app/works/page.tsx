'use client'

import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageWithSidebars from '../components/PageWithSidebars'

export default function WorksPage() {
  const { elementRef, isVisible } = useIntersectionObserver({ triggerOnce: false })
  const { t } = useI18n()

  return (
    <PageWithSidebars>
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="relative z-20">
        <div
          ref={elementRef as React.RefObject<HTMLDivElement>}
          className={`pt-20 transition-all duration-1000 ${
            isVisible ? 'scroll-visible' : 'scroll-hidden'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* ヘッダーセクション */}
            <div className="text-center mb-16">
              <h1 className="section-title mb-6">
                💼 {t('worksPageTitle')}
              </h1>
              <p className="section-subtitle">
                仕事の依頼、人材募集、クリエイター紹介のための掲示板
              </p>
            </div>

            {/* カテゴリーフィルター */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button className="magic-button text-sm">すべて</button>
              <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300">仕事依頼</button>
              <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300">人材募集</button>
              <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300">クリエイター紹介</button>
            </div>

            {/* 掲示板投稿一覧 */}
            <div className="space-y-6 mb-16">
              {/* 仕事依頼 */}
              {[
                {
                  type: '仕事依頼',
                  title: 'ファンタジー小説の表紙イラスト制作',
                  author: '出版社A',
                  date: '2024年2月10日',
                  budget: '¥50,000 - ¥100,000',
                  description: 'ファンタジー小説の表紙イラストを制作していただけるイラストレーターを募集しています。中世ヨーロッパ風の世界観で、主人公とドラゴンが対峙するシーンを描いていただきたいです。',
                  tags: ['イラスト', 'ファンタジー', '表紙'],
                  icon: '📚',
                  color: 'from-emerald-500/20 to-teal-500/20'
                },
                {
                  type: '人材募集',
                  title: 'ゲーム開発チームにイラストレーター募集',
                  author: 'ゲームスタジオB',
                  date: '2024年2月8日',
                  budget: '月給¥300,000 - ¥500,000',
                  description: 'RPGゲームのキャラクターデザインと背景イラストを担当していただけるイラストレーターを募集しています。フルタイムでの勤務をお願いします。',
                  tags: ['ゲーム', 'キャラクター', '背景'],
                  icon: '🎮',
                  color: 'from-blue-500/20 to-purple-500/20'
                },
                {
                  type: 'クリエイター紹介',
                  title: 'フリーランスイラストレーター募集中',
                  author: 'Artist_Alice',
                  date: '2024年2月7日',
                  budget: '応相談',
                  description: 'ファンタジー・SF系のイラスト制作を承っております。キャラクターデザイン、背景イラスト、コンセプトアートなど幅広く対応可能です。',
                  tags: ['フリーランス', 'イラスト', 'キャラクター'],
                  icon: '🎨',
                  color: 'from-rose-500/20 to-pink-500/20'
                },
                {
                  type: '仕事依頼',
                  title: 'アニメーションPV制作',
                  author: '音楽レーベルC',
                  date: '2024年2月6日',
                  budget: '¥200,000 - ¥500,000',
                  description: '楽曲のプロモーションビデオを制作していただけるアニメーターを募集しています。ファンタジー世界を舞台にした2Dアニメーションをお願いします。',
                  tags: ['アニメーション', 'PV', '音楽'],
                  icon: '🎬',
                  color: 'from-amber-500/20 to-orange-500/20'
                },
                {
                  type: '人材募集',
                  title: 'Webデザイナー募集（ファンタジーサイト）',
                  author: 'Web制作会社D',
                  date: '2024年2月5日',
                  budget: '月給¥250,000 - ¥400,000',
                  description: 'ファンタジー系のWebサイト制作を担当していただけるデザイナーを募集しています。UI/UXデザインの経験をお持ちの方歓迎します。',
                  tags: ['Webデザイン', 'UI/UX', 'ファンタジー'],
                  icon: '💻',
                  color: 'from-cyan-500/20 to-blue-500/20'
                },
                {
                  type: 'クリエイター紹介',
                  title: '3Dモデラー・アニメーター募集中',
                  author: '3D_Creator_Bob',
                  date: '2024年2月4日',
                  budget: '応相談',
                  description: 'ゲームやアニメーション用の3Dモデル制作、アニメーション制作を承っております。Blender、Maya、3ds Max対応可能です。',
                  tags: ['3D', 'モデリング', 'アニメーション'],
                  icon: '🎭',
                  color: 'from-violet-500/20 to-purple-500/20'
                }
              ].map((post, index) => (
                <div key={index} className="cosmic-card group cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${post.color} flex items-center justify-center`}>
                          <div className="text-2xl">{post.icon}</div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              post.type === '仕事依頼' ? 'bg-emerald-500/20 text-emerald-300' :
                              post.type === '人材募集' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-rose-500/20 text-rose-300'
                            }`}>
                              {post.type}
                            </span>
                            <span className="text-sm text-white/50">{post.date}</span>
                          </div>
                          <h3 className="text-xl font-playfair font-bold golden-text">{post.title}</h3>
                          <p className="text-white/70 text-sm">投稿者: {post.author}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold golden-text mb-1">{post.budget}</div>
                        <button className="magic-button text-sm">{t('viewDetails')}</button>
                      </div>
                    </div>
                    
                    <p className="text-white/80 mb-4 leading-relaxed">
                      {post.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="px-3 py-1 bg-white/10 border border-white/20 text-white/70 rounded-full text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2 text-sm text-white/50">
                        <button className="flex items-center space-x-1 hover:text-magic-300 transition-colors">
                          <span>💬</span>
                          <span>{index + 3}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-magic-300 transition-colors">
                          <span>❤️</span>
                          <span>{index * 3 + 8}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 投稿ボタン */}
            <div className="text-center mb-16">
              <button className="magic-button text-lg px-8 py-4">
                📝 新しい投稿を作成
              </button>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
              <div className="stat-card text-center">
                <div className="text-3xl font-bold golden-text mb-2">156</div>
                <div className="text-white/70">{t('totalPosts')}</div>
              </div>
              <div className="stat-card text-center">
                <div className="text-3xl font-bold golden-text mb-2">89</div>
                <div className="text-white/70">{t('jobRequests')}</div>
              </div>
              <div className="stat-card text-center">
                <div className="text-3xl font-bold golden-text mb-2">45</div>
                <div className="text-white/70">{t('recruitment')}</div>
              </div>
              <div className="stat-card text-center">
                <div className="text-3xl font-bold golden-text mb-2">234</div>
                <div className="text-white/70">{t('creators')}</div>
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