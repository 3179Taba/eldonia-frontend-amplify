'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { useI18n } from '../../lib/i18n-provider'
import {
  FileText,
  Image,
  Calendar,
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter
} from 'lucide-react'

interface ContentItem {
  id: number
  title: string
  type: 'post' | 'event' | 'product' | 'gallery'
  status: 'published' | 'draft' | 'archived'
  author: string
  created_at: string
  updated_at: string
  views: number
}

export default function ContentManagement() {
  const { isAuthenticated } = useAuth()
  const [contents, setContents] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      fetchContents()
    }
  }, [isAuthenticated])

  const fetchContents = async () => {
    try {
      // モックデータ
      const mockContents: ContentItem[] = [
        {
          id: 1,
          title: '新しいアート作品の紹介',
          type: 'post',
          status: 'published',
          author: 'admin',
          created_at: '2024-01-15',
          updated_at: '2024-01-15',
          views: 1250
        },
        {
          id: 2,
          title: '春のアートフェスティバル',
          type: 'event',
          status: 'published',
          author: 'admin',
          created_at: '2024-01-10',
          updated_at: '2024-01-12',
          views: 890
        },
        {
          id: 3,
          title: '限定アートプリント',
          type: 'product',
          status: 'draft',
          author: 'admin',
          created_at: '2024-01-08',
          updated_at: '2024-01-08',
          views: 0
        },
        {
          id: 4,
          title: 'ギャラリー写真集',
          type: 'gallery',
          status: 'published',
          author: 'admin',
          created_at: '2024-01-05',
          updated_at: '2024-01-05',
          views: 2100
        }
      ]
      setContents(mockContents)
    } catch (error) {
      console.error('コンテンツの取得に失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return FileText
      case 'event': return Calendar
      case 'product': return ShoppingBag
      case 'gallery': return Image
      default: return FileText
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post': return '投稿'
      case 'event': return 'イベント'
      case 'product': return '商品'
      case 'gallery': return 'ギャラリー'
      default: return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return '公開中'
      case 'draft': return '下書き'
      case 'archived': return 'アーカイブ'
      default: return status
    }
  }

  const filteredContents = contents.filter(content => {
    const matchesType = selectedType === 'all' || content.type === selectedType
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">アクセス拒否</h2>
            <p className="text-red-600">このページにアクセスするには管理者権限が必要です。</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📝 コンテンツ管理</h1>
              <p className="text-gray-600 mt-1">投稿、イベント、商品、ギャラリーの管理</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Plus className="h-4 w-4" />
                新規作成
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* フィルターと検索 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="コンテンツを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">すべてのタイプ</option>
                <option value="post">投稿</option>
                <option value="event">イベント</option>
                <option value="product">商品</option>
                <option value="gallery">ギャラリー</option>
              </select>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <Filter className="h-4 w-4" />
                フィルター
              </button>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総コンテンツ数</p>
                <p className="text-2xl font-bold text-gray-900">{contents.length}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg text-white">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">公開中</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contents.filter(c => c.status === 'published').length}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg text-white">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">下書き</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contents.filter(c => c.status === 'draft').length}
                </p>
              </div>
              <div className="bg-yellow-500 p-3 rounded-lg text-white">
                <Edit className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総閲覧数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {contents.reduce((sum, c) => sum + c.views, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg text-white">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* コンテンツ一覧 */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">コンテンツ一覧</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイトル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイプ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    閲覧数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContents.map((content) => {
                  const TypeIcon = getTypeIcon(content.type)
                  return (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{content.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{getTypeLabel(content.type)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(content.status)}`}>
                          {getStatusLabel(content.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {content.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {content.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(content.updated_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredContents.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-gray-500">コンテンツが見つかりませんでした。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
