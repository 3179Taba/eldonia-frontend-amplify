'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Eye, Edit, Save, RotateCcw, Type, Palette, Code, Globe, XCircle } from 'lucide-react'
import Link from 'next/link'

interface ContentItem {
  id: string
  type: 'hero' | 'section' | 'feature' | 'footer'
  title: string
  content: string
  isTranslated: boolean
  css: string
  javascript: string
  order: number
}

interface Page {
  id: string
  name: string
  path: string
  content: ContentItem[]
}

const googleFonts = [
  { name: 'Inter', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Roboto', category: 'sans-serif', weights: [300, 400, 500, 700] },
  { name: 'Open Sans', category: 'sans-serif', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'Lato', category: 'sans-serif', weights: [300, 400, 700, 900] },
  { name: 'Poppins', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Montserrat', category: 'sans-serif', weights: [300, 400, 500, 600, 700] },
  { name: 'Playfair Display', category: 'serif', weights: [400, 500, 600, 700, 800, 900] },
  { name: 'Merriweather', category: 'serif', weights: [300, 400, 700, 900] },
  { name: 'Source Code Pro', category: 'monospace', weights: [300, 400, 500, 600, 700] },
  { name: 'Fira Code', category: 'monospace', weights: [300, 400, 500, 600, 700] }
]

export default function AdminDashboard() {
  const [selectedPage, setSelectedPage] = useState(0)
  const [selectedContent, setSelectedContent] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [showFontPreview, setShowFontPreview] = useState(false)
  const [selectedFont, setSelectedFont] = useState('Inter')
  const [fontWeight, setFontWeight] = useState(400)

  const pages: Page[] = [
    {
      id: 'home',
      name: 'トップページ',
      path: '/',
      content: [
        {
          id: 'hero',
          type: 'hero',
          title: 'ヒーローセクション',
          content: '🎬 FantasyVerse Gallery\nクリエイターたちの素晴らしい作品を発見しよう',
          isTranslated: true,
          css: 'text-4xl md:text-5xl font-bold text-white mb-4',
          javascript: '',
          order: 1
        },
        {
          id: 'features',
          type: 'section',
          title: '特徴セクション',
          content: '多様なメディア\n画像、動画、音楽など、あらゆる形式のクリエイティブコンテンツをサポート',
          isTranslated: true,
          css: 'text-xl font-semibold text-white mb-2',
          javascript: '',
          order: 2
        },
        {
          id: 'stats',
          type: 'section',
          title: '統計セクション',
          content: '📊 Eldonia-Nex 統計\n1,000+ 登録クリエイター\n5,000+ 投稿作品',
          isTranslated: true,
          css: 'text-2xl font-bold text-white mb-6 text-center',
          javascript: '',
          order: 3
        }
      ]
    },
    {
      id: 'gallery',
      name: 'ギャラリーページ',
      path: '/gallery',
      content: [
        {
          id: 'gallery-header',
          type: 'hero',
          title: 'ギャラリーヘッダー',
          content: '🎬 FantasyVerse Gallery\nクリエイターたちの素晴らしい作品を発見しよう',
          isTranslated: true,
          css: 'text-4xl md:text-5xl font-bold text-white mb-4',
          javascript: '',
          order: 1
        }
      ]
    },
    {
      id: 'about',
      name: 'Aboutページ',
      path: '/about',
      content: [
        {
          id: 'about-header',
          type: 'hero',
          title: 'Aboutヘッダー',
          content: '🏰 About Eldonia-Nex\nクリエイターのための次世代プラットフォーム',
          isTranslated: true,
          css: 'text-4xl md:text-5xl font-bold text-white mb-4',
          javascript: '',
          order: 1
        }
      ]
    }
  ]

  const currentPage = pages[selectedPage]
  const currentContent = currentPage?.content[selectedContent]

  const handleContentMove = (direction: 'up' | 'down') => {
    // コンテンツの順序を変更するロジック
    console.log(`Moving content ${direction}`)
  }

  const handleSave = () => {
    // 保存ロジック
    console.log('Saving changes...')
    setIsEditing(false)
  }

  const handleReset = () => {
    // リセットロジック
    console.log('Resetting changes...')
  }

  const loadGoogleFont = (fontName: string, weight: number) => {
    const link = document.createElement('link')
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@${weight}&display=swap`
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }

  useEffect(() => {
    loadGoogleFont(selectedFont, fontWeight)
  }, [selectedFont, fontWeight])

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ヘッダー */}
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-magic-400">
              Eldonia-Nex Admin
            </Link>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedPage(Math.max(0, selectedPage - 1))}
                disabled={selectedPage === 0}
                className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-4 py-2 bg-magic-500 rounded font-medium">
                {currentPage?.name}
              </span>
              <button
                onClick={() => setSelectedPage(Math.min(pages.length - 1, selectedPage + 1))}
                disabled={selectedPage === pages.length - 1}
                className="p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center space-x-2 px-4 py-2 rounded ${
                isEditing ? 'bg-red-500 hover:bg-red-600' : 'bg-magic-500 hover:bg-magic-600'
              }`}
            >
              {isEditing ? <XCircle size={16} /> : <Edit size={16} />}
              <span>{isEditing ? '編集終了' : '編集開始'}</span>
            </button>
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded"
                >
                  <Save size={16} />
                  <span>保存</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
                >
                  <RotateCcw size={16} />
                  <span>リセット</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* 左側: プレビュー画面 */}
        <div className="flex-1 bg-gray-800 p-6 overflow-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-black min-h-full">
            <div className="space-y-8">
              {currentPage?.content.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedContent === index && isEditing
                      ? 'border-magic-500 bg-magic-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => isEditing && setSelectedContent(index)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{item.title}</h3>
                    {isEditing && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleContentMove('up')
                          }}
                          disabled={index === 0}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleContentMove('down')
                          }}
                          disabled={index === currentPage.content.length - 1}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="whitespace-pre-line text-gray-600">{item.content}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    CSS: {item.css} | 翻訳: {item.isTranslated ? '有効' : '無効'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右側: 編集パネル */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 overflow-auto">
          <div className="p-6 space-y-6">
            {/* コンテンツ選択 */}
            <div>
              <h3 className="text-lg font-semibold mb-3">コンテンツ選択</h3>
              <div className="space-y-2">
                {currentPage?.content.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedContent(index)}
                    className={`w-full text-left p-3 rounded ${
                      selectedContent === index
                        ? 'bg-magic-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm opacity-75 truncate">{item.content}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 選択されたコンテンツの編集 */}
            {currentContent && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">テキスト編集</h3>
                  <textarea
                    value={currentContent.content}
                    onChange={(e) => {
                      // テキスト更新ロジック
                      console.log('Content updated:', e.target.value)
                    }}
                    className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded resize-none"
                    placeholder="コンテンツを入力..."
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">翻訳設定</h3>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={currentContent.isTranslated}
                        onChange={(e) => {
                          // 翻訳設定更新ロジック
                          console.log('Translation setting:', e.target.checked)
                        }}
                        className="w-4 h-4 text-magic-500 bg-gray-700 border-gray-600 rounded focus:ring-magic-500"
                      />
                      <span>翻訳を有効にする</span>
                    </label>
                    <Globe size={16} className="text-gray-400" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">CSS編集</h3>
                  <textarea
                    value={currentContent.css}
                    onChange={(e) => {
                      // CSS更新ロジック
                      console.log('CSS updated:', e.target.value)
                    }}
                    className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded resize-none font-mono text-sm"
                    placeholder="CSSクラスを入力..."
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">JavaScript編集</h3>
                  <textarea
                    value={currentContent.javascript}
                    onChange={(e) => {
                      // JavaScript更新ロジック
                      console.log('JavaScript updated:', e.target.value)
                    }}
                    className="w-full h-24 p-3 bg-gray-700 border border-gray-600 rounded resize-none font-mono text-sm"
                    placeholder="JavaScriptコードを入力..."
                  />
                </div>

                {/* Google Fonts プレビュー */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">フォント設定</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">フォント選択</label>
                      <select
                        value={selectedFont}
                        onChange={(e) => setSelectedFont(e.target.value)}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                      >
                        {googleFonts.map((font) => (
                          <option key={font.name} value={font.name}>
                            {font.name} ({font.category})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">フォントウェイト</label>
                      <select
                        value={fontWeight}
                        onChange={(e) => setFontWeight(Number(e.target.value))}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded"
                      >
                        {googleFonts.find(f => f.name === selectedFont)?.weights.map((weight) => (
                          <option key={weight} value={weight}>
                            {weight}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <button
                        onClick={() => setShowFontPreview(!showFontPreview)}
                        className="flex items-center space-x-2 px-3 py-2 bg-magic-500 hover:bg-magic-600 rounded text-sm"
                      >
                        <Type size={16} />
                        <span>フォントプレビュー</span>
                      </button>
                    </div>
                    {showFontPreview && (
                      <div className="p-4 bg-gray-700 rounded border border-gray-600">
                        <div
                          style={{
                            fontFamily: `"${selectedFont}", sans-serif`,
                            fontWeight: fontWeight
                          }}
                          className="text-lg"
                        >
                          The quick brown fox jumps over the lazy dog
                        </div>
                        <div
                          style={{
                            fontFamily: `"${selectedFont}", sans-serif`,
                            fontWeight: fontWeight
                          }}
                          className="text-sm mt-2 text-gray-300"
                        >
                          あいうえお アイウエオ 1234567890
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* プレビュー設定 */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">プレビュー設定</h3>
                  <div className="space-y-2">
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">
                      <Eye size={16} />
                      <span>プレビュー更新</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded">
                      <Palette size={16} />
                      <span>カラーテーマ</span>
                    </button>
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded">
                      <Code size={16} />
                      <span>コードエクスポート</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
