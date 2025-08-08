'use client'

import Link from 'next/link'

const features = ['全ページの観覧・視聴', '商品購入', 'イベント参加']

export default function FreePlanPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <h1 className="text-4xl font-bold text-white mb-6">Free プラン (無料)</h1>
      <ul className="list-disc list-inside text-lg text-gray-300 mb-8 space-y-1">
        {features.map((feature, idx) => (
          <li key={idx}>{feature}</li>
        ))}
      </ul>
      <Link
        href="/auth/signup?plan=Free"
        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg shadow-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
      >
        無料で登録
      </Link>
    </div>
  )
} 