'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Video, Image as ImageIcon, Music, File, Eye, Heart, MessageCircle, Calendar, User, Edit, Trash2, Share, X, BookOpen, Bell, Users, Settings, Repeat, Download, Maximize2, Minimize2, PlayCircle, PauseCircle, FastForward, Rewind, PictureInPicture2, MoreHorizontal } from 'lucide-react'
import { useAuth } from '../../lib/auth-context'
import { useI18n } from '../../lib/i18n-provider'
import { apiClient } from '../../lib/api'
import AudioPlayer from '../../components/AudioPlayer'
import Image from 'next/image'
import ImageModal from '../../components/ImageModal'
import VideoPlayer from '../../components/VideoPlayer'
import CommentSection from '../../components/CommentSection'
import TextModal from '../../components/TextModal'
import VideoModal from '../../components/VideoModal'
import Link from 'next/link';

interface Post {
  id: number
  title: string
  content?: string
  description?: string
  author: {
    username: string
    profile?: {
      avatar?: string
    }
  }
  created_at: string
  updated_at: string
  language: string
  status?: 'draft' | 'published' | 'archived'
  visibility?: string
  file_type: 'text' | 'image' | 'video' | 'music'
  category?: string
  tags?: string[]
  views?: number
  likes?: number
  comments?: number
  hasAudio?: boolean
  isSilentVideo?: boolean
  files?: Array<{
    id: number
    file: string
    file_url?: string
    original_name: string
    file_size?: number
    file_type: string
  }>
}

export default function PostDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isAuthenticated } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTextModal, setShowTextModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedImageName, setSelectedImageName] = useState<string>('')
  const [isLiked, setIsLiked] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    imageTitle: string;
  }>({
    isOpen: false,
    imageUrl: '',
    imageTitle: ''
  });
  const videoRefs = useRef<(HTMLVideoElement|null)[]>([])
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [selectedVideoName, setSelectedVideoName] = useState<string>('')
  const [showComments, setShowComments] = useState(false)

  // 音声関連のstate
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1.0)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [volumeTimeout, setVolumeTimeout] = useState<NodeJS.Timeout | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([])
  const [currentCharIndex, setCurrentCharIndex] = useState<number | null>(null)
  const [textFileContent, setTextFileContent] = useState<string>('')

  const postId = params.id

  // 小説のテキスト内容
  const novelText = `# 小説：EldoniaーNex 〜挑戦の果てに辿り着く場所〜

## 第1章：始まりの場所

EldoniaーNexの世界に足を踏み入れた瞬間、彼女の人生は大きく変わることになった。

「ここが、私の挑戦の始まりなのね」

彼女の名前は、アリア。平凡なOLとして働いていた彼女は、ある日偶然EldoniaーNexという新しい世界を知ることになった。

## 第2章：最初の一歩

EldoniaーNexは、単なるゲームではなかった。それは、現実世界では味わえない成功体験を提供する特別な場所だった。

「この世界で、私は本当の自分になれるかもしれない」

アリアは、EldoniaーNexの中で新しい自分を発見していく。現実世界では控えめだった彼女が、ここでは大胆で決断力のあるリーダーとして成長していく。

## 第3章：仲間との出会い

EldoniaーNexの世界では、同じ志を持つ仲間たちと出会うことができた。

「私たちは、みんな同じ夢を持っているのね」

現実世界では孤独を感じていたアリアだが、ここでは心から信頼できる仲間たちと出会うことができた。彼らと共に、より大きな目標に向かって進んでいく。

## 第4章：困難との戦い

しかし、成功への道のりは決して平坦ではなかった。

「諦めない。絶対に諦めない」

EldoniaーNexの世界でも、現実世界と同様に困難や挫折が待ち受けていた。しかし、アリアは仲間たちと共に、一つ一つの困難を乗り越えていく。

## 第5章：成長の証

時間が経つにつれて、アリアは確実に成長していった。

「私、本当に変わったわね」

EldoniaーNexでの経験を通じて、アリアは現実世界でも自信を持って行動できるようになった。彼女の周りの人々も、その変化に気づき始める。

## 第6章：成功への道

そしてついに、アリアはEldoniaーNexの世界で大きな成功を収めることができた。

「これが、私の挑戦の果てに辿り着いた場所なのね」

しかし、彼女にとって最も大切なのは、成功そのものではなく、その過程で得た成長と仲間たちとの絆だった。

## 第7章：新しい始まり

EldoniaーNexでの経験を経て、アリアは現実世界でも新しい挑戦を始めることにした。

「今度は、現実世界でも私の夢を叶えてみせる」

EldoniaーNexで学んだことを活かして、アリアは現実世界でも自分の目標に向かって進んでいく。

## エピローグ：挑戦の果てに

EldoniaーNexは、単なるゲームではなかった。それは、人々が本当の自分を見つけ、成長するための特別な場所だった。

「EldoniaーNexを通じて、私は本当の自分を見つけることができた」

アリアの物語は、EldoniaーNexの世界で繰り広げられる数多くの成功ストーリーの一つに過ぎない。あなたも、この世界に足を踏み入れて、自分の挑戦を始めてみませんか？

---

*EldoniaーNex - 挑戦の果てに辿り着く場所*

*あなたの成功ストーリーが、ここから始まります。*`

  useEffect(() => {
    let isMounted = true

    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/posts/${postId}/`)
        if (response.ok) {
          const data = await response.json()
          if (isMounted) {
            console.log('投稿詳細データ:', data)
            console.log('投稿の内容フィールド:', {
              description: data.description,
              content: data.content,
              title: data.title,
              file_type: data.file_type
            })
            setPost(data)
          }
        } else {
          if (isMounted) {
            setError('投稿が見つかりません')
          }
        }
      } catch (err) {
        if (isMounted) {
          setError('投稿の取得に失敗しました')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (postId) {
      fetchPost()
    }

    return () => {
      isMounted = false
    }
  }, [postId])

  useEffect(() => {
    // 音声リストを取得し日本語のみセット
    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      const jaVoices = voices.filter(v => v.lang.startsWith('ja'))
      setVoiceList(jaVoices)
      // デフォルト選択
      if (!selectedVoice && jaVoices.length > 0) setSelectedVoice(jaVoices[0])
    }
    updateVoices()
    window.speechSynthesis.onvoiceschanged = updateVoices
    return () => { window.speechSynthesis.onvoiceschanged = null }
  }, [selectedVoice])

  // コンポーネントがアンマウントされた時に読み上げを停止
  useEffect(() => {
    return () => {
      if (volumeTimeout) {
        clearTimeout(volumeTimeout)
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [volumeTimeout])

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes || bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'music':
        return <Music className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getFileTypeColor = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return 'bg-green-100 text-green-800'
      case 'video':
        return 'bg-red-100 text-red-800'
      case 'music':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getFileTypeLabel = (fileType: string) => {
    switch (fileType) {
      case 'image':
        return '画像'
      case 'video':
        return '動画'
      case 'music':
        return '音楽'
      default:
        return 'テキスト'
    }
  }

  const getActualFileType = (files: Array<{file_type: string}>) => {
    if (files.some(f => f.file_type.startsWith('image/'))) {
      return 'image'
    } else if (files.some(f => f.file_type.startsWith('video/'))) {
      return 'video'
    } else if (files.some(f => f.file_type.startsWith('audio/'))) {
      return 'music'
    } else {
      return 'text'
    }
  }

  // 小説のテキスト表示ボタンをレンダリング
  const renderNovelTextButton = () => {
    if (post?.title === '小説：EldoniaーNex 〜挑戦の果てに辿り着く場所〜') {
      return (
        <button
          onClick={() => setShowTextModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <BookOpen className="h-4 w-4" />
          小説を読む
        </button>
      )
    }
    return null
  }

  const handleLike = async () => {
    if (!post) return;
    try {
      const response = await apiClient.toggleLike(post.id);
      if (response.success) {
        setIsLiked(response.is_liked);
        setPost(prev => prev ? { ...prev, likes: response.likes_count } : null);
      }
    } catch (error) {
      console.error('いいねの切り替えに失敗:', error);
      alert('いいねの操作に失敗しました');
    }
  }

  const handleSubscribe = async () => {
    if (!post) return;
    try {
      const response = await apiClient.toggleSubscribe(post.id);
      if (response.success) {
        setIsSubscribed(response.is_subscribed);
      }
    } catch (error) {
      console.error('チャンネル登録の切り替えに失敗:', error);
      alert('チャンネル登録の操作に失敗しました');
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || '投稿',
        text: post?.description || '',
        url: window.location.href,
      })
    } else {
      // フォールバック: URLをクリップボードにコピー
      navigator.clipboard.writeText(window.location.href)
      alert('URLをクリップボードにコピーしました')
    }
  }

  // 画像モーダルを開く
  const openImageModal = (imageUrl: string, imageTitle: string) => {
    setImageModal({
      isOpen: true,
      imageUrl,
      imageTitle
    });
  };

  // 画像モーダルを閉じる
  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      imageUrl: '',
      imageTitle: ''
    });
  };

  const loadTextFileContent = async (fileUrl: string) => {
    try {
      const response = await fetch(fileUrl)
      if (response.ok) {
        const content = await response.text()
        setTextFileContent(content)
        return content
      }
    } catch (error) {
      console.error('テキストファイルの読み込みエラー:', error)
    }
    return ''
  }

  // 一時停止/再開機能付きオーディオコントロール関数
  const handlePlayPause = () => {
    console.log('handlePlayPauseが呼び出されました', { isPlaying, speechSynthesis: !!window.speechSynthesis })

    if (!window.speechSynthesis) {
      alert('お使いのブラウザは音声読み上げに対応していません。')
      return
    }

    // 音声許可を確認
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName }).then((result) => {
        console.log('音声許可状態:', result.state)
        if (result.state === 'denied') {
          alert('音声の使用が許可されていません。ブラウザの設定を確認してください。')
          return
        }
      }).catch(() => {
        console.log('音声許可の確認に失敗しましたが、続行します')
      })
    }

    if (isPlaying) {
      if (window.speechSynthesis.paused) {
        console.log('読み上げを再開します')
        // 再開
        window.speechSynthesis.resume()
      } else {
        console.log('読み上げを一時停止します')
        // 一時停止
        window.speechSynthesis.pause()
      }
    } else {
      // 新しい読み上げを開始
      console.log('新しい読み上げを開始します')
      startReading()
    }
  }

  // 停止機能
  const handleStop = () => {
    console.log('読み上げを停止します')
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setCurrentUtterance(null)
  }

  // 共通エラーハンドラ
  const handleSpeechError = (event: SpeechSynthesisErrorEvent) => {
    if (event.error === 'interrupted') {
      console.log('読み上げが中断されました（正常な動作）');
      setIsPlaying(false);
      setCurrentUtterance(null);
      return;
    }
    console.error('読み上げエラー:', event.error);
    setIsPlaying(false);
    setCurrentUtterance(null);
    alert(`読み上げエラー: ${event.error}`);
  };
  // 共通音声設定
  const applyVoiceSettings = (utterance: SpeechSynthesisUtterance, volume: number) => {
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = volume;
    const voiceToUse = selectedVoice || (window.speechSynthesis.getVoices().find(v => v.lang.startsWith('ja')));
    if (voiceToUse) {
      utterance.voice = voiceToUse;
      console.log('選択音声を設定:', voiceToUse.name);
    }
  };

  const startReading = () => {
    console.log('startReadingが呼び出されました')

    // 音声の準備を待つ関数
    const waitForVoices = () => {
      return new Promise<void>((resolve) => {
        const voices = window.speechSynthesis.getVoices()
        console.log('現在の音声数:', voices.length)

        if (voices.length > 0) {
          console.log('音声が利用可能です')
          resolve()
        } else {
          console.log('音声の読み込みを待機中...')

          // 音声の読み込みを強制的に開始
          window.speechSynthesis.getVoices()

          window.speechSynthesis.onvoiceschanged = () => {
            console.log('音声の読み込みが完了しました')
            resolve()
          }

          // タイムアウトを設定（5秒）
          setTimeout(() => {
            console.log('音声読み込みタイムアウト、続行します')
            resolve()
          }, 5000)
        }
      })
    }

    // 音声の準備を待ってから読み上げを開始
    waitForVoices().then(() => {
      // 音声合成の状態をリセット
      console.log('音声合成の状態をリセットします')
      window.speechSynthesis.cancel()

      // 少し待ってから開始
      setTimeout(() => {
        console.log('読み上げを開始します')

        // 既存の読み上げを停止
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          console.log('既存の読み上げを停止します')
          window.speechSynthesis.cancel()
        }

      // アップロードされたテキストを読み上げ
      const textToRead = novelText || '読み上げるテキストがありません。'
      console.log('読み上げテキスト:', textToRead.substring(0, 100) + '...')

      const utterance = new SpeechSynthesisUtterance(textToRead)
      applyVoiceSettings(utterance, volume);
      utterance.onstart = () => {
        setIsPlaying(true);
        setCurrentUtterance(utterance);
      };
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentUtterance(null);
        setCurrentCharIndex(null)
      };
      utterance.onerror = (event) => {
        handleSpeechError(event)
        setCurrentCharIndex(null)
      }
      utterance.onboundary = (event: any) => {
        setCurrentCharIndex(event.charIndex)
      }

              console.log('音声合成を開始します')
        try {
          window.speechSynthesis.speak(utterance)
          console.log('speak()が呼び出されました')
        } catch (error) {
          console.error('speak()エラー:', error)
          alert('音声合成の開始に失敗しました')
        }
      }, 100)
    })
  }

  const handleVolumeChange = (newVolume: number) => {
    console.log('音量を変更します:', newVolume)
    setVolume(newVolume)

    // 既存のタイムアウトをクリア
    if (volumeTimeout) {
      clearTimeout(volumeTimeout)
    }

    // デバウンス処理：500ms後に音量変更を適用
    const timeout = setTimeout(() => {
      // 現在読み上げ中の場合は、新しい音量で再開
      if (isPlaying && currentUtterance) {
        console.log('音量変更を適用します:', newVolume)
        window.speechSynthesis.cancel()
        const textToRead = `小説：EldoniaーNex 〜挑戦の果てに辿り着く場所〜\n\n${novelText}`

        const newUtterance = new SpeechSynthesisUtterance(textToRead)
        applyVoiceSettings(newUtterance, newVolume);
        newUtterance.onstart = () => {
          setIsPlaying(true);
          setCurrentUtterance(newUtterance);
        };
        newUtterance.onend = () => {
          setIsPlaying(false);
          setCurrentUtterance(null);
          setCurrentCharIndex(null)
        };
        newUtterance.onerror = (event) => {
          handleSpeechError(event)
          setCurrentCharIndex(null)
        }
        newUtterance.onboundary = (event: any) => {
          setCurrentCharIndex(event.charIndex)
        }

        window.speechSynthesis.speak(newUtterance)
      }
    }, 500)

    setVolumeTimeout(timeout)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">エラー</h2>
          <p className="text-gray-600 mb-6">{error || '投稿が見つかりません'}</p>
          <button
            onClick={() => router.push('/post')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            投稿一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 左: メインコンテンツ */}
        <div className="flex-1">
          <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-8">
          {/* 投稿ヘッダー */}
          <div className="flex items-center gap-3 mb-6">
            <Link href="/gallery" className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-yellow-200 to-orange-200 text-gray-900 shadow hover:underline">
              <Image src="/images/icons/logo.png" alt="Eldonia-Nex" width={18} height={18} className="rounded bg-white" style={{minWidth:18, minHeight:18}} />
              Eldonia-Nex
            </Link>
            {/* 既存のバッジ */}
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full ${getFileTypeColor(post.files && post.files.length > 0 ? getActualFileType(post.files) : post.file_type)}`}>
              {getFileTypeIcon(post.files && post.files.length > 0 ? getActualFileType(post.files) : post.file_type)}
              {getFileTypeLabel(post.files && post.files.length > 0 ? getActualFileType(post.files) : post.file_type)}
            </span>
            <span className="text-sm text-gray-400 bg-gray-700 px-3 py-1 rounded">
              {post.language === 'ja' ? '日本語' : post.language}
            </span>
            <span className="text-sm text-gray-400">
              {post.visibility === 'public' ? '公開中' : post.visibility === 'draft' ? '下書き' : post.visibility === 'private' ? '非公開' : 'その他'}
            </span>
          </div>

          {/* タイトルと投稿情報を統合 */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-3xl font-bold text-yellow-400">{post.title}</h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.author?.username || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{(post.views || 0).toLocaleString()} 回閲覧</span>
                </div>
              </div>
            </div>

            {/* 右側のアクションボタン（編集・削除・シェア） */}
            <div className="flex items-center gap-2 ml-4">
              {isAuthenticated && user?.username === post.author?.username && (
                <>
                    <button
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors bg-gray-700/50 rounded-lg hover:bg-gray-600/50"
                      aria-label="投稿を編集"
                    >
                    <Edit className="h-4 w-4" />
                  </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors bg-gray-700/50 rounded-lg hover:bg-gray-600/50"
                      aria-label="投稿を削除"
                    >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-green-400 transition-colors bg-gray-700/50 rounded-lg hover:bg-gray-600/50"
                  aria-label="投稿をシェア"
              >
                <Share className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 内容 */}
          <div className="prose max-w-none mb-8">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{post.description || post.content || ''}</p>
          </div>

          {/* 小説テキスト表示ボタン */}
          {renderNovelTextButton()}

          {/* ファイルプレビュー */}
          {post.files && post.files.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">添付ファイル</h3>

              {/* 動画ファイル */}
              {post.files.filter(f => f.file_type.startsWith('video/')).length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-medium text-gray-300">動画</h4>
                    {/* 音声情報の表示 */}
                    {post.hasAudio !== undefined && (
                      <div className="flex items-center gap-2">
                        {post.hasAudio ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-300 rounded-full text-xs border border-green-500/30">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            音声あり
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded-full text-xs border border-yellow-500/30">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                            サイレント動画
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {post.files
                      .filter(f => f.file_type.startsWith('video/'))
                      .map((file, index) => {
                        console.log('詳細ページの動画ファイル:', file)
                        return (
                          <div key={index} className="relative group">
                            <div className="relative">
                              <video
                                  ref={(el) => {
                                    if (videoRefs.current) {
                                      videoRefs.current[index] = el
                                    }
                                  }}
                                src={file.file_url || file.file}
                                className="w-full h-48 object-cover rounded-lg"
                                preload="metadata"
                                muted
                                loop
                              />
                            </div>
                            <div className="mt-3">
                              <h3 className="text-base font-medium text-white line-clamp-2 mb-1">{file.original_name.replace(/\.[^/.]+$/, '')}</h3>
                              <p className="text-sm text-gray-400">{post.title}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                <span>📁 {formatFileSize(file.file_size)}</span>
                                <span>👁️ 0回視聴</span>
                                <span>📅 {formatDate(post.created_at)}</span>
                              </div>
                            </div>
                            <div
                              className="absolute inset-0 cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setSelectedVideo(file.file_url || file.file)
                                setSelectedVideoName(file.original_name)
                                setShowVideoModal(true)
                              }}
                                role="button"
                                tabIndex={0}
                                aria-label={`動画を再生: ${file.original_name}`}
                            />
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* 画像ファイル */}
              {post.files.filter(f => f.file_type.startsWith('image/')).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-300 mb-3">画像</h4>
                  <div className="grid grid-cols-1 gap-6">
                    {post.files
                      .filter(f => f.file_type.startsWith('image/'))
                      .map((file, index) => (
                        <div key={index} className="cursor-pointer">
                          <img
                            src={file.file_url || file.file}
                            alt={file.original_name}
                            className="w-full h-80 object-contain rounded-lg hover:opacity-80 transition-opacity border border-gray-600"
                            onClick={() => openImageModal(file.file_url || file.file, file.original_name)}
                          />
                          <div className="mt-3">
                            <p className="text-base font-medium text-white truncate">{file.original_name}</p>
                            <p className="text-sm text-gray-400">{formatFileSize(file.file_size)}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 音楽ファイルとコメント */}
              {post.files.filter(f => f.file_type.startsWith('audio/')).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-300 mb-3">🎵 音楽プレイヤー</h4>
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* 左: 音楽プレイヤー */}
                    <div className="flex-1">
                      <div className="space-y-4">
                        {post.files
                          .filter(f => f.file_type.startsWith('audio/'))
                          .map((file, index) => (
                            <div
                              key={index}
                              className="bg-gradient-to-r from-green-900/50 to-teal-900/50 rounded-lg p-6 border border-green-700/50 hover:from-green-800/50 hover:to-teal-800/50 transition-all duration-200"
                            >
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-xl">
                                  🎵
                                </div>
                                <div>
                                  <h5 className="text-lg font-semibold text-white">{file.original_name.replace(/\.[^/.]+$/, '')}</h5>
                                  <p className="text-sm text-gray-300">{post.title}</p>
                                </div>
                              </div>
                              <AudioPlayer
                                src={file.file_url || file.file}
                                title={file.original_name}
                                className="w-full"
                                autoPlay={true}
                                showControls={true}
                                onPlayStateChange={(isPlaying) => {
                                  console.log(`音楽再生状態: ${isPlaying ? '再生中' : '停止中'} - ${file.original_name}`)
                                }}
                              />
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                  <span>📁 {formatFileSize(file.file_size)}</span>
                                  <span>🎵 {file.file_type}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>


                  </div>
                </div>
              )}

              {/* その他のファイル */}
              {post.files.filter(f => !f.file_type.startsWith('video/') && !f.file_type.startsWith('image/') && !f.file_type.startsWith('audio/')).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-300 mb-3">その他のファイル</h4>
                  <div className="space-y-2">
                    {post.files
                      .filter(f => !f.file_type.startsWith('video/') && !f.file_type.startsWith('image/'))
                      .map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                          <File className="h-5 w-5 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{file.original_name}</p>
                            <p className="text-xs text-gray-400">{formatFileSize(file.file_size)} • {file.file_type}</p>
                          </div>
                          <a
                            href={file.file_url || file.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            ダウンロード
                          </a>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex items-center gap-4 pt-6 border-t border-gray-700">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
                aria-label={isLiked ? 'いいねを取り消す' : 'いいねする'}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isLiked ? 'いいね済み' : 'いいね'}</span>
            </button>
            <button
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                aria-label="コメントを表示"
              >
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">コメント</span>
                </button>
                <button
                  onClick={handleSubscribe}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isSubscribed
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                aria-label={isSubscribed ? 'チャンネル登録を解除' : 'チャンネル登録する'}
                >
                  <Bell className={`h-4 w-4 ${isSubscribed ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">{isSubscribed ? '登録済み' : 'チャンネル登録'}</span>
                </button>
              </div>
            </div>
          </div>

        {/* 右: LINE風コメントセクション */}
        <aside className="w-full lg:w-[400px]">
          <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-700/50 overflow-hidden">
            {/* ヘッダー */}
            <div className="bg-gray-800 px-4 py-3 border-b border-gray-700">
              <h4 className="text-md font-medium text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-400" />
                コメント
                {post && (
                  <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded-full ml-auto">
                    {post.comments || 0}
                  </span>
                )}
              </h4>
                </div>
            {/* コメントエリア */}
            <div className="h-[80vh]">
              {post && <CommentSection postId={post.id} />}
                  </div>
                </div>
        </aside>
            </div>

      {/* テキストモーダル */}
      {showTextModal && (
        <TextModal
          isOpen={showTextModal}
          onClose={() => setShowTextModal(false)}
          title="小説：EldoniaーNex 〜挑戦の果てに辿り着く場所〜"
          content={novelText}
          author={post?.author?.username || ''}
          category={post?.category}
          onLike={handleLike}
          onSubscribe={handleSubscribe}
          onShare={handleShare}
          isLiked={isLiked}
          isSubscribed={isSubscribed}
        />
      )}

      {/* 画像モーダル */}
      {imageModal.isOpen && (
        <ImageModal
          isOpen={imageModal.isOpen}
          onClose={closeImageModal}
          imageUrl={imageModal.imageUrl}
          imageTitle={imageModal.imageTitle}
        />
      )}

      {/* 動画モーダル */}
      {showVideoModal && (
        <VideoModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          src={selectedVideo || ''}
          title={selectedVideoName}
        />
      )}


    </div>
  )
}
