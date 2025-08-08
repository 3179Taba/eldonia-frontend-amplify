'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, Star, Search, Heart, Share2, ExternalLink, Video, Music, Palette, Camera } from 'lucide-react'
import Link from 'next/link'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LeftSidebar from '../components/LeftSidebar'
import { useTranslation, Language } from '../lib/useTranslation'
import TranslatableText from '../components/TranslatableText'
import { dummyEvents } from './dummyEvents'

interface Event {
  id: string
  title: string
  description: string
  titleKey: string
  descriptionKey: string
  date: Date
  time: string
  location: string
  locationKey: string
  category: 'art' | 'music' | 'gaming' | 'technology' | 'education' | 'social'
  creator: {
    id: string
    name: string
    avatar: string
    nameKey: string
  }
  image: string
  attendees: number
  maxAttendees: number
  price: number
  isFree: boolean
  isOnline: boolean
  isFeatured: boolean
  tags: string[]
  status: 'upcoming' | 'ongoing' | 'completed'
}

// imgフォルダの画像リスト（実際に存在する画像を使用）
const eventImages = [
  '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_02ff9b2b-44c9-498c-ab8e-4fdf612b919b_0.png',
  '/img/srnote_Beautiful_gothic_bookcase_candlelight_medieval_desk_to_0cd8b99d-521c-400b-b6c5-79451622c0bf_0.png',
  '/img/srnote_Beautiful_Gothic_study_candlelight_medieval_desk_top_t_9dd5cde6-f814-47cf-b600-03eacd16416f_0.png',
  '/img/srnote_cute_cat_full_body_cyberpunk_elf_PhD_fantasy_boy_moon__ffea1def-f8ea-41ee-a4ef-558cae025c19_0.png',
  '/img/srnote_Path_lined_with_medieval_streetlights_--ar_169_--style_r_911b0898-4fa8-46b3-8fde-5fb64045e01f.png',
  '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_v_a43f734f-ee71-41df-8aef-0e51ad446ede.png',
]

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'price'>('date')
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const { t, currentLanguage } = useTranslation()

  // 検索プレースホルダーは静的翻訳を使用
  const searchPlaceholder = t('searchEventsPlaceholder')

  // ダミーイベントデータ（共通ファイルから読み込み）
  useEffect(() => {
    const demo = dummyEvents.map((ev, idx) => ({
      ...ev,
      image: eventImages[idx % eventImages.length] || '/img/default.png',
    }))
    setEvents(demo)
    setFilteredEvents(demo)
  }, [])

  // フィルタリングとソート
  useEffect(() => {
    let filtered = events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return a.date.getTime() - b.date.getTime()
        case 'popularity':
          return b.attendees - a.attendees
        case 'price':
          return a.price - b.price
        default:
          return 0
      }
    })

    setFilteredEvents(filtered)
  }, [events, searchTerm, selectedCategory, selectedStatus, sortBy])

  const categories = [
    { key: 'all', label: 'すべて', icon: Calendar },
    { key: 'art', label: 'アート', icon: Palette },
    { key: 'music', label: '音楽', icon: Music },
    { key: 'gaming', label: 'ゲーム', icon: Video },
    { key: 'technology', label: 'テクノロジー', icon: Video },
    { key: 'education', label: '教育', icon: Users },
    { key: 'social', label: 'ソーシャル', icon: Users }
  ]

  const formatDate = (date: Date) => {
    const localeMap: Record<Language, string> = {
      ja: 'ja-JP',
      en: 'en-US',
      zh: 'zh-CN',
      ko: 'ko-KR'
    }
    const locale = localeMap[currentLanguage] || 'en-US'
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
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
          {/* ヒーローセクション */}
          <div className="relative pt-5 pb-8 overflow-hidden">
            {/* 装飾要素 */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl animate-bounce"></div>
            <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>

            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
              {/* ヘッダー */}
              <div className="relative mb-8 text-center">
                <h1 className="text-4xl md:text-6xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400 mb-4">
                  EVENTS
                </h1>
                <p className="text-gray-300 text-lg font-lora leading-relaxed italic max-w-3xl mx-auto">
                  Discover amazing events and connect with creators around the world
                </p>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="relative px-4 sm:px-6 lg:px-8 pb-8">
            {/* 検索とフィルター */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* 検索バー */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-400 focus:border-transparent"
                  />
                </div>

                {/* カテゴリフィルター */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/25'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {t('allCategories')}
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === category.key
                          ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/25'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
                      }`}
                    >
                      {t(category.key)}
                    </button>
                  ))}
                </div>
              </div>

              {/* ソートオプション */}
              <div className="flex flex-wrap items-center gap-4 text-white/70">
                <span className="text-sm">
                  {t('sortBy')}:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'date' | 'popularity' | 'price')}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-magic-400"
                >
                  <option value="date">
                    {t('dateAsc')}
                  </option>
                  <option value="popularity">
                    {t('nameAsc')}
                  </option>
                  <option value="price">
                    {t('nameDesc')}
                  </option>
                </select>
              </div>
            </div>

            {/* イベント一覧 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="glass-effect rounded-lg overflow-hidden cosmic-border hover:shadow-2xl hover:shadow-magic-500/20 transition-all duration-500 ease-out group hover:scale-105"
                >
                  {/* イベント画像 */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-125 transition-all duration-700 ease-out"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes('default.png')) {
                          // デフォルト画像も読み込めない場合は、プレースホルダーを表示
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        } else {
                          target.src = '/img/default.png';
                        }
                      }}
                    />
                    {/* 画像読み込み失敗時のプレースホルダー */}
                    <div className="hidden absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Calendar className="w-8 h-8 text-white/60" />
                        </div>
                        <p className="text-white/60 text-sm">画像なし</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* タイトル（修正） */}
                    <div
                      className="absolute top-0 left-0 w-full z-10 px-4 pt-2 pb-1 bg-gradient-to-b from-black/80 to-transparent"
                      style={{ pointerEvents: 'none' }}
                    >
                      <span
                        className="block text-white text-base font-bold truncate"
                        style={{
                          maxWidth: 'calc(100% - 48px)', // 右上のアイコン分余白
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        <TranslatableText translationKey={event.titleKey} fallbackText={event.title} />
                      </span>
                    </div>

                    {/* お気に入りボタン */}
                    <button className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-20">
                      <Heart className="w-4 h-4 text-white" />
                    </button>

                    {/* 左下のバッジ群 */}
                    <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                      {/* ステータスバッジ */}
                      <span className="px-2 py-1 bg-magic-500/80 text-white text-xs font-medium rounded">
                        {t('upcoming')}
                      </span>
                      {event.isOnline && (
                        <span className="px-2 py-1 bg-blue-500/80 text-white text-xs font-medium rounded">
                          {t('online')}
                        </span>
                      )}
                    </div>

                    {/* 注目イベント表示 */}
                    {event.isFeatured && (
                      <div className="absolute bottom-4 right-4">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                          {t('featured')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* イベント情報 */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-white group-hover:text-magic-300 transition-colors flex-1 pr-4 min-w-0">
                        <TranslatableText translationKey={event.titleKey} fallbackText={event.title} />
                      </h3>
                      <button className="p-1 text-white/50 hover:text-white transition-colors flex-shrink-0">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-white/70 text-sm mb-4 line-clamp-2">
                      <TranslatableText translationKey={event.descriptionKey} fallbackText={event.description} />
                    </p>

                    {/* イベント詳細 */}
                    <div className="p-4">
                      {/* 日時と場所 */}
                      <div className="flex items-center gap-4 text-white/70 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span><TranslatableText translationKey={event.locationKey} fallbackText={event.location} /></span>
                        </div>
                      </div>

                      {/* 参加者数 */}
                      <div className="flex items-center gap-1 text-white/70 text-sm mb-3">
                        <Users className="w-4 h-4" />
                        <span>
                          {t('participants')}: {event.attendees}/{event.maxAttendees}
                        </span>
                      </div>

                      {/* 価格 */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {event.isFree ? (
                            <span className="text-green-400 font-medium">
                              {t('free')}
                            </span>
                          ) : (
                            <span className="text-white font-medium">
                              ¥{event.price.toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* 主催者 */}
                        <div className="flex items-center gap-2 text-white/70 text-sm">
                          <span>
                            {t('organizer')}
                          </span>
                          <span className="font-medium"><TranslatableText translationKey={event.creator.nameKey} fallbackText={event.creator.name} /></span>
                        </div>
                      </div>
                    </div>

                    {/* 作成者情報 */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {event.creator.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white"><TranslatableText translationKey={event.creator.nameKey} fallbackText={event.creator.name} /></p>
                        <p className="text-xs text-white/60">{t('organizer')}</p>
                      </div>
                    </div>

                    {/* タグ */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {event.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs"
                        >
                          {t(tag)}
                        </span>
                      ))}
                      {event.tags.length > 3 && (
                        <span className="px-2 py-1 bg-white/10 text-white/70 rounded-full text-xs">
                          +{event.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* アクションボタン */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-3 py-1 bg-magic-500/20 text-magic-400 rounded text-sm hover:bg-magic-500/30 transition-colors">
                          <Heart className="w-4 h-4" />
                          {t('favorite')}
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 bg-white/10 text-white/70 rounded text-sm hover:bg-white/20 transition-colors">
                          <Share2 className="w-4 h-4" />
                          {t('share')}
                        </button>
                      </div>

                      <Link
                        href={`/events/${event.id}`}
                        className="flex items-center gap-1 px-4 py-2 bg-magic-500 text-white rounded-lg text-sm font-medium hover:bg-magic-600 transition-colors"
                      >
                        {t('viewDetails')}
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* イベントが見つからない場合 */}
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <div className="text-white/50 text-lg mb-2">
                  {t('noEventsFound')}
                </div>
                <p className="text-white/30">
                  {t('noEventsFoundDesc')}
                </p>
              </div>
            )}

            {/* ページネーション */}
            {filteredEvents.length > 0 && (
              <div className="mt-8 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors">
                    {t('previous')}
                  </button>
                  <span className="px-4 py-2 text-white">1</span>
                  <button className="px-4 py-2 bg-white/10 text-white/70 rounded-lg hover:bg-white/20 transition-colors">
                    {t('next')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
