import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const productId = resolvedParams.id

    // バックエンドAPIにリクエストを転送
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/products/${productId}/`, {
      method: 'GET',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      }
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      return NextResponse.json(errorData, { status: response.status })
    }
  } catch (error) {
    console.error('商品詳細取得APIエラー:', error)
    return NextResponse.json(
      { error: '商品の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
