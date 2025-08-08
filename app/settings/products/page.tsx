'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Filter, Edit, Trash2, Eye, Package, Calendar, DollarSign, ShoppingBag, Truck } from 'lucide-react'
import { useAuth } from '../../lib/auth-context'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  status: 'active' | 'inactive' | 'draft'
  created_at: string
  updated_at: string
  sales_count: number
  revenue: number
  main_image_url?: string
}

interface ShippingNotificationData {
  order_id: string
  product_name: string
  customer_email: string
  customer_name: string
  seller_name: string
  tracking_number: string
  shipping_carrier: string
  estimated_delivery: string
}

interface Order {
  id: string
  order_number: string
  product_name: string
  customer_name: string
  quantity: number
  unit_price: number
  total_amount: number
  order_status: string
  order_status_display: string
  shipping_status: string
  shipping_status_display: string
  shipping_carrier?: string
  tracking_number?: string
  estimated_delivery?: string
  shipped_at?: string
  delivered_at?: string
  customer_email: string
  customer_address?: string
  customer_phone?: string
  notes?: string
  created_at: string
  updated_at: string
}

export default function ProductsPage() {
  const router = useRouter()

  // Auth contextの使用
  const auth = useAuth()
  const user = auth?.user || null
  const token = auth?.token || null

  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // 配送完了通知の状態管理
  const [showShippingNotification, setShowShippingNotification] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [shippingFormData, setShippingFormData] = useState<ShippingNotificationData>({
    order_id: '',
    product_name: '',
    customer_email: '',
    customer_name: '',
    seller_name: '',
    tracking_number: '',
    shipping_carrier: '',
    estimated_delivery: ''
  })

  // タブ管理
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products')

  // 注文管理の状態
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all')
  const [orderSearchTerm, setOrderSearchTerm] = useState('')

  const fetchProductsCb = React.useCallback(fetchProducts, [token])
  useEffect(() => {
    fetchProductsCb()
  }, [fetchProductsCb])

  const fetchOrdersCb = React.useCallback(fetchOrders, [orderStatusFilter, orderSearchTerm, token])
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrdersCb()
    }
  }, [activeTab, fetchOrdersCb])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/backend/products/my/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProducts(data || [])
      } else {
        console.error('商品取得エラー:', response.status)
      }
    } catch (error) {
      console.error('商品取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true)
      const params = new URLSearchParams()
      if (orderStatusFilter !== 'all') {
        params.append('status', orderStatusFilter)
      }
      if (orderSearchTerm) {
        params.append('search', orderSearchTerm)
      }

      const response = await fetch(`/api/backend/orders/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        console.error('注文取得エラー:', response.status)
      }
    } catch (error) {
      console.error('注文取得エラー:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, statusData: any) => {
    try {
      const response = await fetch(`/api/backend/orders/${orderId}/update/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statusData)
      })

      if (response.ok) {
        alert('注文ステータスを更新しました')
        fetchOrders()
      } else {
        const data = await response.json()
        alert(`注文ステータスの更新に失敗しました: ${data.error}`)
      }
    } catch (error) {
      console.error('注文ステータス更新エラー:', error)
      alert('注文ステータスの更新中にエラーが発生しました')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
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
        fetchProducts()
      } else {
        alert('商品の削除に失敗しました')
      }
    } catch (error) {
      console.error('商品削除エラー:', error)
      alert('商品の削除中にエラーが発生しました')
    }
  }

  // 配送完了通知の送信処理
  const handleSendShippingNotification = async () => {
    try {
      const response = await fetch('/api/backend/shipping/notify/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(shippingFormData)
      })

      const data = await response.json()

      if (response.ok) {
        alert('配送完了通知メールを送信しました！')
        setShowShippingNotification(false)
        setShippingFormData({
          order_id: '',
          product_name: '',
          customer_email: '',
          customer_name: '',
          seller_name: '',
          tracking_number: '',
          shipping_carrier: '',
          estimated_delivery: ''
        })
        setSelectedProduct(null)
      } else {
        alert(`配送通知の送信に失敗しました: ${data.error}`)
      }
    } catch (error) {
      console.error('配送通知送信エラー:', error)
      alert('配送通知の送信中にエラーが発生しました')
    }
  }

  // 配送完了通知モーダルを開く
  const openShippingNotification = (product: Product) => {
    setSelectedProduct(product)
    setShippingFormData({
      order_id: '',
      product_name: product.name,
      customer_email: '',
      customer_name: '',
      seller_name: user?.username || '',
      tracking_number: '',
      shipping_carrier: '',
      estimated_delivery: ''
    })
    setShowShippingNotification(true)
  }

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      'art': 'アート',
      'goods': 'グッズ',
      'digital': 'デジタル',
      'service': 'サービス'
    }
    return categories[category] || category
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'active': { text: '販売中', color: 'bg-green-500' },
      'inactive': { text: '停止中', color: 'bg-gray-500' },
      'draft': { text: '下書き', color: 'bg-yellow-500' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { text: '注文待ち', color: 'bg-yellow-500' },
      'confirmed': { text: '確認済み', color: 'bg-blue-500' },
      'shipped': { text: '発送済み', color: 'bg-purple-500' },
      'delivered': { text: '配達完了', color: 'bg-green-500' },
      'cancelled': { text: 'キャンセル', color: 'bg-red-500' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${config.color}`}>
        {config.text}
      </span>
    )
  }

  const getShippingStatusBadge = (status: string) => {
    const statusConfig = {
      'not_shipped': { text: '未発送', color: 'bg-gray-500' },
      'shipped': { text: '発送済み', color: 'bg-blue-500' },
      'in_transit': { text: '配送中', color: 'bg-purple-500' },
      'delivered': { text: '配達完了', color: 'bg-green-500' },
      'returned': { text: '返品', color: 'bg-red-500' }
    }
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_shipped

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
      day: '2-digit'
    })
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ヘッダー */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div>
              <h1 className="text-2xl font-bold text-white">商品管理</h1>
              <p className="text-white/70">出品した商品の管理</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/shop')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                ショップを見る
              </button>

              <button
                onClick={() => router.push('/settings/products/create')}
                className="px-6 py-3 bg-gradient-to-r from-magic-500 to-magic-600 hover:from-magic-600 hover:to-magic-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                新規出品
              </button>
            </div>
          </div>

          {/* タブ */}
          <div className="flex space-x-8 border-b border-white/10">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'products'
                  ? 'border-magic-500 text-magic-400'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              📦 商品管理
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'orders'
                  ? 'border-magic-500 text-magic-400'
                  : 'border-transparent text-white/70 hover:text-white'
              }`}
            >
              📋 注文管理
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'products' ? (
            <>
              {/* 統計情報 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">総商品数</p>
                      <p className="text-2xl font-bold text-white">{products.length}</p>
                    </div>
                    <Package className="w-8 h-8 text-magic-400" />
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">販売中</p>
                      <p className="text-2xl font-bold text-green-400">
                        {products.filter(p => p.status === 'active').length}
                      </p>
                    </div>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">販</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">総売上</p>
                      <p className="text-2xl font-bold text-white">
                        ¥{(products.reduce((sum, p) => sum + (p.revenue || 0), 0)).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-400" />
                  </div>
                </div>

                <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm">総販売数</p>
                      <p className="text-2xl font-bold text-white">
                        {products.reduce((sum, p) => sum + (p.sales_count || 0), 0)}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-400" />
                  </div>
                </div>
              </div>

              {/* 検索・フィルター */}
              <div className="mb-8 p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      placeholder="商品名で検索..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                    />
                  </div>

                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                    >
                      <option value="all">すべてのステータス</option>
                      <option value="active">販売中</option>
                      <option value="inactive">停止中</option>
                      <option value="draft">下書き</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                    >
                      <option value="all">すべてのカテゴリー</option>
                      <option value="art">アート</option>
                      <option value="goods">グッズ</option>
                      <option value="digital">デジタル</option>
                      <option value="service">サービス</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 商品一覧 */}
              <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                {filteredProducts.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">商品が見つかりません</h3>
                    <p className="text-white/70 mb-6">
                      {products.length === 0
                        ? 'まだ商品を出品していません。新規出品から商品を追加してください。'
                        : '検索条件に一致する商品がありません。'
                      }
                    </p>
                    {products.length === 0 && (
                      <button
                        onClick={() => router.push('/settings/products/create')}
                        className="px-6 py-3 bg-magic-500 hover:bg-magic-600 text-white font-bold rounded-lg transition-colors"
                      >
                        新規出品
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            商品
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            カテゴリー
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            価格
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            在庫
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            ステータス
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            売上
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            更新日
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {filteredProducts.map((product) => (
                          <tr key={product.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-12 h-12">
                                  {product.main_image_url ? (
                                    <img
                                      src={product.main_image_url}
                                      alt={product.name}
                                      className="w-12 h-12 object-cover rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                                      <Package className="w-6 h-6 text-white/50" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">{product.name}</div>
                                  <div className="text-sm text-white/70">ID: {product.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-white">
                                {getCategoryName(product.category)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-white">
                                ¥{(product.price || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-white">
                                {(product.stock || 0)}個
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(product.status)}
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-white">
                                  ¥{(product.revenue || 0).toLocaleString()}
                                </div>
                                <div className="text-xs text-white/70">
                                  {(product.sales_count || 0)}回販売
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-white/70">
                                {formatDate(product.updated_at)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => openShippingNotification(product)}
                                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                  title="配送完了通知"
                                >
                                  <Truck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => router.push(`/settings/products/${product.id}`)}
                                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                  title="プレビュー"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => router.push(`/settings/products/${product.id}/edit`)}
                                  className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                                  title="編集"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                  title="削除"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* 注文管理 */}
              <div className="mb-8 p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      placeholder="注文番号・商品名・顧客名で検索..."
                      value={orderSearchTerm}
                      onChange={(e) => setOrderSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                    />
                  </div>

                  <div>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                    >
                      <option value="all">すべてのステータス</option>
                      <option value="pending">注文待ち</option>
                      <option value="confirmed">確認済み</option>
                      <option value="shipped">発送済み</option>
                      <option value="delivered">配達完了</option>
                      <option value="cancelled">キャンセル</option>
                    </select>
                  </div>

                  <div>
                    <button
                      onClick={fetchOrders}
                      className="w-full px-4 py-3 bg-magic-500 hover:bg-magic-600 text-white font-bold rounded-lg transition-colors"
                    >
                      検索
                    </button>
                  </div>
                </div>
              </div>

              {/* 注文一覧 */}
              <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                {ordersLoading ? (
                  <div className="p-12 text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">注文を読み込み中...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">注文が見つかりません</h3>
                    <p className="text-white/70">まだ注文がありません。</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white/10">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            注文番号
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            商品
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            顧客
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            金額
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            注文ステータス
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            配送ステータス
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            注文日
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-white">{order.order_number}</div>
                              <div className="text-xs text-white/70">数量: {order.quantity}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-white">{order.product_name}</div>
                              <div className="text-xs text-white/70">単価: ¥{order.unit_price.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-white">{order.customer_name}</div>
                              <div className="text-xs text-white/70">{order.customer_email}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-medium text-white">
                                ¥{order.total_amount.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {getOrderStatusBadge(order.order_status)}
                            </td>
                            <td className="px-6 py-4">
                              {getShippingStatusBadge(order.shipping_status)}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-white/70">
                                {formatDate(order.created_at)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => updateOrderStatus(order.id, { shipping_status: 'shipped' })}
                                  className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                  title="発送済みに更新"
                                >
                                  <Truck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateOrderStatus(order.id, { shipping_status: 'delivered' })}
                                  className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                  title="配達完了に更新"
                                >
                                  <Package className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateOrderStatus(order.id, { order_status: 'confirmed' })}
                                  className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors"
                                  title="確認済みに更新"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 配送完了通知モーダル */}
      {showShippingNotification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  📦 配送完了通知
                </h2>
                <button
                  onClick={() => setShowShippingNotification(false)}
                  className="text-gray-400 hover:text-white text-2xl transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* 選択された商品情報 */}
                {selectedProduct && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-400 mb-2">商品情報</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-white/70">商品名:</span>
                        <span className="text-white ml-2">{selectedProduct.name}</span>
                      </div>
                      <div>
                        <span className="text-white/70">価格:</span>
                        <span className="text-white ml-2">¥{selectedProduct.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 注文情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      注文番号 *
                    </label>
                    <input
                      type="text"
                      value={shippingFormData.order_id}
                      onChange={(e) => setShippingFormData({...shippingFormData, order_id: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="ORD-20250101-XXXXXXXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      商品名 *
                    </label>
                    <input
                      type="text"
                      value={shippingFormData.product_name}
                      onChange={(e) => setShippingFormData({...shippingFormData, product_name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="商品名を入力"
                    />
                  </div>
                </div>

                {/* 購入者情報 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      購入者メール *
                    </label>
                    <input
                      type="email"
                      value={shippingFormData.customer_email}
                      onChange={(e) => setShippingFormData({...shippingFormData, customer_email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      購入者名 *
                    </label>
                    <input
                      type="text"
                      value={shippingFormData.customer_name}
                      onChange={(e) => setShippingFormData({...shippingFormData, customer_name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="購入者名を入力"
                    />
                  </div>
                </div>

                {/* 配送情報 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      配送業者
                    </label>
                    <select
                      value={shippingFormData.shipping_carrier}
                      onChange={(e) => setShippingFormData({...shippingFormData, shipping_carrier: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    >
                      <option value="">配送業者を選択</option>
                      <option value="ヤマト運輸">ヤマト運輸</option>
                      <option value="佐川急便">佐川急便</option>
                      <option value="日本郵便">日本郵便</option>
                      <option value="FedEx">FedEx</option>
                      <option value="DHL">DHL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      追跡番号
                    </label>
                    <input
                      type="text"
                      value={shippingFormData.tracking_number}
                      onChange={(e) => setShippingFormData({...shippingFormData, tracking_number: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      placeholder="追跡番号を入力"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      予定配達日
                    </label>
                    <input
                      type="date"
                      value={shippingFormData.estimated_delivery}
                      onChange={(e) => setShippingFormData({...shippingFormData, estimated_delivery: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* 出品者名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    出品者名 *
                  </label>
                  <input
                    type="text"
                    value={shippingFormData.seller_name}
                    onChange={(e) => setShippingFormData({...shippingFormData, seller_name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="出品者名を入力"
                  />
                </div>

                {/* アクションボタン */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSendShippingNotification}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-medium shadow-lg"
                  >
                    📧 配送完了通知を送信
                  </button>
                  <button
                    onClick={() => setShowShippingNotification(false)}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
