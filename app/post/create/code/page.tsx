'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Code,
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
  content: string
  description: string
  language: string
  status: 'draft' | 'published'
  category: string
  tags: string[]
  programmingLanguage: string
}

// コード関連の自動タグ生成
const generateCodeTags = (title: string, content: string, description: string, programmingLanguage: string): string[] => {
  const tags: string[] = []

  // タイトルと説明からキーワードを抽出
  const text = `${title} ${content} ${description} ${programmingLanguage}`.toLowerCase()

  // プログラミング言語関連のキーワード
  if (text.includes('javascript') || text.includes('js')) {
    tags.push('JavaScript')
  }
  if (text.includes('typescript') || text.includes('ts')) {
    tags.push('TypeScript')
  }
  if (text.includes('python') || text.includes('py')) {
    tags.push('Python')
  }
  if (text.includes('react') || text.includes('jsx')) {
    tags.push('React')
  }
  if (text.includes('vue') || text.includes('vue.js')) {
    tags.push('Vue.js')
  }
  if (text.includes('angular')) {
    tags.push('Angular')
  }
  if (text.includes('node') || text.includes('node.js')) {
    tags.push('Node.js')
  }
  if (text.includes('php')) {
    tags.push('PHP')
  }
  if (text.includes('java')) {
    tags.push('Java')
  }
  if (text.includes('c++') || text.includes('cpp')) {
    tags.push('C++')
  }
  if (text.includes('c#') || text.includes('csharp')) {
    tags.push('C#')
  }
  if (text.includes('go') || text.includes('golang')) {
    tags.push('Go')
  }
  if (text.includes('rust')) {
    tags.push('Rust')
  }
  if (text.includes('swift')) {
    tags.push('Swift')
  }
  if (text.includes('kotlin')) {
    tags.push('Kotlin')
  }
  if (text.includes('dart')) {
    tags.push('Dart')
  }
  if (text.includes('flutter')) {
    tags.push('Flutter')
  }
  if (text.includes('next') || text.includes('next.js')) {
    tags.push('Next.js')
  }
  if (text.includes('nuxt') || text.includes('nuxt.js')) {
    tags.push('Nuxt.js')
  }
  if (text.includes('express')) {
    tags.push('Express')
  }
  if (text.includes('django')) {
    tags.push('Django')
  }
  if (text.includes('flask')) {
    tags.push('Flask')
  }
  if (text.includes('laravel')) {
    tags.push('Laravel')
  }
  if (text.includes('spring')) {
    tags.push('Spring')
  }
  if (text.includes('unity')) {
    tags.push('Unity')
  }
  if (text.includes('unreal')) {
    tags.push('Unreal Engine')
  }
  if (text.includes('web') || text.includes('frontend')) {
    tags.push('Web開発')
  }
  if (text.includes('mobile') || text.includes('app')) {
    tags.push('モバイル開発')
  }
  if (text.includes('game') || text.includes('ゲーム')) {
    tags.push('ゲーム開発')
  }
  if (text.includes('ai') || text.includes('machine learning') || text.includes('ml')) {
    tags.push('AI/ML')
  }
  if (text.includes('data') || text.includes('データ')) {
    tags.push('データサイエンス')
  }
  if (text.includes('api') || text.includes('rest')) {
    tags.push('API')
  }
  if (text.includes('database') || text.includes('db') || text.includes('sql')) {
    tags.push('データベース')
  }
  if (text.includes('docker') || text.includes('container')) {
    tags.push('Docker')
  }
  if (text.includes('kubernetes') || text.includes('k8s')) {
    tags.push('Kubernetes')
  }
  if (text.includes('aws') || text.includes('amazon')) {
    tags.push('AWS')
  }
  if (text.includes('azure')) {
    tags.push('Azure')
  }
  if (text.includes('gcp') || text.includes('google cloud')) {
    tags.push('GCP')
  }

  // デフォルトタグ
  if (tags.length === 0) {
    tags.push('プログラミング', 'コード')
  }

  return tags
}

export default function CodePostPage() {
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
    category: 'other', // コードカテゴリーで固定
    tags: [],
    programmingLanguage: '',
  })

  const [isUploading, setIsUploading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])

  // タイトルと説明が変更されたときにタグを自動生成
  useEffect(() => {
    if (postData.title || postData.content || postData.description || postData.programmingLanguage) {
      const autoTags = generateCodeTags(postData.title, postData.content, postData.description, postData.programmingLanguage)
      setSuggestedTags(autoTags.filter(tag => !postData.tags.includes(tag)))
    }
  }, [postData.title, postData.content, postData.description, postData.programmingLanguage, postData.tags])

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
      alert('コードを入力してください')
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
        content: postData.content
      })

      const result = await apiClient.createPost({
        title: postData.title,
        description: postData.description,
        category: postData.category,
        tags: postData.tags,
        status: postData.status,
        language: postData.language,
        file_type: 'text',
        content: postData.content
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
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-sky-900 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-950 to-sky-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <Code className="h-8 w-8 text-blue-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-exo2">コード投稿</h1>
              <p className="text-white/70 font-exo2">コード作品を投稿して共有しましょう</p>
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
                    placeholder="コードのタイトルを入力"
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
                    placeholder="コードの説明を入力"
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

                {/* プログラミング言語 */}
                <div>
                  <label className="block text-white/80 font-exo2 mb-2">プログラミング言語</label>
                  <input
                    type="text"
                    value={postData.programmingLanguage}
                    onChange={(e) => setPostData(prev => ({ ...prev, programmingLanguage: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 font-exo2"
                    placeholder="JavaScript, Python, React など"
                  />
                </div>

                {/* カテゴリ（表示のみ） */}
                <div>
                  <label className="block text-white/80 font-exo2 mb-2">カテゴリ</label>
                  <div className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/80 font-exo2">
                    コード
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

            {/* コード内容 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 font-exo2">コード内容</h2>

              <div>
                <label className="block text-white/80 font-exo2 mb-2">コード</label>
                <textarea
                  value={postData.content}
                  onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
                  rows={20}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none font-mono text-sm"
                  placeholder="コードを入力してください..."
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
