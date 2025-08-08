'use client'

import React, { useState, useEffect } from 'react'
import {
  Save, Edit, Eye, Plus, Search, Filter,
  Globe, FileText, Palette, Settings,
  BarChart3, Activity, Zap,
  CheckCircle, AlertCircle, Clock, Star,
  Bot, Languages, Sparkles
} from 'lucide-react'
import { useI18n } from '../../lib/i18n-provider'
import { translations, TranslationKey } from '../../i18n/translations'

interface TranslationData {
  [key: string]: {
    en: string
    ja?: string
    zh?: string
    ko?: string
  }
}

interface TextContent {
  id: string
  text: string
  category: string
  location: string
}

interface CSSStyle {
  id: string
  selector: string
  property: string
  value: string
}

interface StatCard {
  title: string
  value: string
  icon: React.ReactNode
  color: string
  change?: string
}

export default function TranslationAdminPage() {
  const [translationData, setTranslationData] = useState<TranslationData>({})
  const [translationData, setTranslationData] = useState<TranslationData>({})
  const [activeTab, setActiveTab] = useState<'translations' | 'texts' | 'css'>('translations')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editingText, setEditingText] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)

  // Initialize translation data
  useEffect(() => {
    const data: TranslationData = {}
    const enKeys = Object.keys(translations.en) as TranslationKey[]

    enKeys.forEach(key => {
      data[key] = {
        en: translations.en[key] || '',
        ja: translations.ja?.[key] || '',
        zh: translations.zh?.[key] || '',
        ko: translations.ko?.[key] || ''
      }
    })

    setTranslationData(data)
  }, [setTranslationData])

  const handleSaveTranslation = async (key: string) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          translations: {
            en: editingText
          }
        })
      })

      if (response.ok) {
        setTranslationData(prev => ({
          ...prev,
          [key]: { ...prev[key], en: editingText }
        }))
        setEditingKey(null)
        setEditingText('')
      } else {
        alert('Failed to save translation')
      }
    } catch {
      console.error('Save error:')
      alert('Error saving translation')
    } finally {
      setIsSaving(false)
    }
  }

  const handleGeminiTranslation = async (key: string, fromLang: string, toLang: string) => {
    setIsTranslating(true)
    try {
      const response = await fetch('/api/ai-services/services/translation/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: (translationData[key] as any)[fromLang] || '',
          from_lang: fromLang,
          to_lang: toLang,
          context: `This is a translation for the key "${key}" in a web application. Please provide a natural and accurate translation.`
        })
      })

      if (response.ok) {
        const result = await response.json()
        setTranslationData(prev => ({
          ...prev,
          [key]: { ...prev[key], [toLang]: result.translated_text }
        }))
      } else {
        alert('Translation failed')
      }
    } catch {
      console.error('Translation error:')
      alert('Error during translation')
    } finally {
      setIsTranslating(false)
    }
  }

  const handleBulkTranslation = async () => {
    setIsTranslating(true)
    try {
      const keysToTranslate = Object.keys(translationData).filter(key => {
        const data = translationData[key]
        return data.en && (!data.ja || !data.zh || !data.ko)
      })

      for (const key of keysToTranslate) {
        const data = translationData[key]
        if (data.en) {
          // 日本語翻訳
          if (!data.ja) {
            await handleGeminiTranslation(key, 'en', 'ja')
          }
          // 中国語翻訳
          if (!data.zh) {
            await handleGeminiTranslation(key, 'en', 'zh')
          }
          // 韓国語翻訳
          if (!data.ko) {
            await handleGeminiTranslation(key, 'en', 'ko')
          }
        }
      }
    } catch {
      console.error('Bulk translation error:')
      alert('Error during bulk translation')
    } finally {
      setIsTranslating(false)
    }
  }

  const filteredTranslations = Object.entries(translationData).filter(([key, value]) => {
    const matchesSearch = key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         value.en.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || key.startsWith(filterCategory)
    return matchesSearch && matchesCategory
  })

  const categories = [
    'siteName', 'gallery', 'shop', 'events', 'community', 'works',
    'heroTitle', 'heroSubtitle', 'postWork', 'exploreGallery',
    'communityGrowth', 'creators', 'worksCount', 'fans', 'eventCount'
  ]

  // 統計カードデータ
  const statCards: StatCard[] = [
    {
      title: '総翻訳数',
      value: Object.keys(translationData).length.toString(),
      icon: <Globe className="w-5 h-5" />,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: '未翻訳',
      value: Object.entries(translationData).filter(([_, data]) => !data.ja || !data.zh || !data.ko).length.toString(),
      icon: <AlertCircle className="w-5 h-5" />,
      color: 'bg-yellow-500',
      change: '-5%'
    },
    {
      title: 'Gemini翻訳',
      value: '156',
      icon: <Bot className="w-5 h-5" />,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: '翻訳品質',
      value: '98%',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-purple-500',
      change: '+2%'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎛️ 管理ダッシュボード</h1>
              <p className="text-gray-600 mt-1">Eldonia のコンテンツと翻訳を管理（Gemini翻訳対応）</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  previewMode
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                {previewMode ? 'プレビュー中' : 'プレビュー'}
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                設定
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <span>↗</span>
                      {stat.change}
                    </p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg text-white`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* メインコンテンツエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">管理メニュー</h3>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('translations')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'translations'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  翻訳管理
                </button>
                <button
                  onClick={() => setActiveTab('texts')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'texts'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  テキストコンテンツ
                </button>
                <button
                  onClick={() => setActiveTab('css')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === 'css'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Palette className="w-5 h-5" />
                  CSS スタイル
                </button>
              </nav>

              {/* クイックアクション */}
              <div className="mt-8 pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-900 mb-3">クイックアクション</h4>
                <div className="space-y-2">
                  <button
                    onClick={handleBulkTranslation}
                    disabled={isTranslating}
                    className="w-full px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    <Bot className="w-4 h-4" />
                    {isTranslating ? '翻訳中...' : 'Gemini一括翻訳'}
                  </button>
                  <button className="w-full px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    統計レポート
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {/* 検索とフィルター */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="翻訳を検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="text-gray-400 w-4 h-4" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">すべてのカテゴリー</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => {
                    setAddModalType('translation')
                    setShowAddModal(true)
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  新規追加
                </button>
              </div>
            </div>

            {/* コンテンツエリア */}
            <div className="bg-white rounded-xl shadow-sm border">
              {activeTab === 'translations' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">翻訳管理（Gemini対応）</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{filteredTranslations.length} 件の翻訳</span>
                      <span>•</span>
                      <span>最終更新: 2分前</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredTranslations.map(([key, value]) => (
                      <div key={key} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-gray-900">{key}</h3>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {key.split('.')[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {editingKey === key ? (
                              <>
                                <button
                                  onClick={() => handleSaveTranslation(key)}
                                  disabled={isSaving}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  {isSaving ? '保存中...' : '保存'}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingKey(null)
                                    setEditingText('')
                                  }}
                                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                  キャンセル
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingKey(key)
                                  setEditingText(value.en)
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                編集
                              </button>
                            )}
                          </div>
                        </div>

                        {editingKey === key ? (
                          <div className="space-y-3">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={3}
                              placeholder="翻訳テキストを入力..."
                            />
                            {previewMode && (
                              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Eye className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-blue-700">プレビュー</span>
                                </div>
                                <p className="text-gray-900">{editingText}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {/* 英語（原文） */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-gray-500">🇺🇸 English</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">{value.en.length} 文字</span>
                              </div>
                              <p className="text-gray-900">{value.en}</p>
                            </div>

                            {/* 翻訳言語 */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {/* 日本語 */}
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-blue-700">🇯🇵 日本語</span>
                                  {!value.ja && (
                                    <button
                                      onClick={() => handleGeminiTranslation(key, 'en', 'ja')}
                                      disabled={isTranslating}
                                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                      <Bot className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-gray-900">{value.ja || '未翻訳'}</p>
                              </div>

                              {/* 中国語 */}
                              <div className="p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-green-700">🇨🇳 中国語</span>
                                  {!value.zh && (
                                    <button
                                      onClick={() => handleGeminiTranslation(key, 'en', 'zh')}
                                      disabled={isTranslating}
                                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                      <Bot className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-gray-900">{value.zh || '未翻訳'}</p>
                              </div>

                              {/* 韓国語 */}
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-purple-700">🇰🇷 韓国語</span>
                                  {!value.ko && (
                                    <button
                                      onClick={() => handleGeminiTranslation(key, 'en', 'ko')}
                                      disabled={isTranslating}
                                      className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 disabled:opacity-50"
                                    >
                                      <Bot className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-sm text-gray-900">{value.ko || '未翻訳'}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'texts' && (
                <div className="p-6 text-center">
                  <div className="py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">テキストコンテンツ管理</h3>
                    <p className="text-gray-500">この機能は近日公開予定です</p>
                  </div>
                </div>
              )}

              {activeTab === 'css' && (
                <div className="p-6 text-center">
                  <div className="py-12">
                    <Palette className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">CSS スタイル管理</h3>
                    <p className="text-gray-500">この機能は近日公開予定です</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
