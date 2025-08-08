'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, Star, Crown, Zap, Shield, Globe, CreditCard } from 'lucide-react'
import { useAuth } from '../lib/auth-context'
import { getUserLevelInfo } from '../lib/user-levels'
import { useI18n } from '../lib/i18n-provider'
import LanguageSelector from '../components/LanguageSelector'
import { apiClient } from '../lib/api'

interface PricingPlan {
  id: string
  name: string
  price: number
  currency: string
  period: string
  features: string[]
  popular?: boolean
  icon: React.ReactNode
  color: string
}

interface CountryInfo {
  code: string
  name: string
  currency: string
  symbol: string
  rate: number
}

const countries: CountryInfo[] = [
  { code: 'JP', name: '日本', currency: 'JPY', symbol: '¥', rate: 1 },
  { code: 'US', name: 'アメリカ', currency: 'USD', symbol: '$', rate: 0.0067 },
  { code: 'EU', name: 'ヨーロッパ', currency: 'EUR', symbol: '€', rate: 0.0062 },
  { code: 'GB', name: 'イギリス', currency: 'GBP', symbol: '£', rate: 0.0053 },
  { code: 'CA', name: 'カナダ', currency: 'CAD', symbol: 'C$', rate: 0.0091 },
  { code: 'AU', name: 'オーストラリア', currency: 'AUD', symbol: 'A$', rate: 0.0102 },
  { code: 'KR', name: '韓国', currency: 'KRW', symbol: '₩', rate: 8.95 },
  { code: 'CN', name: '中国', currency: 'CNY', symbol: '元', rate: 0.048 },
]

// 通貨スタイル・言語に応じた通貨記号・表記を返す関数
function getCurrencySymbol(country: CountryInfo, locale: string) {
  if (country.code === 'CN') {
    // 中国語の場合は「元」または「CNY」
    if (locale === 'zh') return '元';
    // 英語の場合は「CNY」
    if (locale === 'en') return 'CNY';
    // 日本語・韓国語の場合は「元」
    return '元';
  }
  if (country.code === 'JP') {
    // 日本は常に「¥」を使用
    return '¥';
  }
  if (country.code === 'KR') {
    if (locale === 'ko') return '₩';
    if (locale === 'en') return 'KRW';
    return '₩';
  }
  // その他はデフォルト
  return country.symbol;
}

// 通貨に応じたコンテンツ翻訳を取得する関数
function getCurrencyContent(country: CountryInfo, locale: string) {
  const content = {
    jp: {
      ja: {
        name: '日本',
        description: '日本のユーザー向けプラン',
        features: ['基本投稿機能', 'ギャラリー閲覧', 'コミュニティ参加', '標準サポート'],
        superFeatures: ['すべての無料機能', '管理者権限', '高度な分析ツール', '優先サポート', 'カスタムテーマ', '広告なし', '早期アクセス機能'],
        businessFeatures: ['すべてのスーパーユーザー機能', 'ビジネス分析ダッシュボード', 'チーム管理機能', 'APIアクセス', 'カスタムブランディング', '専用サポート', '高度なセキュリティ', 'バックアップ・復元機能']
      },
      en: {
        name: 'Japan',
        description: 'Plans for Japanese users',
        features: ['Basic posting features', 'Gallery viewing', 'Community participation', 'Standard support'],
        superFeatures: ['All Free features', 'Admin rights', 'Advanced analytics tools', 'Priority support', 'Custom themes', 'Ad-free viewing', 'Early access features'],
        businessFeatures: ['All Super User features', 'Business analytics dashboard', 'Team management features', 'API access', 'Custom branding', 'Dedicated support', 'Advanced security', 'Backup & restore features']
      },
      zh: {
        name: '日本',
        description: '日本用户专用计划',
        features: ['基本发布功能', '画廊浏览', '社区参与', '标准支持'],
        superFeatures: ['所有免费功能', '管理权限', '高级分析工具', '优先支持', '自定义主题', '无广告观看', '早期访问功能'],
        businessFeatures: ['所有超级用户功能', '商业分析仪表板', '团队管理功能', 'API访问', '自定义品牌', '专属支持', '高级安全', '备份和恢复功能']
      },
      ko: {
        name: '일본',
        description: '일본 사용자를 위한 플랜',
        features: ['기본 게시 기능', '갤러리 보기', '커뮤니티 참여', '표준 지원'],
        superFeatures: ['모든 무료 기능', '관리 권한', '고급 분석 도구', '우선 지원', '사용자 정의 테마', '광고 없는 시청', '초기 접근 기능'],
        businessFeatures: ['모든 슈퍼 유저 기능', '비즈니스 분석 대시보드', '팀 관리 기능', 'API 접근', '사용자 정의 브랜드링', '전용 지원', '고급 보안', '백업 및 복구 기능']
      }
    },
    cn: {
      ja: {
        name: '中国',
        description: '中国のユーザー向けプラン',
        features: ['基本投稿機能', 'ギャラリー閲覧', 'コミュニティ参加', '標準サポート'],
        superFeatures: ['すべての無料機能', '管理者権限', '高度な分析ツール', '優先サポート', 'カスタムテーマ', '広告なし', '早期アクセス機能'],
        businessFeatures: ['すべてのスーパーユーザー機能', 'ビジネス分析ダッシュボード', 'チーム管理機能', 'APIアクセス', 'カスタムブランディング', '専用サポート', '高度なセキュリティ', 'バックアップ・復元機能']
      },
      en: {
        name: 'China',
        description: 'Plans for Chinese users',
        features: ['Basic posting features', 'Gallery viewing', 'Community participation', 'Standard support'],
        superFeatures: ['All Free features', 'Admin rights', 'Advanced analytics tools', 'Priority support', 'Custom themes', 'Ad-free viewing', 'Early access features'],
        businessFeatures: ['All Super User features', 'Business analytics dashboard', 'Team management features', 'API access', 'Custom branding', 'Dedicated support', 'Advanced security', 'Backup & restore features']
      },
      zh: {
        name: '中国',
        description: '中国用户专用计划',
        features: ['基本发布功能', '画廊浏览', '社区参与', '标准支持'],
        superFeatures: ['所有免费功能', '管理权限', '高级分析工具', '优先支持', '自定义主题', '无广告观看', '早期访问功能'],
        businessFeatures: ['所有超级用户功能', '商业分析仪表板', '团队管理功能', 'API访问', '自定义品牌', '专属支持', '高级安全', '备份和恢复功能']
      },
      ko: {
        name: '중국',
        description: '중국 사용자를 위한 플랜',
        features: ['기본 게시 기능', '갤러리 보기', '커뮤니티 참여', '표준 지원'],
        superFeatures: ['모든 무료 기능', '관리 권한', '고급 분석 도구', '우선 지원', '사용자 정의 테마', '광고 없는 시청', '초기 접근 기능'],
        businessFeatures: ['모든 슈퍼 유저 기능', '비즈니스 분석 대시보드', '팀 관리 기능', 'API 접근', '사용자 정의 브랜드링', '전용 지원', '고급 보안', '백업 및 복구 기능']
      }
    },
    kr: {
      ja: {
        name: '韓国',
        description: '韓国のユーザー向けプラン',
        features: ['基本投稿機能', 'ギャラリー閲覧', 'コミュニティ参加', '標準サポート'],
        superFeatures: ['すべての無料機能', '管理者権限', '高度な分析ツール', '優先サポート', 'カスタムテーマ', '広告なし', '早期アクセス機能'],
        businessFeatures: ['すべてのスーパーユーザー機能', 'ビジネス分析ダッシュボード', 'チーム管理機能', 'APIアクセス', 'カスタムブランディング', '専用サポート', '高度なセキュリティ', 'バックアップ・復元機能']
      },
      en: {
        name: 'Korea',
        description: 'Plans for Korean users',
        features: ['Basic posting features', 'Gallery viewing', 'Community participation', 'Standard support'],
        superFeatures: ['All Free features', 'Admin rights', 'Advanced analytics tools', 'Priority support', 'Custom themes', 'Ad-free viewing', 'Early access features'],
        businessFeatures: ['All Super User features', 'Business analytics dashboard', 'Team management features', 'API access', 'Custom branding', 'Dedicated support', 'Advanced security', 'Backup & restore features']
      },
      zh: {
        name: '韩国',
        description: '韩国用户专用计划',
        features: ['基本发布功能', '画廊浏览', '社区参与', '标准支持'],
        superFeatures: ['所有免费功能', '管理权限', '高级分析工具', '优先支持', '自定义主题', '无广告观看', '早期访问功能'],
        businessFeatures: ['所有超级用户功能', '商业分析仪表板', '团队管理功能', 'API访问', '自定义品牌', '专属支持', '高级安全', '备份和恢复功能']
      },
      ko: {
        name: '한국',
        description: '한국 사용자를 위한 플랜',
        features: ['기본 게시 기능', '갤러리 보기', '커뮤니티 참여', '표준 지원'],
        superFeatures: ['모든 무료 기능', '관리 권한', '고급 분석 도구', '우선 지원', '사용자 정의 테마', '광고 없는 시청', '초기 접근 기능'],
        businessFeatures: ['모든 슈퍼 유저 기능', '비즈니스 분석 대시보드', '팀 관리 기능', 'API 접근', '사용자 정의 브랜드링', '전용 지원', '고급 보안', '백업 및 복구 기능']
      }
    },
    us: {
      ja: {
        name: 'アメリカ',
        description: 'アメリカのユーザー向けプラン',
        features: ['基本投稿機能', 'ギャラリー閲覧', 'コミュニティ参加', '標準サポート'],
        superFeatures: ['すべての無料機能', '管理者権限', '高度な分析ツール', '優先サポート', 'カスタムテーマ', '広告なし', '早期アクセス機能'],
        businessFeatures: ['すべてのスーパーユーザー機能', 'ビジネス分析ダッシュボード', 'チーム管理機能', 'APIアクセス', 'カスタムブランディング', '専用サポート', '高度なセキュリティ', 'バックアップ・復元機能']
      },
      en: {
        name: 'United States',
        description: 'Plans for US users',
        features: ['Basic posting features', 'Gallery viewing', 'Community participation', 'Standard support'],
        superFeatures: ['All Free features', 'Admin rights', 'Advanced analytics tools', 'Priority support', 'Custom themes', 'Ad-free viewing', 'Early access features'],
        businessFeatures: ['All Super User features', 'Business analytics dashboard', 'Team management features', 'API access', 'Custom branding', 'Dedicated support', 'Advanced security', 'Backup & restore features']
      },
      zh: {
        name: '美国',
        description: '美国用户专用计划',
        features: ['基本发布功能', '画廊浏览', '社区参与', '标准支持'],
        superFeatures: ['所有免费功能', '管理权限', '高级分析工具', '优先支持', '自定义主题', '无广告观看', '早期访问功能'],
        businessFeatures: ['所有超级用户功能', '商业分析仪表板', '团队管理功能', 'API访问', '自定义品牌', '专属支持', '高级安全', '备份和恢复功能']
      },
      ko: {
        name: '미국',
        description: '미국 사용자를 위한 플랜',
        features: ['기본 게시 기능', '갤러리 보기', '커뮤니티 참여', '표준 지원'],
        superFeatures: ['모든 무료 기능', '관리 권한', '고급 분석 도구', '우선 지원', '사용자 정의 테마', '광고 없는 시청', '초기 접근 기능'],
        businessFeatures: ['모든 슈퍼 유저 기능', '비즈니스 분석 대시보드', '팀 관리 기능', 'API 접근', '사용자 정의 브랜드링', '전용 지원', '고급 보안', '백업 및 복구 기능']
      }
    },
    eu: {
      ja: {
        name: 'ヨーロッパ',
        description: 'ヨーロッパのユーザー向けプラン',
        features: ['基本投稿機能', 'ギャラリー閲覧', 'コミュニティ参加', '標準サポート'],
        superFeatures: ['すべての無料機能', '管理者権限', '高度な分析ツール', '優先サポート', 'カスタムテーマ', '広告なし', '早期アクセス機能'],
        businessFeatures: ['すべてのスーパーユーザー機能', 'ビジネス分析ダッシュボード', 'チーム管理機能', 'APIアクセス', 'カスタムブランディング', '専用サポート', '高度なセキュリティ', 'バックアップ・復元機能']
      },
      en: {
        name: 'Europe',
        description: 'Plans for European users',
        features: ['Basic posting features', 'Gallery viewing', 'Community participation', 'Standard support'],
        superFeatures: ['All Free features', 'Admin rights', 'Advanced analytics tools', 'Priority support', 'Custom themes', 'Ad-free viewing', 'Early access features'],
        businessFeatures: ['All Super User features', 'Business analytics dashboard', 'Team management features', 'API access', 'Custom branding', 'Dedicated support', 'Advanced security', 'Backup & restore features']
      },
      zh: {
        name: '欧洲',
        description: '欧洲用户专用计划',
        features: ['基本发布功能', '画廊浏览', '社区参与', '标准支持'],
        superFeatures: ['所有免费功能', '管理权限', '高级分析工具', '优先支持', '自定义主题', '无广告观看', '早期访问功能'],
        businessFeatures: ['所有超级用户功能', '商业分析仪表板', '团队管理功能', 'API访问', '自定义品牌', '专属支持', '高级安全', '备份和恢复功能']
      },
      ko: {
        name: '유럽',
        description: '유럽 사용자를 위한 플랜',
        features: ['기본 게시 기능', '갤러리 보기', '커뮤니티 참여', '표준 지원'],
        superFeatures: ['모든 무료 기능', '관리 권한', '고급 분석 도구', '우선 지원', '사용자 정의 테마', '광고 없는 시청', '초기 접근 기능'],
        businessFeatures: ['모든 슈퍼 유저 기능', '비즈니스 분석 대시보드', '팀 관리 기능', 'API 접근', '사용자 정의 브랜드링', '전용 지원', '고급 보안', '백업 및 복구 기능']
      }
    },
    gb: {
      ja: {
        name: 'イギリス',
        description: 'イギリスのユーザー向けプラン',
        features: ['基本投稿機能', 'ギャラリー閲覧', 'コミュニティ参加', '標準サポート'],
        superFeatures: ['すべての無料機能', '管理者権限', '高度な分析ツール', '優先サポート', 'カスタムテーマ', '広告なし', '早期アクセス機能'],
        businessFeatures: ['すべてのスーパーユーザー機能', 'ビジネス分析ダッシュボード', 'チーム管理機能', 'APIアクセス', 'カスタムブランディング', '専用サポート', '高度なセキュリティ', 'バックアップ・復元機能']
      },
      en: {
        name: 'United Kingdom',
        description: 'Plans for UK users',
        features: ['Basic posting features', 'Gallery viewing', 'Community participation', 'Standard support'],
        superFeatures: ['All Free features', 'Admin rights', 'Advanced analytics tools', 'Priority support', 'Custom themes', 'Ad-free viewing', 'Early access features'],
        businessFeatures: ['All Super User features', 'Business analytics dashboard', 'Team management features', 'API access', 'Custom branding', 'Dedicated support', 'Advanced security', 'Backup & restore features']
      },
      zh: {
        name: '英国',
        description: '英国用户专用计划',
        features: ['基本发布功能', '画廊浏览', '社区参与', '标准支持'],
        superFeatures: ['所有免费功能', '管理权限', '高级分析工具', '优先支持', '自定义主题', '无广告观看', '早期访问功能'],
        businessFeatures: ['所有超级用户功能', '商业分析仪表板', '团队管理功能', 'API访问', '自定义品牌', '专属支持', '高级安全', '备份和恢复功能']
      },
      ko: {
        name: '영국',
        description: '영국 사용자를 위한 플랜',
        features: ['기본 게시 기능', '갤러리 보기', '커뮤니티 참여', '표준 지원'],
        superFeatures: ['모든 무료 기능', '관리 권한', '고급 분석 도구', '우선 지원', '사용자 정의 테마', '광고 없는 시청', '초기 접근 기능'],
        businessFeatures: ['모든 슈퍼 유저 기능', '비즈니스 분석 대시보드', '팀 관리 기능', 'API 접근', '사용자 정의 브랜드링', '전용 지원', '고급 보안', '백업 및 복구 기능']
      }
    },
    ca: {
      ja: {
        name: 'カナダ',
        description: 'カナダのユーザー向けプラン',
        features: ['基本投稿機能', 'ギャラリー閲覧', 'コミュニティ参加', '標準サポート'],
        superFeatures: ['すべての無料機能', '管理者権限', '高度な分析ツール', '優先サポート', 'カスタムテーマ', '広告なし', '早期アクセス機能'],
        businessFeatures: ['すべてのスーパーユーザー機能', 'ビジネス分析ダッシュボード', 'チーム管理機能', 'APIアクセス', 'カスタムブランディング', '専用サポート', '高度なセキュリティ', 'バックアップ・復元機能']
      },
      en: {
        name: 'Canada',
        description: 'Plans for Canadian users',
        features: ['Basic posting features', 'Gallery viewing', 'Community participation', 'Standard support'],
        superFeatures: ['All Free features', 'Admin rights', 'Advanced analytics tools', 'Priority support', 'Custom themes', 'Ad-free viewing', 'Early access features'],
        businessFeatures: ['All Super User features', 'Business analytics dashboard', 'Team management features', 'API access', 'Custom branding', 'Dedicated support', 'Advanced security', 'Backup & restore features']
      },
      zh: {
        name: '加拿大',
        description: '加拿大用户专用计划',
        features: ['基本发布功能', '画廊浏览', '社区参与', '标准支持'],
        superFeatures: ['所有免费功能', '管理权限', '高级分析工具', '优先支持', '自定义主题', '无广告观看', '早期访问功能'],
        businessFeatures: ['所有超级用户功能', '商业分析仪表板', '团队管理功能', 'API访问', '自定义品牌', '专属支持', '高级安全', '备份和恢复功能']
      },
      ko: {
        name: '캐나다',
        description: '캐나다 사용자를 위한 플랜',
        features: ['기본 게시 기능', '갤러리 보기', '커뮤니티 참여', '표준 지원'],
        superFeatures: ['모든 무료 기능', '관리 권한', '고급 분석 도구', '우선 지원', '사용자 정의 테마', '광고 없는 시청', '초기 접근 기능'],
        businessFeatures: ['모든 슈퍼 유저 기능', '비즈니스 분석 대시보드', '팀 관리 기능', 'API 접근', '사용자 정의 브랜드링', '전용 지원', '고급 보안', '백업 및 복구 기능']
      }
    },
    au: {
      ja: {
        name: 'オーストラリア',
        description: 'オーストラリアのユーザー向けプラン',
        features: ['基本投稿機能', 'ギャラリー閲覧', 'コミュニティ参加', '標準サポート'],
        superFeatures: ['すべての無料機能', '管理者権限', '高度な分析ツール', '優先サポート', 'カスタムテーマ', '広告なし', '早期アクセス機能'],
        businessFeatures: ['すべてのスーパーユーザー機能', 'ビジネス分析ダッシュボード', 'チーム管理機能', 'APIアクセス', 'カスタムブランディング', '専用サポート', '高度なセキュリティ', 'バックアップ・復元機能']
      },
      en: {
        name: 'Australia',
        description: 'Plans for Australian users',
        features: ['Basic posting features', 'Gallery viewing', 'Community participation', 'Standard support'],
        superFeatures: ['All Free features', 'Admin rights', 'Advanced analytics tools', 'Priority support', 'Custom themes', 'Ad-free viewing', 'Early access features'],
        businessFeatures: ['All Super User features', 'Business analytics dashboard', 'Team management features', 'API access', 'Custom branding', 'Dedicated support', 'Advanced security', 'Backup & restore features']
      },
      zh: {
        name: '澳大利亚',
        description: '澳大利亚用户专用计划',
        features: ['基本发布功能', '画廊浏览', '社区参与', '标准支持'],
        superFeatures: ['所有免费功能', '管理权限', '高级分析工具', '优先支持', '自定义主题', '无广告观看', '早期访问功能'],
        businessFeatures: ['所有超级用户功能', '商业分析仪表板', '团队管理功能', 'API访问', '自定义品牌', '专属支持', '高级安全', '备份和恢复功能']
      },
      ko: {
        name: '호주',
        description: '호주 사용자를 위한 플랜',
        features: ['기본 게시 기능', '갤러리 보기', '커뮤니티 참여', '표준 지원'],
        superFeatures: ['모든 무료 기능', '관리 권한', '고급 분석 도구', '우선 지원', '사용자 정의 테마', '광고 없는 시청', '초기 접근 기능'],
        businessFeatures: ['모든 슈퍼 유저 기능', '비즈니스 분석 대시보드', '팀 관리 기능', 'API 접근', '사용자 정의 브랜드링', '전용 지원', '고급 보안', '백업 및 복구 기능']
      }
    }
  };

  // エラーハンドリングを追加
  try {
    if (country.code === 'JP') {
      return content.jp[locale] || content.jp.en;
    }
    if (country.code === 'CN') {
      return content.cn[locale] || content.cn.en;
    }
    if (country.code === 'KR') {
      return content.kr[locale] || content.kr.en;
    }
    if (country.code === 'US') {
      return content.us[locale] || content.us.en;
    }
    if (country.code === 'EU') {
      return content.eu[locale] || content.eu.en;
    }
    if (country.code === 'GB') {
      return content.gb[locale] || content.gb.en;
    }
    if (country.code === 'CA') {
      return content.ca[locale] || content.ca.en;
    }
    if (country.code === 'AU') {
      return content.au[locale] || content.au.en;
    }
  } catch (error) {
    console.error('Error in getCurrencyContent:', error);
  }

  // デフォルトは英語
  return {
    name: country.name,
    description: `Plans for ${country.name} users`,
    features: ['Basic posting features', 'Gallery viewing', 'Community participation', 'Standard support'],
    superFeatures: ['All Free features', 'Admin rights', 'Advanced analytics tools', 'Priority support', 'Custom themes', 'Ad-free viewing', 'Early access features'],
    businessFeatures: ['All Super User features', 'Business analytics dashboard', 'Team management features', 'API access', 'Custom branding', 'Dedicated support', 'Advanced security', 'Backup & restore features']
  };
}

export default function PremiumPage() {
  const { user, isAuthenticated } = useAuth()
  const { t, locale } = useI18n()
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(countries[0])
  const [loading, setLoading] = useState(false)
  const [apiTranslations, setApiTranslations] = useState<{[key: string]: string}>({})
  const [isTranslating, setIsTranslating] = useState(false)

  // API翻訳を取得する関数
  const fetchApiTranslations = async (countryCode: string, language: string) => {
    try {
      setIsTranslating(true)
      const response = await apiClient.getPremiumPageTranslation(countryCode, language, 'formal')
      setApiTranslations(response.translations)
      console.log('API翻訳取得成功:', response.translations)
    } catch (error) {
      console.error('API翻訳エラー:', error)
      // エラー時はローカル翻訳を使用
      setApiTranslations({})
    } finally {
      setIsTranslating(false)
    }
  }

  // 通貨選択時の処理
  const handleCountryChange = async (countryCode: string) => {
    const country = countries.find(c => c.code === countryCode)
    if (country) {
      setSelectedCountry(country)
      // API翻訳を取得
      await fetchApiTranslations(countryCode, locale)
    }
  }

  // 言語変更時の処理
  const fetchApiTranslationsCb = React.useCallback(fetchApiTranslations, [])
  useEffect(() => {
    if (selectedCountry) {
      fetchApiTranslationsCb(selectedCountry.code, locale)
    }
  }, [locale, selectedCountry, fetchApiTranslationsCb])

  // 翻訳テキストを取得する関数（API翻訳を優先）
  const getTranslatedText = (key: string, fallback: string) => {
    return apiTranslations[key] || fallback
  }

  const getPricingPlans = (): PricingPlan[] => {
    try {
      const basePriceSuper = 500 // 日本円ベース（スーパーユーザー）
      const basePriceBusiness = 3000 // 日本円ベース（ビジネス）
      const convertedPriceSuper = Math.round(basePriceSuper * (selectedCountry?.rate || 1))
      const convertedPriceBusiness = Math.round(basePriceBusiness * (selectedCountry?.rate || 1))

      const currencyContent = getCurrencyContent(selectedCountry, locale);

      return [
        {
          id: 'free',
          name: t('freePlan'),
          price: 0,
          currency: selectedCountry?.symbol || '¥',
          period: t('monthly'),
          features: currencyContent?.features || ['Basic posting features', 'Gallery viewing', 'Community participation', 'Standard support'],
          icon: <Star className="w-6 h-6" />,
          color: 'bg-gray-100 text-gray-800'
        },
        {
          id: 'super',
          name: t('superUserPlan'),
          price: convertedPriceSuper,
          currency: selectedCountry?.symbol || '¥',
          period: t('monthly'),
          features: currencyContent?.superFeatures || ['All Free features', 'Admin rights', 'Advanced analytics tools', 'Priority support', 'Custom themes', 'Ad-free viewing', 'Early access features'],
          icon: <Crown className="w-6 h-6" />,
          color: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
        },
        {
          id: 'business',
          name: t('businessPlan'),
          price: convertedPriceBusiness,
          currency: selectedCountry?.symbol || '¥',
          period: t('monthly'),
          features: currencyContent?.businessFeatures || ['All Super User features', 'Business analytics dashboard', 'Team management features', 'API access', 'Custom branding', 'Dedicated support', 'Advanced security', 'Backup & restore features'],
          popular: true,
          icon: <Zap className="w-6 h-6" />,
          color: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
        }
      ]
    } catch (error) {
      console.error('Error in getPricingPlans:', error)
      // エラー時のデフォルトプランを返す
      return [
        {
          id: 'free',
          name: 'Free',
          price: 0,
          currency: '¥',
          period: 'Monthly',
          features: ['Basic posting features', 'Gallery viewing', 'Community participation', 'Standard support'],
          icon: <Star className="w-6 h-6" />,
          color: 'bg-gray-100 text-gray-800'
        }
      ]
    }
  }

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) {
      alert(t('loginRequiredMessage'))
      return
    }

    if (planId === 'free') {
      alert(t('freePlanAvailable'))
      return
    }

    setLoading(true)

    try {
      // ここで実際の決済処理を実装
      // Stripe、PayPal、または独自の決済システム
      console.log(`Subscribing to ${planId} plan for ${selectedCountry?.currency} ${getPricingPlans().find(p => p.id === planId)?.price}`)

      // 仮の決済処理
      await new Promise(resolve => setTimeout(resolve, 2000))

      alert(t('paymentCompleted'))
    } catch (error) {
      console.error('Payment error:', error)
      alert(t('paymentError'))
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    const symbol = getCurrencySymbol(selectedCountry, locale);
    if (selectedCountry?.currency === 'JPY' || selectedCountry?.currency === 'KRW' || selectedCountry?.currency === 'CNY') {
      return `${symbol}${price.toLocaleString()}`;
    }
    return `${symbol}${price.toFixed(2)}`;
  }

  const plans = getPricingPlans()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold">
              ← {t('home')}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{t('premiumPageTitle')}</h1>
            <div className="flex items-center space-x-4">
              {/* <LanguageSelector /> 削除 */}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* アフィリエイトキャッチコピー - 10%報酬に焦点 */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow p-4 text-white mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-300 mb-2">10% 報酬制度</div>
            <div className="font-bold text-lg mb-1">{t('affiliateCatchphrase')}</div>
            <div className="text-sm opacity-90 mb-3">{t('affiliateSubtitle')}</div>
            <button
              onClick={() => {
                const affiliateSection = document.getElementById('affiliate-section');
                if (affiliateSection) {
                  affiliateSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white text-purple-600 px-4 py-2 rounded font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              {t('affiliateJoinNow')}
            </button>
          </div>
        </div>

        {/* ヘッダーセクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {getTranslatedText('chooseYourPlan', t('chooseYourPlan'))}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {getTranslatedText('chooseYourPlanDesc', t('chooseYourPlanDesc'))}
          </p>
        </div>

        {/* 国選択 */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center space-x-4">
              <Globe className="w-5 h-5 text-gray-600" />
              <label className="text-sm font-medium text-gray-700">
                {getTranslatedText('regionCurrency', t('regionCurrency'))}:
              </label>
              <select
                value={selectedCountry.code}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-black text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.currency})
                  </option>
                ))}
              </select>
              {isTranslating && (
                <div className="text-xs text-blue-600 animate-pulse">
                  {getTranslatedText('processing', '翻訳中...')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* プラン比較 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full ${
                plan.popular ? 'ring-2 ring-blue-400 scale-105' : ''
              }`}
            >
              {/* プランヘッダー */}
              <div className={`absolute top-0 left-0 right-0 text-white text-center py-2 text-sm font-semibold ${
                plan.id === 'free'
                  ? 'bg-gray-700'
                  : plan.id === 'super'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                  : plan.id === 'business'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                  : 'bg-gray-600'
              }`}>
                {plan.popular ? t('recommendedPlan') : plan.name}
              </div>

              <div className="p-8 pt-16 flex flex-col flex-1">
                <div className="flex items-center mb-6">
                  <div className={`p-3 rounded-full ${plan.color} mr-4`}>
                    {plan.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600">{t('plan')}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                  {plan.price === 0 && (
                    <p className="text-sm text-gray-500 mt-1">{t('currentlyUsing')}</p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || (plan.id === 'free' && isAuthenticated)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 mt-auto ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                      : plan.id === 'super'
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600'
                      : plan.id === 'free'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {t('processing')}
                    </div>
                  ) : plan.id === 'free' ? (
                    t('currentlyUsing')
                  ) : (
                    <div className="flex items-center justify-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      {t('startNow')}
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 追加情報 */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('frequentlyAskedQuestions')}
            </h3>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{t('planChangeQuestion')}</h4>
                <p className="text-gray-600">{t('planChangeAnswer')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{t('cancellationQuestion')}</h4>
                <p className="text-gray-600">{t('cancellationAnswer')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{t('paymentMethodsQuestion')}</h4>
                <p className="text-gray-600">{t('paymentMethodsAnswer')}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">{t('freeTrialQuestion')}</h4>
                <p className="text-gray-600">{t('freeTrialAnswer')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 現在のユーザー情報 */}
        {isAuthenticated && (
          <div className="mt-8 text-center">
            <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-800">
                {t('currentPlan')}: <span className="font-semibold">{getUserLevelInfo(user).name}</span>
              </p>
            </div>
          </div>
        )}

        {/* アフィリエイトシステム */}
        <div id="affiliate-section" className="mt-16">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-4">{t('affiliateSystem')}</h3>
              <p className="text-xl opacity-90">{t('affiliateSystemDesc')}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 rounded-lg p-6">
                <h4 className="text-xl font-semibold mb-4">{t('affiliateBenefits')}</h4>
                <p className="mb-4 opacity-90">{t('affiliateBenefitsDesc')}</p>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span>10% コミッション</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span>無制限の紹介</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span>リアルタイム統計</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span>マーケティング素材</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 rounded-lg p-6">
                <h4 className="text-xl font-semibold mb-4">{t('referralLink')}</h4>
                <p className="mb-4 opacity-90">{t('referralLinkDesc')}</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={`https://eldonia-nex.com/ref/${user?.id || 'demo'}`}
                    readOnly
                    className="flex-1 bg-white/20 border border-white/30 rounded px-3 py-2 text-white placeholder-white/50"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://eldonia-nex.com/ref/${user?.id || 'demo'}`)
                      alert(t('linkCopied'))
                    }}
                    className="bg-white text-purple-600 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
                  >
                    {t('copyLink')}
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                {t('becomeAffiliate')}
              </button>
            </div>
          </div>
        </div>

        {/* アフィリエイト統計 */}
        {isAuthenticated && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">{t('referralStats')}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">{t('totalReferrals')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">{t('activeReferrals')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">¥0</div>
                  <div className="text-sm text-gray-600">{t('totalEarnings')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">¥0</div>
                  <div className="text-sm text-gray-600">{t('pendingEarnings')}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
