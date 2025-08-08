'use client'

import { useState } from 'react'
import { uploadFile, checkBucketExists, listBuckets } from '../lib/supabase-storage'

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [buckets, setBuckets] = useState<any[]>([])
  const [bucketExists, setBucketExists] = useState<boolean | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const checkBuckets = async () => {
    try {
      // バケット一覧を取得
      const { data, error } = await listBuckets()
      if (error) {
        console.error('バケット一覧取得エラー:', error)
        setBuckets([])
      } else {
        setBuckets(data || [])
        console.log('利用可能なバケット:', data)
      }

      // post-filesバケットの存在確認
      const exists = await checkBucketExists('post-files')
      setBucketExists(exists)
      console.log('post-filesバケット存在確認:', exists)
    } catch (error) {
      console.error('バケット確認エラー:', error)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      alert('ファイルを選択してください')
      return
    }

    setUploading(true)
    setResult(null)

    try {
      console.log('アップロード開始:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      const uploadResult = await uploadFile({
        bucket: 'post-files',
        file: file,
        path: 'test-uploads'
      })

      console.log('アップロード結果:', uploadResult)
      setResult(uploadResult)

    } catch (error) {
      console.error('アップロードエラー:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ファイルアップロードテスト</h1>
      
      <div className="mb-6">
        <button
          onClick={checkBuckets}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          バケット状況を確認
        </button>
      </div>

      {buckets.length > 0 && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">利用可能なバケット</h2>
          <ul className="list-disc list-inside">
            {buckets.map((bucket, index) => (
              <li key={index}>
                <strong>{bucket.name}</strong> - {bucket.public ? '公開' : '非公開'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {bucketExists !== null && (
        <div className="mb-6 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">post-filesバケット状況</h2>
          <p className={bucketExists ? 'text-green-600' : 'text-red-600'}>
            {bucketExists ? '✅ 存在します' : '❌ 存在しません'}
          </p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">ファイル選択</h2>
        <input
          type="file"
          onChange={handleFileChange}
          className="border border-gray-300 rounded px-3 py-2"
          accept="image/*,video/*,.pdf,.txt"
        />
        {file && (
          <div className="mt-2 text-sm text-gray-600">
            選択されたファイル: {file.name} ({file.size} bytes)
          </div>
        )}
      </div>

      <div className="mb-6">
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          {uploading ? 'アップロード中...' : 'アップロードテスト'}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded ${
          result.success ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'
        }`}>
          <h2 className="text-lg font-semibold mb-2">
            {result.success ? 'アップロード成功' : 'アップロード失敗'}
          </h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded">
        <h2 className="text-lg font-semibold mb-2">トラブルシューティング</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>「バケット状況を確認」ボタンをクリック</li>
          <li>post-filesバケットが存在するか確認</li>
          <li>ファイルを選択してアップロードテスト</li>
          <li>エラーメッセージを確認</li>
          <li>ブラウザの開発者ツールのコンソールも確認</li>
        </ol>
      </div>
    </div>
  )
} 