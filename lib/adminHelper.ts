import { supabase } from './supabaseClient'

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
}

/**
 * 現在のユーザーが管理者かどうかをチェックする
 */
export const checkIsAdmin = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return false
    }

    return session.user.app_metadata?.role === 'admin'
  } catch (error) {
    console.error('管理者権限チェックエラー:', error)
    return false
  }
}

/**
 * 管理者ユーザー一覧を取得する（サーバーサイドAPI経由）
 */
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    // サーバーサイドAPIを使用
    const response = await fetch('/api/admin/users', {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.users || []
  } catch (error) {
    console.error('管理者ユーザー取得エラー:', error)
    return []
  }
}

/**
 * 管理者アカウントを作成する（サーバーサイドAPI経由）
 */
export const createAdminUser = async (email: string, password: string): Promise<AdminUser | null> => {
  try {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role: 'admin' }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error('管理者ユーザー作成エラー:', error)
    return null
  }
}

/**
 * ユーザーを管理者に昇格する（サーバーサイドAPI経由）
 */
export const promoteToAdmin = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/admin/users/${userId}/promote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('管理者昇格エラー:', error)
    return false
  }
}

/**
 * 管理者権限を削除する（サーバーサイドAPI経由）
 */
export const demoteFromAdmin = async (userId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/admin/users/${userId}/demote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error('管理者権限削除エラー:', error)
    return false
  }
}

/**
 * デフォルトの管理者アカウントを作成する（開発用）
 */
export const createDefaultAdmin = async (): Promise<AdminUser | null> => {
  const defaultEmail = 'admin@eldonia.com'
  const defaultPassword = 'admin123'

  try {
    // 既存のユーザーをチェック
    const existingUsers = await getAdminUsers()
    const existingAdmin = existingUsers.find(user => 
      user.email === defaultEmail && user.role === 'admin'
    )

    if (existingAdmin) {
      console.log('デフォルト管理者アカウントは既に存在します')
      return existingAdmin
    }

    // 新しい管理者アカウントを作成
    console.log('デフォルト管理者アカウントを作成中...')
    return await createAdminUser(defaultEmail, defaultPassword)
  } catch (error) {
    console.error('デフォルト管理者作成エラー:', error)
    return null
  }
} 