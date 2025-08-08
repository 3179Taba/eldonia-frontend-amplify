import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 環境変数のチェック
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 環境変数が設定されていない場合のエラーハンドリング
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 必要な環境変数が設定されていません:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
}

// サーバーサイド用のSupabaseクライアント
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// 管理者権限チェック
const checkAdminAuth = async (request: NextRequest) => {
  if (!supabaseAdmin) {
    console.error('Supabaseクライアントが初期化されていません')
    return null
  }

  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  try {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return null
    }

    if (user.app_metadata?.role !== 'admin') {
      return null
    }

    return user
  } catch (error) {
    console.error('認証エラー:', error)
    return null
  }
}

// DELETE: ユーザー削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        error: 'Supabase configuration error. Please check environment variables.'
      }, { status: 500 })
    }

    const adminUser = await checkAdminAuth(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const userId = resolvedParams.id

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      console.error('ユーザー削除エラー:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API エラー:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
