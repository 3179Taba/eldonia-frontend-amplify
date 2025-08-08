import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('フロントエンドAPIルート: 投稿データ取得開始')

    // バックエンドAPIのURLを修正（Dockerでポート80で動作）
    const backendUrl = process.env.BACKEND_URL || 'http://localhost'
    const apiUrl = `${backendUrl}/api/gallery/`

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
    console.log('取得したデータ件数:', data.items ? data.items.length : 'no items property')

    // バックエンドのレスポンス形式をそのまま返す
    return NextResponse.json(data)
  } catch (error) {
    console.error('Backend API fetch error:', error)

    // エラー時は空のオブジェクトを返す
    return NextResponse.json({
      items: [],
      pagination: {
        current_page: 1,
        total_pages: 1,
        total_items: 0,
        page_size: 12,
        has_next: false,
        has_previous: false
      },
      filters: {
        category: "all",
        available_categories: ["all", "image", "video", "music"]
      }
    }, { status: 200 })
  }
}
