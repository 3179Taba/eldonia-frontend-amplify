'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Star,
  Globe,
  Zap,
  Wand2,
  Rocket,
  Crown,
  Heart
} from 'lucide-react'
import Header from './components/Header'
import StatsSection from './components/StatsSection'
import HeroSection from './components/HeroSection'
import AffiliateBanner from './components/AffiliateBanner'
import FeaturesSection from './components/FeaturesSection'
import FeaturedWorksSection from './components/FeaturedWorksSection'
import WhyChooseSection from './components/WhyChooseSection'
import Footer from './components/Footer'
import HomePageProtection from './components/HomePageProtection'

export default function HomePage() {
  return (
    <HomePageProtection>
      <div className="min-h-screen">
        {/* 固定背景画像 */}
        <div className="fixed inset-0 z-0">
          <Image
            src="/images/hero/hiro.png"
            alt="Eldonia-Nex Hero Background"
            fill
            className="object-cover"
            priority
          />
          {/* オーバーレイ */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80"></div>
        </div>

        {/* 背景装飾 */}
        <div className="absolute inset-0 overflow-hidden z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-magic-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-cosmic-500/10 rounded-full blur-2xl animate-bounce-slow"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-neon-500/10 rounded-full blur-3xl animate-float"></div>
        </div>

        {/* ヘッダー */}
        <Header />

        {/* メインコンテンツ */}
        <main className="relative z-20">
          {/* ヒーローセクション */}
          <HeroSection />

          {/* アフィリエイト募集バナー */}
          <AffiliateBanner />

          {/* 機能カードセクション */}
          <FeaturesSection />

          {/* 注目作品セクション */}
          <FeaturedWorksSection />

          {/* 特徴セクション */}
          <WhyChooseSection />

          {/* 統計セクション（フッターの上） */}
          <StatsSection />
        </main>

        {/* フッター */}
        <Footer />
      </div>
    </HomePageProtection>
  )
}
