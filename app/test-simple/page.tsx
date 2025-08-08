'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function TestSimple() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setResult(null)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      console.log('環境変数確認:', {
        url: supabaseUrl,
        hasKey: !!supabaseKey,
        keyLength: supabaseKey?.length || 0
      })

      if (!supabaseUrl || !supabaseKey) {
        setResult({
          success: false,
          error: '環境変数が設定されていません'
        })
        return
      }

      const supabase = createClient(supabaseUrl, supabaseKey)

      // バケット一覧を取得
      console.log('バケット一覧を取得中...')
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      
      if (bucketsError) {
        console.error('バケット一覧取得エラー:', bucketsError)
        setResult({
          success: false,
          error: `バケット一覧取得エラー: ${bucketsError.message}`
        })
        return
      }

      console.log('バケット一覧:', buckets)

      // post-filesバケットの存在確認
      console.log('post-filesバケットを確認中...')
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket('post-files')
      
      if (bucketError) {
        console.error('post-filesバケット確認エラー:', bucketError)
        setResult({
          success: false,
          error: `post-filesバケット確認エラー: ${bucketError.message}`,
          buckets: buckets
        })
        return
      }

      console.log('post-filesバケット:', bucketData)

      setResult({
        success: true,
        buckets: buckets,
        postFilesBucket: bucketData
      })

    } catch (error) {
      console.error('テストエラー:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">シンプルなSupabase接続テスト</h1>
      
      <div className="mb-6">
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'テスト中...' : '接続テスト'}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded ${
          result.success ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'
        }`}>
          <h2 className="text-lg font-semibold mb-2">
            {result.success ? 'テスト成功' : 'テスト失敗'}
          </h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
        <h2 className="text-lg font-semibold mb-2">テスト内容</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>環境変数の確認</li>
          <li>Supabaseクライアントの作成</li>
          <li>バケット一覧の取得</li>
          <li>post-filesバケットの存在確認</li>
        </ol>
      </div>
    </div>
  )
} 