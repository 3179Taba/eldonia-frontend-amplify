'use client'

import { usePrivilegedOperation } from './lib/hooks/usePrivilegedOperation'
import { useState } from 'react'

export default function TestPrivilegedHook() {
  const {
    loading,
    error,
    manageUsers,
    viewAnalytics,
    checkPermission
  } = usePrivilegedOperation()

  const [results, setResults] = useState<any>({})
  const [permissionResults, setPermissionResults] = useState<any>({})

  // 権限チェックテスト
  const testPermissions = async () => {
    const operations = ['manage_users', 'view_analytics', 'manage_content', 'manage_billing', 'export_data'] as const
    
    const results: any = {}
    
    for (const operation of operations) {
      try {
        await checkPermission(operation, { requireAdmin: true })
        results[operation] = { success: true, message: '権限があります' }
      } catch (err) {
        results[operation] = { 
          success: false, 
          message: err instanceof Error ? err.message : '不明なエラー' 
        }
      }
    }
    
    setPermissionResults(results)
  }

  // ユーザー管理テスト
  const testManageUsers = async () => {
    const result = await manageUsers('list')
    setResults(prev => ({ ...prev, manageUsers: result }))
  }

  // アナリティクステスト
  const testViewAnalytics = async () => {
    const result = await viewAnalytics({
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString()
    })
    setResults(prev => ({ ...prev, viewAnalytics: result }))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">特権操作フック テスト</h1>
      
      {/* 権限チェックテスト */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">権限チェックテスト</h2>
        <button
          onClick={testPermissions}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          権限チェック実行
        </button>
        
        {Object.keys(permissionResults).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(permissionResults).map(([operation, result]: [string, any]) => (
              <div
                key={operation}
                className={`p-3 rounded-lg ${
                  result.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="font-medium">{operation}</div>
                <div className="text-sm">{result.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 特権操作テスト */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">特権操作テスト</h2>
        <div className="space-y-4">
          <button
            onClick={testManageUsers}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '実行中...' : 'ユーザー管理テスト'}
          </button>
          
          <button
            onClick={testViewAnalytics}
            disabled={loading}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? '実行中...' : 'アナリティクステスト'}
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="font-medium text-red-800">エラー</div>
          <div className="text-red-700">{error}</div>
        </div>
      )}

      {/* 結果表示 */}
      {Object.keys(results).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">実行結果</h2>
          <div className="space-y-4">
            {Object.entries(results).map(([key, result]: [string, any]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">{key}</h3>
                <div className="bg-white p-3 rounded border">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 状態表示 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">フック状態</h2>
        <div className="space-y-2 text-sm">
          <div>Loading: {loading ? 'true' : 'false'}</div>
          <div>Error: {error || 'なし'}</div>
        </div>
      </div>
    </div>
  )
} 