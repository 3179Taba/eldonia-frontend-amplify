'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Clock, Star, Flame } from 'lucide-react'
import { useAuth } from '../lib/auth-context'
import { useI18n } from '../lib/i18n-provider'

interface Suggestion {
  type: 'interest' | 'history' | 'popular'
  text: string
  icon: string
  description: string
}

export default function SearchBar() {
  const { user, isAuthenticated } = useAuth()
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // サジェストを取得
  const fetchSuggestions = async (searchQuery: string) => {
    if (!isAuthenticated || !searchQuery.trim()) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/suggestions/search_suggestions/?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('サジェスト取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 検索をログに記録
  const logSearch = async (searchQuery: string) => {
    if (!isAuthenticated) return

    try {
      await fetch('/api/suggestions/log_search/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          query: searchQuery,
          search_type: 'general',
          result_count: 0,
        }),
      })
    } catch (error) {
      console.error('検索ログ記録エラー:', error)
    }
  }

  // 相互作用をログに記録
  const logInteraction = async (contentType: string, contentId: number, interactionType: string) => {
    if (!isAuthenticated) return

    try {
      await fetch('/api/suggestions/log_interaction/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          interaction_type: interactionType,
        }),
      })
    } catch (error) {
      console.error('相互作用ログ記録エラー:', error)
    }
  }

  // デバウンス処理
  const fetchSuggestionsCb = useCallback(fetchSuggestions, [isAuthenticated])
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        fetchSuggestionsCb(query)
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, fetchSuggestionsCb])

  // 外側クリックでサジェストを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    setShowSuggestions(false)
    logSearch(searchQuery)
    // 実際の検索処理をここに追加
    console.log('検索実行:', searchQuery)
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    handleSearch(suggestion.text)
    logInteraction('search', 0, 'click')
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'interest':
        return <Star className="h-4 w-4 text-yellow-500" />
      case 'history':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'popular':
        return <Flame className="h-4 w-4 text-red-500" />
      default:
        return <Search className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="hidden md:flex items-center relative" ref={searchRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder={t('searchPlaceholder') || "Search..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          className="w-48 h-10 px-4 pr-10 rounded-lg bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500/50 transition-all duration-300"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/50 pointer-events-none" />

        {/* サジェストドロップダウン */}
        {showSuggestions && (query.trim() || suggestions.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-white/70">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-magic-500 mx-auto"></div>
                <p className="mt-2 text-sm">サジェストを読み込み中...</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="py-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center space-x-3 group"
                  >
                    <div className="flex items-center space-x-2">
                      {getSuggestionIcon(suggestion.type)}
                      <span className="text-lg">{suggestion.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium group-hover:text-magic-300 transition-colors">
                        {suggestion.text}
                      </div>
                      <div className="text-white/60 text-xs">
                        {suggestion.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="p-4 text-center text-white/70">
                <p className="text-sm">サジェストが見つかりません</p>
              </div>
            ) : null}

            {/* 検索履歴がない場合のデフォルトサジェスト */}
            {!isAuthenticated && (
              <div className="p-4 text-center text-white/70">
                <p className="text-sm">ログインするとパーソナライズされたサジェストが表示されます</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* クリアボタン */}
      {query && (
        <button
          onClick={() => {
            setQuery('')
            setSuggestions([])
            setShowSuggestions(false)
          }}
          className="ml-2 p-1 text-white/50 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
