'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Save,
  AlertTriangle,
  Loader2,
  Sparkles,
  Plus,
  Tag,
  X
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
  content: string
  coverImage: File | null
}

// テキスト関連の自動タグ生成
const generateTextTags = (title: string, content: string, description: string): string[] => {
  const tags: string[] = []

  // タイトルと説明からキーワードを抽出
  const text = `${title} ${content} ${description}`.toLowerCase()

  // テキスト関連のキーワード
  if (text.includes('novel') || text.includes('小説') || text.includes('物語')) {
    tags.push('小説')
  }
  if (text.includes('essay') || text.includes('エッセイ') || text.includes('随筆')) {
    tags.push('エッセイ')
  }
  if (text.includes('article') || text.includes('記事') || text.includes('ブログ')) {
    tags.push('記事')
  }
  if (text.includes('poem') || text.includes('詩') || text.includes('ポエム')) {
    tags.push('詩')
  }
  if (text.includes('story') || text.includes('ストーリー') || text.includes('物語')) {
    tags.push('ストーリー')
  }
  if (text.includes('fantasy') || text.includes('ファンタジー')) {
    tags.push('ファンタジー')
  }
  if (text.includes('scifi') || text.includes('sf') || text.includes('サイエンスフィクション')) {
    tags.push('SF')
  }
  if (text.includes('romance') || text.includes('恋愛') || text.includes('ロマンス')) {
    tags.push('恋愛')
  }
  if (text.includes('mystery') || text.includes('ミステリー') || text.includes('推理')) {
    tags.push('ミステリー')
  }
  if (text.includes('horror') || text.includes('ホラー') || text.includes('恐怖')) {
    tags.push('ホラー')
  }
  if (text.includes('adventure') || text.includes('冒険')) {
    tags.push('冒険')
  }
  if (text.includes('comedy') || text.includes('コメディ') || text.includes('笑い')) {
    tags.push('コメディ')
  }

  // デフォルトタグ
  if (tags.length === 0) {
    tags.push('テキスト', 'クリエイティブ')
  }

  return tags
}

export default function TextPostPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()

  // 投稿データの初期値
  const [postData, setPostData] = useState<PostData>({
    title: '',
    content: '',
    description: '',
    language: 'ja',
    status: 'published', // デフォルトで公開に設定
    category: 'writing', // テキストカテゴリーで固定
    tags: [],
    files: [], // ファイルは初期値として空の配列
    coverImage: null,
  })

  const [isUploading, setIsUploading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])

  // タイトルと説明が変更されたときにタグを自動生成
  useEffect(() => {
    if (postData.title || postData.content || postData.description) {
      const autoTags = generateTextTags(postData.title, postData.content, postData.description)
      setSuggestedTags(autoTags.filter(tag => !postData.tags.includes(tag)))
    }
  }, [postData.title, postData.content, postData.description, postData.tags])

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

    if (!postData.title.trim()) {
      alert('タイトルを入力してください')
      return
    }

    if (!postData.content.trim()) {
      alert('内容を入力してください')
      return
    }

    setIsUploading(true)
    try {
      console.log('送信する投稿データ:', {
        title: postData.title,
        description: postData.description,
        category: postData.category,
        tags: postData.tags,
        status: postData.status,
        language: postData.language,
        file_type: 'text',
        content: postData.content,
        coverImage: postData.coverImage
      })

      // FormDataをオブジェクトに変換
      const postObject = {
        title: postData.title,
        description: postData.description,
        category: postData.category,
        tags: postData.tags,
        language: postData.language,
        file_type: 'text',
        status: postData.status,
        content: postData.content,
        files: postData.files,
        hasAudio: false,
        isSilentVideo: false
      }

      const result = await apiClient.createPostWithFiles(postObject)

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
              <FileText className="h-8 w-8 text-blue-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-exo2">テキスト投稿</h1>
              <p className="text-white/70 font-exo2">テキスト作品を投稿して共有しましょう</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
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
                    placeholder="テキストのタイトルを入力"
                  />
                </div>

                {/* 説明 */}
                <div className="md:col-span-2">
                  <label className="block text-white/80 font-exo2 mb-2">説明</label>
                  <textarea
                    value={postData.description}
                    onChange={(e) => setPostData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none font-exo2"
                    placeholder="テキストの説明を入力"
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
                    テキスト
                  </div>
                </div>

                {/* サムネイル */}
                <div className="md:col-span-2">
                  <label className="block text-white/80 font-exo2 mb-2">サムネイル画像</label>
                  <div className="space-y-4">
                    {postData.coverImage ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(postData.coverImage)}
                          alt="サムネイル"
                          className="w-full max-w-xs h-48 object-cover rounded-lg border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => setPostData(prev => ({ ...prev, coverImage: null }))}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setPostData(prev => ({ ...prev, coverImage: file }))
                            }
                          }}
                          className="hidden"
                          id="cover-image-input"
                        />
                        <label
                          htmlFor="cover-image-input"
                          className="cursor-pointer block"
                        >
                          <div className="text-white/60 mb-2">
                            <FileText className="h-12 w-12 mx-auto mb-2" />
                            <p className="font-exo2">サムネイル画像をアップロード</p>
                            <p className="text-sm text-white/40">JPG, PNG, GIF (最大5MB)</p>
                          </div>
                        </label>
                      </div>
                    )}
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

            {/* テキスト内容 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 font-exo2">テキスト内容</h2>

              <div>
                <label className="block text-white/80 font-exo2 mb-2">内容</label>
                <textarea
                  value={postData.content}
                  onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                  rows={15}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none font-exo2"
                  placeholder="テキストの内容を入力してください..."
                />
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
