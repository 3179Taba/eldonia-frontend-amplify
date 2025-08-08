'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Volume2, VolumeX, Heart, MessageCircle, Bell, Share, Play, Pause } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface TextModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string
  author: string
  category?: string
  onLike?: () => void
  onSubscribe?: () => void
  onShare?: () => void
  isLiked?: boolean
  isSubscribed?: boolean
}

export default function TextModal({
  isOpen,
  onClose,
  title,
  content,
  author,
  category,
  onLike,
  onSubscribe,
  onShare,
  isLiked = false,
  isSubscribed = false
}: TextModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1.0)
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)
  const [volumeTimeout, setVolumeTimeout] = useState<NodeJS.Timeout | null>(null)
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([])
  const [currentCharIndex, setCurrentCharIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen) return

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
  }, [isOpen, selectedVoice])

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

  const handlePlayPause = () => {
    console.log('handlePlayPauseが呼び出されました', { isPlaying, speechSynthesis: !!window.speechSynthesis })
    
    if (!window.speechSynthesis) {
      alert('お使いのブラウザは音声読み上げに対応していません。')
      return
    }

    if (isPlaying) {
      if (window.speechSynthesis.paused) {
        console.log('読み上げを再開します')
        window.speechSynthesis.resume()
      } else {
        console.log('読み上げを一時停止します')
        window.speechSynthesis.pause()
      }
    } else {
      console.log('新しい読み上げを開始します')
      startReading()
    }
  }

  const handleStop = () => {
    console.log('読み上げを停止します')
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setCurrentUtterance(null)
  }

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
    
    const waitForVoices = () => {
      return new Promise<void>((resolve) => {
        const voices = window.speechSynthesis.getVoices()
        console.log('現在の音声数:', voices.length)
        
        if (voices.length > 0) {
          console.log('音声が利用可能です')
          resolve()
        } else {
          console.log('音声の読み込みを待機中...')
          window.speechSynthesis.getVoices()
          
          window.speechSynthesis.onvoiceschanged = () => {
            console.log('音声の読み込みが完了しました')
            resolve()
          }
          
          setTimeout(() => {
            console.log('音声読み込みタイムアウト、続行します')
            resolve()
          }, 5000)
        }
      })
    }

    waitForVoices().then(() => {
      console.log('音声合成の状態をリセットします')
      window.speechSynthesis.cancel()
      
      setTimeout(() => {
        console.log('読み上げを開始します')
        
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          console.log('既存の読み上げを停止します')
          window.speechSynthesis.cancel()
        }
      
        const textToRead = content || '読み上げるテキストがありません。'
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
    
    if (volumeTimeout) {
      clearTimeout(volumeTimeout)
    }
    
    const timeout = setTimeout(() => {
      if (isPlaying && currentUtterance) {
        console.log('音量変更を適用します:', newVolume)
        window.speechSynthesis.cancel()
        const textToRead = content
        
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

  const handleClose = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setCurrentUtterance(null)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10">
              <Image
                src="/images/icons/logo.png"
                alt="Eldonia-Nex"
                width={40}
                height={40}
                className="rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                <Link href="/gallery" className="flex items-center gap-1 group">
                  <Image src="/images/icons/logo.png" alt="Eldonia-Nex" width={20} height={20} style={{minWidth:20, minHeight:20}} className="rounded bg-white" />
                  <span className="font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400 text-xs group-hover:underline">Eldonia-Nex</span>
                </Link>
                <span>作者: {author} • カテゴリー: {category}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="モーダルを閉じる"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* オーディオコントローラー */}
        <div className="px-6 py-4 bg-gray-700/50 border-b border-gray-600">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isPlaying 
                  ? 'bg-orange-600 text-white hover:bg-orange-700' 
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              type="button"
              aria-label={isPlaying ? '読み上げを停止' : '読み上げを開始'}
            >
              {isPlaying ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              <span className="text-sm font-medium">
                {isPlaying ? '停止' : '読み上げ開始'}
              </span>
            </button>
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>{isPlaying ? '読み上げ中...' : '読み上げ準備完了'}</span>
              </div>
              {/* 音声情報表示 */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">音声選択:</span>
                <select
                  className="text-xs bg-gray-800 text-gray-200 border border-gray-600 rounded px-2 py-1"
                  value={selectedVoice?.name || ''}
                  onChange={e => {
                    const v = voiceList.find(v => v.name === e.target.value)
                    setSelectedVoice(v || null)
                  }}
                  aria-label="音声を選択"
                >
                  {voiceList.map(v => (
                    <option key={v.name} value={v.name}>{v.name}（{v.lang}）</option>
                  ))}
                </select>
              </div>
              {/* 音量調節スライダー */}
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${volume * 100}%, #4b5563 ${volume * 100}%, #4b5563 100%)`
                  }}
                  aria-label="音量調節"
                />
                <span className="text-xs text-gray-400 w-8 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* モーダルコンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed font-serif text-base">
              <h1 className="text-2xl font-bold text-yellow-400 mb-6">{title}</h1>
              {/* 既読部分グレーアウト・未読部分白色（styleで強制）＋デバッグ用currentCharIndex表示 */}
              <div className="text-gray-300">
                <div className="text-xs text-yellow-400 mb-2">currentCharIndex: {currentCharIndex}</div>
                {(() => {
                  if (currentCharIndex === null) {
                    return content.split('\n').map((line, index) => {
                      if (line.startsWith('##')) {
                        const chapterTitle = line.replace('##', '').trim()
                        return (
                          <h2 key={index} className="text-xl font-semibold text-blue-400 mt-8 mb-4">
                            第{chapterTitle}章
                          </h2>
                        )
                      } else {
                        return <p key={index} className="mb-2">{line}</p>
                      }
                    })
                  } else {
                    const before = content.slice(0, currentCharIndex)
                    const after = content.slice(currentCharIndex)
                    return (
                      <span className="whitespace-pre-wrap">
                        <span style={{ color: '#888' }}>{before}</span>
                        <span style={{ color: '#fff' }}>{after}</span>
                      </span>
                    )
                  }
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* モーダルフッター */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900">
          <div className="flex items-center gap-4">
            <button 
              onClick={onLike}
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
              onClick={onSubscribe}
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
            <button 
              onClick={onShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              aria-label="投稿をシェア"
            >
              <Share className="h-4 w-4" />
              <span className="hidden sm:inline">シェア</span>
            </button>
          </div>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
} 