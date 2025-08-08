'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/auth-context'
import { useI18n } from '../../lib/i18n-provider'
import {
  Users,
  Eye,
  MousePointer,
  Clock,
  MapPin,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  pageViews: number
  uniqueVisitors: number
  bounceRate: number
  avgSessionDuration: number
  topPages: Array<{
    path: string
    views: number
    percentage: number
  }>
  trafficSources: Array<{
    source: string
    visitors: number
    percentage: number
  }>
  userEngagement: Array<{
    metric: string
    value: number
    change: number
  }>
}

export default function AnalyticsPage() {
  const { isAuthenticated } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics()
    }
  }, [isAuthenticated, timeRange])

  const fetchAnalytics = async () => {
    try {
      // モックデータ
      const mockAnalytics: AnalyticsData = {
        pageViews: 45620,
        uniqueVisitors: 12340,
        bounceRate: 42.5,
        avgSessionDuration: 185,
        topPages: [
          { path: '/', views: 12500, percentage: 27.4 },
          { path: '/gallery', views: 8900, percentage: 19.5 },
          { path: '/community', views: 6700, percentage: 14.7 },
          { path: '/about', views: 4500, percentage: 9.9 },
          { path: '/shop', views: 3200, percentage: 7.0 }
        ],
        trafficSources: [
          { source: 'Organic Search', visitors: 6800, percentage: 55.1 },
          { source: 'Direct', visitors: 3200, percentage: 25.9 },
          { source: 'Social Media', visitors: 1800, percentage: 14.6 },
          { source: 'Referral', visitors: 540, percentage: 4.4 }
        ],
        userEngagement: [
          { metric: 'ページビュー', value: 45620, change: 12.5 },
          { metric: 'ユニークビジター', value: 12340, change: 8.3 },
          { metric: '平均セッション時間', value: 185, change: -2.1 },
          { metric: '直帰率', value: 42.5, change: -5.2 }
        ]
      }
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('分析データの取得に失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}分${remainingSeconds}秒`
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">アクセス拒否</h2>
            <p className="text-red-600">このページにアクセスするには管理者権限が必要です。</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 分析ダッシュボード</h1>
              <p className="text-gray-600 mt-1">ユーザー行動とパフォーマンス分析</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1d">過去24時間</option>
                <option value="7d">過去7日間</option>
                <option value="30d">過去30日間</option>
                <option value="90d">過去90日間</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 主要指標 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ページビュー</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.pageViews.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">+{analytics?.userEngagement[0].change}% 前回比</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg text-white">
                <Eye className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ユニークビジター</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.uniqueVisitors.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">+{analytics?.userEngagement[1].change}% 前回比</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg text-white">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均セッション時間</p>
                <p className="text-2xl font-bold text-gray-900">{analytics && formatDuration(analytics.avgSessionDuration)}</p>
                <p className="text-sm text-red-600 mt-1">{analytics?.userEngagement[2].change}% 前回比</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg text-white">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">直帰率</p>
                <p className="text-2xl font-bold text-gray-900">{analytics?.bounceRate}%</p>
                <p className="text-sm text-green-600 mt-1">{analytics?.userEngagement[3].change}% 前回比</p>
              </div>
              <div className="bg-red-500 p-3 rounded-lg text-white">
                <MousePointer className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 人気ページ */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">人気ページ</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics?.topPages.map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{page.path}</p>
                        <p className="text-xs text-gray-500">{page.views.toLocaleString()} ビュー</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{page.percentage}%</p>
                      <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${page.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* トラフィックソース */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">トラフィックソース</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics?.trafficSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{source.source}</p>
                        <p className="text-xs text-gray-500">{source.visitors.toLocaleString()} ビジター</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{source.percentage}%</p>
                      <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-2 bg-green-500 rounded-full"
                          style={{ width: `${source.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* チャートエリア */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ページビューの推移</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">チャートがここに表示されます</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ユーザーエンゲージメント</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">チャートがここに表示されます</p>
              </div>
            </div>
          </div>
        </div>

        {/* リアルタイム統計 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">リアルタイム統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-600">現在オンライン</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">23</p>
              <p className="text-sm text-gray-600">アクティブページ</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">89</p>
              <p className="text-sm text-gray-600">今日の新規ユーザー</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
