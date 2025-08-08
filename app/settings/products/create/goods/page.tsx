'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../../../../lib/auth-context'

interface ProductData {
  category: string
  subCategory: string
  name: string
  price: number
  stock: number
  description: string
  images: File[]
}

export default function GoodsSubCategoryPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [productData, setProductData] = useState<ProductData>({
    category: 'goods',
    subCategory: '',
    name: '',
    price: 0,
    stock: 1,
    description: '',
    images: []
  })

  // 物品サブカテゴリー
  const goodsSubCategories = [
    { id: 'accessories', name: 'アクセサリー', icon: '💍', description: 'ジュエリー、時計、バッグなど' },
    { id: 'clothing', name: '衣類', icon: '👕', description: '服、帽子、靴など' },
    { id: 'books', name: '書籍・雑誌', icon: '📚', description: '本、雑誌、マンガなど' },
    { id: 'stationery', name: '文房具', icon: '✏️', description: 'ペン、ノート、文具など' },
    { id: 'home', name: 'ホーム・インテリア', icon: '🏠', description: '家具、インテリア用品など' },
    { id: 'toys', name: 'おもちゃ・ゲーム', icon: '🎮', description: 'おもちゃ、ゲーム、フィギュアなど' },
    { id: 'sports', name: 'スポーツ用品', icon: '⚽', description: 'スポーツ用具、フィットネス用品など' },
    { id: 'beauty', name: '美容・コスメ', icon: '💄', description: '化粧品、スキンケア用品など' },
    { id: 'food', name: '食品・飲料', icon: '🍎', description: '食品、飲料、お菓子など' },
    { id: 'electronics', name: '電化製品', icon: '📱', description: 'スマホ、PC、家電など' },
    { id: 'other_goods', name: 'その他物品', icon: '📦', description: 'その他の物品' }
  ]

  const handleSubCategorySelect = (subCategoryId: string) => {
    setProductData({ ...productData, subCategory: subCategoryId })
    router.push(`/settings/products/create/details?category=goods&subCategory=${subCategoryId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ヘッダー */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/settings/products/create')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">物品の種類を選択</h1>
                <p className="text-white/70">物品の詳細カテゴリーを選択してください</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goodsSubCategories.map((subCategory) => (
            <button
              key={subCategory.id}
              onClick={() => handleSubCategorySelect(subCategory.id)}
              className="group p-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-all duration-300 text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl">
                  {subCategory.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-orange-300 transition-colors">
                    {subCategory.name}
                  </h3>
                </div>
              </div>
              <div className="text-white/60 text-sm">
                {subCategory.description}
              </div>
            </button>
          ))}
        </div>

        {/* ヒント */}
        <div className="mt-12">
          <div className="bg-white/5 rounded-lg p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-2">物品出品のヒント</h3>
            <p className="text-white/70">
              物品を出品する際は、適切なサブカテゴリーを選択することで、
              お客様が商品を見つけやすくなります。商品の性質に最も近いカテゴリーを選択してください。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 