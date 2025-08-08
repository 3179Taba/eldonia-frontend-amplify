'use client'

import { useState, useEffect } from 'react'
import { checkBucketExists, listBuckets, uploadFile } from '../lib/supabase-storage'

export default function TestSupabaseStoragePage() {
  const [buckets, setBuckets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  const [uploadResult, setUploadResult] = useState<any>(null)

  useEffect(() => {
    checkBuckets()
  }, [])

  const checkBuckets = async () => {
    setLoading(true)
    try {
      const result = await listBuckets()
      if (result.error) {
        setMessage(`バケット一覧取得エラー: ${result.error}`)
      } else {
        setBuckets(result.data)
        setMessage(`バケット一覧取得成功: ${result.data.length}個のバケット`)
      }
    } catch (error) {
      setMessage(`エラー: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testBucket = async (bucketName: string) => {
    setLoading(true)
    try {
      const exists = await checkBucketExists(bucketName)
      setMessage(`${bucketName}バケット: ${exists ? '存在します' : '存在しません'}`)
    } catch (error) {
      setMessage(`${bucketName}バケット確認エラー: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const result = await uploadFile({
        bucket: 'post-files',
        file,
        metadata: {
          test: true,
          uploaded_at: new Date().toISOString()
        }
      })

      setUploadResult(result)
      if (result.success) {
        setMessage(`アップロード成功: ${result.url}`)
      } else {
        setMessage(`アップロード失敗: ${result.error}`)
      }
    } catch (error) {
      setMessage(`アップロードエラー: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Storage テスト</h1>

        {/* バケット一覧 */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">バケット一覧</h2>
          <button
            onClick={checkBuckets}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
          >
            {loading ? '確認中...' : 'バケット一覧を更新'}
          </button>

          {buckets.length > 0 ? (
            <div className="space-y-4">
              {buckets.map((bucket) => (
                <div key={bucket.id} className="border rounded p-4">
                  <h3 className="font-semibold">{bucket.name}</h3>
                  <p>ID: {bucket.id}</p>
                  <p>Public: {bucket.public ? 'Yes' : 'No'}</p>
                  <p>File size limit: {bucket.file_size_limit} bytes</p>
                  <button
                    onClick={() => testBucket(bucket.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    存在確認
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">バケットが見つかりません</p>
          )}
        </div>

        {/* 個別バケットテスト */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">個別バケットテスト</h2>
          <div className="space-x-4">
            {['post-files', 'avatars', 'gallery', 'temp'].map((bucketName) => (
              <button
                key={bucketName}
                onClick={() => testBucket(bucketName)}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {bucketName}確認
              </button>
            ))}
          </div>
        </div>

        {/* アップロードテスト */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">アップロードテスト</h2>
          <input
            type="file"
            onChange={testUpload}
            disabled={loading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {uploadResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold">アップロード結果:</h3>
              <pre className="text-sm">{JSON.stringify(uploadResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  )
} 