'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface ProductData {
  category: string
  subCategory: string
  name: string
  price: number
  stock: number
  description: string
  images: File[]
}

export default function ArtSubCategoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get('category')
  
  const [productData, setProductData] = useState<ProductData>({
    category: category || '',
    subCategory: '',
    name: '',
    price: 0,
    stock: 1,
    description: '',
    images: []
  })

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

  const handleSubCategorySelect = (subCategoryId: string) => {
    setProductData({ ...productData, subCategory: subCategoryId })
    router.push(`/settings/products/create/details?category=${category}&subCategory=${subCategoryId}`)
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
                <h1 className="text-2xl font-bold text-white">アート・イラスト</h1>
                <p className="text-white/70">サブカテゴリーを選択してください</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artSubCategories.map((subCategory) => (
            <button
              key={subCategory.id}
              onClick={() => handleSubCategorySelect(subCategory.id)}
              className="group relative bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40"
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{subCategory.icon}</div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white group-hover:text-white">
                    {subCategory.name}
                  </h3>
                </div>
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 