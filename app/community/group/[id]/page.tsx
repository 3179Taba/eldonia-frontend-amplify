'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useI18n } from '../../../lib/i18n-provider'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import LeftSidebar from '../../../components/LeftSidebar'
import { getGroupById } from '../../../lib/groupUtils'
import { Users, MessageCircle, Globe, Heart, Star, Award, TrendingUp, Languages, Search, Plus, Calendar, Palette, Music, Video, BookOpen, Code, Camera, PenTool, Mic, Gamepad2, Lightbulb, Users2, FolderOpen, MessageSquare, Share2, Settings, Crown, Zap, Target, Send, MoreHorizontal, Edit, Trash2, UserPlus, UserMinus, Shield, Eye, EyeOff, Lock, Globe as GlobeIcon } from 'lucide-react'

export default function GroupDetailPage() {
  const params = useParams()
  const groupId = params.id
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [message, setMessage] = useState('')
  const [isMember, setIsMember] = useState(false)
  const [group, setGroup] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // グループデータを読み込み
  useEffect(() => {
    const loadGroup = async () => {
      if (groupId) {
        try {
          setLoading(true)
          const groupData = await getGroupById(Number(groupId))
          if (groupData) {
            setGroup(groupData)
          }
        } catch (error) {
          console.error('Failed to load group:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadGroup()
  }, [groupId])

  // サンプルグループデータ (フォールバック用)
  const defaultGroup = {
    id: groupId,
    name: 'ファンタジーイラスト制作部',
    category: 'art',
    description: 'ファンタジー世界のキャラクターや風景を描くイラストレーターのグループ。共同で作品を制作し、技術を向上させ合いましょう。',
    members: 156,
    maxMembers: 200,
    isPublic: true,
    tags: ['ファンタジー', 'イラスト', 'キャラクター', '共同制作'],
    lastActivity: '2時間前',
    image: '/img/srnote_Beautiful_gothic_bookcase_candlelight_medieval_desk_to_0cd8b99d-521c-400b-b6c5-79451622c0bf_0.png',
    owner: {
      id: 1,
      name: 'イラストマスター',
      avatar: '/img/srnote_cute_cat_full_body_cyberpunk_elf_PhD_fantasy_boy_moon__ffea1def-f8ea-41ee-a4ef-558cae025c19_0.png'
    },
    createdAt: '2024年1月15日',
    rules: [
      '作品の著作権を尊重してください',
      '建設的なフィードバックを心がけてください',
      'スパムや不適切な投稿は禁止です',
      '他のメンバーを尊重してください'
    ],
    recentMessages: [
      {
        id: 1,
        user: {
          name: 'イラストマスター',
          avatar: '/img/srnote_cute_cat_full_body_cyberpunk_elf_PhD_fantasy_boy_moon__ffea1def-f8ea-41ee-a4ef-558cae025c19_0.png'
        },
        message: '新しいキャラクターデザインの課題を投稿しました！皆さんの作品を見るのが楽しみです。',
        timestamp: '2時間前'
      },
      {
        id: 2,
        user: {
          name: 'ファンタジーアーティスト',
          avatar: '/img/srnote_Beautiful_gothic_bookcase_candlelight_medieval_desk_to_0cd8b99d-521c-400b-b6c5-79451622c0bf_0.png'
        },
        message: '素晴らしい作品ですね！私も参加させていただきます。',
        timestamp: '1時間前'
      },
      {
        id: 3,
        user: {
          name: '魔法の絵師',
          avatar: '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_02ff9b2b-44c9-498c-ab8e-4fdf612b919b_0.png'
        },
        message: '背景の描き方について質問があります。どのように光の効果を表現していますか？',
        timestamp: '30分前'
      }
    ],
    files: [
      {
        id: 1,
        name: 'キャラクターデザインガイド.pdf',
        type: 'pdf',
        size: '2.3MB',
        uploadedBy: 'イラストマスター',
        uploadedAt: '1日前'
      },
      {
        id: 2,
        name: '背景テクスチャ集.zip',
        type: 'zip',
        size: '15.7MB',
        uploadedBy: 'ファンタジーアーティスト',
        uploadedAt: '3日前'
      }
    ],
    events: [
      {
        id: 1,
        title: '月例イラストコンテスト',
        date: '2024年2月15日',
        description: '「魔法の森」をテーマにしたイラストコンテストを開催します。'
      },
      {
        id: 2,
        title: '技術共有会',
        date: '2024年2月20日',
        description: 'デジタルイラストの技法について共有します。'
      }
    ]
  }

  // グループデータが読み込まれていない場合はデフォルトデータを使用
  const currentGroup = group || defaultGroup

  const categories = [
    { id: 'art', name: 'アート・イラスト', icon: Palette, color: 'from-pink-500 to-red-500' }
  ]

  const category = categories.find(cat => cat.id === currentGroup.category)
  const IconComponent = category?.icon || Users

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: メッセージ送信処理
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  const handleJoinGroup = () => {
    setIsMember(true)
    // TODO: グループ参加処理
    console.log('Joining group:', groupId)
  }

  const handleLeaveGroup = () => {
    setIsMember(false)
    // TODO: グループ退出処理
    console.log('Leaving group:', groupId)
  }

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
            {/* グループヘッダー */}
            <div className="relative mb-8">
              {/* グループ画像 */}
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
                <img
                  src={currentGroup.image}
                  alt={currentGroup.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* グループ情報オーバーレイ */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${category?.color} text-white`}>
                      {category?.name}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentGroup.isPublic
                        ? 'bg-green-500/80 text-white'
                        : 'bg-yellow-500/80 text-white'
                    }`}>
                      {currentGroup.isPublic ? 'パブリック' : 'プライベート'}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-2">
                    {currentGroup.name}
                  </h1>

                  <p className="text-white/80 text-lg max-w-3xl">
                    {currentGroup.description}
                  </p>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="absolute top-4 right-4 flex gap-2">
                {isOwner ? (
                  <button className="p-2 bg-gray-800/50 text-white rounded-lg hover:bg-gray-700/50 transition-all duration-300">
                    <Settings className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    {isMember ? (
                      <button
                        onClick={handleLeaveGroup}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center gap-2"
                      >
                        <UserMinus className="w-4 h-4" />
                        退出
                      </button>
                    ) : (
                      <button
                        onClick={handleJoinGroup}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        参加する
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* タブナビゲーション */}
            <div className="mb-8">
              <div className="flex border-b border-white/20">
                {[
                  { id: 'overview', name: '概要', icon: Users },
                  { id: 'chat', name: 'チャット', icon: MessageSquare },
                  { id: 'files', name: 'ファイル', icon: FolderOpen },
                  { id: 'events', name: 'イベント', icon: Calendar },
                  { id: 'members', name: 'メンバー', icon: Users2 }
                ].map((tab) => {
                  const IconComponent = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'border-yellow-400 text-yellow-400'
                          : 'border-transparent text-white/60 hover:text-white/80'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {tab.name}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* タブコンテンツ */}
            <div className="mb-16">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* メインコンテンツ */}
                  <div className="lg:col-span-2">
                    <div className="cosmic-card p-6 mb-6">
                      <h3 className="text-xl font-playfair font-bold mb-4 golden-text">
                        グループについて
                      </h3>
                      <p className="text-white/80 leading-relaxed">
                        {currentGroup.description}
                      </p>
                    </div>

                    <div className="cosmic-card p-6">
                      <h3 className="text-xl font-playfair font-bold mb-4 golden-text">
                        最近のメッセージ
                      </h3>
                      <div className="space-y-4">
                        {currentGroup.recentMessages.map((msg) => (
                          <div key={msg.id} className="flex gap-3">
                            <img
                              src={msg.user.avatar}
                              alt={msg.user.name}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white">{msg.user.name}</span>
                                <span className="text-white/50 text-sm">{msg.timestamp}</span>
                              </div>
                              <p className="text-white/80">{msg.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* サイドバー */}
                  <div className="space-y-6">
                    {/* グループ統計 */}
                    <div className="cosmic-card p-6">
                      <h3 className="text-lg font-playfair font-bold mb-4 golden-text">
                        グループ統計
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-white/60">メンバー</span>
                          <span className="text-white">{currentGroup.members}/{currentGroup.maxMembers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">作成日</span>
                          <span className="text-white">{currentGroup.createdAt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">最終活動</span>
                          <span className="text-white">{currentGroup.lastActivity}</span>
                        </div>
                      </div>
                    </div>

                    {/* グループルール */}
                    <div className="cosmic-card p-6">
                      <h3 className="text-lg font-playfair font-bold mb-4 golden-text">
                        グループルール
                      </h3>
                      <ul className="space-y-2">
                        {currentGroup.rules.map((rule, index) => (
                          <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                            <span className="text-yellow-400 mt-1">•</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* タグ */}
                    <div className="cosmic-card p-6">
                      <h3 className="text-lg font-playfair font-bold mb-4 golden-text">
                        タグ
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {currentGroup.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="cosmic-card p-6">
                  <h3 className="text-xl font-playfair font-bold mb-6 golden-text">
                    グループチャット
                  </h3>

                  {/* メッセージエリア */}
                  <div className="h-96 overflow-y-auto mb-6 p-4 bg-gray-800/30 rounded-lg">
                    {currentGroup.recentMessages.map((msg) => (
                      <div key={msg.id} className="flex gap-3 mb-4">
                        <img
                          src={msg.user.avatar}
                          alt={msg.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">{msg.user.name}</span>
                            <span className="text-white/50 text-sm">{msg.timestamp}</span>
                          </div>
                          <p className="text-white/80">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* メッセージ入力 */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="メッセージを入力..."
                      className="flex-1 px-4 py-2 bg-gray-800/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="cosmic-card p-6">
                  <h3 className="text-xl font-playfair font-bold mb-6 golden-text">
                    共有ファイル
                  </h3>

                  <div className="space-y-4">
                    {currentGroup.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="w-8 h-8 text-blue-400" />
                          <div>
                            <div className="font-medium text-white">{file.name}</div>
                            <div className="text-white/60 text-sm">
                              {file.uploadedBy} • {file.uploadedAt} • {file.size}
                            </div>
                          </div>
                        </div>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-all duration-300">
                          ダウンロード
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'events' && (
                <div className="cosmic-card p-6">
                  <h3 className="text-xl font-playfair font-bold mb-6 golden-text">
                    グループイベント
                  </h3>

                  <div className="space-y-4">
                    {currentGroup.events.map((event) => (
                      <div key={event.id} className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="w-5 h-5 text-yellow-400" />
                          <span className="font-medium text-white">{event.title}</span>
                        </div>
                        <div className="text-white/60 text-sm mb-2">{event.date}</div>
                        <p className="text-white/80">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="cosmic-card p-6">
                  <h3 className="text-xl font-playfair font-bold mb-6 golden-text">
                    メンバー一覧
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* オーナー */}
                    <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentGroup.owner.avatar}
                          alt={currentGroup.owner.name}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <div className="font-medium text-white">{currentGroup.owner.name}</div>
                          <div className="text-yellow-400 text-sm">オーナー</div>
                        </div>
                      </div>
                    </div>

                    {/* サンプルメンバー */}
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className="p-4 bg-gray-800/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={`/img/srnote_Beautiful_gothic_bookcase_candlelight_medieval_desk_to_0cd8b99d-521c-400b-b6c5-79451622c0bf_0.png`}
                            alt={`メンバー${i + 1}`}
                            className="w-12 h-12 rounded-full"
                          />
                          <div>
                            <div className="font-medium text-white">メンバー{i + 1}</div>
                            <div className="text-white/60 text-sm">メンバー</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
