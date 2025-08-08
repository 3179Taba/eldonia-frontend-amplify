'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Image, 
  Video, 
  Music, 
  FileText, 
  Code, 
  BookOpen,
  ArrowLeft
} from 'lucide-react'
import Logo from '../../components/Logo'

const categories = [
  {
    id: 'text',
    name: 'テキスト',
    description: '文章や小説を投稿',
    icon: FileText,
    color: 'from-blue-500 to-blue-600',
    href: '/post/create/text'
  },
  {
    id: 'image',
    name: '画像',
    description: '写真やイラストを投稿',
    icon: Image,
    color: 'from-green-500 to-green-600',
    href: '/post/create/image'
  },
  {
    id: 'video',
    name: '動画',
    description: '動画や映像を投稿',
    icon: Video,
    color: 'from-red-500 to-red-600',
    href: '/post/create/video'
  },
  {
    id: 'music',
    name: '音楽',
    description: '楽曲や音声を投稿',
    icon: Music,
    color: 'from-purple-500 to-purple-600',
    href: '/post/create/music'
  },
  {
    id: 'manga',
    name: '漫画',
    description: '漫画やイラストを投稿',
    icon: BookOpen,
    color: 'from-orange-500 to-orange-600',
    href: '/post/create/manga'
  },
  {
    id: 'code',
    name: 'コード',
    description: 'プログラミングコードを投稿',
    icon: Code,
    color: 'from-gray-500 to-gray-600',
    href: '/post/create/code'
  }
]

export default function CreatePostPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ヘッダー */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Logo size="lg" showText={true} />
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/settings/posts')}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">新規投稿</h1>
            <p className="text-white/70">投稿の種類を選択してください</p>
          </div>
        </div>

        {/* カテゴリーグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => router.push(category.href)}
              className="glass-effect rounded-lg p-6 cosmic-border cursor-pointer hover:bg-white/5 transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-white/60 text-sm">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ヒント */}
        <div className="mt-12 text-center">
          <div className="glass-effect rounded-lg p-6 cosmic-border">
            <h3 className="text-lg font-semibold text-white mb-2">投稿のヒント</h3>
            <p className="text-white/70">
              投稿の種類に応じて適切なカテゴリーを選択してください。
              各カテゴリーには専用のエディターとアップロード機能が用意されています。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 