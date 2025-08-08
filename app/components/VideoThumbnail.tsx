'use client'

import { useState, useRef, useEffect } from 'react'
import { Play } from 'lucide-react'

interface VideoThumbnailProps {
  videoUrl: string
  className?: string
  showPlayButton?: boolean
  onThumbnailGenerated?: (thumbnailUrl: string) => void
}

export default function VideoThumbnail({ 
  videoUrl, 
  className = "w-full h-48 object-cover rounded-lg", 
  showPlayButton = true,
  onThumbnailGenerated 
}: VideoThumbnailProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [loadTime, setLoadTime] = useState<number>(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // URLの妥当性チェック
  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return false
    try {
      // 相対パス（/mp4/...）の場合は有効とする
      if (url.startsWith('/')) return true
      // 絶対URLの場合はURLコンストラクタで検証
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  useEffect(() => {
    console.log('VideoThumbnail: コンポーネント初期化', { videoUrl })
    
    // URLの妥当性チェック
    if (!isValidUrl(videoUrl)) {
      console.error('VideoThumbnail: 無効なURL:', videoUrl)
      setHasError(true)
      setIsLoaded(true)
      return
    }
    
    const video = videoRef.current
    if (!video) {
      console.log('VideoThumbnail: video要素が見つかりません')
      return
    }

    const startTime = Date.now()

    const handleLoadedData = () => {
      const endTime = Date.now()
      const loadDuration = endTime - startTime
      console.log('VideoThumbnail: ビデオデータ読み込み完了:', { 
        videoUrl, 
        loadDuration: `${loadDuration}ms`,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        duration: video.duration
      })
      setIsLoaded(true)
      setLoadTime(loadDuration)
      // 最初のフレームに移動
      video.currentTime = 0
    }

    const handleSeeked = () => {
      console.log('VideoThumbnail: ビデオシーク完了:', videoUrl)
      // 一時停止
      video.pause()
    }

    const handleCanPlay = () => {
      console.log('VideoThumbnail: ビデオ再生可能:', videoUrl)
      setIsLoaded(true)
    }

    const handleError = (e: Event) => {
      const endTime = Date.now()
      const loadDuration = endTime - startTime
      const error = e.target as HTMLVideoElement
      const errorDetails = {
        videoUrl, 
        error: error.error || 'Unknown error',
        errorCode: error.error?.code,
        errorMessage: error.error?.message,
        loadDuration: `${loadDuration}ms`
      }
      console.error('VideoThumbnail: ビデオ読み込みエラー:', errorDetails)
      setHasError(true)
      setIsLoaded(true) // エラーでもローディングを終了
    }

    const handleLoadStart = () => {
      console.log('VideoThumbnail: ビデオ読み込み開始:', videoUrl)
      setIsLoaded(false)
      setHasError(false)
    }

    const handleLoadEnd = () => {
      const endTime = Date.now()
      const loadDuration = endTime - startTime
      console.log('VideoThumbnail: ビデオ読み込み終了:', { 
        videoUrl, 
        loadDuration: `${loadDuration}ms`,
        success: !hasError
      })
    }

    video.addEventListener('loadstart', handleLoadStart)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('seeked', handleSeeked)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('loadend', handleLoadEnd)

    return () => {
      video.removeEventListener('loadstart', handleLoadStart)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('seeked', handleSeeked)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadend', handleLoadEnd)
    }
  }, [videoUrl, hasError])

  // 無効なURLの場合はエラー表示
  if (!isValidUrl(videoUrl)) {
    return (
      <div className="relative group">
        <div className={`${className} bg-gray-800 flex items-center justify-center`}>
          <div className="text-center text-white">
            <div className="text-4xl mb-2">🎬</div>
            <div className="text-sm">動画URLが無効です</div>
            <div className="text-xs text-gray-400 mt-1">URL: {videoUrl || '空'}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group">
      {/* ビデオ要素 */}
      <video
        ref={videoRef}
        src={videoUrl}
        className={`${className} transition-transform duration-300 group-hover:scale-105`}
        preload="metadata"
        muted
        playsInline
        onLoadedData={(e) => {
          const video = e.currentTarget
          video.currentTime = 0
          video.pause()
        }}
        onSeeked={(e) => {
          const video = e.currentTarget
          video.pause()
        }}
      />
      
      {/* ローディング表示 */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
            <div className="text-sm">動画を読み込み中...</div>
            <div className="text-xs text-gray-400 mt-1">{videoUrl}</div>
          </div>
        </div>
      )}
      
      {/* エラー表示 */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-4xl mb-2">🎬</div>
            <div className="text-sm">動画を読み込めませんでした</div>
            <div className="text-xs text-gray-400 mt-1">{videoUrl}</div>
          </div>
        </div>
      )}
      
      {/* 再生ボタン */}
      {showPlayButton && isLoaded && !hasError && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <Play className="h-4 w-4" />
              再生
            </div>
          </div>
        </div>
      )}
      
      {/* ビデオアイコン */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-medium">
        🎬
      </div>
      
      {/* 再生ボタンオーバーレイ */}
      {isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black bg-opacity-50 rounded-full p-3">
            <div className="text-white text-2xl">▶</div>
          </div>
        </div>
      )}
      
      {/* デバッグ情報（開発環境のみ） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
          {isLoaded ? `✓ ${loadTime}ms` : '⏳'}
        </div>
      )}
    </div>
  )
} 