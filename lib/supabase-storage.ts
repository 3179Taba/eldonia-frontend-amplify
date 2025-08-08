import { supabase } from './supabaseClient'

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

    // 認証状態を確認
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.warn('認証セッションが見つかりません。匿名アップロードを試行します。')
    } else {
      console.log('認証セッション確認:', { userId: session.user.id })
    }

    // ファイルタイプに応じた処理
    const processedFile = await processFileByType(file)

    // ファイル名のサニタイズ
    const fileName = sanitizeFileName(processedFile.name)
    const filePath = path ? `${path}/${fileName}` : fileName

    // ファイルのハッシュ値を計算
    const fileHash = await calculateFileHash(processedFile)

    // メタデータを設定
    const fileMetadata = {
      ...metadata,
      size: processedFile.size,
      mime_type: processedFile.type,
      hash: fileHash,
      uploaded_at: new Date().toISOString(),
      original_size: file.size, // 元のファイルサイズを保存
      processed: file.size !== processedFile.size, // 処理されたかどうかのフラグ
      user_id: session?.user?.id || 'anonymous' // ユーザーIDを追加
    }

    console.log('Supabase Storageにアップロード中...', { filePath, fileMetadata })

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, processedFile, {
        cacheControl: '3600',
        upsert: false,
        metadata: fileMetadata
      })

    if (error) {
      console.error('Supabase Storage エラー:', error)
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

// ファイルアップロード関数（FileUpload.tsxとの互換性のため）
export async function uploadToSupabase(
  file: File,
  bucket: string,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<{ id: string; file_url: string; file_type: string }> {
  try {
    console.log('uploadToSupabase開始:', { bucket, folder, fileName: file.name })

    // 環境変数のチェック
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co' ||
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key_here') {
      throw new Error('Supabase設定が不完全です。.env.localファイルを確認してください。')
    }

    // ファイル名の生成
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    console.log('Supabase Storageにアップロード中...', { filePath })

    // プログレスコールバック（簡易実装）
    if (onProgress) {
      onProgress(50); // 中間段階
    }

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      console.error('Supabase Storage エラー:', error)
      throw new Error(error.message || 'アップロードに失敗しました')
    }

    console.log('アップロード成功:', data)

    // プログレスコールバック
    if (onProgress) {
      onProgress(100);
    }

    // 公開URLを取得
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    console.log('公開URL取得:', urlData)

    return {
      id: data.path,
      file_url: urlData.publicUrl,
      file_type: file.type
    }

  } catch (error) {
    console.error('uploadToSupabase エラー:', error)
    throw error
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

  return `${sanitized.replace(/\.[^/.]+$/, '')}_${timestamp}_${uniqueId}.${ext}`
}

// ファイルハッシュ値の計算
async function calculateFileHash(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      const uint8Array = new Uint8Array(arrayBuffer)

      // 簡易的なハッシュ計算（実際の実装ではより安全な方法を使用）
      let hash = 0
      for (let i = 0; i < uint8Array.length; i++) {
        hash = ((hash << 5) - hash) + uint8Array[i]
        hash = hash & hash // 32bit整数に変換
      }

      resolve(hash.toString(16))
    }
    reader.readAsArrayBuffer(file)
  })
}

// ファイルサイズの検証
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}

// テキストファイルかどうかの判定
export function isTextFile(filename: string): boolean {
  const textExtensions = [
    '.txt', '.md', '.json', '.xml', '.html', '.htm', '.css', '.js', '.ts', '.jsx', '.tsx',
    '.py', '.java', '.cpp', '.c', '.h', '.php', '.rb', '.go', '.rs', '.swift', '.kt',
    '.sql', '.csv', '.log', '.ini', '.conf', '.yaml', '.yml', '.toml', '.env',
    '.sh', '.bat', '.ps1', '.bash', '.zsh', '.fish',
    '.tex', '.rst', '.adoc', '.wiki', '.org'
  ]

  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'))
  return textExtensions.includes(extension)
}

// ファイルタイプの検証
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

// ファイルタイプに応じた自動処理
export async function processFileByType(file: File): Promise<File> {
  const fileType = file.type.toLowerCase()

  try {
    // 画像ファイルの処理
    if (fileType.startsWith('image/')) {
      console.log('画像ファイルを処理中:', file.name)
      return await processImageFile(file)
    }

    // 音声ファイルの処理
    if (fileType.startsWith('audio/')) {
      console.log('音声ファイルを処理中:', file.name)
      return await processAudioFile(file)
    }

    // 動画ファイルの処理
    if (fileType.startsWith('video/')) {
      console.log('動画ファイルを処理中:', file.name)
      return await processVideoFile(file)
    }

    // テキストファイルの処理
    if (fileType.startsWith('text/') || isTextFile(file.name)) {
      console.log('テキストファイルを処理中:', file.name)
      return await processTextFile(file)
    }

    // その他のファイルは処理せずにそのまま返す
    console.log('その他のファイルタイプ:', fileType)
    return file

  } catch (error) {
    console.error('ファイル処理中にエラーが発生:', error)
    return file // エラーの場合は元のファイルを返す
  }
}

// 動画ファイルの処理
export async function processVideoFile(file: File): Promise<File> {
  return new Promise((resolve) => {
    try {
      // 動画ファイルの基本検証
      const video = document.createElement('video')
      video.preload = 'metadata'

      video.onloadedmetadata = () => {
        try {
          const duration = video.duration
          const width = video.videoWidth
          const height = video.videoHeight

          console.log('動画ファイル情報:', {
            duration,
            width,
            height,
            fileSize: file.size,
            fileType: file.type
          })

          // 動画ファイルの検証
          if (duration > 3600) { // 1時間以上の場合
            console.warn('動画ファイルが長すぎます（1時間以上）')
          }

          if (file.size > 100 * 1024 * 1024) { // 100MB以上の場合
            console.warn('動画ファイルサイズが大きすぎます（100MB以上）')
          }

          // 動画ファイルの基本処理（必要に応じて）
          // 実際の動画処理は重いため、基本検証のみ行う

          resolve(file)
        } catch (error) {
          console.error('動画ファイル処理エラー:', error)
          resolve(file) // エラーの場合は元のファイルを返す
        }
      }

      video.onerror = () => {
        console.error('動画ファイルの読み込みに失敗しました')
        resolve(file) // エラーの場合は元のファイルを返す
      }

      video.src = URL.createObjectURL(file)
    } catch (error) {
      console.error('動画ファイル処理エラー:', error)
      resolve(file) // エラーの場合は元のファイルを返す
    }
  })
}

// 音楽ファイルの処理
export async function processAudioFile(file: File): Promise<File> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio()
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      audio.onloadedmetadata = async () => {
        try {
          // 音声ファイルの基本情報を取得
          const duration = audio.duration
          const sampleRate = audioContext.sampleRate

          console.log('音声ファイル情報:', {
            duration,
            sampleRate,
            fileSize: file.size,
            fileType: file.type
          })

          // 音声ファイルの検証
          if (duration > 3600) { // 1時間以上の場合
            console.warn('音声ファイルが長すぎます（1時間以上）')
          }

          if (file.size > 50 * 1024 * 1024) { // 50MB以上の場合
            console.warn('音声ファイルサイズが大きすぎます（50MB以上）')
          }

          // 音声ファイルの基本処理（必要に応じて）
          // 実際の音声処理は重いため、基本検証のみ行う

          resolve(file)
        } catch (error) {
          console.error('音声ファイル処理エラー:', error)
          resolve(file) // エラーの場合は元のファイルを返す
        } finally {
          audioContext.close()
        }
      }

      audio.onerror = () => {
        console.error('音声ファイルの読み込みに失敗しました')
        audioContext.close()
        resolve(file) // エラーの場合は元のファイルを返す
      }

      audio.src = URL.createObjectURL(file)
    } catch (error) {
      console.error('音声ファイル処理エラー:', error)
      resolve(file) // エラーの場合は元のファイルを返す
    }
  })
}

// テキストファイルの処理
export async function processTextFile(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string

        console.log('テキストファイル情報:', {
          fileName: file.name,
          fileSize: file.size,
          contentLength: content.length,
          fileType: file.type
        })

        // テキストファイルの検証
        if (content.length > 1000000) { // 100万文字以上の場合
          console.warn('テキストファイルが大きすぎます（100万文字以上）')
        }

        // 文字エンコーディングの検出と正規化
        let processedContent = content

        // 改行コードの正規化（Windows, Mac, Unix）
        processedContent = processedContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

        // 不要な空白文字の削除（オプション）
        // processedContent = processedContent.replace(/\s+$/gm, '') // 行末の空白を削除

        // ファイルサイズが変更された場合のみ新しいファイルを作成
        if (processedContent !== content) {
          const processedFile = new File([processedContent], file.name, {
            type: file.type || 'text/plain',
            lastModified: file.lastModified
          })
          resolve(processedFile)
        } else {
          resolve(file)
        }

      } catch (error) {
        console.error('テキストファイル処理エラー:', error)
        resolve(file) // エラーの場合は元のファイルを返す
      }
    }

    reader.onerror = () => {
      console.error('テキストファイルの読み込みに失敗しました')
      resolve(file) // エラーの場合は元のファイルを返す
    }

    // テキストファイルとして読み込み
    reader.readAsText(file, 'utf-8')
  })
}

// 画像ファイルの処理（改善版）
export async function processImageFile(file: File): Promise<File> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        console.error('Canvas 2D contextが利用できません')
        resolve(file)
        return
      }

      const img = new Image()

      img.onload = () => {
        try {
          // 最大サイズを設定
          const maxSize = 2048
          let { width, height } = img

          // アスペクト比を保持してリサイズ
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height * maxSize) / width
              width = maxSize
            } else {
              width = (width * maxSize) / height
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height

          // 画像を描画
          ctx.drawImage(img, 0, 0, width, height)

          // 画像形式に応じて最適な品質を選択
          let mimeType = 'image/jpeg'
          let quality = 0.85

          if (file.type === 'image/png') {
            mimeType = 'image/png'
            quality = undefined // PNGの場合はqualityは無視
          } else if (file.type === 'image/webp') {
            mimeType = 'image/webp'
            quality = 0.85
          } else if (file.type === 'image/gif') {
            mimeType = 'image/gif'
            quality = undefined
          }

          // キャンバスからBlobを取得
          canvas.toBlob((blob) => {
            if (blob) {
              const processedFile = new File([blob], file.name, {
                type: mimeType,
                lastModified: file.lastModified
              })
              console.log('画像処理完了:', {
                originalSize: file.size,
                processedSize: processedFile.size,
                originalType: file.type,
                processedType: mimeType
              })
              resolve(processedFile)
            } else {
              console.error('画像のBlob生成に失敗しました')
              resolve(file)
            }
          }, mimeType, quality)
        } catch (error) {
          console.error('画像処理エラー:', error)
          resolve(file)
        }
      }

      img.onerror = () => {
        console.error('画像の読み込みに失敗しました')
        resolve(file)
      }

      img.src = URL.createObjectURL(file)
    } catch (error) {
      console.error('画像ファイル処理エラー:', error)
      resolve(file)
    }
  })
}
