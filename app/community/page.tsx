'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LeftSidebar from '../components/LeftSidebar'
import AITestPanel from '../components/AITestPanel'
import { getGroups } from '../lib/groupUtils'
import { Users, MessageCircle, Globe, Heart, Star, Award, TrendingUp, Languages, Search, Plus, Calendar, Palette, Music, Video, BookOpen, Code, Camera, PenTool, Mic, Gamepad2, Lightbulb, Users2, FolderOpen, MessageSquare, Share2, Settings, Crown, Zap, Target } from 'lucide-react'

export default function CommunityPage() {
  const { elementRef, isVisible } = useIntersectionObserver({ triggerOnce: false })
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // グループデータを読み込み
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoading(true)
        const groupsData = await getGroups()
        setGroups(groupsData)
      } catch (error) {
        console.error('Failed to load groups:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGroups()
  }, [])

  // カテゴリ別グループデータ
  const categories = [
    { id: 'all', name: 'すべて', icon: Users, color: 'from-blue-500 to-purple-500' },
    { id: 'art', name: 'アート・イラスト', icon: Palette, color: 'from-pink-500 to-red-500' },
    { id: 'music', name: '音楽・作曲', icon: Music, color: 'from-green-500 to-teal-500' },
    { id: 'video', name: '動画・映像', icon: Video, color: 'from-purple-500 to-indigo-500' },
    { id: 'writing', name: '小説・文章', icon: BookOpen, color: 'from-yellow-500 to-orange-500' },
    { id: 'programming', name: 'プログラミング', icon: Code, color: 'from-gray-500 to-slate-500' },
    { id: 'photography', name: '写真・カメラ', icon: Camera, color: 'from-cyan-500 to-blue-500' },
    { id: 'design', name: 'デザイン', icon: PenTool, color: 'from-emerald-500 to-green-500' },
    { id: 'voice', name: 'ボイス・音声', icon: Mic, color: 'from-violet-500 to-purple-500' },
    { id: 'gaming', name: 'ゲーム開発', icon: Gamepad2, color: 'from-red-500 to-pink-500' },
    { id: 'gallery', name: 'GALLERY作品', icon: Heart, color: 'from-rose-500 to-pink-500' },
    { id: 'idea', name: 'アイデア・企画', icon: Lightbulb, color: 'from-amber-500 to-yellow-500' }
  ]

  const filteredGroups = groups.filter(group => {
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // ローディング中の場合
  if (loading) {
    return (
      <div className="min-h-screen bg-fantasy-gradient relative overflow-hidden">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fantasy-gradient relative overflow-hidden">
      {/* 左サイドバー - PC版のみ表示 */}
      <div className="hidden lg:block">
        <LeftSidebar isOpen={isLeftSidebarOpen} onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
      </div>

      {/* メインコンテンツエリア */}
      <div className={`pt-20 transition-all duration-300 ${
        isLeftSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      }`}>
        {/* ヘッダー */}
        <Header />

        <main className="relative z-20 min-h-screen">
          <div
            ref={elementRef as React.RefObject<HTMLDivElement>}
            className={`transition-all duration-1000 w-full ${
              isVisible ? 'scroll-visible' : 'scroll-hidden'
            }`}
          >
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
              {/* ヒーローセクション */}
              <div className="relative pt-5 pb-16 overflow-hidden mb-8">
                {/* 装飾要素 */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl animate-bounce"></div>
                <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>

                <div className="relative z-10">
                  {/* ヘッダー */}
                  <div className="text-center mb-8">
                    <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 mb-2 font-bebas-neue tracking-wider">
                      COMMUNITY
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                      <span className="text-amber-400 text-sm font-cormorant-garamond tracking-widest italic">
                        CREATIVE GROUPS
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                    </div>
                  </div>

                  {/* サブタイトル */}
                  <p className="text-gray-300 text-lg font-lora leading-relaxed italic mt-6 text-center max-w-3xl mx-auto">
                    同じ趣味や目標を持つクリエーターとグループを作成し、共同作業で作品を完成させましょう
                  </p>
                </div>
              </div>

              {/* 検索・フィルターセクション */}
              <div className="mb-8 rounded-xl p-6 -mt-20">
                {/* 検索バー */}
                <div className="max-w-3xl mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="グループ名、説明、タグで検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-800/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400 text-lg"
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  </div>
                </div>

                {/* カテゴリーフィルター */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {categories.map((category) => {
                      const IconComponent = category.icon
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                            selectedCategory === category.id
                              ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                              : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-white/10'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          {category.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* グループ作成CTA */}
              <div className="mb-8 text-center">
                <Link
                  href="/community/create-group"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  新しいグループを作成
                </Link>
              </div>

              {/* グループ一覧 */}
              <div className="mb-16">
                <h2 className="text-3xl font-playfair font-bold mb-8 text-center golden-text">
                  人気のグループ
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGroups.map((group) => {
                    const category = categories.find(cat => cat.id === group.category)
                    return (
                      <div key={group.id} className="cosmic-card group cursor-pointer hover:scale-105 transition-all duration-300">
                        {/* グループ画像 */}
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={group.image || '/img/srnote_Beautiful_gothic_bookcase_candlelight_medieval_desk_to_0cd8b99d-521c-400b-b6c5-79451622c0bf_0.png'}
                            alt={group.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                          {/* カテゴリバッジ */}
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${category?.color} text-white`}>
                              {category?.name}
                            </span>
                          </div>

                          {/* プライベート/パブリックバッジ */}
                          <div className="absolute top-4 right-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              group.isPublic
                                ? 'bg-green-500/80 text-white'
                                : 'bg-yellow-500/80 text-white'
                            }`}>
                              {group.isPublic ? 'パブリック' : 'プライベート'}
                            </span>
                          </div>
                        </div>

                        {/* グループ情報 */}
                        <div className="p-6">
                          <h3 className="text-xl font-playfair font-bold mb-2 golden-text group-hover:text-yellow-300 transition-colors">
                            {group.name}
                          </h3>
                          <p className="text-white/70 text-sm mb-4 line-clamp-2">
                            {group.description}
                          </p>

                          {/* メンバー数 */}
                          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                            <Users2 className="w-4 h-4" />
                            <span>{group.members}/{group.maxMembers} メンバー</span>
                          </div>

                          {/* タグ */}
                          <div className="flex flex-wrap gap-1 mb-4">
                            {group.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* アクションボタン */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-white/50 text-sm">
                              <MessageSquare className="w-4 h-4" />
                              <span>{group.lastActivity}</span>
                            </div>
                            <Link
                              href={`/community/group/${group.id}`}
                              className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                            >
                              参加する
                              <Users2 className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* グループが見つからない場合 */}
                {filteredGroups.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-white/50 text-lg mb-2">
                      条件に合うグループが見つかりませんでした
                    </div>
                    <p className="text-white/30">
                      新しいグループを作成してみませんか？
                    </p>
                  </div>
                )}
              </div>

              {/* 共同作業機能 */}
              <div className="mb-16">
                <h2 className="text-3xl font-playfair font-bold mb-8 text-center golden-text">
                  共同作業機能
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { icon: MessageSquare, title: 'グループチャット', desc: 'リアルタイムでメンバーとコミュニケーション。ファイル共有も可能' },
                    { icon: FolderOpen, title: 'ファイル共有', desc: '作品や素材を安全に共有。バージョン管理で進捗を追跡' },
                    { icon: Calendar, title: 'スケジュール管理', desc: '共同作業の予定を管理。締切やミーティングを設定' },
                    { icon: Target, title: 'タスク管理', desc: '作業を細分化して進捗を管理。完了度を可視化' },
                    { icon: Share2, title: '作品発表', desc: '完成した作品をグループ内で発表。フィードバックを収集' },
                    { icon: Crown, title: 'リーダー機能', desc: 'グループリーダーがメンバーを管理。権限設定で安全に' }
                  ].map((feature, index) => (
                    <div key={index} className="cosmic-card text-center group cursor-pointer">
                      <div className="p-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-magic-500/30 to-cosmic-500/30 rounded-full mx-auto mb-4 flex items-center justify-center">
                          <feature.icon className="w-8 h-8 text-magic-300" />
                        </div>
                        <h3 className="text-xl font-playfair font-bold mb-2 golden-text">{feature.title}</h3>
                        <p className="text-white/70 mb-4">{feature.desc}</p>
                        <button className="magic-button text-sm">詳細を見る</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 統計セクション */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 mb-16">
                <h2 className="text-3xl font-bold text-white text-center mb-8">
                  コミュニティ統計
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">1,234</div>
                    <div className="text-blue-200">アクティブグループ</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mx-auto mb-4">
                      <Users2 className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">15,678</div>
                    <div className="text-blue-200">グループメンバー</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-purple-500 rounded-full mx-auto mb-4">
                      <Zap className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">567</div>
                    <div className="text-blue-200">完成作品</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mx-auto mb-4">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">98%</div>
                    <div className="text-blue-200">満足度</div>
                  </div>
                </div>
              </div>

              {/* CTAセクション */}
              <div className="text-center">
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link
                    href="/community/create-group"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    グループを作成
                  </Link>
                  <Link
                    href="/community/browse-groups"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    グループを探す
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* フッター */}
        <Footer />
      </div>

      {/* AIテストパネル */}
      <AITestPanel />
    </div>
  )
}
