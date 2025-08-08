'use client'

import { useState } from 'react'
import { uploadFile, checkBucketExists, listBuckets } from '../lib/supabase-storage'

export default function TestUploadDummy() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [buckets, setBuckets] = useState<any[]>([])
  const [bucketExists, setBucketExists] = useState<boolean | null>(null)

  // ダミーファイルを作成する関数
  const createDummyFile = (type: 'text' | 'image' | 'video') => {
    let content = ''
    let fileName = ''
    let mimeType = ''

    switch (type) {
      case 'text':
        content = 'This is a test file for upload testing.\nCreated at: ' + new Date().toISOString()
        fileName = 'test-file.txt'
        mimeType = 'text/plain'
        break
      case 'image':
        // 1x1ピクセルの透明なPNG画像のBase64
        content = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        fileName = 'test-image.png'
        mimeType = 'image/png'
        break
      case 'video':
        // 最小限のMP4ファイル（実際には無効だが、テスト用）
        content = 'test video content'
        fileName = 'test-video.mp4'
        mimeType = 'video/mp4'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    return new File([blob], fileName, { type: mimeType })
  }

  const checkBuckets = async () => {
    try {
      console.log('バケット状況を確認中...')
      
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

  const handleUploadDummy = async (type: 'text' | 'image' | 'video') => {
    setUploading(true)
    setResult(null)

    try {
      const dummyFile = createDummyFile(type)
      
      console.log('ダミーファイル作成:', {
        fileName: dummyFile.name,
        fileSize: dummyFile.size,
        fileType: dummyFile.type
      })

      const uploadResult = await uploadFile({
        bucket: 'post-files',
        file: dummyFile,
        path: 'dummy-test'
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
      <h1 className="text-2xl font-bold mb-6">ダミーファイルアップロードテスト</h1>
      
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
        <h2 className="text-lg font-semibold mb-2">ダミーファイルアップロードテスト</h2>
        <div className="space-y-2">
          <button
            onClick={() => handleUploadDummy('text')}
            disabled={uploading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 mr-2"
          >
            {uploading ? 'アップロード中...' : 'テキストファイル'}
          </button>
          
          <button
            onClick={() => handleUploadDummy('image')}
            disabled={uploading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400 mr-2"
          >
            {uploading ? 'アップロード中...' : '画像ファイル'}
          </button>
          
          <button
            onClick={() => handleUploadDummy('video')}
            disabled={uploading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {uploading ? 'アップロード中...' : '動画ファイル'}
          </button>
        </div>
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
        <h2 className="text-lg font-semibold mb-2">テスト手順</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>「バケット状況を確認」ボタンをクリック</li>
          <li>post-filesバケットが存在するか確認</li>
          <li>任意のダミーファイルボタンをクリック</li>
          <li>アップロード結果を確認</li>
          <li>ブラウザの開発者ツールのコンソールも確認</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
        <h2 className="text-lg font-semibold mb-2">注意事項</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>ダミーファイルは実際のファイルではありません</li>
          <li>テスト用の小さなファイルです</li>
          <li>エラーメッセージを詳しく確認してください</li>
          <li>コンソールログも確認してください</li>
        </ul>
      </div>
    </div>
  )
} 