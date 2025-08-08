'use client'

import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'

export default function TestStorage() {
  const [buckets, setBuckets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [config, setConfig] = useState<any>(null)

  useEffect(() => {
    const checkStorage = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        setConfig({
          url: supabaseUrl,
          hasKey: !!supabaseKey,
          keyLength: supabaseKey?.length || 0
        })

        if (!supabaseUrl || !supabaseKey) {
          setError('環境変数が設定されていません')
          setLoading(false)
          return
        }

        const supabase = createClient(supabaseUrl, supabaseKey)

        // バケット一覧を取得
        const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets()
        
        if (bucketsError) {
          setError(`バケット一覧取得エラー: ${bucketsError.message}`)
        } else {
          setBuckets(bucketsData || [])
        }

        // 特定のバケット名でテスト
        const testBucketNames = ['post-files', 'postfiles', 'post_files', 'files']
        
        for (const bucketName of testBucketNames) {
          try {
            const { data: files, error: listError } = await supabase.storage
              .from(bucketName)
              .list('', { limit: 1 })
            
            console.log(`バケット "${bucketName}":`, { files, error: listError })
          } catch (e) {
            console.log(`バケット "${bucketName}" テストエラー:`, e)
          }
        }

      } catch (err) {
        setError(`エラー: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    checkStorage()
  }, [])

  if (loading) {
    return <div className="p-8">読み込み中...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Storage テスト</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">設定情報</h2>
        <pre className="text-sm">{JSON.stringify(config, null, 2)}</pre>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h2 className="text-lg font-semibold mb-2">エラー</h2>
          <p>{error}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">存在するバケット一覧</h2>
        {buckets.length === 0 ? (
          <p className="text-gray-600">バケットが存在しません</p>
        ) : (
          <ul className="list-disc list-inside">
            {buckets.map((bucket, index) => (
              <li key={index} className="mb-1">
                <strong>{bucket.name}</strong> - {bucket.public ? '公開' : '非公開'}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">推奨バケット名</h2>
        <p className="text-gray-600 mb-2">以下のバケット名のいずれかを作成してください:</p>
        <ul className="list-disc list-inside">
          <li><code>post-files</code> (推奨)</li>
          <li><code>postfiles</code></li>
          <li><code>post_files</code></li>
          <li><code>files</code></li>
        </ul>
      </div>

      <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
        <h2 className="text-lg font-semibold mb-2">次のステップ</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Supabaseダッシュボードで「Storage」→「Buckets」を開く</li>
          <li>「New bucket」をクリック</li>
          <li>バケット名を <code>post-files</code> に設定</li>
          <li>「Public bucket」にチェックを入れる</li>
          <li>「Create bucket」をクリック</li>
          <li>このページを再読み込みして確認</li>
        </ol>
      </div>
    </div>
  )
} 