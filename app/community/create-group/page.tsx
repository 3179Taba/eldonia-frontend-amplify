'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useI18n } from '../../lib/i18n-provider'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import LeftSidebar from '../../components/LeftSidebar'
import { createGroup } from '../../lib/groupUtils'
import { Palette, Music, Video, BookOpen, Code, Camera, PenTool, Mic, Gamepad2, Heart, Lightbulb, Plus, X, Upload, Eye, EyeOff, Lock, Globe } from 'lucide-react'

export default function CreateGroupPage() {
  const router = useRouter()
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isPublic: true,
    maxMembers: 100,
    tags: [] as string[],
    image: null as File | null
  })
  const [newTag, setNewTag] = useState('')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // カテゴリオプション
  const categories = [
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.category) {
      alert('必須項目を入力してください')
      return
    }

    try {
      setLoading(true)

      // グループを作成
      const newGroup = await createGroup({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        isPublic: formData.isPublic,
        maxMembers: formData.maxMembers,
        tags: formData.tags,
        image: formData.image ? URL.createObjectURL(formData.image) : null
      })

      if (newGroup) {
        console.log('Created group:', newGroup)
        alert('グループが作成されました！')

        // コミュニティページにリダイレクト
        router.push('/community')
      } else {
        alert('グループの作成に失敗しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('Failed to create group:', error)
      alert('グループの作成に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
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
                新しいグループを作成
              </h1>
              <p className="text-white/80 max-w-2xl mx-auto">
                同じ興味を持つ仲間とつながる新しいコミュニティを作成しましょう。
                グループの詳細を設定して、理想の創作環境を構築してください。
              </p>
            </div>

            {/* フォーム */}
            <div className="max-w-4xl mx-auto">
              <div className="cosmic-card p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* 基本情報 */}
                  <div>
                    <h3 className="text-xl font-playfair font-bold mb-4 golden-text">
                      基本情報
                    </h3>
                    <div className="space-y-4">
                      {/* グループ名 */}
                      <div>
                        <label className="block text-white/80 mb-2 font-medium">
                          グループ名 *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400"
                          placeholder="グループ名を入力"
                          required
                        />
                      </div>

                      {/* 説明 */}
                      <div>
                        <label className="block text-white/80 mb-2 font-medium">
                          説明 *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400"
                          placeholder="グループの目的や活動内容を説明してください"
                          required
                        />
                      </div>

                      {/* カテゴリ */}
                      <div>
                        <label className="block text-white/80 mb-2 font-medium">
                          カテゴリ *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {categories.map((category) => {
                            const IconComponent = category.icon
                            return (
                              <button
                                key={category.id}
                                type="button"
                                onClick={() => handleInputChange('category', category.id)}
                                className={`p-3 rounded-lg border-2 transition-all duration-300 flex items-center gap-2 ${
                                  formData.category === category.id
                                    ? `border-yellow-400 bg-gradient-to-r ${category.color} text-white`
                                    : 'border-white/20 bg-white/5 text-white/70 hover:bg-white/10'
                                }`}
                              >
                                <IconComponent className="w-4 h-4" />
                                <span className="text-sm">{category.name}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 設定 */}
                  <div>
                    <h3 className="text-xl font-playfair font-bold mb-4 golden-text">
                      設定
                    </h3>
                    <div className="space-y-4">
                      {/* プライバシー設定 */}
                      <div>
                        <label className="block text-white/80 mb-2 font-medium">
                          プライバシー設定
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="privacy"
                              checked={formData.isPublic}
                              onChange={() => handleInputChange('isPublic', true)}
                              className="text-yellow-400 focus:ring-yellow-400"
                            />
                            <Globe className="w-4 h-4 text-blue-400" />
                            <span className="text-white">公開</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="privacy"
                              checked={!formData.isPublic}
                              onChange={() => handleInputChange('isPublic', false)}
                              className="text-yellow-400 focus:ring-yellow-400"
                            />
                            <Lock className="w-4 h-4 text-yellow-400" />
                            <span className="text-white">プライベート</span>
                          </label>
                        </div>
                      </div>

                      {/* 最大メンバー数 */}
                      <div>
                        <label className="block text-white/80 mb-2 font-medium">
                          最大メンバー数
                        </label>
                        <input
                          type="number"
                          value={formData.maxMembers}
                          onChange={(e) => handleInputChange('maxMembers', parseInt(e.target.value))}
                          min="1"
                          max="1000"
                          className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* タグ */}
                  <div>
                    <h3 className="text-xl font-playfair font-bold mb-4 golden-text">
                      タグ
                    </h3>
                    <div className="space-y-4">
                      {/* タグ入力 */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          className="flex-1 px-4 py-2 bg-gray-800/50 border border-white/20 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400"
                          placeholder="タグを入力"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* タグ表示 */}
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="flex items-center gap-1 px-3 py-1 bg-white/10 text-white rounded-full text-sm"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="text-white/50 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 画像アップロード */}
                  <div>
                    <h3 className="text-xl font-playfair font-bold mb-4 golden-text">
                      グループ画像
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          画像を選択
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        {previewImage && (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImage(null)
                              setFormData(prev => ({ ...prev, image: null }))
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-all duration-300"
                          >
                            削除
                          </button>
                        )}
                      </div>

                      {/* プレビュー */}
                      {previewImage && (
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                          <img
                            src={previewImage}
                            alt="プレビュー"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 送信ボタン */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          作成中...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5" />
                          グループを作成
                        </>
                      )}
                    </button>
                    <Link
                      href="/community"
                      className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
                    >
                      キャンセル
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>

        {/* フッター */}
        <Footer />
      </div>
    </div>
  )
}
