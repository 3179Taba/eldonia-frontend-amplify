# 特権操作フック (usePrivilegedOperation)

## 概要

`usePrivilegedOperation` は、管理者権限が必要な操作を安全に実行するためのカスタムフックです。権限チェック、タイムアウト制御、エラーハンドリングを統合して提供します。

## 機能

- **権限チェック**: 操作実行前にユーザーの権限を確認
- **タイムアウト制御**: 長時間の操作を防止（デフォルト30秒）
- **エラーハンドリング**: 統一されたエラー処理
- **型安全性**: TypeScriptによる型チェック
- **セキュリティ**: 管理者権限の強制チェック

## 使用方法

### 基本的な使用例

```typescript
import { usePrivilegedOperation } from '../lib/hooks/usePrivilegedOperation'

function AdminComponent() {
  const {
    loading,
    error,
    manageUsers,
    viewAnalytics,
    checkPermission
  } = usePrivilegedOperation()

  // ユーザー一覧取得
  const handleListUsers = async () => {
    const result = await manageUsers('list')
    if (result.error) {
      console.error('エラー:', result.error)
      return
    }
    console.log('ユーザー一覧:', result.data)
  }

  // アナリティクス取得
  const handleViewAnalytics = async () => {
    const result = await viewAnalytics({
      start: '2024-01-01',
      end: '2024-12-31'
    })
    if (result.error) {
      console.error('エラー:', result.error)
      return
    }
    console.log('アナリティクス:', result.data)
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleListUsers} disabled={loading}>
        {loading ? '読み込み中...' : 'ユーザー一覧取得'}
      </button>
    </div>
  )
}
```

### 権限チェック

```typescript
const { checkPermission } = usePrivilegedOperation()

// 管理者権限チェック
const checkAdminPermission = async () => {
  try {
    await checkPermission('manage_users', { requireAdmin: true })
    console.log('管理者権限があります')
  } catch (err) {
    console.error('権限がありません:', err.message)
  }
}

// 特定のロールチェック
const checkSpecificRole = async () => {
  try {
    await checkPermission('view_analytics', { requireSpecificRole: 'analyst' })
    console.log('アナリスト権限があります')
  } catch (err) {
    console.error('権限がありません:', err.message)
  }
}
```

### カスタム操作

```typescript
const { executeCustomOperation } = usePrivilegedOperation()

// カスタム特権操作
const handleCustomOperation = async () => {
  const result = await executeCustomOperation(
    'manage_content',
    async () => {
      // カスタム操作の実装
      const response = await fetch('/api/admin/custom', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      return response.json()
    },
    { requireAdmin: true, timeout: 60000 } // 60秒タイムアウト
  )

  if (result.error) {
    console.error('カスタム操作エラー:', result.error)
    return
  }

  console.log('カスタム操作結果:', result.data)
}
```

## 利用可能な操作

### 1. ユーザー管理 (manageUsers)

```typescript
// ユーザー一覧取得
const result = await manageUsers('list')

// ユーザー作成
const result = await manageUsers('create', {
  username: 'newuser',
  email: 'user@example.com',
  password: 'password123'
})

// ユーザー更新
const result = await manageUsers('update', {
  userId: 123,
  data: { is_active: false }
})

// ユーザー削除
const result = await manageUsers('delete', { userId: 123 })
```

### 2. アナリティクス表示 (viewAnalytics)

```typescript
// 期間指定でアナリティクス取得
const result = await viewAnalytics({
  start: '2024-01-01T00:00:00Z',
  end: '2024-12-31T23:59:59Z'
})
```

### 3. コンテンツ管理 (manageContent)

```typescript
// コンテンツ一覧取得
const result = await manageContent('list')

// コンテンツ作成
const result = await manageContent('create', {
  title: '新しいコンテンツ',
  content: 'コンテンツの内容'
})

// コンテンツ更新
const result = await manageContent('update', {
  contentId: 456,
  data: { title: '更新されたタイトル' }
})

// コンテンツ削除
const result = await manageContent('delete', { contentId: 456 })
```

### 4. 請求管理 (manageBilling)

```typescript
// 請求一覧取得
const result = await manageBilling('list')

// 請求更新
const result = await manageBilling('update', {
  billingId: 789,
  data: { status: 'paid' }
})
```

### 5. データエクスポート (exportData)

```typescript
// JSON形式でユーザーデータエクスポート
const result = await exportData('users', 'json')

// CSV形式でアナリティクスエクスポート
const result = await exportData('analytics', 'csv')

// JSON形式でコンテンツエクスポート
const result = await exportData('content', 'json')
```

## オプション設定

### PrivilegedOperationOptions

```typescript
interface PrivilegedOperationOptions {
  requireAdmin?: boolean        // 管理者権限が必要
  requireSpecificRole?: string  // 特定のロールが必要
  timeout?: number             // タイムアウト時間（ミリ秒）
}
```

### 使用例

```typescript
// 管理者権限が必要な操作
const result = await executeCustomOperation(
  'manage_users',
  operationFn,
  { requireAdmin: true }
)

// 特定のロールが必要な操作
const result = await executeCustomOperation(
  'view_analytics',
  operationFn,
  { requireSpecificRole: 'analyst' }
)

// カスタムタイムアウト設定
const result = await executeCustomOperation(
  'export_data',
  operationFn,
  { requireAdmin: true, timeout: 120000 } // 2分
)
```

## エラーハンドリング

### エラーの種類

1. **認証エラー**: ユーザーがログインしていない
2. **権限エラー**: 必要な権限がない
3. **タイムアウトエラー**: 操作が時間内に完了しない
4. **ネットワークエラー**: API通信エラー
5. **サーバーエラー**: サーバー側のエラー

### エラー処理例

```typescript
const handleOperation = async () => {
  const result = await manageUsers('list')
  
  if (result.error) {
    switch (result.error) {
      case '認証が必要です':
        // ログイン画面にリダイレクト
        router.push('/login')
        break
      case '管理者権限が必要です':
        // 権限エラーメッセージ表示
        showError('管理者権限が必要です')
        break
      case '操作がタイムアウトしました':
        // タイムアウトエラーメッセージ表示
        showError('操作がタイムアウトしました。再度お試しください。')
        break
      default:
        // その他のエラー
        showError(result.error)
    }
    return
  }
  
  // 成功時の処理
  console.log('操作成功:', result.data)
}
```

## セキュリティ考慮事項

1. **権限チェック**: すべての操作で権限チェックを実行
2. **タイムアウト**: 長時間の操作を防止
3. **エラーメッセージ**: 機密情報を含まないエラーメッセージ
4. **トークン管理**: 適切なトークン管理と更新
5. **ログ記録**: 重要な操作のログ記録

## ベストプラクティス

1. **常にエラーハンドリング**: すべての操作でエラーをチェック
2. **適切な権限設定**: 必要最小限の権限のみ付与
3. **ユーザーフィードバック**: 操作状況をユーザーに通知
4. **ローディング状態**: 長時間の操作にはローディング表示
5. **型安全性**: TypeScriptの型チェックを活用

## トラブルシューティング

### よくある問題

1. **"認証が必要です" エラー**
   - ユーザーがログインしているか確認
   - トークンが有効か確認

2. **"管理者権限が必要です" エラー**
   - ユーザーに管理者権限が付与されているか確認
   - Supabaseのロール設定を確認

3. **"操作がタイムアウトしました" エラー**
   - ネットワーク接続を確認
   - タイムアウト時間を延長

4. **API通信エラー**
   - サーバーが起動しているか確認
   - 環境変数が正しく設定されているか確認 