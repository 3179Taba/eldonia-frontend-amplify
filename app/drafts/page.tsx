'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/auth-context'
import { FileText, Edit, Trash2, Eye, Send } from 'lucide-react'

interface Draft {
  id: number
  title: string
  description: string
  category: string
  tags: string | string[]
  visibility: string
  language: string
  file_type: string
  created_at: string
  updated_at: string
  author: {
    id: number
    username: string
    first_name: string
    last_name: string
  }
}

export default function DraftsPage() {
  const router = useRouter()
  const { isAuthenticated, token } = useAuth()
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    fetchDrafts()
  }, [isAuthenticated, token, router, fetchDrafts])

  const fetchDrafts = React.useCallback(async () => {
    try {
      console.log('下書き取得開始 - トークン:', token ? '存在' : 'なし')
      console.log('認証状態:', isAuthenticated)

      const response = await fetch('http://localhost:8000/api/posts/drafts/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('下書き取得レスポンス:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error('下書き取得エラーレスポンス:', errorData)
        throw new Error(`下書きの取得に失敗しました: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('下書き取得成功:', data)
      setDrafts(data)
    } catch (error) {
      console.error('下書き取得エラー:', error)
      setError('下書きの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [token, isAuthenticated])

  const handleEditDraft = (draftId: number) => {
    router.push(`/post/edit/${draftId}`)
  }

  const handleDeleteDraft = async (draftId: number) => {
    if (!confirm('この下書きを削除しますか？')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/api/posts/${draftId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('下書きの削除に失敗しました')
      }

      // 下書き一覧を更新
      setDrafts(drafts.filter(draft => draft.id !== draftId))
    } catch (error) {
      console.error('下書き削除エラー:', error)
      alert('下書きの削除に失敗しました')
    }
  }

  const handlePublishDraft = async (draft: Draft) => {
    if (!confirm('この下書きを投稿しますか？')) {
      return
    }

    try {
      // 翻訳処理
      let translatedTitle = draft.title
      let translatedContent = draft.description

      // タイトルとコンテンツを翻訳（日本語以外の場合）
      const userLanguage = navigator.language.split('-')[0] || 'ja'
      if (userLanguage !== 'ja') {
        try {
          // タイトル翻訳
          const titleResponse = await fetch('http://localhost:8000/api/ai/single-translation/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: draft.title,
              from_lang: 'ja',
              to_lang: userLanguage
            })
          })

          if (titleResponse.ok) {
            const titleData = await titleResponse.json()
            if (titleData.success) {
              translatedTitle = titleData.translated_text

              // 翻訳結果を辞書に登録
              try {
                await fetch('http://localhost:8000/api/translate/register/', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    ja: draft.title,
                    en: userLanguage === 'en' ? translatedTitle : '',
                    zh: userLanguage === 'zh' ? translatedTitle : '',
                    ko: userLanguage === 'ko' ? translatedTitle : '',
                    type: 'content'
                  })
                })
              } catch (registerError) {
                console.warn('辞書登録に失敗しました:', registerError)
              }
            }
          }

          // コンテンツ翻訳
          const contentResponse = await fetch('http://localhost:8000/api/ai/single-translation/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: draft.description,
              from_lang: 'ja',
              to_lang: userLanguage
            })
          })

          if (contentResponse.ok) {
            const contentData = await contentResponse.json()
            if (contentData.success) {
              translatedContent = contentData.translated_text

              // 翻訳結果を辞書に登録
              try {
                await fetch('http://localhost:8000/api/translate/register/', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    ja: draft.description,
                    en: userLanguage === 'en' ? translatedContent : '',
                    zh: userLanguage === 'zh' ? translatedContent : '',
                    ko: userLanguage === 'ko' ? translatedContent : '',
                    type: 'content'
                  })
                })
              } catch (registerError) {
                console.warn('辞書登録に失敗しました:', registerError)
              }
            }
          }
        } catch (translationError) {
          console.warn('翻訳に失敗しました。元のテキストを使用します:', translationError)
        }
      }

      // 下書きを投稿に変換
      const formData = new FormData()
      formData.append('title', translatedTitle)
      formData.append('content', translatedContent)
      formData.append('category', draft.category)
      formData.append('tags', Array.isArray(draft.tags) ? draft.tags.join(', ') : draft.tags || '')
      formData.append('status', 'published') // 投稿状態に変更
      formData.append('language', userLanguage !== 'ja' ? userLanguage : draft.language)
      formData.append('file_type', draft.file_type)

      const response = await fetch(`http://localhost:8000/api/posts/${draft.id}/update/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '投稿に失敗しました')
      }

      // 投稿成功後、下書きを削除
      const deleteResponse = await fetch(`http://localhost:8000/api/posts/${draft.id}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (deleteResponse.ok) {
        // 下書き一覧から削除
        setDrafts(drafts.filter(d => d.id !== draft.id))

        // 成功ポップアップを表示
        const popup = document.createElement('div')
        popup.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out'
        popup.innerHTML = `
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <div>
              <h3 class="font-semibold">投稿完了！</h3>
              <p class="text-sm opacity-90">下書きが正常に投稿されました</p>
            </div>
          </div>
        `
        document.body.appendChild(popup)

        // 3秒後にポップアップを削除
        setTimeout(() => {
          popup.style.transform = 'translateX(100%)'
          setTimeout(() => {
            if (popup.parentNode) {
              popup.parentNode.removeChild(popup)
            }
          }, 300)
        }, 3000)

      } else {
        console.error('下書き削除エラー:', deleteResponse.statusText)
        alert('投稿は完了しましたが、下書きの削除に失敗しました')
      }
    } catch (error) {
      console.error('投稿エラー:', error)
      alert(error instanceof Error ? error.message : '投稿に失敗しました')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ログインが必要です</h1>
          <p className="mb-6">下書きを表示するにはログインしてください。</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ログインページへ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold golden-text mb-4">下書き一覧</h1>
          <p className="text-white/80">保存された下書きを管理できます</p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white/80">下書きを読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg glass-effect border border-red-400 text-red-300">
            <p>{error}</p>
          </div>
        )}

        {!loading && drafts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">下書きがありません</h3>
            <p className="text-white/60 mb-6">まだ下書きは保存されていません</p>
            <button
              onClick={() => router.push('/post/create')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              新規投稿を作成
            </button>
          </div>
        )}

        {!loading && drafts.length > 0 && (
          <div className="grid gap-6">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="glass-effect rounded-lg cosmic-border p-6 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{draft.title || 'タイトルなし'}</h3>
                    <p className="text-white/70 mb-3 line-clamp-2">
                      {draft.description || '内容なし'}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {draft.tags ? (
                        Array.isArray(draft.tags) ? (
                          draft.tags.length > 0 ? (
                        draft.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-sm"
                          >
                            {tag}
                          </span>
                        ))
                          ) : (
                            <span className="text-white/40 text-sm">タグなし</span>
                          )
                        ) : (
                          // タグが文字列の場合、カンマで分割
                          draft.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-sm"
                            >
                              {tag.trim()}
                            </span>
                          ))
                        )
                      ) : (
                        <span className="text-white/40 text-sm">タグなし</span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span>カテゴリ: {draft.category || '未設定'}</span>
                      <span>言語: {draft.language}</span>
                      <span>ファイルタイプ: {draft.file_type}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-white/40 mt-2">
                      <span>作成日: {formatDate(draft.created_at)}</span>
                      <span>更新日: {formatDate(draft.updated_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handlePublishDraft(draft)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="投稿"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditDraft(draft.id)}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="編集"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDraft(draft.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="削除"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/post/create')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            新規投稿を作成
          </button>
        </div>
      </div>
    </div>
  )
}
