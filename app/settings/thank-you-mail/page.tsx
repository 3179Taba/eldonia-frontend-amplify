'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Save, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../lib/auth-context'

interface ThankYouMailSettings {
  enabled: boolean
  subject: string
  content: string
  includeOrderDetails: boolean
  includeTrackingInfo: boolean
  customSignature: string
}

export default function ThankYouMailPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [settings, setSettings] = useState<ThankYouMailSettings>({
    enabled: true,
    subject: 'ご購入ありがとうございます！',
    content: `{{customer_name}} 様

この度はご購入いただき、誠にありがとうございます。

ご注文の商品は、通常2-3営業日以内に発送いたします。
発送完了時には、別途メールにてお知らせいたします。

商品到着まで今しばらくお待ちください。

ご不明な点がございましたら、お気軽にお問い合わせください。

今後ともよろしくお願いいたします。

{{seller_name}}`,
    includeOrderDetails: true,
    includeTrackingInfo: true,
    customSignature: ''
  })

  const [previewMode, setPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // ここでAPIに設定を保存
      console.log('サンキューメール設定を保存:', settings)
      alert('設定を保存しました')
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const getPreviewContent = () => {
    let content = settings.content
    content = content.replace(/\{\{customer_name\}\}/g, '田中太郎')
    content = content.replace(/\{\{seller_name\}\}/g, user?.first_name && user?.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user?.username || '出品者'
    )
    content = content.replace(/\{\{order_id\}\}/g, 'ORD-2024-001')
    content = content.replace(/\{\{product_name\}\}/g, 'サンプル商品')
    return content
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ヘッダー */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/settings/products/create/details')}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">サンキューメール設定</h1>
                <p className="text-white/70">購入者に送信するサンキューメールをカスタマイズ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* 設定セクション */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 左側：設定 */}
            <div className="space-y-6">
              {/* 基本設定 */}
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="h-5 w-5 text-magic-400" />
                  <h3 className="text-lg font-semibold text-white">基本設定</h3>
                </div>
                
                <div className="space-y-4">
                  {/* 有効/無効 */}
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                        className="w-4 h-4 text-magic-500 bg-white/10 border-white/20 rounded focus:ring-magic-500"
                      />
                      <span className="text-white text-sm">サンキューメールを有効にする</span>
                    </label>
                  </div>

                  {/* 件名 */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">メール件名</label>
                    <input
                      type="text"
                      value={settings.subject}
                      onChange={(e) => setSettings({ ...settings, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                      placeholder="メールの件名を入力"
                    />
                  </div>

                  {/* オプション設定 */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">オプション設定</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.includeOrderDetails}
                          onChange={(e) => setSettings({ ...settings, includeOrderDetails: e.target.checked })}
                          className="w-4 h-4 text-magic-500 bg-white/10 border-white/20 rounded focus:ring-magic-500"
                        />
                        <span className="text-white text-sm">注文詳細を含める</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={settings.includeTrackingInfo}
                          onChange={(e) => setSettings({ ...settings, includeTrackingInfo: e.target.checked })}
                          className="w-4 h-4 text-magic-500 bg-white/10 border-white/20 rounded focus:ring-magic-500"
                        />
                        <span className="text-white text-sm">追跡情報を含める</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* カスタム署名 */}
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">カスタム署名</h3>
                <textarea
                  value={settings.customSignature}
                  onChange={(e) => setSettings({ ...settings, customSignature: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  rows={3}
                  placeholder="カスタム署名を入力（空欄の場合はデフォルト署名が使用されます）"
                />
              </div>
            </div>

            {/* 右側：プレビュー */}
            <div className="space-y-6">
              {/* プレビュー */}
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">プレビュー</h3>
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                  >
                    {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {previewMode ? '編集モード' : 'プレビューモード'}
                  </button>
                </div>

                {previewMode ? (
                  <div className="bg-white text-gray-800 p-4 rounded-lg">
                    <div className="mb-4">
                      <div className="text-sm text-gray-500">件名: {settings.subject}</div>
                      <div className="text-sm text-gray-500">送信先: customer@example.com</div>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {getPreviewContent()}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">メール本文</label>
                    <textarea
                      value={settings.content}
                      onChange={(e) => setSettings({ ...settings, content: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                      rows={15}
                      placeholder="メールの本文を入力してください"
                    />
                    <div className="mt-2 text-xs text-white/50">
                      利用可能な変数: {'{{customer_name}}'}, {'{{order_id}}'}, {'{{seller_name}}'}, {'{{product_name}}'}
                    </div>
                  </div>
                )}
              </div>

              {/* テンプレート */}
              <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">テンプレート</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      subject: 'ご購入ありがとうございます！',
                      content: `{{customer_name}} 様

この度はご購入いただき、誠にありがとうございます。

ご注文の商品は、通常2-3営業日以内に発送いたします。
発送完了時には、別途メールにてお知らせいたします。

商品到着まで今しばらくお待ちください。

ご不明な点がございましたら、お気軽にお問い合わせください。

今後ともよろしくお願いいたします。

{{seller_name}}`
                    })}
                    className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <div className="text-white font-medium text-sm">シンプル版</div>
                    <div className="text-white/50 text-xs">基本的なサンキューメール</div>
                  </button>
                  <button
                    onClick={() => setSettings({
                      ...settings,
                      subject: '🎉 ご購入ありがとうございます！',
                      content: `{{customer_name}} 様

🎉 この度はご購入いただき、誠にありがとうございます！

✨ ご注文の商品は、通常2-3営業日以内に発送いたします。
📧 発送完了時には、別途メールにてお知らせいたします。

📦 商品到着まで今しばらくお待ちください。

❓ ご不明な点がございましたら、お気軽にお問い合わせください。

今後ともよろしくお願いいたします。

{{seller_name}}`
                    })}
                    className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <div className="text-white font-medium text-sm">絵文字版</div>
                    <div className="text-white/50 text-xs">絵文字を使った親しみやすいメール</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex space-x-4 pt-8 border-t border-white/20">
            <button
              onClick={() => router.push('/settings/products/create/details')}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              戻る
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-6 py-3 bg-magic-500 hover:bg-magic-600 disabled:bg-white/20 disabled:text-white/50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  設定を保存
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 