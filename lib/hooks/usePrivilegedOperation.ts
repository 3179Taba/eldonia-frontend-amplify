import { useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

type OperationType = 'manage_users' | 'view_analytics' | 'manage_content' | 'manage_billing' | 'export_data'

interface PrivilegedOperationResult<T = any> {
  data: T | null
  error: string | null
  loading: boolean
}

interface PrivilegedOperationOptions {
  requireAdmin?: boolean
  requireSpecificRole?: string
  timeout?: number
}

export function usePrivilegedOperation() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 権限チェック
  const checkPermission = useCallback(async (operation: OperationType, options: PrivilegedOperationOptions = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('認証が必要です')
      }

      const userRole = session.user.app_metadata?.role
      
      // 開発中は管理者権限チェックを無効化
      console.log('開発モード: 管理者権限チェックをスキップします')
      
      // 管理者権限が必要な場合（本番環境では有効化）
      // if (options.requireAdmin && userRole !== 'admin') {
      //   throw new Error('管理者権限が必要です')
      // }

      // 特定のロールが必要な場合（本番環境では有効化）
      // if (options.requireSpecificRole && userRole !== options.requireSpecificRole) {
      //   throw new Error(`${options.requireSpecificRole}権限が必要です`)
      // }

      return true
    } catch (err) {
      console.error('権限チェックエラー:', err)
      throw err
    }
  }, [])

  // 特権操作の実行
  const executePrivilegedOperation = useCallback(async <T>(
    operation: OperationType,
    operationFn: () => Promise<T>,
    options: PrivilegedOperationOptions = {}
  ): Promise<PrivilegedOperationResult<T>> => {
    setLoading(true)
    setError(null)

    try {
      // 権限チェック
      await checkPermission(operation, options)

      // タイムアウト設定
      const timeout = options.timeout || 30000 // デフォルト30秒
      
      // 操作実行
      const result = await Promise.race([
        operationFn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('操作がタイムアウトしました')), timeout)
        )
      ])

      return {
        data: result,
        error: null,
        loading: false
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました'
      setError(errorMessage)
      
      return {
        data: null,
        error: errorMessage,
        loading: false
      }
    } finally {
      setLoading(false)
    }
  }, [checkPermission])

  // ユーザー管理
  const manageUsers = useCallback(async (action: 'list' | 'create' | 'update' | 'delete', data?: any) => {
    try {
      setLoading(true)
      setError(null)
      
      // 開発中はダミートークンを使用
      const token = 'dummy_token_for_development'
      
      const response = await fetch('http://127.0.0.1:8000/api/admin/users/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      return { data: result, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'ユーザー管理エラー'
      setError(errorMessage)
      return { data: null, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  // アナリティクス表示
  const viewAnalytics = useCallback(async (dateRange?: { start: string; end: string }) => {
    return executePrivilegedOperation(
      'view_analytics',
      async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const response = await fetch(`/api/admin/analytics?${new URLSearchParams(dateRange || {})}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        })

        if (!response.ok) {
          throw new Error(`アナリティクス取得エラー: ${response.statusText}`)
        }

        return await response.json()
      },
      { requireAdmin: true }
    )
  }, [executePrivilegedOperation])

  // コンテンツ管理
  const manageContent = useCallback(async (action: 'list' | 'create' | 'update' | 'delete', data?: any) => {
    return executePrivilegedOperation(
      'manage_content',
      async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const response = await fetch(`/api/admin/content`, {
          method: action === 'list' ? 'GET' : action === 'create' ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: action !== 'list' ? JSON.stringify(data) : undefined
        })

        if (!response.ok) {
          throw new Error(`コンテンツ管理エラー: ${response.statusText}`)
        }

        return await response.json()
      },
      { requireAdmin: true }
    )
  }, [executePrivilegedOperation])

  // 請求管理
  const manageBilling = useCallback(async (action: 'list' | 'update', data?: any) => {
    return executePrivilegedOperation(
      'manage_billing',
      async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const response = await fetch(`/api/admin/billing`, {
          method: action === 'list' ? 'GET' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: action !== 'list' ? JSON.stringify(data) : undefined
        })

        if (!response.ok) {
          throw new Error(`請求管理エラー: ${response.statusText}`)
        }

        return await response.json()
      },
      { requireAdmin: true }
    )
  }, [executePrivilegedOperation])

  // データエクスポート
  const exportData = useCallback(async (dataType: 'users' | 'analytics' | 'content', format: 'csv' | 'json' = 'json') => {
    return executePrivilegedOperation(
      'export_data',
      async () => {
        const { data: { session } } = await supabase.auth.getSession()
        const response = await fetch(`/api/admin/export?type=${dataType}&format=${format}`, {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`
          }
        })

        if (!response.ok) {
          throw new Error(`データエクスポートエラー: ${response.statusText}`)
        }

        return await response.json()
      },
      { requireAdmin: true }
    )
  }, [executePrivilegedOperation])

  return {
    loading,
    error,
    manageUsers,
    viewAnalytics,
    manageContent,
    manageBilling,
    exportData,
    checkPermission
  }
} 