import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    console.log('フロントエンドAPIルート: 個別投稿データ取得開始', resolvedParams.id)

    // バックエンドAPIのURLを環境変数から取得
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const apiUrl = `${backendUrl}/api/posts/${resolvedParams.id}/`

    console.log('バックエンドAPI URL:', apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log('バックエンドAPIレスポンス:', response.status, response.ok)

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('取得した投稿データ:', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Backend API fetch error:', error)

    // エラー時は404を返す
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
}
