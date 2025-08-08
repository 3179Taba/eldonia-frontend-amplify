'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ImageIcon, 
  Music, 
  Video, 
  FileText, 
  Code, 
  Package,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '../../../lib/auth-context'

interface ProductData {
  category: string
  subCategory: string
  name: string
  price: number
  stock: number
  description: string
  images: File[]
}

export default function CreateProductPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [productData, setProductData] = useState<ProductData>({
    category: '',
    subCategory: '',
    name: '',
    price: 0,
    stock: 1,
    description: '',
    images: []
  })

  // カテゴリーオプション
  const categories = [
    { id: 'art', name: 'アート・イラスト', icon: <ImageIcon className="h-6 w-6" />, color: 'from-blue-500 to-blue-600' },
    { id: 'music', name: '音楽・音声', icon: <Music className="h-6 w-6" />, color: 'from-purple-500 to-purple-600' },
    { id: 'video', name: '動画・映像', icon: <Video className="h-6 w-6" />, color: 'from-red-500 to-red-600' },
    { id: 'text', name: 'テキスト・小説', icon: <FileText className="h-6 w-6" />, color: 'from-green-500 to-green-600' },
    { id: 'code', name: 'コード・プログラム', icon: <Code className="h-6 w-6" />, color: 'from-gray-500 to-gray-600' },
    { id: 'goods', name: '物品', icon: <Package className="h-6 w-6" />, color: 'from-orange-500 to-orange-600' },
    { id: 'other', name: 'その他', icon: <Package className="h-6 w-6" />, color: 'from-indigo-500 to-indigo-600' }
  ]

  // アートサブカテゴリー
  const artSubCategories = [
    { id: 'illustration', name: 'イラスト', icon: '🎨' },
    { id: 'digital_art', name: 'デジタルアート', icon: '🖼️' },
    { id: 'painting', name: '絵画', icon: '🖼️' },
    { id: 'photography', name: '写真', icon: '📷' },
    { id: 'sculpture', name: '彫刻', icon: '🗿' },
    { id: 'design', name: 'デザイン', icon: '🎯' },
    { id: 'comic', name: '漫画', icon: '📖' },
    { id: 'animation', name: 'アニメーション', icon: '🎬' },
    { id: 'other_art', name: 'その他アート', icon: '🎭' }
  ]

  // 音楽サブカテゴリー
  const musicSubCategories = [
    { id: 'pop', name: 'ポップ', icon: '🎵' },
    { id: 'rock', name: 'ロック', icon: '🎸' },
    { id: 'jazz', name: 'ジャズ', icon: '🎷' },
    { id: 'classical', name: 'クラシック', icon: '🎻' },
    { id: 'electronic', name: 'エレクトロニック', icon: '🎹' },
    { id: 'hiphop', name: 'ヒップホップ', icon: '🎤' },
    { id: 'other_music', name: 'その他音楽', icon: '🎼' }
  ]

  // 動画サブカテゴリー
  const videoSubCategories = [
    { id: 'movie', name: '映画', icon: '🎬' },
    { id: 'animation', name: 'アニメーション', icon: '🎭' },
    { id: 'documentary', name: 'ドキュメンタリー', icon: '📹' },
    { id: 'tutorial', name: 'チュートリアル', icon: '📚' },
    { id: 'other_video', name: 'その他動画', icon: '🎥' }
  ]

  // 物品サブカテゴリー
  const goodsSubCategories = [
    { id: 'accessories', name: 'アクセサリー', icon: '💍' },
    { id: 'clothing', name: '衣類', icon: '👕' },
    { id: 'books', name: '書籍・雑誌', icon: '📚' },
    { id: 'stationery', name: '文房具', icon: '✏️' },
    { id: 'home', name: 'ホーム・インテリア', icon: '🏠' },
    { id: 'toys', name: 'おもちゃ・ゲーム', icon: '🎮' },
    { id: 'sports', name: 'スポーツ用品', icon: '⚽' },
    { id: 'beauty', name: '美容・コスメ', icon: '💄' },
    { id: 'food', name: '食品・飲料', icon: '🍎' },
    { id: 'electronics', name: '電化製品', icon: '📱' },
    { id: 'other_goods', name: 'その他物品', icon: '📦' }
  ]

  const handleCategorySelect = (categoryId: string) => {
    if (categoryId === 'goods') {
      // 物品の場合はサブカテゴリー選択ページに遷移
      setProductData({ ...productData, category: categoryId })
      router.push('/settings/products/create/goods?category=goods')
    } else if (categoryId === 'art') {
      // アートの場合はサブカテゴリー選択ページに遷移
      setProductData({ ...productData, category: categoryId })
      router.push('/settings/products/create/art?category=art')
    } else {
      // その他のカテゴリーは直接商品名入力ページに遷移
      setProductData({ ...productData, category: categoryId })
      router.push(`/settings/products/create/details?category=${categoryId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ヘッダー */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/settings/products')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">新規出品</h1>
                <p className="text-white/70">商品のカテゴリーを選択してください</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategorySelect(category.id)}
              className="group p-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${category.color} text-white`}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {category.name}
                  </h3>
                </div>
              </div>
              <div className="text-white/60 text-sm">
                {category.id === 'goods' && '詳細なサブカテゴリーから選択できます'}
                {category.id !== 'goods' && 'このカテゴリーで商品を出品します'}
              </div>
            </button>
          ))}
        </div>

        {/* ヒント */}
        <div className="mt-12">
          <div className="bg-white/5 rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">出品のヒント</h3>
            <p className="text-white/70">
              商品の種類に応じて適切なカテゴリーを選択してください。
              物品カテゴリーでは、より詳細なサブカテゴリーから選択できます。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 