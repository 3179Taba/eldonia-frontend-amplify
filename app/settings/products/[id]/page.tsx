'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Edit, Trash2, Package, Calendar, DollarSign, Eye, Star, Tag } from 'lucide-react'
import { useAuth } from '../../../lib/auth-context'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  category_name: string
  status: string
  status_name: string
  images: string[]
  commission_rate: number
  commission_amount: number
  profit: number
  views: number
  sales_count: number
  rating: number
  created_at: string
  updated_at: string
  seller_name: string
  seller_full_name: string
}

export default function ProductDetailPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  // Auth contextの使用
  const auth = useAuth()
  const user = auth?.user || null
  const token = auth?.token || null

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProductCb = React.useCallback(fetchProduct, [productId, token])
  useEffect(() => {
    if (productId) {
      fetchProductCb()
    }
  }, [productId, token, fetchProductCb])

  // ページがフォーカスされた時にデータを再取得
  useEffect(() => {
    const handleFocus = () => {
      if (productId) {
        fetchProductCb()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [productId, token, fetchProductCb])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/backend/products/${productId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProduct(data)
      } else {
        setError('商品の取得に失敗しました')
      }
    } catch (error) {
      console.error('商品取得エラー:', error)
      setError('商品の取得中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!confirm('この商品を削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      const response = await fetch(`/api/backend/products/${productId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('商品を削除しました')
        router.push('/settings/products')
      } else {
        alert('商品の削除に失敗しました')
      }
    } catch (error) {
      console.error('商品削除エラー:', error)
      alert('商品の削除中にエラーが発生しました')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'published': { text: '販売中', color: 'bg-green-500' },
      'inactive': { text: '停止中', color: 'bg-gray-500' },
      'draft': { text: '下書き', color: 'bg-yellow-500' },
      'sold_out': { text: '売り切れ', color: 'bg-red-500' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '未設定'
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">商品が見つかりません</h3>
          <p className="text-white/70 mb-6">{error || '指定された商品は存在しません。'}</p>
          <button
            onClick={() => router.push('/settings/products')}
            className="px-6 py-3 bg-magic-500 hover:bg-magic-600 text-white font-bold rounded-lg transition-colors"
          >
            商品一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ヘッダー */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/settings/products')}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">商品詳細</h1>
                <p className="text-white/70">{product.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/settings/products/${productId}/edit`)}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                編集
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                削除
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 商品画像 */}
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  商品画像
                </h3>
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {product.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`${product.name} - 画像${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {index === 0 && (
                          <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            メイン
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-white/10 rounded-lg flex items-center justify-center">
                    <Package className="w-12 h-12 text-white/30" />
                  </div>
                )}
              </div>
            </div>

            {/* 商品情報 */}
            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">基本情報</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-white/70">商品名</label>
                    <p className="text-white font-medium">{product.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">商品説明</label>
                    <p className="text-white">{product.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-white/70">カテゴリー</label>
                      <p className="text-white">{product.category_name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-white/70">ステータス</label>
                      <div className="mt-1">{getStatusBadge(product.status)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 価格・在庫情報 */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  価格・在庫
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70">価格</label>
                    <p className="text-2xl font-bold text-white">¥{product.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">在庫数</label>
                    <p className="text-2xl font-bold text-white">{product.stock}個</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">手数料率</label>
                    <p className="text-white">{product.commission_rate}%</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">手数料額</label>
                    <p className="text-white">¥{product.commission_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">利益</label>
                    <p className="text-green-400 font-bold">¥{product.profit.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* 統計情報 */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  統計情報
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70">閲覧数</label>
                    <p className="text-white">{product.views}回</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">販売数</label>
                    <p className="text-white">{product.sales_count}回</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">評価</label>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white">{product.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 日時情報 */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  日時情報
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-white/70">作成日</label>
                    <p className="text-white">{formatDate(product.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-white/70">更新日</label>
                    <p className="text-white">{formatDate(product.updated_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
