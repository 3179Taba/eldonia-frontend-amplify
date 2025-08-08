'use client'

import { useState } from 'react'
import { usePrivilegedOperation } from '../../../lib/hooks/usePrivilegedOperation'
import {
  Users,
  BarChart3,
  FileText,
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

export default function PrivilegedOperationExample() {
  const {
    loading,
    error,
    manageUsers,
    viewAnalytics,
    manageContent,
    manageBilling,
    exportData,
    checkPermission
  } = usePrivilegedOperation()

  const [results, setResults] = useState<any>({})
  const [permissionStatus, setPermissionStatus] = useState<Record<string, boolean>>({})

  // 権限チェック
  const checkAllPermissions = async () => {
    const operations = ['manage_users', 'view_analytics', 'manage_content', 'manage_billing', 'export_data'] as const

    const status: Record<string, boolean> = {}

    for (const operation of operations) {
      try {
        await checkPermission(operation, { requireAdmin: true })
        status[operation] = true
      } catch {
        status[operation] = false
      }
    }

    setPermissionStatus(status)
  }

  // ユーザー一覧取得
  const handleListUsers = async () => {
    const result = await manageUsers('list')
    setResults(prev => ({ ...prev, users: result }))
  }

  // アナリティクス取得
  const handleViewAnalytics = async () => {
    const result = await viewAnalytics({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30日前
      end: new Date().toISOString()
    })
    setResults(prev => ({ ...prev, analytics: result }))
  }

  // コンテンツ管理
  const handleManageContent = async () => {
    const result = await manageContent('list')
    setResults(prev => ({ ...prev, content: result }))
  }

  // 請求管理
  const handleManageBilling = async () => {
    const result = await manageBilling('list')
    setResults(prev => ({ ...prev, billing: result }))
  }

  // データエクスポート
  const handleExportData = async () => {
    const result = await exportData('users', 'json')
    setResults(prev => ({ ...prev, export: result }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          特権操作の例
        </h1>
        <p className="text-gray-600">
          管理者権限が必要な操作の実行例です。
        </p>
      </div>

      {/* 権限チェック */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">権限チェック</h2>
        <button
          onClick={checkAllPermissions}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          全権限をチェック
        </button>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(permissionStatus).map(([operation, hasPermission]) => (
            <div
              key={operation}
              className={`p-4 rounded-lg border ${
                hasPermission
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {hasPermission ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  {operation.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 特権操作ボタン */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">特権操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={handleListUsers}
            disabled={loading}
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Users className="w-5 h-5 text-blue-600" />
            <span>ユーザー一覧取得</span>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          </button>

          <button
            onClick={handleViewAnalytics}
            disabled={loading}
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span>アナリティクス表示</span>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          </button>

          <button
            onClick={handleManageContent}
            disabled={loading}
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FileText className="w-5 h-5 text-purple-600" />
            <span>コンテンツ管理</span>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          </button>

          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <CreditCard className="w-5 h-5 text-yellow-600" />
            <span>請求管理</span>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          </button>

          <button
            onClick={handleExportData}
            disabled={loading}
            className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5 text-orange-600" />
            <span>データエクスポート</span>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">エラー</span>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
        </div>
      )}

      {/* 結果表示 */}
      {Object.keys(results).length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">実行結果</h2>
          <div className="space-y-4">
            {Object.entries(results).map(([key, result]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="bg-white p-3 rounded border">
                  <pre className="text-sm text-gray-700 overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使用方法の説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          使用方法
        </h3>
        <div className="text-blue-800 space-y-2">
          <p>• 各操作は管理者権限が必要です</p>
          <p>• 権限がない場合はエラーメッセージが表示されます</p>
          <p>• 操作はタイムアウト（30秒）で制限されています</p>
          <p>• 結果は下部に表示されます</p>
        </div>
      </div>
    </div>
  )
}
