'use client'

import { useState, useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react'
import Image from 'next/image'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  imageTitle: string
}

export default function ImageModal({ isOpen, onClose, imageUrl, imageTitle }: ImageModalProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // モーダルが開くたびにリセット
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setRotation(0)
      setPosition({ x: 0, y: 0 })
    }
  }, [isOpen])

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case '+':
        case '=':
          e.preventDefault()
          setScale(prev => Math.min(prev + 0.2, 5))
          break
        case '-':
          e.preventDefault()
          setScale(prev => Math.max(prev - 0.2, 0.1))
          break
        case '0':
          e.preventDefault()
          setScale(1)
          setRotation(0)
          setPosition({ x: 0, y: 0 })
          break
        case 'r':
          e.preventDefault()
          setRotation(prev => prev + 90)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // マウスホイールでズーム
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setScale(prev => Math.max(0.1, Math.min(5, prev + delta)))
  }

  // ドラッグ開始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  // ドラッグ中
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  // ドラッグ終了
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // ダウンロード機能
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = imageTitle || 'image'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('ダウンロードエラー:', error)
      alert('ダウンロードに失敗しました')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      {/* 背景クリックで閉じる */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      
      {/* メインコンテンツ */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex flex-col">
        {/* 左上ロゴタイトル */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/20">
          <div className="relative w-8 h-8">
            <Image
              src="/images/icons/logo.png"
              alt="Eldonia-Nex"
              width={32}
              height={32}
              className="rounded-lg"
            />
          </div>
          <div>
            <h3 className="text-white text-sm font-medium">{imageTitle}</h3>
            <p className="text-white/60 text-xs">画像ビューア</p>
          </div>
        </div>

        {/* ツールバー */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg p-2 border border-white/20">
          <button
            onClick={() => setScale(prev => Math.max(prev - 0.2, 0.1))}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            title="縮小 (Z)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-white text-sm px-2">
            {Math.round(scale * 100)}%
          </span>
          
          <button
            onClick={() => setScale(prev => Math.min(prev + 0.2, 5))}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            title="拡大 (Z)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-white/30 mx-1" />
          
          <button
            onClick={() => setRotation(prev => prev + 90)}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            title="回転 (R)"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-white/30 mx-1" />
          
          <button
            onClick={handleDownload}
            className="p-2 text-white hover:bg-white/20 rounded transition-colors"
            title="ダウンロード"
          >
            <Download className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-white/30 mx-1" />
          
          <button
            onClick={() => {
              setScale(1)
              setRotation(0)
              setPosition({ x: 0, y: 0 })
            }}
            className="px-3 py-1 text-white hover:bg-white/20 rounded text-sm transition-colors"
            title="リセット (0)"
          >
            リセット
          </button>
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
          title="閉じる (ESC)"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 画像コンテナ */}
        <div 
          className="flex-1 flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default' }}
        >
          <img
            src={imageUrl}
            alt={imageTitle}
            className="max-w-full max-h-full object-contain transition-transform duration-200"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center center'
            }}
            draggable={false}
          />
        </div>

        {/* ショートカットキー説明 */}
        <div className="absolute bottom-4 right-4 z-10 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
          <div className="text-white text-xs space-y-1">
            <div>Z: 拡大/縮小</div>
            <div>R: 回転</div>
            <div>0: リセット</div>
            <div>ESC: 閉じる</div>
          </div>
        </div>
      </div>
    </div>
  )
} 