'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Music,
  Upload,
  X,
  Save,
  AlertTriangle,
  Loader2,
  Play,
  Sparkles,
  Plus,
  Tag
} from 'lucide-react'
import { useAuth } from '../../../lib/auth-context'
import { useI18n } from '../../../lib/i18n-provider'
import { apiClient } from '../../../lib/api'
import Image from 'next/image'

interface PostData {
  title: string
  description: string
  language: string
  status: 'draft' | 'published'
  category: string
  tags: string[]
  files: File[]
  genre: string
  duration: string
  coverImage: File | null
  lyrics: string
}

// 音楽関連の自動タグ生成
const generateMusicTags = (title: string, description: string, genre: string): string[] => {
  const tags: string[] = []

  const text = `${title} ${description} ${genre}`.toLowerCase()

  if (text.includes('pop') || text.includes('ポップ')) tags.push('ポップ')
  if (text.includes('rock') || text.includes('ロック')) tags.push('ロック')
  if (text.includes('jazz') || text.includes('ジャズ')) tags.push('ジャズ')
  if (text.includes('classical') || text.includes('クラシック')) tags.push('クラシック')
  if (text.includes('electronic') || text.includes('エレクトロニック')) tags.push('エレクトロニック')
  if (text.includes('hip-hop') || text.includes('ヒップホップ')) tags.push('ヒップホップ')
  if (text.includes('folk') || text.includes('フォーク')) tags.push('フォーク')
  if (text.includes('original') || text.includes('オリジナル')) tags.push('オリジナル')
  if (text.includes('cover') || text.includes('カバー')) tags.push('カバー')
  if (text.includes('voice') || text.includes('音声') || text.includes('ボイス')) tags.push('音声作品')
  if (text.includes('instrumental') || text.includes('インスト')) tags.push('インスト')
  if (text.includes('vocal') || text.includes('ボーカル')) tags.push('ボーカル')

  if (tags.length === 0) {
    tags.push('音楽', 'クリエイティブ')
  }

  return tags
}

// 音楽説明の自動生成
const generateMusicDescription = (title: string, genre: string): string => {
  const genreDescriptions: { [key: string]: string } = {
    'pop': 'ポップス調の楽曲です。親しみやすく、聴きやすいメロディーが特徴的です。',
    'rock': 'ロック調の楽曲です。力強いリズムとギターサウンドが印象的です。',
    'jazz': 'ジャズ調の楽曲です。洗練された和声と即興的な演奏が魅力です。',
    'classical': 'クラシック調の楽曲です。美しい旋律と豊かな表現力が特徴です。',
    'electronic': 'エレクトロニック調の楽曲です。デジタルサウンドとビートが印象的です。',
    'hip-hop': 'ヒップホップ調の楽曲です。リズミカルなビートとラップが特徴的です。',
    'folk': 'フォーク調の楽曲です。素朴で温かみのある音色が魅力です。',
    'other': 'オリジナル楽曲です。独自の世界観とサウンドをお楽しみください。'
  }

  return genreDescriptions[genre] || `${title} - オリジナル楽曲です。`
}

// 歌詞からジャケット画像を生成
const generateCoverFromLyrics = async (lyrics: string, title: string, genre: string): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')!

    // 背景色を設定
    const gradient = ctx.createLinearGradient(0, 0, 400, 400)
    gradient.addColorStop(0, '#1e3a8a')
    gradient.addColorStop(1, '#3b82f6')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 400, 400)

    // 音楽ノートを描画
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 60px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('♪', 200, 200)

    // タイトルを描画
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 20px Arial'
    ctx.fillText(title || 'Music', 200, 300)

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], 'music_cover.jpg', { type: 'image/jpeg' }))
      }
    }, 'image/jpeg', 0.8)
  })
}

// デフォルトジャケット画像を生成
const generateDefaultCover = async (): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 400
    const ctx = canvas.getContext('2d')!

    const gradient = ctx.createLinearGradient(0, 0, 400, 400)
    gradient.addColorStop(0, '#1e3a8a')
    gradient.addColorStop(1, '#3b82f6')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 400, 400)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 60px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('♪', 200, 200)

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], 'default_music_cover.jpg', { type: 'image/jpeg' }))
      }
    }, 'image/jpeg', 0.8)
  })
}

export default function MusicPostPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()

  const [postData, setPostData] = useState<PostData>({
    title: '',
    description: '',
    language: 'ja',
    status: 'published',
    category: 'music',
    tags: [],
    files: [],
    genre: '',
    duration: '',
    coverImage: null,
    lyrics: '',
  })

  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [suggestedTags, setSuggestedTags] = useState<string[]>([])
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [suggestedDescription, setSuggestedDescription] = useState<string>('')

  // タグ自動生成
  useEffect(() => {
    if (postData.title || postData.description || postData.genre) {
      const autoTags = generateMusicTags(postData.title, postData.description, postData.genre)
      setSuggestedTags(autoTags.filter(tag => !postData.tags.includes(tag)))
    }
  }, [postData.title, postData.description, postData.genre, postData.tags])

  // 説明自動生成
  useEffect(() => {
    if (postData.title || postData.genre) {
      const autoDescription = generateMusicDescription(postData.title, postData.genre)
      setSuggestedDescription(autoDescription)
    }
  }, [postData.title, postData.genre])

  // 歌詞からジャケット生成
  useEffect(() => {
    if (postData.lyrics.trim() && !postData.coverImage) {
      generateCoverFromLyrics(postData.lyrics, postData.title, postData.genre)
        .then(generatedCover => {
          setPostData(prev => ({ ...prev, coverImage: generatedCover }))
          setCoverPreview(URL.createObjectURL(generatedCover))
        })
        .catch(error => {
          console.error('ジャケット画像生成エラー:', error)
        })
    }
  }, [postData.lyrics, postData.title, postData.genre, postData.coverImage])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const audioFiles = files.filter(file => file.type.startsWith('audio/'))
    setPostData(prev => ({ ...prev, files: [...prev.files, ...audioFiles] }))
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
    const audioFiles = files.filter(file => file.type.startsWith('audio/'))
    setPostData(prev => ({ ...prev, files: [...prev.files, ...audioFiles] }))
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

  const removeTag = useCallback((tagToRemove: string) => {
    setPostData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }, [])

  const applySuggestedDescription = useCallback(() => {
    if (suggestedDescription) {
      setPostData(prev => ({ ...prev, description: suggestedDescription }))
    }
  }, [suggestedDescription])

  const handleCoverSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setPostData(prev => ({ ...prev, coverImage: file }))
      setCoverPreview(URL.createObjectURL(file))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!postData.files.length) {
      alert('音楽ファイルを選択してください')
      return
    }

    setIsUploading(true)

    try {
      let coverFile = postData.coverImage

      let isAutoGenerated = false
      let generationSource = ''

      if (!coverFile) {
        if (postData.lyrics.trim()) {
          coverFile = await generateCoverFromLyrics(postData.lyrics, postData.title, postData.genre)
          isAutoGenerated = true
          generationSource = 'lyrics'
        } else {
          coverFile = await generateDefaultCover()
          isAutoGenerated = true
          generationSource = 'default'
        }
      }

      // FormDataをオブジェクトに変換
      const postObject = {
        title: postData.title,
        description: postData.description,
        category: postData.category,
        tags: postData.tags,
        language: postData.language,
        file_type: 'music',
        status: postData.status,
        files: postData.files,
        hasAudio: true,
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
      <div>ログインしてください</div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-950 to-indigo-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-600/20 rounded-lg">
              <Music className="h-8 w-8 text-blue-300" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-exo2">音楽投稿</h1>
              <p className="text-white/70 font-exo2">音楽作品をアップロードして共有しましょう</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ステップ1: 基本情報 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h2 className="text-xl font-semibold text-white font-exo2">基本情報</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* タイトル */}
                <div className="md:col-span-2">
                  <label className="block text-white/80 font-exo2 mb-2">タイトル *</label>
                  <input
                    type="text"
                    value={postData.title}
                    onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 font-exo2"
                    placeholder="音楽のタイトルを入力"
                    required
                  />
                </div>

                {/* ジャンル */}
                <div>
                  <label className="block text-white/80 font-exo2 mb-2">ジャンル *</label>
                  <select
                    value={postData.genre}
                    onChange={(e) => setPostData(prev => ({ ...prev, genre: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    required
                  >
                    <option value="">ジャンルを選択</option>
                    <option value="pop">ポップ</option>
                    <option value="rock">ロック</option>
                    <option value="jazz">ジャズ</option>
                    <option value="classical">クラシック</option>
                    <option value="electronic">エレクトロニック</option>
                    <option value="hip-hop">ヒップホップ</option>
                    <option value="folk">フォーク</option>
                    <option value="other">その他</option>
                  </select>
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
              </div>
            </div>

            {/* ステップ2: 歌詞入力 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h2 className="text-xl font-semibold text-white font-exo2">歌詞入力</h2>
                <span className="text-sm text-white/60">（任意）</span>
              </div>

              <div className="relative">
                <textarea
                  value={postData.lyrics}
                  onChange={(e) => setPostData(prev => ({ ...prev, lyrics: e.target.value }))}
                  rows={8}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none font-exo2 font-mono"
                  placeholder="歌詞を入力してください...

例：
[Verse 1]
歌詞の内容...

[Chorus]
コーラスの内容...

歌詞を入力すると、自動的にジャケット画像が生成されます。"
                />
                <div className="absolute bottom-2 right-2 text-xs text-white/50">
                  {postData.lyrics.length}/1000
                </div>
              </div>

              <div className="mt-3 text-sm text-white/60">
                <p>✨ 歌詞を入力すると、自動的にジャケット画像が生成されます</p>
              </div>
            </div>

            {/* ステップ3: ジャケット画像 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <h2 className="text-xl font-semibold text-white font-exo2">ジャケット画像</h2>
                <span className="text-sm text-white/60">（自動生成）</span>
              </div>

              <div className="space-y-4">
                {/* プレビュー */}
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center overflow-hidden">
                    {coverPreview ? (
                      <Image
                        src={coverPreview}
                        alt="ジャケット画像"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music className="h-12 w-12 text-white/50" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-white/80 text-sm mb-2">
                      {postData.lyrics.trim() ? '✨ 歌詞に基づいてジャケット画像を自動生成しました' : '🎵 デフォルトの音楽アイコンが表示されます'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverSelect}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm"
                    >
                      <Upload className="h-4 w-4" />
                      画像を選択
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ステップ4: 音楽ファイル */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
                <h2 className="text-xl font-semibold text-white font-exo2">音楽ファイル</h2>
                <span className="text-sm text-white/60">（必須）</span>
              </div>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver ? 'border-blue-400 bg-blue-400/10' : 'border-white/20'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <p className="text-white/80 mb-2">音楽ファイルをドラッグ&ドロップまたはクリックして選択</p>
                <p className="text-white/60 text-sm mb-4">MP3, WAV, FLAC, AAC など</p>

                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Upload className="h-5 w-5" />
                  ファイルを選択
                </label>
              </div>

              {/* 選択されたファイル一覧 */}
              {postData.files.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-white/80 font-semibold">選択されたファイル:</h3>
                  {postData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Music className="h-5 w-5 text-blue-400" />
                        <span className="text-white">{file.name}</span>
                        <span className="text-white/60 text-sm">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ステップ5: 詳細情報 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">5</div>
                <h2 className="text-xl font-semibold text-white font-exo2">詳細情報</h2>
              </div>

              <div className="space-y-6">
                {/* 説明 */}
                <div>
                  <label className="block text-white/80 font-exo2 mb-2">説明</label>
                  <div className="space-y-3">
                    <textarea
                      value={postData.description}
                      onChange={(e) => setPostData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none font-exo2"
                      placeholder="音楽作品の説明を入力してください..."
                    />
                    {suggestedDescription && suggestedDescription !== postData.description && (
                      <div className="p-3 bg-blue-600/20 border border-blue-400/30 rounded-lg">
                        <p className="text-white/80 text-sm mb-2">自動生成された説明:</p>
                        <p className="text-white text-sm mb-2">{suggestedDescription}</p>
                        <button
                          type="button"
                          onClick={applySuggestedDescription}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          <Sparkles className="h-3 w-3" />
                          自動生成を適用
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* カテゴリー（表示のみ） */}
                <div>
                  <label className="block text-white/80 font-exo2 mb-2">カテゴリー</label>
                  <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/60">
                    音楽
                  </div>
                </div>

                {/* タグ */}
                <div>
                  <label className="block text-white/80 font-exo2 mb-2">タグ</label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                        placeholder="タグを入力してEnter"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* 提案タグ */}
                    {suggestedTags.length > 0 && (
                      <div>
                        <p className="text-white/60 text-sm mb-2">提案タグ:</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestedTags.map((tag, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => addSuggestedTag(tag)}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/30 border border-blue-400/50 text-white rounded-full text-sm hover:bg-blue-600/50 transition-colors"
                            >
                              <Tag className="h-3 w-3" />
                              {tag}
                              <Plus className="h-3 w-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 選択されたタグ */}
                    {postData.tags.length > 0 && (
                      <div>
                        <p className="text-white/60 text-sm mb-2">選択されたタグ:</p>
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
                      </div>
                    )}
                  </div>
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
