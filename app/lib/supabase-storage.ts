import { supabase } from '../../lib/supabaseClient'

// デバッグ情報を出力
console.log('Supabase設定:', {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
})

// 環境変数の検証
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co') {
  console.warn('NEXT_PUBLIC_SUPABASE_URLが正しく設定されていません。.env.localファイルを確認してください。')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEYが正しく設定されていません。.env.localファイルを確認してください。')
}

// 共通のSupabaseクライアントを再エクスポート
export { supabase }

// ファイルアップロード用の型定義
export interface UploadFileOptions {
  bucket: 'post-files' | 'avatars' | 'gallery' | 'temp'
  file: File
  path?: string
  metadata?: Record<string, any>
}

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
  fileId?: string
}

// ファイルアップロード関数
export async function uploadFile({
  bucket,
  file,
  path,
  metadata = {}
}: UploadFileOptions): Promise<UploadResult> {
  try {
    console.log('アップロード開始:', { bucket, fileName: file.name, fileSize: file.size })

    // 環境変数のチェック
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co' ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
      return {
        success: false,
        error: 'Supabase設定が不完全です。.env.localファイルを確認してください。'
      }
    }

    // バケットの存在確認（簡素化）
    console.log(`バケット ${bucket} へのアップロードを試行します...`)

    // シンプルなファイル名生成（指定されたコードと同じ方式）
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    console.log('Supabase Storageにアップロード中...', { filePath })

    // Supabase Storageにアップロード（シンプルな方式）
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error('Supabase Storage エラー:', {
        message: error.message,
        details: error,
        name: error.name
      })
      return {
        success: false,
        error: error.message || 'アップロードに失敗しました'
      }
    }

    console.log('アップロード成功:', data)

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    console.log('公開URL取得:', urlData)

    return {
      success: true,
      url: urlData.publicUrl,
      fileId: data.path
    }

  } catch (error) {
    console.error('アップロード中にエラーが発生:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ファイル削除関数
export async function deleteFile(
  bucket: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return {
        success: false,
        error: error.message
      }
    }

    return { success: true }

  } catch (error) {
    console.error('Delete failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ファイル一覧取得関数
export async function listFiles(
  bucket: string,
  path?: string
): Promise<{ data: any[]; error?: string }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path || '')

    if (error) {
      console.error('List error:', error)
      return {
        data: [],
        error: error.message
      }
    }

    return { data: data || [] }

  } catch (error) {
    console.error('List failed:', error)
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// ファイル名のサニタイズ
function sanitizeFileName(filename: string): string {
  // 危険な文字を除去
  const dangerousChars = ['..', '/', '\\', ':', '*', '?', '"', '<', '>', '|']
  let sanitized = filename

  for (const char of dangerousChars) {
    sanitized = sanitized.replace(char, '_')
  }

  // ファイル名を短縮（最大50文字）
  const name = sanitized.split('.')[0]
  const ext = sanitized.split('.').pop() || ''

  if (name.length > 50) {
    sanitized = `${name.substring(0, 50)}.${ext}`
  }

  // ユニークなファイル名を生成
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const uniqueId = Math.random().toString(36).substring(2, 10)

  const nameWithoutExt = sanitized.split('.')[0]
  const extension = sanitized.split('.').pop() || ''

  return `${nameWithoutExt}_${timestamp}_${uniqueId}.${extension}`
}

// ファイルハッシュ計算
export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// ファイルサイズ検証
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

// ファイルタイプ検証
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

// 動画ファイル処理
export async function processVideoFile(file: File): Promise<File> {
  // 動画ファイルの前処理（必要に応じて実装）
  return file
}

// 画像ファイル処理
export async function processImageFile(file: File): Promise<File> {
  // 画像ファイルの前処理（必要に応じて実装）
  return file
}

// バケット作成関数
export async function createBucket(bucketName: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`バケット ${bucketName} を作成中...`)

    // Supabase設定の確認
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co') {
      console.error('Supabase URLが正しく設定されていません')
      return {
        success: false,
        error: 'Supabase URLが正しく設定されていません'
      }
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_anon_key_here') {
      console.error('Supabase ANON KEYが正しく設定されていません')
      return {
        success: false,
        error: 'Supabase ANON KEYが正しく設定されていません'
      }
    }

    // 認証ヘッダーを取得
    const authHeaders = await getAuthHeaders()
    console.log(`認証ヘッダー:`, authHeaders.Authorization ? '設定済み' : '未設定')

    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true, // 公開バケット
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*']
    })

    if (error) {
      console.error(`バケット ${bucketName} 作成エラー:`, {
        message: error.message,
        name: error.name,
        details: error
      })
      return {
        success: false,
        error: error.message
      }
    }

    console.log(`バケット ${bucketName} 作成成功:`, data)
    return { success: true }

  } catch (error) {
    console.error(`バケット ${bucketName} 作成失敗:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// バケット存在確認
export async function checkBucketExists(bucketName: string): Promise<boolean> {
  try {
    console.log(`バケット ${bucketName} の存在確認を開始...`)

    // Supabase設定の確認
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co') {
      console.error('Supabase URLが正しく設定されていません')
      return false
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_anon_key_here') {
      console.error('Supabase ANON KEYが正しく設定されていません')
      return false
    }

    // 認証ヘッダーを取得
    const authHeaders = await getAuthHeaders()
    console.log(`認証ヘッダー:`, authHeaders.Authorization ? '設定済み' : '未設定')

    console.log(`Supabase Storage APIを呼び出し中: getBucket(${bucketName})`)
    const { data, error } = await supabase.storage.getBucket(bucketName)

    if (error) {
      console.error(`バケット ${bucketName} の確認エラー:`, {
        message: error.message,
        name: error.name,
        details: error,
        errorType: error.constructor.name
      })

      // エラーの種類に応じた詳細メッセージ
      if (error.message.includes('400') || error.message.includes('not found')) {
        console.error(`バケット ${bucketName} が存在しないか、Storageサービスが有効になっていません`)
      } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
        console.error('認証エラー: APIキーが無効です')
      } else if (error.message.includes('403') || error.message.includes('forbidden')) {
        console.error('権限エラー: Storage操作の権限がありません')
      }

      return false
    }

    console.log(`バケット ${bucketName} が存在します:`, data)
    return true
  } catch (error) {
    console.error(`バケット ${bucketName} の確認中に例外が発生:`, {
      error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error)
    })
    return false
  }
}

// Storageサービスが有効かどうかを確認
export async function checkStorageEnabled(): Promise<{ enabled: boolean; error?: string }> {
  try {
    console.log('Storageサービスの有効性を確認中...')

    // 現在のセッションを確認
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.log('ユーザーがログインしていません。認証が必要です。')
      return {
        enabled: false,
        error: '認証が必要です。ユーザーがログインしていません。'
      }
    }

    console.log('認証済みユーザー:', session.user.email || session.user.id)
    console.log('アクセストークン:', session.access_token ? 'あり' : 'なし')

    // トークンの有効性を確認
    if (!session.access_token) {
      console.error('アクセストークンがありません')
      return {
        enabled: false,
        error: 'アクセストークンがありません。再ログインが必要です。'
      }
    }

    // 空のバケット一覧を取得してStorageサービスが有効かテスト
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('Storageサービス確認エラー:', {
        message: error.message,
        name: error.name,
        details: error
      })

      if (error.message.includes('400') || error.message.includes('not found')) {
        return {
          enabled: false,
          error: 'Storageサービスが有効になっていません。Supabaseプロジェクトの設定でStorageを有効にしてください。'
        }
      } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
        return {
          enabled: false,
          error: '認証エラー: ユーザーがログインしていないか、認証が無効です。'
        }
      } else if (error.message.includes('403') || error.message.includes('forbidden')) {
        return {
          enabled: false,
          error: '権限エラー: Storage操作の権限がありません。'
        }
      }

      return {
        enabled: false,
        error: error.message
      }
    }

    console.log('Storageサービスは有効です')
    return { enabled: true }

  } catch (error) {
    console.error('Storageサービス確認で例外が発生:', error)
    return {
      enabled: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// 認証トークンを取得してヘッダーに追加
async function getAuthHeaders(): Promise<{ Authorization?: string }> {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    return {
      Authorization: `Bearer ${session.access_token}`
    }
  }
  return {}
}

// 利用可能なバケット一覧取得
export async function listBuckets(): Promise<{ data: any[]; error?: string }> {
  try {
    console.log('バケット一覧取得を開始...')

    // Supabase設定の確認
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project-id.supabase.co') {
      console.error('Supabase URLが正しく設定されていません')
      return {
        data: [],
        error: 'Supabase URLが正しく設定されていません'
      }
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_anon_key_here') {
      console.error('Supabase ANON KEYが正しく設定されていません')
      return {
        data: [],
        error: 'Supabase ANON KEYが正しく設定されていません'
      }
    }

    // 認証ヘッダーを取得
    const authHeaders = await getAuthHeaders()
    console.log('認証ヘッダー:', authHeaders.Authorization ? '設定済み' : '未設定')

    console.log('Supabase Storage APIを呼び出し中...')
    const { data, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('バケット一覧取得エラー:', {
        message: error.message,
        name: error.name,
        details: error,
        errorType: error.constructor.name
      })

      // エラーの種類に応じた詳細メッセージ
      let errorMessage = error.message
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        errorMessage = '認証エラー: APIキーが無効です'
      } else if (error.message.includes('403') || error.message.includes('forbidden')) {
        errorMessage = '権限エラー: Storage操作の権限がありません'
      } else if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessage = 'リソースが見つかりません: Storageサービスが有効になっていない可能性があります'
      } else if (error.message.includes('500') || error.message.includes('server error')) {
        errorMessage = 'サーバーエラー: Supabase側で問題が発生しています'
      }

      return {
        data: [],
        error: errorMessage
      }
    }

    console.log('利用可能なバケット:', data)
    return { data: data || [] }
  } catch (error) {
    console.error('バケット一覧取得で例外が発生:', {
      error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error)
    })
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
