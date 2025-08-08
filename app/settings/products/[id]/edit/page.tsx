'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Upload, X, Package, DollarSign, Tag, ShoppingBag } from 'lucide-react'
import { useAuth } from '../../../../lib/auth-context'

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
}

export default function ProductEditPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  // Auth contextの使用
  const auth = useAuth()
  const user = auth?.user || null
  const token = auth?.token || null

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // フォーム状態
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 1,
    category: 'art',
    status: 'draft',
    commission_rate: 10.0
  })

  // 画像関連
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [subImages, setSubImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])

  const fetchProductCb = React.useCallback(fetchProduct, [productId, token])
  useEffect(() => {
    if (productId) {
      fetchProductCb()
    }
  }, [productId, fetchProductCb])

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
        // カテゴリーに応じて手数料を設定
        let commission_rate = data.commission_rate || 10.0
        if (data.category === 'goods') {
          commission_rate = 5.0
        }

        setFormData({
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          stock: data.stock || 1,
          category: data.category || 'art',
          status: data.status || 'draft',
          commission_rate: commission_rate
        })
        setExistingImages(data.images || [])
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: name === 'price' || name === 'stock' || name === 'commission_rate' ? Number(value) : value
      }

      // カテゴリーが物品の場合、手数料を5%に自動設定
      if (name === 'category' && value === 'goods') {
        newData.commission_rate = 5.0
      }

      return newData
    })
  }

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0])
    }
  }

  const handleSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('サブ画像選択イベント:', {
      target: e.target,
      files: e.target.files,
      filesLength: e.target.files?.length,
      multiple: e.target.multiple,
      accept: e.target.accept
    })

    if (e.target.files) {
      const files = Array.from(e.target.files)
      console.log('サブ画像選択:', {
        fileCount: files.length,
        files: files.map(f => ({ name: f.name, size: f.size, type: f.type }))
      })
      setSubImages(files)
    } else {
      console.log('ファイルが選択されていません')
    }
  }

  const clearSubImages = () => {
    setSubImages([])
    // ファイル入力フィールドをリセット
    const fileInput = document.getElementById('sub-images-input') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
      console.log('サブ画像入力フィールドをクリアしました')
    } else {
      console.log('サブ画像入力フィールドが見つかりません')
    }
  }

  const removeSubImage = (index: number) => {
    setSubImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const formDataToSend = new FormData()

      // 基本データを追加
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString())
        }
      })

      // 画像を追加
      if (mainImage) {
        formDataToSend.append('mainImage', mainImage)
        console.log('メイン画像を追加:', mainImage.name, mainImage.size, mainImage.type)
      }

      subImages.forEach((image, index) => {
        formDataToSend.append('subImages', image)
        console.log(`サブ画像${index + 1}を追加:`, image.name, image.size, image.type)
      })

      // 既存画像の情報を送信
      if (existingImages.length > 0) {
        formDataToSend.append('existingImages', JSON.stringify(existingImages))
        console.log('既存画像を追加:', existingImages)
      }

      console.log('送信するデータ:', {
        formData,
        mainImage: mainImage ? `${mainImage.name} (${mainImage.size} bytes)` : 'なし',
        subImages: subImages.map(img => `${img.name} (${img.size} bytes)`),
        existingImages
      })

      console.log('リクエスト詳細:', {
        url: `/api/backend/products/${productId}/update/`,
        method: 'PUT',
        hasToken: !!token,
        tokenLength: token?.length || 0
      })

      const response = await fetch(`/api/backend/products/${productId}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      console.log('レスポンスステータス:', response.status)
      console.log('レスポンスヘッダー:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const responseData = await response.json()
        console.log('更新成功:', responseData)
        alert('商品を更新しました')
        // 更新後に商品詳細ページに戻る
        router.push(`/settings/products/${productId}`)
        // ページを強制的にリロード
        window.location.reload()
      } else {
        console.error('更新エラー - ステータス:', response.status)
        console.error('更新エラー - ステータステキスト:', response.statusText)

        let errorData
        try {
          errorData = await response.json()
          console.error('更新エラー - JSON:', errorData)
        } catch (parseError) {
          console.error('更新エラー - JSON解析失敗:', parseError)
          const textData = await response.text()
          console.error('更新エラー - テキスト:', textData)
          errorData = { error: textData || '不明なエラー' }
        }

        const errorMessage = errorData.error || errorData.detail || errorData.message || '不明なエラー'
        console.error('最終エラーメッセージ:', errorMessage)
        alert(`商品の更新に失敗しました: ${errorMessage}`)
      }
    } catch (error) {
      console.error('商品更新エラー:', error)
      alert(`商品の更新中にエラーが発生しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      'art': 'アート・イラスト',
      'music': '音楽・音声',
      'video': '動画・映像',
      'text': 'テキスト・小説',
      'code': 'コード・プログラム',
      'goods': '物品',
      'other': 'その他'
    }
    return categories[category] || category
  }

  const getStatusName = (status: string) => {
    const statuses: { [key: string]: string } = {
      'draft': '下書き',
      'published': '公開中',
      'sold_out': '売り切れ',
      'inactive': '非公開'
    }
    return statuses[status] || status
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
                onClick={() => router.push(`/settings/products/${productId}`)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">商品編集</h1>
                <p className="text-white/70">{product.name}</p>
              </div>
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
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-6 py-3 bg-magic-500 hover:bg-magic-600 disabled:bg-magic-400 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 基本情報 */}
            <div className="bg-white/5 rounded-lg border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" />
                基本情報
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">商品名 *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                    placeholder="商品名を入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">カテゴリー *</label>
                  <select
                    name="category"
                    value={formData.category || 'art'}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                  >
                    <option value="art">アート・イラスト</option>
                    <option value="music">音楽・音声</option>
                    <option value="video">動画・映像</option>
                    <option value="text">テキスト・小説</option>
                    <option value="code">コード・プログラム</option>
                    <option value="goods">物品</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">ステータス *</label>
                  <select
                    name="status"
                    value={formData.status || 'draft'}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                  >
                    <option value="draft">下書き</option>
                    <option value="published">公開中</option>
                    <option value="sold_out">売り切れ</option>
                    <option value="inactive">非公開</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-white mb-2">商品説明 *</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                  placeholder="商品の詳細な説明を入力"
                />
              </div>
            </div>

            {/* 価格・在庫情報 */}
            <div className="bg-white/5 rounded-lg border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                価格・在庫
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">価格 (円) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || 0}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">在庫数 *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock || 1}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                    placeholder="1"
                  />
                </div>

                                 <div>
                   <label className="block text-sm font-medium text-white mb-2">手数料率 (%)</label>
                   <input
                     type="number"
                     name="commission_rate"
                     value={formData.commission_rate || 10.0}
                     onChange={handleInputChange}
                     min="0"
                     max="100"
                     step="0.1"
                     disabled={formData.category === 'goods'}
                     className={`w-full px-4 py-3 border rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500 ${
                       formData.category === 'goods'
                         ? 'bg-gray-600/30 border-gray-500 cursor-not-allowed'
                         : 'bg-white/10 border-white/20'
                     }`}
                     placeholder="10.0"
                   />
                   <p className="text-white/50 text-xs mt-1">
                     {formData.category === 'goods'
                       ? '物品カテゴリーは5%に自動設定されます（変更不可）'
                       : '物品以外は10%がデフォルトです'}
                   </p>
                 </div>
              </div>
            </div>

            {/* 商品画像 */}
            <div className="bg-white/5 rounded-lg border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                商品画像
              </h3>

              {/* 既存画像 */}
              {existingImages.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-4">既存画像</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`既存画像${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {index === 0 && (
                          <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            メイン
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 新規画像アップロード */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">メイン画像</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-magic-500 file:text-white hover:file:bg-magic-600"
                  />
                  {mainImage && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(mainImage)}
                        alt="プレビュー"
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-white">サブ画像 (複数選択可)</label>
                    <div className="flex gap-2">
                      {subImages.length > 0 && (
                        <button
                          type="button"
                          onClick={clearSubImages}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          クリア
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.getElementById('sub-images-input') as HTMLInputElement
                          if (fileInput) {
                            console.log('サブ画像入力フィールドの状態:', {
                              multiple: fileInput.multiple,
                              accept: fileInput.accept,
                              type: fileInput.type,
                              id: fileInput.id
                            })
                            fileInput.click()
                          }
                        }}
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        テスト
                      </button>
                    </div>
                  </div>
                  <input
                    id="sub-images-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSubImagesChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-magic-500 file:text-white hover:file:bg-magic-600"
                  />
                  {subImages.length > 0 && (
                    <div className="mt-2">
                      <p className="text-white/70 text-sm mb-2">選択された画像: {subImages.length}個</p>
                      <div className="grid grid-cols-4 gap-2">
                        {subImages.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`サブ画像${index + 1}`}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                              {index + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSubImage(index)}
                              className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {subImages.length === 0 && (
                    <p className="text-white/50 text-sm mt-2">画像を選択してください（Ctrl+クリックで複数選択）</p>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
