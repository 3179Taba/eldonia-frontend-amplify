'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Image,
  Upload,
  X,
  Save,
  AlertTriangle,
  Loader2,
  Palette,
  Sparkles,
  Plus,
  Tag
} from 'lucide-react'
import { useAuth } from '../../../lib/auth-context'
import { useI18n } from '../../../lib/i18n-provider'
import { apiClient } from '../../../lib/api'

interface PostData {
  title: string
  description: string
  language: string
  status: 'draft' | 'published'
  category: string
  tags: string[]
  files: File[]
}

// 画像関連の自動タグ生成
const generateImageTags = (title: string, description: string): string[] => {
  const tags: string[] = []

  // タイトルと説明からキーワードを抽出
  const text = `${title} ${description}`.toLowerCase()

  // 画像関連のキーワード
  if (text.includes('photo') || text.includes('写真') || text.includes('カメラ')) {
    tags.push('写真')
  }
  if (text.includes('illustration') || text.includes('イラスト') || text.includes('絵')) {
    tags.push('イラスト')
  }
  if (text.includes('design') || text.includes('デザイン')) {
    tags.push('デザイン')
  }
  if (text.includes('art') || text.includes('アート')) {
    tags.push('アート')
  }
  if (text.includes('portrait') || text.includes('ポートレート') || text.includes('人物')) {
    tags.push('ポートレート')
  }
  if (text.includes('landscape') || text.includes('風景') || text.includes('自然')) {
    tags.push('風景')
  }
  if (text.includes('abstract') || text.includes('抽象')) {
    tags.push('抽象')
  }
  if (text.includes('fantasy') || text.includes('ファンタジー')) {
    tags.push('ファンタジー')
  }
  if (text.includes('anime') || text.includes('アニメ')) {
    tags.push('アニメ')
  }
  if (text.includes('digital') || text.includes('デジタル')) {
    tags.push('デジタルアート')
  }

  // デフォルトタグ
  if (tags.length === 0) {
    tags.push('画像', 'クリエイティブ')
  }

  return tags
}

export default function ImagePostPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()

  // 投稿データの初期値
  const [postData, setPostData] = useState<PostData>({
    title: '',
    description: '',
    language: 'ja',
    status: 'published', // デフォルトで公開に設定
    category: 'photo', // 画像カテゴリーで固定
    tags: [],
    files: [],
  })

  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])

  // タイトルと説明が変更されたときにタグを自動生成
  useEffect(() => {
    if (postData.title || postData.description) {
      const autoTags = generateImageTags(postData.title, postData.description)
      setSuggestedTags(autoTags.filter(tag => !postData.tags.includes(tag)))
    }
  }, [postData.title, postData.description, postData.tags])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setPostData(prev => ({ ...prev, files: [...prev.files, ...imageFiles] }))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    setPostData(prev => ({ ...prev, files: [...prev.files, ...imageFiles] }))
  }, [])

  const removeFile = useCallback((index: number) => {
    setPostData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }))
  }, [])

  const addTag = useCallback(() => {
    if (tagInput.trim() && !postData.tags.includes(tagInput.trim())) {
      setPostData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }))
      setTagInput('')
    }
  }, [tagInput, postData.tags])

  const addSuggestedTag = useCallback((tag: string) => {
    if (!postData.tags.includes(tag)) {
      setPostData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }, [postData.tags])

  const removeTag = useCallback((tag: string) => {
    setPostData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      alert('ログインが必要です')
      return
    }

    if (postData.files.length === 0) {
      alert('画像を選択してください')
      return
    }

    if (!postData.title.trim()) {
      alert('タイトルを入力してください')
      return
    }

    setIsUploading(true)
    try {
      // ファイル情報を準備
      const files = postData.files.map(file => ({
        url: URL.createObjectURL(file), // 一時的なURL（実際の実装ではSupabase Storageにアップロード）
        originalName: file.name,
        size: file.size,
        type: file.type,
        hash: '' // 実際の実装ではファイルハッシュを計算
      }))

      console.log('送信するファイル情報:', files)
      console.log('送信する投稿データ:', {
        title: postData.title,
        description: postData.description,
        category: postData.category,
        tags: postData.tags,
        status: postData.status,
        language: postData.language,
        file_type: 'image',
        files: files
      })

      const result = await apiClient.createPost({
        title: postData.title,
        description: postData.description,
        category: postData.category,
        tags: postData.tags,
        status: postData.status,
        language: postData.language,
        file_type: 'image',
        files: files
      })

      if (result.success) {
        alert('投稿が完了しました！')
        router.push('/post')
      } else {
        alert(`投稿に失敗しました: ${result.error}`)
      }
    } catch (error) {
      console.error('投稿エラー:', error)
      alert('投稿中にエラーが発生しました')
    } finally {
      setIsUploading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-sky-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">ログインが必要です</h1>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ログインする
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-950 to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <Image className="h-8 w-8 text-blue-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-exo2">画像投稿</h1>
              <p className="text-white/70 font-exo2">画像作品をアップロードして共有しましょう</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ファイルアップロード */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 font-exo2">画像ファイル</h2>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-white/20 hover:border-blue-400/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                <p className="text-white/80 mb-4 font-exo2">
                  画像ファイルをドラッグ&ドロップまたはクリックして選択
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-exo2"
                >
                  <Palette className="h-5 w-5" />
                  画像を選択
                </label>
              </div>

              {/* 選択されたファイル */}
              {postData.files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-semibold text-white font-exo2">選択された画像</h3>
                  {postData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Image className="h-6 w-6 text-blue-300" />
                        <div>
                          <p className="text-white font-exo2">{file.name}</p>
                          <p className="text-white/60 text-sm font-exo2">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 基本情報 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6 font-exo2">基本情報</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* タイトル */}
                <div className="md:col-span-2">
                  <label className="block text-white/80 font-exo2 mb-2">タイトル</label>
                  <input
                    type="text"
                    value={postData.title}
                    onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 font-exo2"
                    placeholder="画像のタイトルを入力"
                  />
                </div>

                {/* 説明 */}
                <div className="md:col-span-2">
                  <label className="block text-white/80 font-exo2 mb-2">説明</label>
                  <textarea
                    value={postData.description}
                    onChange={(e) => setPostData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none font-exo2"
                    placeholder="画像の説明を入力"
                  />
                </div>

                {/* 言語 */}
                <div>
                  <label className="block text-white/80 font-exo2 mb-2">言語</label>
                  <select
                    value={postData.language}
                    onChange={(e) => setPostData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                    <option value="ko">한국어</option>
                  </select>
                </div>

                {/* 公開状態 */}
                <div>
                  <label className="block text-white/80 font-exo2 mb-2">公開状態</label>
                  <select
                    value={postData.status}
                    onChange={(e) => setPostData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  >
                    <option value="draft">下書き</option>
                    <option value="published">公開</option>
                  </select>
                </div>

                {/* カテゴリ（表示のみ） */}
                <div>
                  <label className="block text-white/80 font-exo2 mb-2">カテゴリ</label>
                  <div className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/80 font-exo2">
                    画像
                  </div>
                </div>

                {/* タグ */}
                <div className="md:col-span-2">
                  <label className="block text-white/80 font-exo2 mb-2">タグ</label>

                  {/* 自動生成されたタグの提案 */}
                  {suggestedTags.length > 0 && (
                    <div className="mb-4">
                      <p className="text-white/60 text-sm mb-2 font-exo2">提案タグ:</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedTags.map((tag, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addSuggestedTag(tag)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 border border-blue-400/30 text-blue-300 rounded-full text-sm hover:bg-blue-600/30 transition-colors font-exo2"
                          >
                            <Plus className="h-3 w-3" />
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* タグ入力 */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 font-exo2"
                      placeholder="タグを入力してEnter"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-exo2"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* 選択されたタグ */}
                  {postData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {postData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/30 border border-blue-400/50 text-white rounded-full text-sm font-exo2"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-blue-300 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 公開設定 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 font-exo2">公開設定</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 font-exo2 mb-2">投稿の状態</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={postData.status === 'published'}
                        onChange={(e) => setPostData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-white font-exo2">公開</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={postData.status === 'draft'}
                        onChange={(e) => setPostData(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 focus:ring-blue-500 focus:ring-2"
                      />
                      <span className="text-white font-exo2">下書き</span>
                    </label>
                  </div>
                </div>

                <div className="text-sm text-white/60 font-exo2">
                  {postData.status === 'published' ? (
                    <p>投稿は公開され、他のユーザーが閲覧できるようになります。</p>
                  ) : (
                    <p>下書きとして保存され、後で編集・公開できます。</p>
                  )}
                </div>
              </div>
            </div>

            {/* 投稿ボタン */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.push('/post')}
                className="px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-exo2"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-exo2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    投稿中...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    {postData.status === 'published' ? '公開する' : '下書き保存'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
