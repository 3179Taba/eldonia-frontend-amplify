'use client'

import Link from 'next/link'
import { Star, Crown, Zap, Gem } from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: '一般プラン',
    price: '無料',
    description: '基本的な閲覧機能を無料で利用',
    features: [
      '💻 画像・動画・音楽の視聴',
      '🎥 有料配信視聴（PPVのみ）',
      '🔔 フォロー通知受信',
      '💬 コミュニティチャット閲覧',
      '🌍 閲覧翻訳対応',
      '📈 ランキング閲覧',
      '🔗 紹介コード発行（1回10％）'
    ],
    icon: Star,
    color: 'from-gray-400 to-gray-600',
    buttonColor: 'from-gray-500 to-gray-700',
    popular: false
  },
  {
    id: 'standard',
    name: 'スタンダードプラン',
    price: '¥800/月',
    description: 'クリエーター活動を始める方に',
    features: [
      '💻 画像・動画・音楽の視聴',
      '🎨 作品投稿（GALLERY）',
      '🛒 商品販売（SHOP）',
      '🎥 有料配信視聴（PPV・メンバー視聴）',
      '🔔 投稿・配信通知管理',
      '💬 コミュニティチャット投稿＋翻訳',
      '🌍 投稿翻訳対応',
      '📁 ポートフォリオ（20作品まで）',
      '🧾 WORK応募・自己PR投稿',
      '📈 ランキング表示',
      '🎁 ポイント・バッジ',
      '🔗 紹介報酬（1人10％還元）',
      '✉️ DMメッセージ（制限あり）'
    ],
    icon: Crown,
    color: 'from-blue-400 to-blue-600',
    buttonColor: 'from-blue-500 to-blue-700',
    popular: true
  },
  {
    id: 'premium',
    name: 'プレミアムプラン',
    price: '¥1,500/月',
    description: '本格的なクリエーター活動に',
    features: [
      '💻 画像・動画・音楽の視聴',
      '🎨 作品投稿（GALLERY）',
      '🛒 商品販売（予約・限定販売可）',
      '📣 イベント告知（先行・限定イベント）',
      '🎥 有料配信視聴（分析付きメンバー管理）',
      '💰 有料配信開催（高度配信可）',
      '🔔 通知分析・予約通知',
      '💬 多言語翻訳・DM連携',
      '🌍 SEO翻訳監修・優先表示',
      '📁 ポートフォリオ（無制限＋シークレット）',
      '🧾 WORK応募・自己PR・AI推薦',
      '💼 WORK依頼（個人依頼投稿）',
      '✉️ DMメッセージ（無制限）',
      '📈 ランキング（ピックアップ・特集対象）',
      '📢 広告出稿枠（自己プロモ）',
      '🎁 特別称号・VIPバッジ',
      '🔗 紹介報酬（1人10％還元）'
    ],
    icon: Zap,
    color: 'from-purple-400 to-pink-600',
    buttonColor: 'from-purple-500 to-pink-700',
    popular: false
  },
  {
    id: 'business',
    name: 'ビジネスプラン',
    price: '¥10,000/月',
    description: '企業・プロフェッショナル向け',
    features: [
      '💻 画像・動画・音楽の視聴',
      '🎨 作品投稿（GALLERY）',
      '🛒 商品販売（無制限販売可）',
      '📣 イベント告知（主催・スポンサー可）',
      '🎥 有料配信視聴（分析付きメンバー管理）',
      '💰 有料配信開催（スポンサー配信可）',
      '🔔 一括通知配信',
      '💬 多言語翻訳・DM連携',
      '🌍 SEO翻訳監修・優先表示',
      '📁 ポートフォリオ（無制限＋企業実績表示）',
      '🧾 仕事依頼・スカウト',
      '💼 企業依頼・スカウト',
      '✉️ DMメッセージ（無制限）',
      '📈 ランキング（広告連携表示）',
      '📢 バナー広告・スポンサー出稿',
      '🎁 スポンサー・企業バッジ',
      '🔗 紹介報酬（1人10％還元）'
    ],
    icon: Gem,
    color: 'from-yellow-400 to-orange-500',
    buttonColor: 'from-yellow-500 to-orange-600',
    popular: false
  }
]

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* ヘッダー */}
      <div className="text-center pt-20 pb-12 px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          プランを選択
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          あなたのニーズに最適なプランをお選びください。
          どのプランでも無料トライアル期間があります。
        </p>
      </div>

      {/* プラン一覧 */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon
            return (
              <div
                key={plan.id}
                className={`relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300 ${
                  plan.popular ? 'ring-2 ring-blue-400 scale-105' : ''
                }`}
              >
                {/* 人気バッジ */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      人気
                    </span>
                  </div>
                )}

                {/* プランアイコン */}
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${plan.color} mb-3`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                  <p className="text-gray-400 text-sm mb-3">{plan.description}</p>
                  <div className="text-2xl font-bold text-white mb-2">{plan.price}</div>
                </div>

                {/* 機能一覧 */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-gray-300">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                      <span className="text-xs leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 登録ボタン */}
                <Link
                  href={`/auth/signup?plan=${plan.id.charAt(0).toUpperCase() + plan.id.slice(1)}`}
                  className={`block w-full py-2 px-4 rounded-lg font-semibold text-center transition-all duration-300 bg-gradient-to-r ${plan.buttonColor} text-white hover:shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1 text-sm`}
                >
                  {plan.id === 'free' ? '無料で登録' : 'このプランで登録'}
                </Link>
              </div>
            )
          })}
        </div>

        {/* 機能比較表 */}
        <div className="mt-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 overflow-x-auto">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">機能比較表</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white font-semibold">機能カテゴリ</th>
                  <th className="text-center py-3 px-2 text-white font-semibold">一般プラン<br/><span className="text-gray-400">（無料）</span></th>
                  <th className="text-center py-3 px-2 text-white font-semibold">スタンダード<br/><span className="text-gray-400">（¥800/月）</span></th>
                  <th className="text-center py-3 px-2 text-white font-semibold">プレミアム<br/><span className="text-gray-400">（¥1,500/月）</span></th>
                  <th className="text-center py-3 px-2 text-white font-semibold">ビジネス<br/><span className="text-gray-400">（¥10,000/月）</span></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <td className="py-2 px-4 text-white">💻 閲覧機能</td>
                  <td className="text-center py-2 px-2 text-green-400">○</td>
                  <td className="text-center py-2 px-2 text-green-400">○</td>
                  <td className="text-center py-2 px-2 text-green-400">○</td>
                  <td className="text-center py-2 px-2 text-green-400">○</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2 px-4 text-white">🎨 作品投稿</td>
                  <td className="text-center py-2 px-2 text-red-400">×</td>
                  <td className="text-center py-2 px-2 text-green-400">○</td>
                  <td className="text-center py-2 px-2 text-green-400">○</td>
                  <td className="text-center py-2 px-2 text-green-400">○</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2 px-4 text-white">🛒 商品販売</td>
                  <td className="text-center py-2 px-2 text-red-400">×</td>
                  <td className="text-center py-2 px-2 text-green-400">○</td>
                  <td className="text-center py-2 px-2 text-green-400">○（予約・限定可）</td>
                  <td className="text-center py-2 px-2 text-green-400">○（無制限可）</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2 px-4 text-white">📣 イベント告知</td>
                  <td className="text-center py-2 px-2 text-red-400">×</td>
                  <td className="text-center py-2 px-2 text-red-400">×</td>
                  <td className="text-center py-2 px-2 text-green-400">○（先行・限定可）</td>
                  <td className="text-center py-2 px-2 text-green-400">○（主催・スポンサー可）</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2 px-4 text-white">💰 有料配信開催</td>
                  <td className="text-center py-2 px-2 text-red-400">×</td>
                  <td className="text-center py-2 px-2 text-red-400">×</td>
                  <td className="text-center py-2 px-2 text-green-400">○（高度配信可）</td>
                  <td className="text-center py-2 px-2 text-green-400">○（スポンサー配信可）</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2 px-4 text-white">💼 WORK依頼</td>
                  <td className="text-center py-2 px-2 text-red-400">×</td>
                  <td className="text-center py-2 px-2 text-red-400">×</td>
                  <td className="text-center py-2 px-2 text-green-400">○（個人依頼）</td>
                  <td className="text-center py-2 px-2 text-green-400">○（企業依頼・スカウト）</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2 px-4 text-white">📢 広告出稿枠</td>
                  <td className="text-center py-2 px-2 text-red-400">×</td>
                  <td className="text-center py-2 px-2 text-red-400">×</td>
                  <td className="text-center py-2 px-2 text-green-400">○（自己プロモ）</td>
                  <td className="text-center py-2 px-2 text-green-400">○（バナー・スポンサー）</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* よくある質問 */}
        <div className="mt-16 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-6">よくある質問</h3>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h4 className="font-semibold text-white mb-2">プランの変更は可能ですか？</h4>
                <p className="text-gray-400 text-sm">はい、いつでもプランを変更できます。変更は即座に反映されます。</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">解約は簡単ですか？</h4>
                <p className="text-gray-400 text-sm">はい、設定画面からいつでも簡単に解約できます。</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">支払い方法は？</h4>
                <p className="text-gray-400 text-sm">クレジットカード、デビットカード、銀行振込に対応しています。</p>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-2">無料トライアル期間は？</h4>
                <p className="text-gray-400 text-sm">すべてのプランで30日間の無料トライアル期間があります。</p>
              </div>
            </div>
          </div>
        </div>

        {/* 戻るボタン */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
} 