'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useI18n } from '../../lib/i18n-provider'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import LeftSidebar from '../../components/LeftSidebar'
import { getGroups } from '../../lib/groupUtils'
import { Users, MessageCircle, Globe, Heart, Star, Award, TrendingUp, Languages, Search, Plus, Calendar, Palette, Music, Video, BookOpen, Code, Camera, PenTool, Mic, Gamepad2, Lightbulb, Users2, FolderOpen, MessageSquare, Share2, Settings, Crown, Zap, Target, SortAsc, SortDesc } from 'lucide-react'

export default function BrowseGroupsPage() {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('activity')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
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

  // カテゴリオプション
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

  const filteredAndSortedGroups = groups
    .filter(group => {
      const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory
      const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           group.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'activity':
          comparison = a.lastActivity.localeCompare(b.lastActivity)
          break
        case 'members':
          comparison = a.members - b.members
          break
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
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
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            {/* ページヘッダー */}
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-4 golden-text">
                グループを探す
              </h1>
              <p className="text-white/80 max-w-2xl mx-auto">
                あなたの興味に合ったグループを見つけて、新しい仲間とつながりましょう。
                様々なカテゴリから、理想のコミュニティを発見できます。
              </p>
            </div>

            {/* 検索・フィルター・ソート */}
            <div className="max-w-7xl mx-auto mb-8">
              <div className="cosmic-card p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  {/* 検索バー */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="グループを検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400"
                    />
                  </div>

                  {/* カテゴリフィルター */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((category) => {
                      const IconComponent = category.icon
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 ${
                            selectedCategory === category.id
                              ? `bg-gradient-to-r ${category.color} text-white`
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                          {category.name}
                        </button>
                      )
                    })}
                  </div>

                  {/* ソート */}
                  <div className="flex gap-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    >
                      <option value="activity">活動順</option>
                      <option value="members">メンバー数順</option>
                      <option value="name">名前順</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
                    >
                      {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* グループ一覧 */}
            <div className="max-w-7xl mx-auto mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-playfair font-bold golden-text">
                  グループ一覧 ({filteredAndSortedGroups.length}件)
                </h2>
                <Link
                  href="/community/create-group"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                  新しいグループを作成
                </Link>
              </div>

              {filteredAndSortedGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAndSortedGroups.map((group) => {
                    const category = categories.find(cat => cat.id === group.category)
                    const IconComponent = category?.icon || Users

                    return (
                      <Link key={group.id} href={`/community/group/${group.id}`}>
                        <div className="cosmic-card p-6 h-full hover:scale-105 transition-all duration-300 cursor-pointer">
                          {/* グループ画像 */}
                          <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                            <img
                              src={group.image || '/img/srnote_Beautiful_gothic_bookcase_candlelight_medieval_desk_to_0cd8b99d-521c-400b-b6c5-79451622c0bf_0.png'}
                              alt={group.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                            {/* カテゴリバッジ */}
                            <div className="absolute top-3 left-3">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${category?.color} text-white flex items-center gap-1`}>
                                <IconComponent className="w-3 h-3" />
                                {category?.name}
                              </span>
                            </div>

                            {/* プライバシーバッジ */}
                            <div className="absolute top-3 right-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                group.isPublic
                                  ? 'bg-green-500/80 text-white'
                                  : 'bg-yellow-500/80 text-white'
                              }`}>
                                {group.isPublic ? '公開' : 'プライベート'}
                              </span>
                            </div>
                          </div>

                          {/* グループ情報 */}
                          <div>
                            <h3 className="text-xl font-playfair font-bold mb-2 golden-text">
                              {group.name}
                            </h3>
                            <p className="text-white/70 text-sm mb-4 line-clamp-2">
                              {group.description}
                            </p>

                            {/* 統計情報 */}
                            <div className="flex items-center justify-between text-sm text-white/60 mb-3">
                              <div className="flex items-center gap-1">
                                <Users2 className="w-4 h-4" />
                                <span>{group.members}/{group.maxMembers}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageCircle className="w-4 h-4" />
                                <span>{group.lastActivity}</span>
                              </div>
                            </div>

                            {/* タグ */}
                            <div className="flex flex-wrap gap-1">
                              {group.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-white/50 text-lg mb-2">
                    条件に合うグループが見つかりませんでした
                  </div>
                  <p className="text-white/30 mb-4">
                    検索条件を変更するか、新しいグループを作成してみませんか？
                  </p>
                  <Link
                    href="/community/create-group"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300"
                  >
                    <Plus className="w-5 h-5" />
                    新しいグループを作成
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* フッター */}
        <Footer />
      </div>
    </div>
  )
}
