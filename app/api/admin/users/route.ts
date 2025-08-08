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
  console.error('')
  console.error('📝 .env.localファイルに以下の環境変数を設定してください:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
  console.error('SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key')
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

// GET: ユーザー一覧取得
export async function GET(request: NextRequest) {
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

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('ユーザー取得エラー:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error('API エラー:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: 管理者ユーザー作成
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { email, password, role = 'user' } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role }
    })

    if (error) {
      console.error('ユーザー作成エラー:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      user: {
        id: user.id,
        email: user.email,
        role: user.app_metadata?.role || 'user',
        created_at: user.created_at
      }
    })
  } catch (error) {
    console.error('API エラー:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 