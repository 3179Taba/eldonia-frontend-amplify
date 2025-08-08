'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Check, X, Edit, Image as ImageIcon, Package, Truck, Mail, Calculator } from 'lucide-react'
import { useAuth } from '../../../../lib/auth-context'

interface ProductData {
  id: string
  category: string
  subCategory: string
  name: string
  price: number
  stock: number
  description: string
  mainImage: File | null
  subImages: File[]
  // 配送関連
  shippingCarrier?: string
  shippingDays?: string
  shippingCostType?: 'free' | 'fixed' | 'calculated'
  shippingCost?: string
  shippingRegions?: string[]
  shippingOptions?: string[]
  // 商品サイズ・重量
  productWeight?: number
  productLength?: number
  productWidth?: number
  productHeight?: number
  productSize?: 'small' | 'medium' | 'large' | 'extra_large'
  // メール関連
  salesNotificationEmail?: string
  emailNotification?: boolean
  smsNotification?: boolean
}

export default function ProductConfirmPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Auth contextの使用
  const auth = useAuth()
  const user = auth?.user || null
  const token = auth?.token || null
  
  const [productData, setProductData] = useState<ProductData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProductData = async () => {
      // URLパラメータから商品データを取得
      const category = searchParams.get('category')
      const subCategory = searchParams.get('subCategory')
      const name = searchParams.get('name')
      const price = searchParams.get('price')
      const stock = searchParams.get('stock')
      const description = searchParams.get('description')
      const shippingCarrier = searchParams.get('shippingCarrier')
      const shippingDays = searchParams.get('shippingDays')
      const shippingCostType = searchParams.get('shippingCostType') as any
      const shippingCost = searchParams.get('shippingCost')
      const productSize = searchParams.get('productSize') as any
      const salesNotificationEmail = searchParams.get('salesNotificationEmail')

      // セッションストレージから画像データを取得（WebP対応）
      let mainImage: File | null = null
      let subImages: File[] = []

      try {
        // まずWebPデータを試す
        const mainImageData = sessionStorage.getItem('productMainImage')
        if (mainImageData) {
          const data = JSON.parse(mainImageData)
          // WebPデータからBlobを作成
          const base64Response = await fetch(data.data)
          const blob = await base64Response.blob()
          mainImage = new File([blob], data.name, {
            type: data.type,
            lastModified: data.lastModified
          })
        } else {
          // WebPデータがない場合はメタデータを試す
          const mainImageMeta = sessionStorage.getItem('productMainImageMeta')
          if (mainImageMeta) {
            const data = JSON.parse(mainImageMeta)
            // メタデータのみでFileオブジェクトを作成（実際のデータは空）
            mainImage = new File([], data.name, {
              type: data.type,
              lastModified: data.lastModified
            })
            // サイズ情報を追加
            Object.defineProperty(mainImage, 'size', {
              value: data.size,
              writable: false
            })
          }
        }

        // サブ画像も同様に処理（エラーハンドリング強化）
        const subImagesData = sessionStorage.getItem('productSubImages')
        if (subImagesData) {
          try {
            const dataArray = JSON.parse(subImagesData)
            const subImagesPromises = dataArray.map(async (data: any) => {
              try {
                const base64Response = await fetch(data.data)
                const blob = await base64Response.blob()
                return new File([blob], data.name, {
                  type: data.type,
                  lastModified: data.lastModified
                })
              } catch (error) {
                console.warn(`サブ画像の復元に失敗しました: ${data.name}`, error)
                // エラーが発生した場合はメタデータのみのFileオブジェクトを作成
                const file = new File([], data.name, {
                  type: data.type,
                  lastModified: data.lastModified
                })
                Object.defineProperty(file, 'size', {
                  value: data.size,
                  writable: false
                })
                return file
              }
            })
            subImages = await Promise.all(subImagesPromises)
          } catch (error) {
            console.error('サブ画像データの解析に失敗しました:', error)
            // メタデータにフォールバック
            const subImagesMeta = sessionStorage.getItem('productSubImagesMeta')
            if (subImagesMeta) {
              try {
                const dataArray = JSON.parse(subImagesMeta)
                subImages = dataArray.map((data: any) => {
                  const file = new File([], data.name, {
                    type: data.type,
                    lastModified: data.lastModified
                  })
                  Object.defineProperty(file, 'size', {
                    value: data.size,
                    writable: false
                  })
                  return file
                })
              } catch (metaError) {
                console.error('サブ画像メタデータの解析にも失敗しました:', metaError)
              }
            }
          }
        } else {
          // WebPデータがない場合はメタデータを試す
          const subImagesMeta = sessionStorage.getItem('productSubImagesMeta')
          if (subImagesMeta) {
            try {
              const dataArray = JSON.parse(subImagesMeta)
              subImages = dataArray.map((data: any) => {
                const file = new File([], data.name, {
                  type: data.type,
                  lastModified: data.lastModified
                })
                Object.defineProperty(file, 'size', {
                  value: data.size,
                  writable: false
                })
                return file
              })
            } catch (error) {
              console.error('サブ画像メタデータの解析に失敗しました:', error)
            }
          }
        }
      } catch (error) {
        console.error('画像データの取得に失敗しました:', error)
      }

      if (category && name && price) {
        setProductData({
          id: `PROD-${Date.now()}`,
          category,
          subCategory: subCategory || '',
          name,
          price: parseInt(price),
          stock: parseInt(stock || '1'),
          description: description || '',
          mainImage,
          subImages,
          shippingCarrier,
          shippingDays,
          shippingCostType,
          shippingCost,
          productSize,
          salesNotificationEmail,
          emailNotification: true,
          smsNotification: false
        })
      }
      setIsLoading(false)
    }

    loadProductData()
  }, [searchParams])

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      'art': 'アート',
      'goods': 'グッズ',
      'digital': 'デジタル',
      'service': 'サービス'
    }
    return categories[category] || category
  }

  const getSubCategoryName = (subCategory: string) => {
    const subCategories: { [key: string]: string } = {
      'painting': '絵画',
      'sculpture': '彫刻',
      'photography': '写真',
      'illustration': 'イラスト',
      'craft': 'クラフト',
      'fashion': 'ファッション',
      'accessory': 'アクセサリー',
      'home': 'ホーム',
      'software': 'ソフトウェア',
      'template': 'テンプレート',
      'consultation': 'コンサルティング',
      'design': 'デザイン',
      'writing': 'ライティング'
    }
    return subCategories[subCategory] || subCategory
  }

  const isDigitalProduct = () => {
    return productData?.category === 'digital' || productData?.category === 'art'
  }

  const getCommissionRate = () => {
    const rates: { [key: string]: number } = {
      'art': 0.10,
      'goods': 0.05,
      'digital': 0.10,
      'service': 0.12
    }
    return rates[productData?.category || ''] || 0.10
  }

  const calculateCommission = (price: number) => {
    return Math.floor(price * getCommissionRate())
  }

  const calculateProfit = (price: number) => {
    return price - calculateCommission(price)
  }

  const handleSubmit = async () => {
    if (!productData) return

    setIsSubmitting(true)
    try {
      // 商品出品のAPI呼び出し
      const formData = new FormData()
      
      // 基本情報
      formData.append('id', productData.id)
      formData.append('category', productData.category)
      formData.append('sub_category', productData.subCategory)
      formData.append('name', productData.name)
      formData.append('price', productData.price.toString())
      formData.append('stock', productData.stock.toString())
      formData.append('description', productData.description)
      
      // 画像
      if (productData.mainImage) {
        formData.append('mainImage', productData.mainImage)
      }
      productData.subImages.forEach((file, index) => {
        formData.append(`subImages`, file)
      })
      
      // 配送情報
      if (productData.shippingCarrier) formData.append('shipping_carrier', productData.shippingCarrier)
      if (productData.shippingDays) formData.append('shipping_days', productData.shippingDays)
      if (productData.shippingCostType) formData.append('shipping_cost_type', productData.shippingCostType)
      if (productData.shippingCost) formData.append('shipping_cost', productData.shippingCost)
      if (productData.productSize) formData.append('product_size', productData.productSize)
      if (productData.salesNotificationEmail) formData.append('sales_notification_email', productData.salesNotificationEmail)

      const response = await fetch('/api/backend/products/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        // レスポンスのContent-Typeをチェック
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          throw new Error(errorData.error || `商品出品に失敗しました (${response.status})`)
        } else {
          // HTMLエラーページが返された場合
          const errorText = await response.text()
          console.error('API Error Response:', errorText)
          throw new Error(`商品出品に失敗しました (${response.status} ${response.statusText})`)
        }
      }

      alert('商品の出品が完了しました！')
      router.push('/settings/products')
    } catch (error) {
      console.error('商品出品エラー:', error)
      alert(`商品出品中にエラーが発生しました: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const saveMainImageToSession = async (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const mainImageData = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        data: reader.result
      }
      sessionStorage.setItem('productMainImage', JSON.stringify(mainImageData))
    }
    reader.readAsDataURL(file)
  }

  const saveSubImagesToSession = async (files: File[]) => {
    const subImagesData: any[] = []
    const subImagesMeta: any[] = []

    for (const file of files) {
      if (file.size > 0) {
        // 実際のデータを持つ画像
        const reader = new FileReader()
        reader.onload = () => {
          subImagesData.push({
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            data: reader.result
          })
        }
        reader.readAsDataURL(file)
      } else {
        // メタデータのみの画像
        subImagesMeta.push({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        })
      }
    }

    // すべての画像を処理した後に保存
    await Promise.all(subImagesData.map(data => {
      return new Promise(resolve => {
        const reader = new FileReader()
        reader.onload = () => {
          sessionStorage.setItem('productSubImages', JSON.stringify(subImagesData))
          resolve(null)
        }
        reader.readAsDataURL(new File([], data.name, {
          type: data.type,
          lastModified: data.lastModified
        }))
      })
    }))

    // メタデータのみの画像がある場合
    if (subImagesMeta.length > 0) {
      sessionStorage.setItem('productSubImagesMeta', JSON.stringify(subImagesMeta))
    }
  }

  // handleEditの修正
  const handleEdit = async () => {
    if (!productData) return
    if (productData.mainImage && productData.mainImage.size > 0) {
      await saveMainImageToSession(productData.mainImage)
    } else if (productData.mainImage) {
      sessionStorage.setItem('productMainImageMeta', JSON.stringify({
        name: productData.mainImage.name,
        size: productData.mainImage.size,
        type: productData.mainImage.type,
        lastModified: productData.mainImage.lastModified
      }))
    }
    if (productData.subImages.length > 0) {
      await saveSubImagesToSession(productData.subImages)
    }
    const params = new URLSearchParams({
      category: productData.category,
      subCategory: productData.subCategory,
      name: productData.name,
      price: productData.price.toString(),
      stock: productData.stock.toString(),
      description: productData.description,
      ...(productData.shippingCarrier && { shippingCarrier: productData.shippingCarrier }),
      ...(productData.shippingDays && { shippingDays: productData.shippingDays }),
      ...(productData.shippingCostType && { shippingCostType: productData.shippingCostType }),
      ...(productData.shippingCost && { shippingCost: productData.shippingCost }),
      ...(productData.productSize && { productSize: productData.productSize }),
      ...(productData.salesNotificationEmail && { salesNotificationEmail: productData.salesNotificationEmail })
    })
    router.push(`/settings/products/create/details?${params.toString()}`)
  }

  // ローディング状態の表示
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

  if (!productData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white">商品データが見つかりません</p>
          <button
            onClick={() => router.push('/settings/products/create')}
            className="mt-4 px-6 py-2 bg-magic-500 hover:bg-magic-600 text-white rounded-lg transition-colors"
          >
            商品作成に戻る
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
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">出品情報の確認</h1>
                <p className="text-white/70">出品内容を確認してから出品してください</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                編集
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* 確認メッセージ */}
          <div className="mb-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Check className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">出品情報の確認</h3>
            </div>
            <p className="text-white/80">
              以下の内容で商品を出品します。内容に問題がなければ「出品する」ボタンをクリックしてください。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左側：商品情報 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 基本情報 */}
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="h-5 w-5 text-magic-400" />
                  <h3 className="text-lg font-semibold text-white">商品基本情報</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">商品ID</label>
                      <p className="text-white font-mono bg-white/10 px-3 py-2 rounded-lg">
                        {productData.id}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">カテゴリー</label>
                      <p className="text-white">
                        {getCategoryName(productData.category)}
                        {productData.subCategory && (
                          <span className="text-white/70"> → {getSubCategoryName(productData.subCategory)}</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">商品名</label>
                      <p className="text-white font-medium">{productData.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">価格</label>
                      <p className="text-white font-medium">¥{productData.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">在庫数</label>
                      <p className="text-white">{productData.stock}個</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">商品サイズ</label>
                      <p className="text-white">
                        {productData.productSize === 'small' && '小'}
                        {productData.productSize === 'medium' && '中'}
                        {productData.productSize === 'large' && '大'}
                        {productData.productSize === 'extra_large' && '特大'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">商品説明</label>
                    <p className="text-white bg-white/10 px-3 py-2 rounded-lg whitespace-pre-wrap">
                      {productData.description || '説明なし'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 配送情報 - 物品商品の場合 */}
              {!isDigitalProduct() && (
                <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="h-5 w-5 text-magic-400" />
                    <h3 className="text-lg font-semibold text-white">配送情報</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">配送業者</label>
                      <p className="text-white">{productData.shippingCarrier || '未設定'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">配送日数</label>
                      <p className="text-white">{productData.shippingDays || '未設定'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">送料タイプ</label>
                      <p className="text-white">
                        {productData.shippingCostType === 'free' && '送料無料'}
                        {productData.shippingCostType === 'fixed' && '固定送料'}
                        {productData.shippingCostType === 'calculated' && '計算送料'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">送料</label>
                      <p className="text-white">
                        {productData.shippingCostType === 'free' && '無料'}
                        {productData.shippingCost && `¥${productData.shippingCost}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ダウンロード情報 - デジタル商品の場合 */}
              {isDigitalProduct() && (
                <div className="p-6 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">ダウンロード情報</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">配信方法</label>
                      <p className="text-white">購入後、自動的にダウンロードリンクが提供されます</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">配信タイミング</label>
                      <p className="text-white">即座に配信（購入完了後すぐ）</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">ダウンロード期限</label>
                      <p className="text-white">無期限（購入後いつでもダウンロード可能）</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">配信回数</label>
                      <p className="text-white">無制限（何度でもダウンロード可能）</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 画像情報 */}
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <ImageIcon className="h-5 w-5 text-magic-400" />
                  <h3 className="text-lg font-semibold text-white">商品画像</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">メイン画像</label>
                    {productData.mainImage ? (
                      <div className="relative">
                        {productData.mainImage.size > 0 ? (
                          <>
                            <img
                              src={URL.createObjectURL(productData.mainImage)}
                              alt="メイン画像"
                              className="w-full h-48 object-cover rounded-lg"
                              onError={(e) => {
                                // 画像読み込みエラー時の処理
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent) {
                                  const placeholder = document.createElement('div')
                                  placeholder.className = 'w-full h-48 bg-white/10 rounded-lg flex items-center justify-center'
                                  placeholder.innerHTML = `
                                    <div class="text-center">
                                      <svg class="w-8 h-8 text-white/50 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                      </svg>
                                      <p class="text-white/70 text-sm">${productData.mainImage.name}</p>
                                      <p class="text-white/50 text-xs">(WebP形式)</p>
                                    </div>
                                  `
                                  parent.appendChild(placeholder)
                                }
                              }}
                            />
                            <p className="text-white/70 text-xs mt-1">
                              {productData.mainImage.name} ({(productData.mainImage.size / 1024 / 1024).toFixed(2)} MB)
                              {productData.mainImage.type === 'image/webp' && ' - WebP形式'}
                            </p>
                          </>
                        ) : (
                          <div className="w-full h-48 bg-white/10 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <ImageIcon className="w-8 h-8 text-white/50 mx-auto mb-2" />
                              <p className="text-white/70 text-sm">{productData.mainImage.name}</p>
                              <p className="text-white/50 text-xs">(メタデータのみ)</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-white/50">画像が選択されていません</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">サブ画像 ({productData.subImages.length}枚)</label>
                    {productData.subImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {productData.subImages.map((file, index) => (
                          <div key={index} className="relative">
                            {file.size > 0 ? (
                              <>
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`サブ画像 ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                  onError={(e) => {
                                    // 画像読み込みエラー時の処理
                                    const target = e.target as HTMLImageElement
                                    target.style.display = 'none'
                                    const parent = target.parentElement
                                    if (parent) {
                                      const placeholder = document.createElement('div')
                                      placeholder.className = 'w-full h-24 bg-white/10 rounded-lg flex items-center justify-center'
                                      placeholder.innerHTML = `
                                        <div class="text-center">
                                          <svg class="w-4 h-4 text-white/50 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                          </svg>
                                          <p class="text-white/70 text-xs">${file.name}</p>
                                          <p class="text-white/50 text-xs">(WebP形式)</p>
                                        </div>
                                      `
                                      parent.appendChild(placeholder)
                                    }
                                  }}
                                />
                                <p className="text-white/70 text-xs mt-1">
                                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  {file.type === 'image/webp' && ' - WebP形式'}
                                  {file.size === 0 && ' - メタデータのみ'}
                                </p>
                              </>
                            ) : (
                              <div className="w-full h-24 bg-white/10 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                  <ImageIcon className="w-4 h-4 text-white/50 mx-auto mb-1" />
                                  <p className="text-white/70 text-xs">{file.name}</p>
                                  <p className="text-white/50 text-xs">(メタデータのみ)</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/50">サブ画像はありません</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 右側：収益計算・出品ボタン */}
            <div className="space-y-6">
              {/* 収益計算 */}
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-5 w-5 text-magic-400" />
                  <h3 className="text-lg font-semibold text-white">収益計算</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">販売価格</span>
                    <span className="text-white">¥{productData.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">手数料 ({getCommissionRate() * 100}%)</span>
                    <span className="text-red-400">-¥{calculateCommission(productData.price).toLocaleString()}</span>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between">
                      <span className="text-white font-medium">予想収益</span>
                      <span className="text-green-400 font-bold">¥{calculateProfit(productData.price).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* メール設定 */}
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-magic-400" />
                  <h3 className="text-lg font-semibold text-white">メール設定</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">売上通知メール</label>
                    <p className="text-white">{productData.salesNotificationEmail || '未設定'}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">メール通知</span>
                    <span className="text-green-400 text-sm">有効</span>
                  </div>
                </div>
              </div>

              {/* 出品ボタン */}
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-white/70 text-sm mb-2">出品内容に問題がなければ</p>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-gradient-to-r from-magic-500 to-magic-600 hover:from-magic-600 hover:to-magic-700 text-white font-bold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          出品中...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5" />
                          商品を出品する
                        </div>
                      )}
                    </button>
                  </div>
                  <p className="text-white/50 text-xs text-center">
                    出品後は商品管理ページで商品の編集・削除が可能です
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 