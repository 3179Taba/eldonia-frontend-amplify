'use client'

import React, { useState, useEffect } from 'react'
import { Check, X, Globe, Download, Upload, RefreshCw } from 'lucide-react'
import { useI18n } from '../../../lib/i18n-provider'
import { translations, TranslationKey } from '../../../i18n/translations'

interface TranslationItem {
  key: string
  en: string
  status: 'pending' | 'translated' | 'error'
}

export default function AutoTranslatePage() {
  const { t } = useI18n()
  const [translationItems, setTranslationItems] = useState<TranslationItem[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isTranslating, setIsTranslating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  // Initialize translation items
  useEffect(() => {
    const items: TranslationItem[] = Object.keys(translations.en).map(key => ({
      key,
      en: translations.en[key as TranslationKey] || '',
      status: 'pending'
    }))
    setTranslationItems(items)
  }, [])

  // Select all
  const selectAll = () => {
    const allKeys = new Set(translationItems.map(item => item.key))
    setSelectedItems(allKeys)
  }

  // Deselect all
  const deselectAll = () => {
    setSelectedItems(new Set())
  }

  // Toggle individual item
  const toggleItem = (itemKey: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemKey)) {
      newSelected.delete(itemKey)
    } else {
      newSelected.add(itemKey)
    }
    setSelectedItems(newSelected)
  }

  // Simulate translation process
  const startTranslation = async () => {
    if (selectedItems.size === 0) {
      alert('Please select items to translate')
      return
    }

    setIsTranslating(true)
    setProgress(0)

    const selectedItemsArray = Array.from(selectedItems)
    const totalItems = selectedItemsArray.length

    for (let i = 0; i < totalItems; i++) {
      const itemKey = selectedItemsArray[i]
      
      // Simulate translation delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Update progress
      setProgress(((i + 1) / totalItems) * 100)
      
      // Update item status
      setTranslationItems(prev => prev.map(item => 
        item.key === itemKey 
          ? { ...item, status: 'translated' }
          : item
      ))
    }

    setIsTranslating(false)
    alert('Translation completed!')
  }

  // Export translations
  const exportTranslations = () => {
    const data = {
      translations: translations.en,
      exportDate: new Date().toISOString(),
      language: 'en'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fantasyverse-translations-en.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  // Import translations
  const importTranslations = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          if (data.translations) {
            alert('Translations imported successfully!')
            // Here you would typically update the translations file
          }
        } catch (error) {
          alert('Failed to import translations')
        }
      }
      reader.readAsText(file)
    }
  }

  const pendingCount = translationItems.filter(item => item.status === 'pending').length
  const translatedCount = translationItems.filter(item => item.status === 'translated').length
  const errorCount = translationItems.filter(item => item.status === 'error').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-cosmic-900 via-cosmic-800 to-cosmic-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="section-title mb-4">
            🌟 Translation Management
          </h1>
          <p className="section-subtitle">
            Manage and maintain English translations for FantasyVerse
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="cosmic-card p-4 text-center">
            <div className="text-2xl font-bold golden-text">{translationItems.length}</div>
            <div className="text-sm text-white/70">Total Items</div>
          </div>
          <div className="cosmic-card p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{pendingCount}</div>
            <div className="text-sm text-white/70">Pending</div>
          </div>
          <div className="cosmic-card p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{translatedCount}</div>
            <div className="text-sm text-white/70">Translated</div>
          </div>
          <div className="cosmic-card p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{errorCount}</div>
            <div className="text-sm text-white/70">Errors</div>
          </div>
        </div>

        {/* Actions */}
        <div className="cosmic-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={selectAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={deselectAll}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Deselect All
              </button>
              <button
                onClick={startTranslation}
                disabled={isTranslating || selectedItems.size === 0}
                className="px-4 py-2 bg-golden-400 text-cosmic-900 rounded-lg hover:bg-golden-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isTranslating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    Process Selected ({selectedItems.size})
                  </>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={exportTranslations}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importTranslations}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Progress Bar */}
          {isTranslating && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-white/70 mb-2">
                <span>Translation Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-golden-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Translation List */}
        <div className="cosmic-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-playfair font-bold golden-text">Translation Items</h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1 bg-white/10 text-white rounded text-sm hover:bg-white/20"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          <div className="space-y-4">
            {translationItems.map((item) => (
              <div key={item.key} className="border border-white/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.key)}
                      onChange={() => toggleItem(item.key)}
                      className="w-4 h-4 text-golden-400 bg-white/10 border-white/20 rounded focus:ring-golden-400"
                    />
                    <div>
                      <h3 className="font-medium text-golden-400">{item.key}</h3>
                      {showPreview && (
                        <p className="text-sm text-white/70 mt-1">{item.en}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.status === 'pending' && (
                      <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">Pending</span>
                    )}
                    {item.status === 'translated' && (
                      <span className="px-2 py-1 bg-green-600 text-white rounded text-xs flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Done
                      </span>
                    )}
                    {item.status === 'error' && (
                      <span className="px-2 py-1 bg-red-600 text-white rounded text-xs flex items-center gap-1">
                        <X className="w-3 h-3" />
                        Error
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Language Info */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg">
            <Globe className="w-4 h-4" />
            <span className="text-sm text-white/70">Current Language:</span>
            <span className="text-sm font-medium text-golden-400">English</span>
          </div>
        </div>
      </div>
    </div>
  )
} 