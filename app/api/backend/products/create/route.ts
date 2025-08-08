import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // FormDataを取得
    const formData = await request.formData()

    // 認証トークンを取得
    const authHeader = request.headers.get('authorization')

    console.log('商品作成リクエスト開始')
    console.log('認証ヘッダー:', authHeader ? '存在' : 'なし')
    console.log('FormData内容:', Object.fromEntries(formData.entries()))

    // FormDataの各エントリを詳細にログ出力
    console.log('=== FormData詳細 ===')
    for (const [key, value] of Array.from(formData.entries())) {
      console.log(`${key}:`, value)
    }
    console.log('==================')

    // Djangoバックエンドにリクエストを送信
    const response = await fetch(`http://localhost:8000/api/products/create/`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader || '',
      },
      body: formData
    })

    // レスポンスを取得
    const data = await response.json()

    console.log('バックエンドレスポンス:', {
      status: response.status,
      data: data
    })

    if (response.ok) {
      return NextResponse.json(data, { status: 200 })
    } else {
      console.error('バックエンドエラー:', data)
      return NextResponse.json(data, { status: response.status })
    }
  } catch (error) {
    console.error('商品作成エラー:', error)
    return NextResponse.json(
      { error: '商品作成中にエラーが発生しました', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
