'use client'

import Link from 'next/link'

export default function TermsOfServicePage(){
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">利用規約</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-4 text-gray-800">
        <p>このページはEldonia Webの利用規約を掲載するためのプレースホルダーです。正式なドキュメントは現在準備中です。</p>
        <p>ご不明点は<a href="/support/contact" className="text-blue-600 underline">お問い合わせ</a>ページよりご連絡ください。</p>
      </div>
      <div className="mt-8">
        <Link href="/support" className="text-blue-600 underline">← サポート一覧へ戻る</Link>
      </div>
    </main>
  )
} 