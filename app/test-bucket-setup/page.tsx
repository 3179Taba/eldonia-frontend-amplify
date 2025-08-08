'use client'

import React, { useState, useEffect } from 'react'
import { checkBucketExists, createBucket, listBuckets, checkStorageEnabled } from '../../app/lib/supabase-storage'
import { supabase } from '../../lib/supabaseClient'

// 環境変数のデバッグ情報を表示
const debugSupabaseConfig = () => {
  console.log('=== Supabase設定デバッグ ===')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '設定済み' : '未設定')
  console.log('========================')
}

export default function TestBucketSetup() {
  const [buckets, setBuckets] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [storageEnabled, setStorageEnabled] = useState<boolean | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  const requiredBuckets = ['post-files', 'avatars', 'gallery', 'temp']

  useEffect(() => {
    debugSupabaseConfig()
    checkAuthStatus()
    checkStorageStatus()
    loadBuckets()
  }, [])

  const checkAuthStatus = async () => {
    console.log('認証状態を確認中...')
    
    // 現在のセッションを取得
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('セッション取得エラー:', error)
      setIsAuthenticated(false)
      return
    }
    
    if (session) {
      console.log('ユーザーがログイン中:', session.user.email)
      console.log('アクセストークン:', session.access_token ? 'あり' : 'なし')
      setUser(session.user)
      setIsAuthenticated(true)
    } else {
      console.log('ユーザーがログインしていません')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const checkStorageStatus = async () => {
    console.log('Storageサービスの状態を確認中...')
    const { enabled, error } = await checkStorageEnabled()
    setStorageEnabled(enabled)
    if (!enabled) {
      console.error('Storageサービスが無効:', error)
    }
  }

  const handleLogin = async () => {
    setLoading(true)
    setMessage('ログイン中...')
    
    try {
      console.log('匿名ログインを開始...')
      
      // 匿名ログインを試行
      const { data, error } = await supabase.auth.signInAnonymously()
      
      if (error) {
        console.error('匿名ログインエラー:', {
          message: error.message,
          name: error.name,
          details: error
        })
        setMessage(`ログインエラー: ${error.message}\n\n詳細: コンソールを確認してください`)
      } else {
        console.log('匿名ログイン成功:', {
          user: data.user,
          session: data.session
        })
        setUser(data.user)
        setIsAuthenticated(true)
        setMessage('匿名ログインに成功しました\n\nユーザーID: ' + data.user.id)
        
        // ログイン後にStorage状態を再確認
        console.log('ログイン後のStorage状態を確認中...')
        await checkStorageStatus()
        await loadBuckets()
      }
    } catch (error) {
      console.error('ログイン中に例外が発生:', {
        error,
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        message: error instanceof Error ? error.message : String(error)
      })
      setMessage(`予期しないエラー: ${error instanceof Error ? error.message : String(error)}\n\n詳細: コンソールを確認してください`)
    }
    
    setLoading(false)
  }

  const loadBuckets = async () => {
    setLoading(true)
    setMessage('バケット一覧を取得中...')
    try {
      console.log('バケット一覧取得を開始...')
      const { data, error } = await listBuckets()
      if (error) {
        console.error('バケット一覧取得エラー:', error)
        setMessage(`エラー: ${error}\n\n詳細: コンソールを確認してください`)
      } else {
        setBuckets(data)
        setMessage(`バケット一覧を取得しました: ${data.length}個\n\n取得したバケット: ${data.map(b => b.name).join(', ')}`)
      }
    } catch (error) {
      console.error('バケット一覧取得で例外が発生:', error)
      setMessage(`予期しないエラー: ${error instanceof Error ? error.message : String(error)}\n\n詳細: コンソールを確認してください`)
    }
    setLoading(false)
  }

  const createRequiredBuckets = async () => {
    setLoading(true)
    setMessage('必要なバケットを作成中...')
    
    const results = []
    for (const bucketName of requiredBuckets) {
      console.log(`バケット ${bucketName} を処理中...`)
      const exists = await checkBucketExists(bucketName)
      if (!exists) {
        console.log(`バケット ${bucketName} を作成中...`)
        const result = await createBucket(bucketName)
        results.push({ bucket: bucketName, success: result.success, error: result.error })
        console.log(`バケット ${bucketName} 作成結果:`, result)
      } else {
        console.log(`バケット ${bucketName} は既に存在します`)
        results.push({ bucket: bucketName, success: true, message: '既に存在' })
      }
    }
    
    const successCount = results.filter(r => r.success).length
    const errorDetails = results.filter(r => !r.success).map(r => `${r.bucket}: ${r.error}`).join('\n')
    
    setMessage(`バケット作成完了: ${successCount}/${results.length}個成功\n\n${errorDetails ? `エラー詳細:\n${errorDetails}` : ''}`)
    await loadBuckets()
    setLoading(false)
  }

  const checkBucket = async (bucketName: string) => {
    console.log(`バケット ${bucketName} の存在確認を開始...`)
    const exists = await checkBucketExists(bucketName)
    console.log(`バケット ${bucketName} 存在確認結果:`, exists)
    setMessage(`バケット ${bucketName}: ${exists ? '存在します' : '存在しません'}`)
  }

  return (
    <div className="container mx-auto p-6 text-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Supabase Storage バケット設定テスト</h1>
      
      {/* Supabase設定状態の表示 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="text-lg font-semibold mb-2 text-blue-900">Supabase設定状態</h2>
        <div className="space-y-2 text-sm">
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '未設定'}</p>
          <p><strong>ANON KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '設定済み' : '未設定'}</p>
          <p><strong>設定状態:</strong> 
            {process.env.NEXT_PUBLIC_SUPABASE_URL && 
             process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && 
             process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_anon_key_here' ? 
              <span className="text-green-600">✓ 正しく設定済み</span> : 
              <span className="text-red-600">✗ 設定が必要</span>
            }
          </p>
        </div>
        {(!process.env.NEXT_PUBLIC_SUPABASE_URL || 
          process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co' ||
          !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_anon_key_here') && (
          <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>注意:</strong> Supabase設定が不完全です。.env.localファイルを作成して正しい値を設定してください。
            </p>
          </div>
        )}
        
        {/* Storageサービス状態の表示 */}
        <div className="mt-3 p-3 border rounded">
          <p className="text-sm">
            <strong>Storageサービス:</strong> 
            {storageEnabled === null ? (
              <span className="text-gray-600">確認中...</span>
            ) : storageEnabled ? (
              <span className="text-green-600">✓ 有効</span>
            ) : (
              <span className="text-red-600">✗ 無効</span>
            )}
          </p>
          {storageEnabled === false && (
            <p className="text-red-600 text-xs mt-1">
              Supabaseプロジェクトの設定でStorageサービスを有効にしてください。
              <br />
              また、StorageのRLSポリシーで匿名ユーザーのアクセスを許可する必要があります。
            </p>
          )}
        </div>
        
        {/* 認証状態の表示 */}
        <div className="mt-3 p-3 border rounded">
          <p className="text-sm">
            <strong>認証状態:</strong> 
            {isAuthenticated === null ? (
              <span className="text-gray-600">確認中...</span>
            ) : isAuthenticated ? (
              <span className="text-green-600">✓ ログイン済み</span>
            ) : (
              <span className="text-red-600">✗ 未ログイン</span>
            )}
          </p>
          {user && (
            <p className="text-xs text-gray-600 mt-1">
              ユーザーID: {user.id} {user.email && `(${user.email})`}
              <br />
              アクセストークン: {user.access_token ? '✓ あり' : '✗ なし'}
            </p>
          )}
          {isAuthenticated === false && (
            <p className="text-red-600 text-xs mt-1">
              Storage操作には認証が必要です。匿名ログインを試してください。
            </p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <button 
          onClick={loadBuckets}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
        >
          バケット一覧取得
        </button>
        
        <button 
          onClick={createRequiredBuckets}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          必要なバケットを作成
        </button>
        
        <button 
          onClick={checkStorageStatus}
          disabled={loading}
          className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-2"
        >
          Storage状態を再確認
        </button>
        
        {isAuthenticated === false && (
          <button 
            onClick={handleLogin}
            disabled={loading}
            className="bg-orange-500 text-white px-4 py-2 rounded disabled:opacity-50 ml-2"
          >
            匿名ログイン
          </button>
        )}
        
        {isAuthenticated === false && (
          <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>注意:</strong> 匿名認証が有効になっていない可能性があります。
              <br />
              Supabaseプロジェクトの設定で以下を確認してください：
              <br />
              1. Authentication → Settings → Auth Providers → Email → Enable anonymous sign-ins
              <br />
              2. Storage → Settings → Enable Row Level Security (RLS)
            </p>
          </div>
        )}
        
        {/* RLSポリシー設定の案内 */}
        <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded">
          <p className="text-blue-800 text-sm">
            <strong>RLSポリシー設定が必要:</strong>
            <br />
            StorageApiErrorが発生している場合は、Supabase DashboardのSQL Editorで以下を実行してください：
            <br />
            <code className="bg-gray-200 px-2 py-1 rounded text-xs">
              CREATE POLICY "Allow anonymous bucket creation" ON storage.buckets FOR INSERT WITH CHECK (auth.role() = 'anon');
            </code>
            <br />
            詳細は <strong>SUPABASE_STORAGE_SETUP.md</strong> を参照してください。
          </p>
        </div>
      </div>

      {message && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <p className="text-gray-900 whitespace-pre-wrap">{message}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">必要なバケット</h2>
        <div className="grid grid-cols-2 gap-4">
          {requiredBuckets.map(bucket => (
            <div key={bucket} className="p-4 border rounded bg-white">
              <h3 className="font-medium text-gray-900">{bucket}</h3>
              <button 
                onClick={() => checkBucket(bucket)}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                存在確認
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900">現在のバケット一覧</h2>
        {loading ? (
          <p className="text-gray-900">読み込み中...</p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {buckets.map(bucket => (
              <div key={bucket.id} className="p-3 border rounded bg-white">
                <p className="text-gray-900"><strong>名前:</strong> {bucket.name}</p>
                <p className="text-gray-900"><strong>ID:</strong> {bucket.id}</p>
                <p className="text-gray-900"><strong>作成日:</strong> {new Date(bucket.created_at).toLocaleString()}</p>
                <p className="text-gray-900"><strong>公開:</strong> {bucket.public ? 'はい' : 'いいえ'}</p>
              </div>
            ))}
            {buckets.length === 0 && (
              <p className="text-gray-600">バケットが存在しません</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 