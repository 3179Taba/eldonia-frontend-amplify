import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('フロントエンドAPIルート: ギャラリーデータ取得開始')
    
    // URLパラメータを取得
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'all'
    const page = searchParams.get('page') || '1'
    const pageSize = searchParams.get('page_size') || '12'
    
    // バックエンドAPIのURLを環境変数から取得
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const apiUrl = `${backendUrl}/api/gallery/?category=${category}&page=${page}&page_size=${pageSize}`
    
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
    console.log('取得したギャラリーデータ件数:', data.items ? data.items.length : 'no items')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Backend API fetch error:', error)
    
    // エラー時は空のデータを返す
    return NextResponse.json({
      items: [],
      pagination: {
        current_page: 1,
        total_pages: 0,
        total_items: 0,
        page_size: 12,
        has_next: false,
        has_previous: false
      },
      filters: {
        category: 'all',
        available_categories: ['all', 'image', 'video', 'music']
      }
    }, { status: 200 })
  }
} 