'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Play, Pause, Volume2, VolumeX, SkipBack, SkipForward,
  X, Maximize2, Minimize2, Repeat, Shuffle, Heart,
  Download, Share2, MoreHorizontal, Clock, Disc3,
  Waves, Music2, Mic, MicOff
} from 'lucide-react'
import Image from 'next/image'

interface MusicModalProps {
  isOpen: boolean
  onClose: () => void
  src: string
  title: string
  artist?: string
  album?: string
  coverImage?: string
  duration?: number
  onPlayStateChange?: (isPlaying: boolean) => void
}

export default function MusicModal({
  isOpen,
  onClose,
  src,
  title,
  artist = 'Unknown Artist',
  album = 'Unknown Album',
  coverImage,
  duration,
  onPlayStateChange
}: MusicModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showVisualizer, setShowVisualizer] = useState(true)
  const [isRecording, setIsRecording] = useState(false)

  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const visualizerRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  // 音声分析用
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const audio = audioRef.current
    if (!audio) return

    // 音声分析の初期化
    if (showVisualizer && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
        sourceRef.current = audioContextRef.current.createMediaElementSource(audio)
        sourceRef.current.connect(analyserRef.current)
        analyserRef.current.connect(audioContextRef.current.destination)
      } catch (error) {
        console.warn('Audio visualization not supported:', error)
        setShowVisualizer(false)
      }
    }

    const handleLoadedMetadata = () => {
      setAudioDuration(audio.duration || duration || 0)
      setIsLoading(false)
      setError(null)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      if (isRepeat) {
        audio.currentTime = 0
        audio.play()
        setIsPlaying(true)
      }
    }

    const handleError = (e: Event) => {
      console.error('Audio error:', e)
      setError('音声ファイルの読み込みに失敗しました')
      setIsLoading(false)
      setIsPlaying(false)
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
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('canplay', handleCanPlay)
    }
  }, [isOpen, src, duration, isRepeat, showVisualizer])

  // ビジュアライザーのアニメーション
  useEffect(() => {
    if (!showVisualizer || !analyserRef.current || !visualizerRef.current) return

    const canvas = visualizerRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!isPlaying) return

      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2.5
      let barHeight
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8

        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
        gradient.addColorStop(0, '#8b5cf6')
        gradient.addColorStop(1, '#3b82f6')

        ctx.fillStyle = gradient
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight)

        x += barWidth + 1
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, showVisualizer])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        await audio.play()
        setIsPlaying(true)
      }
      onPlayStateChange?.(!isPlaying)
    } catch (error) {
      console.error('Playback error:', error)
      setError('再生に失敗しました')
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !progressRef.current) return

    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * audio.duration
    audio.currentTime = newTime
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    if (isMuted && newVolume > 0) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
    }
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // ここに録音機能を実装
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = src
    link.download = `${title}.mp3`
    link.click()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `${title} by ${artist}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('URLをクリップボードにコピーしました')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'w-full h-full max-w-none' : 'w-full max-w-2xl'
      }`}>

        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={title}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Music2 className="h-6 w-6 text-white" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white truncate">{title}</h2>
              <p className="text-gray-400 text-sm">{artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title={isFullscreen ? 'フルスクリーン解除' : 'フルスクリーン'}
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="閉じる"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="p-6">
          {/* エラー表示 */}
          {error && (
            <div className="text-red-200 text-sm mb-4 p-3 bg-red-800/40 rounded-lg border border-red-600/30">
              {error}
            </div>
          )}

          {/* アルバムアートとビジュアライザー */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              {coverImage ? (
                <div className="relative">
                  <Image
                    src={coverImage}
                    alt={title}
                    width={300}
                    height={300}
                    className={`rounded-2xl shadow-2xl transition-transform duration-300 ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                  />
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/20 rounded-2xl flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Disc3 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-80 h-80 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Music2 className="h-20 w-20 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* ビジュアライザー */}
          {showVisualizer && (
            <div className="mb-6">
              <canvas
                ref={visualizerRef}
                width={400}
                height={60}
                className="w-full h-15 rounded-lg bg-gray-800/50"
              />
            </div>
          )}

          {/* プログレスバー */}
          <div
            ref={progressRef}
            className="relative h-2 bg-gray-700/50 rounded-full mb-4 cursor-pointer group"
            onClick={handleSeek}
          >
            <div
              className="absolute h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            />
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-100 opacity-0 group-hover:opacity-100 border-2 border-purple-500"
              style={{ left: `calc(${progressPercentage}% - 8px)` }}
            />
          </div>

          {/* 時間表示 */}
          <div className="flex justify-between text-sm text-gray-400 mb-6">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(audioDuration)}</span>
          </div>

          {/* メインコントロール */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-3 rounded-full transition-colors ${
                isShuffle ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="シャッフル"
            >
              <Shuffle className="h-5 w-5" />
            </button>

            <button
              onClick={skipBackward}
              className="p-3 text-gray-400 hover:text-white transition-colors"
              title="10秒戻る"
            >
              <SkipBack className="h-6 w-6" />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading}
              className="p-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
              title={isPlaying ? '一時停止' : '再生'}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
              ) : isPlaying ? (
                <Pause className="h-8 w-8" />
              ) : (
                <Play className="h-8 w-8 ml-1" />
              )}
            </button>

            <button
              onClick={skipForward}
              className="p-3 text-gray-400 hover:text-white transition-colors"
              title="10秒進む"
            >
              <SkipForward className="h-6 w-6" />
            </button>

            <button
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-3 rounded-full transition-colors ${
                isRepeat ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="リピート"
            >
              <Repeat className="h-5 w-5" />
            </button>
          </div>

          {/* 音量とその他のコントロール */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="p-2 text-gray-400 hover:text-white transition-colors"
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
                className="w-24 bg-gray-700/50 rounded-lg appearance-none cursor-pointer h-2"
                title="音量"
                style={{
                  background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(isMuted ? 0 : volume) * 100}%, #4b5563 ${(isMuted ? 0 : volume) * 100}%, #4b5563 100%)`
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-2 rounded-full transition-colors ${
                  isLiked ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title={isLiked ? 'いいね済み' : 'いいね'}
              >
                <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={toggleRecording}
                className={`p-2 rounded-full transition-colors ${
                  isRecording ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
                title={isRecording ? '録音停止' : '録音開始'}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              <button
                onClick={handleDownload}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="ダウンロード"
              >
                <Download className="h-5 w-5" />
              </button>

              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="シェア"
              >
                <Share2 className="h-5 w-5" />
              </button>

              <button className="p-2 text-gray-400 hover:text-white transition-colors" title="その他">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* オーディオ要素 */}
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onLoadStart={() => setIsLoading(true)}
        />
      </div>
    </div>
  )
}
