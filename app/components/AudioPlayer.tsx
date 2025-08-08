'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react'

// 音量スライダーのスタイル
const sliderStyles = `
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #8b5cf6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .slider::-moz-range-thumb {
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #8b5cf6;
    cursor: pointer;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  .slider::-webkit-slider-track {
    background: transparent;
    border: none;
  }

  .slider::-moz-range-track {
    background: transparent;
    border: none;
  }
`

interface AudioPlayerProps {
  src: string
  title?: string
  className?: string
  autoPlay?: boolean
  showControls?: boolean
  onPlayStateChange?: (isPlaying: boolean) => void
}

export default function AudioPlayer({
  src,
  title = '音楽ファイル',
  className = '',
  autoPlay = true,
  showControls = true,
  onPlayStateChange
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // 音源が変更された場合の状態リセット
    setCurrentTime(0)
    setDuration(0)
    setIsLoading(true)
    setError(null)
    setIsPlaying(false)

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
      setError(null)
      console.log('音源メタデータ読み込み完了:', title)

      // 自動再生が有効な場合、メタデータ読み込み後に再生を試行
      if (autoPlay) {
        // 少し遅延を入れてから再生を試行
        setTimeout(() => {
          audio.play().then(() => {
            setIsPlaying(true)
            setError(null) // エラーをクリア
            console.log('自動再生開始:', title)
          }).catch(err => {
            console.warn('Auto-play failed:', err)
            // 自動再生に失敗してもエラーにしない（ユーザーが手動で再生できる）
            setIsPlaying(false)
            // 自動再生の失敗は一般的なので、エラーメッセージは表示しない
          })
        }, 100)
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }

    const handleError = (e: Event) => {
      const audio = e.target as HTMLAudioElement
      let errorMessage = '音楽ファイルの読み込みに失敗しました'

      // より詳細なエラー情報を取得
      if (audio.error) {
        switch (audio.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = '音楽の読み込みが中断されました'
            break
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = 'ネットワークエラーが発生しました'
            break
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage = '音楽ファイルの形式がサポートされていません'
            break
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = '音楽ファイルの形式がサポートされていません'
            break
          default:
            errorMessage = '音楽ファイルの読み込みに失敗しました'
        }
      }

      console.warn('Audio error occurred:', errorMessage)
      setError(errorMessage)
      setIsLoading(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      setError(null)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('canplay', handleCanPlay)

    return () => {
      // コンポーネントがアンマウントされる際に再生を停止
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [src, autoPlay, title])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
        onPlayStateChange?.(false)
      } else {
        // 音源の準備状態を確認
        if (audio.readyState < 2) {
          // 音源がまだ読み込まれていない場合、読み込みを待つ
          audio.load()
          setError('音楽ファイルを読み込み中です...')

          // 読み込み完了を待つ
          await new Promise((resolve, reject) => {
            const handleCanPlay = () => {
              audio.removeEventListener('canplay', handleCanPlay)
              audio.removeEventListener('error', handleError)
              resolve(true)
            }

            const handleError = () => {
              audio.removeEventListener('canplay', handleCanPlay)
              audio.removeEventListener('error', handleError)
              reject(new Error('音楽ファイルの読み込みに失敗しました'))
            }

            audio.addEventListener('canplay', handleCanPlay)
            audio.addEventListener('error', handleError)
          })
        }

        // 再生を試行
        await audio.play()
        setIsPlaying(true)
        onPlayStateChange?.(true)
        setError(null) // エラーをクリア
        console.log('音楽再生開始:', title)
      }
    } catch (err) {
      console.warn('Play/pause error:', err)
      if (err instanceof Error) {
        setError(`再生に失敗しました: ${err.message}`)
      } else {
        setError('再生に失敗しました')
      }
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progress = progressRef.current
    if (!audio || !progress) return

    const rect = progress.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progressWidth = rect.width
    const seekTime = (clickX / progressWidth) * duration

    audio.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    audio.volume = newVolume

    if (newVolume === 0) {
      setIsMuted(true)
    } else if (isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const skipBackward = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.max(0, currentTime - 10)
  }

  const skipForward = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.min(duration, currentTime + 10)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={`bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-xl p-6 border border-gray-600/30 shadow-xl ${className}`}>
      <style jsx>{sliderStyles}</style>

      {/* エラー表示 */}
      {error && (
        <div className="text-red-200 text-sm mb-4 p-3 bg-red-800/40 rounded-lg border border-red-600/30 font-medium">
          {error}
        </div>
      )}

      {/* タイトル */}
      <div className="text-white font-bold text-lg mb-4 truncate drop-shadow-sm">
        {title}
      </div>

      {/* オーディオ要素 */}
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadStart={() => setIsLoading(true)}
      />

      {/* プログレスバー */}
      <div
        ref={progressRef}
        className="relative h-3 bg-gray-600/50 rounded-full mb-4 cursor-pointer shadow-inner"
        onClick={handleSeek}
      >
        <div
          className="absolute h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-100 shadow-lg"
          style={{ width: `${progressPercentage}%` }}
        />
        <div
          className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-100 hover:scale-125 border-2 border-purple-500"
          style={{ left: `calc(${progressPercentage}% - 8px)` }}
        />
      </div>

      {/* 時間表示 */}
      <div className="flex justify-between text-sm text-white font-medium mb-4">
        <span className="bg-gray-700/50 px-2 py-1 rounded-md">{formatTime(currentTime)}</span>
        <span className="bg-gray-700/50 px-2 py-1 rounded-md">{formatTime(duration)}</span>
      </div>

      {/* コントロール */}
      {showControls && (
        <div className="flex items-center justify-between">
          {/* 再生コントロール */}
          <div className="flex items-center gap-3">
            <button
              onClick={skipBackward}
              className="p-2 text-white hover:text-purple-300 transition-colors bg-gray-700/50 rounded-lg hover:bg-gray-600/50"
              title="10秒戻る"
            >
              <SkipBack className="h-5 w-5" />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
              title={isPlaying ? '一時停止' : '再生'}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={skipForward}
              className="p-2 text-white hover:text-purple-300 transition-colors bg-gray-700/50 rounded-lg hover:bg-gray-600/50"
              title="10秒進む"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          {/* 音量コントロール */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="p-2 text-white hover:text-purple-300 transition-colors bg-gray-700/50 rounded-lg hover:bg-gray-600/50"
              title={isMuted ? 'ミュート解除' : 'ミュート'}
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 bg-gray-600/50 rounded-lg appearance-none cursor-pointer slider h-2"
              title="音量"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
