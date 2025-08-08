import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const productId = resolvedParams.id
    const formData = await request.formData()

    // バックエンドAPIにリクエストを転送
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/api/products/${productId}/update/`, {
      method: 'PUT',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: formData
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json(data)
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      return NextResponse.json(errorData, { status: response.status })
    }
  } catch (error) {
    console.error('商品更新APIエラー:', error)
    return NextResponse.json(
      { error: '商品の更新中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
