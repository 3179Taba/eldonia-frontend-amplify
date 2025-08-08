import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('フロントエンドAPIルート: 投稿作成開始')
    
    const body = await request.json()
    console.log('リクエストボディ:', body)
    
    // バックエンドAPIのURLを環境変数から取得
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const apiUrl = `${backendUrl}/api/posts/create/`
    
    console.log('バックエンドAPI URL:', apiUrl)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('バックエンドAPIレスポンス:', response.status, response.ok)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Backend API error: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    console.log('作成された投稿データ:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Backend API fetch error:', error)
    
    // エラー時は500を返す
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
} 