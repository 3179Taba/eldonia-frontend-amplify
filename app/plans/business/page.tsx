'use client'

import Link from 'next/link'

const features = [
  '全ページの観覧・視聴',
  '商品購入',
  'イベント参加',
  'ユーザー紹介料の報酬',
  '作品の投稿・編集',
  '掲示板の新規話題',
  'イベント告知',
  'グループチャット',
  '企業へのアプローチ',
  '仕事探しマッチング',
  '商品の出品',
  '広告',
  '求人',
  '会議',
  '求人マッチング',
  '大量商品の出品',
  '在庫管理システム'
]

export default function BusinessPlanPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <h1 className="text-4xl font-bold text-white mb-6">Business プラン (¥3000〜/月)</h1>
      <ul className="list-disc list-inside text-lg text-gray-300 mb-8 space-y-1 max-w-2xl">
        {features.map((feature, idx) => (
          <li key={idx}>{feature}</li>
        ))}
      </ul>
      <Link
        href="/auth/signup?plan=Business"
        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
      >
        このプランで登録
      </Link>
    </div>
  )
} 