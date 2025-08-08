'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Video,
  Upload,
  X,
  Save,
  AlertTriangle,
  Loader2,
  Play,
  Sparkles,
  Film,
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
  duration: string
  hasAudio: boolean
  isSilentVideo: boolean
}

// 動画関連の自動タグ生成
const generateVideoTags = (title: string, description: string, hasAudio: boolean = true): string[] => {
  const tags: string[] = []

  // タイトルと説明からキーワードを抽出
  const text = `${title} ${description}`.toLowerCase()

  // 動画関連のキーワード
  if (text.includes('tutorial') || text.includes('チュートリアル') || text.includes('how to')) {
    tags.push('チュートリアル')
  }
  if (text.includes('animation') || text.includes('アニメーション')) {
    tags.push('アニメーション')
  }
  if (text.includes('music') || text.includes('音楽') || text.includes('楽曲')) {
    tags.push('音楽')
  }
  if (text.includes('game') || text.includes('ゲーム')) {
    tags.push('ゲーム')
  }
  if (text.includes('art') || text.includes('アート') || text.includes('イラスト')) {
    tags.push('アート')
  }
  if (text.includes('vlog') || text.includes('ブログ')) {
    tags.push('Vlog')
  }
  if (text.includes('review') || text.includes('レビュー')) {
    tags.push('レビュー')
  }
  if (text.includes('short') || text.includes('ショート')) {
    tags.push('ショート動画')
  }
  if (text.includes('long') || text.includes('長編')) {
    tags.push('長編動画')
  }

  // 音声なし動画用のタグ
  if (!hasAudio) {
    tags.push('サイレント動画', '音声なし')
    if (text.includes('animation') || text.includes('アニメーション')) {
      tags.push('アニメーション')
    }
    if (text.includes('art') || text.includes('アート') || text.includes('イラスト')) {
      tags.push('ビジュアルアート')
    }
    if (text.includes('dance') || text.includes('ダンス')) {
      tags.push('ダンス')
    }
    if (text.includes('timelapse') || text.includes('タイムラプス')) {
      tags.push('タイムラプス')
    }
  }

  // デフォルトタグ
  if (tags.length === 0) {
    tags.push('動画', 'クリエイティブ')
  }

  return tags
}

export default function VideoPostPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()

  // 投稿データの初期値
  const [postData, setPostData] = useState<PostData>({
    title: '',
    description: '',
    language: 'ja',
    status: 'published', // デフォルトで公開に設定
    category: 'video', // 動画カテゴリーで固定
    tags: [],
    files: [],
    duration: '',
    hasAudio: false,
    isSilentVideo: false,
  })

  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [audioDetecting, setAudioDetecting] = useState(false)

  // 動画ファイルから音声を検出する関数
  const detectAudioInVideo = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const url = URL.createObjectURL(file)

      video.onloadedmetadata = () => {
        // 動画の長さを取得
        const duration = video.duration

        // 音声トラックの有無を確認
        video.oncanplay = () => {
          // 動画を少し再生して音声を検出
          video.currentTime = 0
          video.volume = 0 // 音を出さない

          video.onseeked = () => {
            // 音声トラックがあるかどうかを確認（audioTracksは非標準）
            // 代替方法: 動画のプロパティから音声の有無を推測
            const hasAudioTrack = !!(video as any).webkitAudioDecodedByteCount ||
                                 !!(video as any).mozAudioChannelCount ||
                                 video.readyState >= 2 // HAVE_CURRENT_DATA

            URL.revokeObjectURL(url)
            resolve(hasAudioTrack)
          }

          video.onseeked(new Event('seeked'))
        }

        video.onerror = () => {
          URL.revokeObjectURL(url)
          resolve(false) // エラーの場合は音声なしと仮定
        }
      }

      video.src = url
    })
  }

  // タイトルと説明が変更されたときにタグを自動生成
  useEffect(() => {
    if (postData.title || postData.description) {
      const autoTags = generateVideoTags(postData.title, postData.description, postData.hasAudio)
      setSuggestedTags(autoTags.filter(tag => !postData.tags.includes(tag)))
    }
  }, [postData.title, postData.description, postData.tags, postData.hasAudio])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const videoFiles = files.filter(file => file.type.startsWith('video/'))

    if (videoFiles.length > 0) {
      setAudioDetecting(true)
      try {
        // 最初の動画ファイルから音声を検出
        const hasAudio = await detectAudioInVideo(videoFiles[0])
        setPostData(prev => ({
          ...prev,
          files: [...prev.files, ...videoFiles],
          hasAudio,
          isSilentVideo: !hasAudio
        }))
      } catch (error) {
        console.error('音声検出エラー:', error)
        setPostData(prev => ({
          ...prev,
          files: [...prev.files, ...videoFiles],
          hasAudio: false,
          isSilentVideo: true
        }))
      } finally {
        setAudioDetecting(false)
      }
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    const videoFiles = files.filter(file => file.type.startsWith('video/'))

    if (videoFiles.length > 0) {
      setAudioDetecting(true)
      try {
        // 最初の動画ファイルから音声を検出
        const hasAudio = await detectAudioInVideo(videoFiles[0])
        setPostData(prev => ({
          ...prev,
          files: [...prev.files, ...videoFiles],
          hasAudio,
          isSilentVideo: !hasAudio
        }))
      } catch (error) {
        console.error('音声検出エラー:', error)
        setPostData(prev => ({
          ...prev,
          files: [...prev.files, ...videoFiles],
          hasAudio: false,
          isSilentVideo: true
        }))
      } finally {
        setAudioDetecting(false)
      }
    }
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
      alert('動画を選択してください')
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
        file_type: 'video',
        files: files
      })

      const result = await apiClient.createPost({
        title: postData.title,
        description: postData.description,
        category: postData.category,
        tags: postData.tags,
        status: postData.status,
        language: postData.language,
        file_type: 'video',
        files: files,
        hasAudio: postData.hasAudio,
        isSilentVideo: postData.isSilentVideo
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
              <Video className="h-8 w-8 text-blue-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-exo2">動画投稿</h1>
              <p className="text-white/70 font-exo2">動画作品をアップロードして共有しましょう</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ファイルアップロード */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 font-exo2">動画ファイル</h2>

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
                  動画ファイルをドラッグ&ドロップまたはクリックして選択
                </p>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-exo2"
                >
                  <Film className="h-5 w-5" />
                  動画を選択
                </label>
              </div>

              {/* 音声検出中の表示 */}
              {audioDetecting && (
                <div className="mt-6 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-5 w-5 text-blue-300 animate-spin" />
                    <p className="text-blue-300 font-exo2">音声を検出中...</p>
                  </div>
                </div>
              )}

              {/* 音声情報の表示 */}
              {postData.files.length > 0 && !audioDetecting && (
                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  <h3 className="text-lg font-semibold text-white font-exo2 mb-3">動画情報</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-white/60 font-exo2">音声:</span>
                      {postData.hasAudio ? (
                        <span className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-sm">
                          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                          音声あり
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded-full text-sm">
                          <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                          音声なし（サイレント動画）
                        </span>
                      )}
                    </div>
                    {postData.isSilentVideo && (
                      <div className="mt-3 p-3 bg-yellow-600/10 border border-yellow-500/20 rounded-lg">
                        <p className="text-yellow-300 text-sm font-exo2">
                          💡 音声なしの動画です。視聴者に分かりやすく伝えるため、説明文や字幕の追加をお勧めします。
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 選択されたファイル */}
              {postData.files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h3 className="text-lg font-semibold text-white font-exo2">選択された動画</h3>
                  {postData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Video className="h-6 w-6 text-blue-300" />
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
                    placeholder="動画のタイトルを入力"
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
                    placeholder="動画の説明を入力"
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
                    動画
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
