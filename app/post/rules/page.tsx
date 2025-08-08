'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle,
  X,
  ArrowRight,
  Crown,
  Image,
  Video,
  Music,
  Palette,
  FileText,
  Code,
  Sparkles
} from 'lucide-react'
import { useAuth } from '../../lib/auth-context'
import { useI18n } from '../../lib/i18n-provider'

interface PostType {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  route: string
}

interface ProhibitedItem {
  id: string
  text: string
  checked: boolean
}

export default function PostRulesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()

  const [selectedPostType, setSelectedPostType] = useState<string | null>(null)
  const [prohibitedItems, setProhibitedItems] = useState<ProhibitedItem[]>([])
  const [allChecked, setAllChecked] = useState(false)

  const postTypes: PostType[] = [
    {
      id: 'image',
      name: '画像・イラスト',
      description: '写真、イラスト、デザイン、AI生成画像',
      icon: <Image className="h-6 w-6" />,
      color: 'emerald',
      route: '/post/create/image'
    },
    {
      id: 'video',
      name: '動画・アニメーション',
      description: '動画作品、アニメーション、チュートリアル、AI動画',
      icon: <Video className="h-6 w-6" />,
      color: 'rose',
      route: '/post/create/video'
    },
    {
      id: 'music',
      name: '音楽・音声',
      description: 'オリジナル楽曲、カバー、音声作品、AI音楽、AI音声',
      icon: <Music className="h-6 w-6" />,
      color: 'magic',
      route: '/post/create/music'
    },
    {
      id: 'manga',
      name: 'マンガ',
      description: 'オリジナルマンガ、イラスト、コミック作品',
      icon: <Palette className="h-6 w-6" />,
      color: 'cosmic',
      route: '/post/create/manga'
    },
    {
      id: 'text',
      name: 'テキスト・文章',
      description: '小説、エッセイ、記事、AI生成テキスト',
      icon: <FileText className="h-6 w-6" />,
      color: 'amber',
      route: '/post/create/text'
    },
    {
      id: 'code',
      name: 'コード・技術',
      description: 'プログラミングコード、スクリプト、AI生成コード',
      icon: <Code className="h-6 w-6" />,
      color: 'cyan',
      route: '/post/create/code'
    }
  ]

  const allProhibitedItems: Record<string, ProhibitedItem[]> = {
    image: [
      { id: 'inappropriate', text: '不適切なコンテンツの禁止', checked: false },
      { id: 'copyright', text: '著作権侵害の禁止', checked: false },
      { id: 'harmful', text: '有害なコンテンツの禁止', checked: false },
      { id: 'useless', text: '有益ではないコンテンツの禁止', checked: false }
    ],
    video: [
      { id: 'inappropriate', text: '不適切なコンテンツの禁止', checked: false },
      { id: 'copyright', text: '著作権侵害の禁止', checked: false },
      { id: 'harmful', text: '有害なコンテンツの禁止', checked: false },
      { id: 'fake-news', text: 'フェイクニュースの禁止', checked: false },
      { id: 'useless', text: '有益ではないコンテンツの禁止', checked: false }
    ],
    music: [
      { id: 'copyright', text: '著作権侵害の禁止', checked: false },
      { id: 'harmful', text: '有害なコンテンツの禁止', checked: false },
      { id: 'useless', text: '有益ではないコンテンツの禁止', checked: false }
    ],
    manga: [
      { id: 'inappropriate', text: '不適切なコンテンツの禁止', checked: false },
      { id: 'copyright', text: '著作権侵害の禁止', checked: false },
      { id: 'harmful', text: '有害なコンテンツの禁止', checked: false },
      { id: 'useless', text: '有益ではないコンテンツの禁止', checked: false }
    ],
    text: [
      { id: 'inappropriate', text: '不適切なコンテンツの禁止', checked: false },
      { id: 'copyright', text: '著作権侵害の禁止', checked: false },
      { id: 'harmful', text: '有害なコンテンツの禁止', checked: false },
      { id: 'useless', text: '有益ではないコンテンツの禁止', checked: false }
    ],
    code: [
      { id: 'harmful', text: '有害なコンテンツの禁止', checked: false },
      { id: 'malware', text: 'マルウェア・ウイルスの禁止', checked: false },
      { id: 'useless', text: '有益ではないコンテンツの禁止', checked: false }
    ]
  }

  const handlePostTypeSelect = useCallback((postTypeId: string) => {
    setSelectedPostType(postTypeId)
    setProhibitedItems(allProhibitedItems[postTypeId] || [])
    setAllChecked(false)
  }, [])

  const handleCheckboxChange = useCallback((itemId: string) => {
    setProhibitedItems(prev =>
      prev.map(item =>
        item.id === itemId
          ? { ...item, checked: !item.checked }
          : item
      )
    )
  }, [])

  const handleProceedToPost = useCallback(() => {
    if (!selectedPostType) return

    const postType = postTypes.find(pt => pt.id === selectedPostType)
    if (postType) {
      router.push(postType.route)
    }
  }, [selectedPostType, router])

  // すべてのチェックボックスがチェックされているかチェック
  React.useEffect(() => {
    if (prohibitedItems.length > 0) {
      const allChecked = prohibitedItems.every(item => item.checked)
      setAllChecked(allChecked)
    }
  }, [prohibitedItems])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="cosmic-card p-8 text-center">
          <X className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-playfair font-bold text-white mb-4">ログインが必要です</h2>
          <p className="text-white/70 mb-6">投稿するにはログインしてください</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="magic-button"
          >
            ログインする
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl animate-bounce-slow"></div>
      </div>

      {/* ヘッダー */}
      <div className="relative z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-3"
              >
                <div className="relative w-8 h-8">
                  <img
                    src="/images/icons/logo.png"
                    alt="Eldonia-Nex"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                </div>
                <span className="text-2xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400">
                  Eldonia-Nex
                </span>
              </button>
              <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/30 to-transparent"></div>
              <div>
                <h1 className="text-3xl font-playfair font-bold text-white mb-1">📋 投稿ルール</h1>
                <p className="text-white/70 font-exo2">投稿するコンテンツの種類を選択し、ルールを確認してください</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* コンテンツタイプ選択 */}
          <div className="cosmic-card p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full mb-4 shadow-lg">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-playfair font-bold text-white mb-2">投稿するコンテンツを選択</h2>
              <p className="text-white/70">投稿したいコンテンツの種類を選択してください</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {postTypes.map((postType) => (
                <button
                  key={postType.id}
                  onClick={() => handlePostTypeSelect(postType.id)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 text-left group ${
                    selectedPostType === postType.id
                      ? `border-${postType.color}-400 bg-${postType.color}-500/10`
                      : 'border-white/20 hover:border-white/40 bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-${postType.color}-500/20`}>
                      <div className={`text-${postType.color}-400`}>
                        {postType.icon}
                      </div>
                    </div>
                    <h3 className="font-playfair font-semibold text-white">{postType.name}</h3>
                  </div>
                  <p className="text-white/70 text-sm">{postType.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 禁止事項 */}
          {selectedPostType && (
            <div className="cosmic-card p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-playfair font-bold text-white mb-2">禁止事項の確認</h2>
                <p className="text-white/70">以下の項目にすべてチェックを入れてください</p>
              </div>

              <div className="space-y-4">
                {prohibitedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={item.checked}
                      onChange={() => handleCheckboxChange(item.id)}
                      className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 border-white/30 rounded bg-transparent"
                    />
                    <label htmlFor={item.id} className="text-white/80 font-exo2 cursor-pointer">
                      {item.text}
                    </label>
                    {item.checked && (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>
                ))}
              </div>

              {/* 進行状況 */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white/60 text-sm">進行状況</span>
                  <span className="text-white/60 text-sm">
                    {prohibitedItems.filter(item => item.checked).length} / {prohibitedItems.length}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(prohibitedItems.filter(item => item.checked).length / prohibitedItems.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* 投稿ボタン */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleProceedToPost}
                  disabled={!allChecked}
                  className={`magic-button text-lg px-10 py-4 rounded-xl font-playfair font-semibold transition-all duration-300 flex items-center justify-center gap-3 mx-auto ${
                    allChecked
                      ? 'hover:scale-105 shadow-lg shadow-emerald-500/30'
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <ArrowRight className="h-6 w-6" />
                  投稿画面に進む
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
