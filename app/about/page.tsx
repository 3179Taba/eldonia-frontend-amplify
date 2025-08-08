'use client'

import React from "react";
import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageWithSidebars from '../components/PageWithSidebars'
import PageHeader from '../components/PageHeader'
import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  const { elementRef, isVisible } = useIntersectionObserver({ triggerOnce: false })


  return (
    <PageWithSidebars>
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <main className="relative z-20 bg-gray-900 min-h-screen">
        <div
          ref={elementRef}
          className={`transition-all duration-1000 ${
            isVisible ? 'scroll-visible' : 'scroll-hidden'
          }`}
        >
          {/* ページヘッダー */}
          <PageHeader
            title="About Eldonia-Nex"
            subtitle="クリエイターのための次世代プラットフォーム"
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* トップページに戻るボタン */}
            <div className="mb-8 relative">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-magic-500 to-cosmic-500 text-white font-bold rounded-lg shadow-lg hover:from-magic-600 hover:to-cosmic-600 transition-all duration-300"
              >
                ← トップページに戻る
              </Link>
            </div>

            {/* 会社概要セクション */}
            <div className="mb-16 relative">
              {/* 装飾アイコン - セクション左上 */}
              <div className="absolute -top-4 -left-4 w-12 h-12 opacity-25">
                <Image
                  src="/images/icons/logo.png"
                  alt="装飾アイコン"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain transform -rotate-12"
                />
              </div>

              <div className="bg-gray-800 rounded-xl p-8 mb-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <div className="w-8 h-8 mr-3">
                    <Image
                      src="/images/icons/logo.png"
                      alt="装飾アイコン"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  🏢 私たちについて
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">ミッション</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Eldonia-Nexは、クリエイターが自由に作品を共有し、世界中の人々とつながることができる
                      次世代のデジタルプラットフォームです。私たちは、アート、音楽、動画、そしてすべての
                      クリエイティブな表現を支援し、クリエイターコミュニティの成長を促進します。
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">ビジョン</h3>
                    <p className="text-gray-300 leading-relaxed">
                      テクノロジーとクリエイティビティの融合により、誰もが自分の才能を発揮できる
                      世界を創造します。私たちは、クリエイターが安心して作品を発表し、
                      ファンと直接つながることができる環境を提供します。
                    </p>
                  </div>
                </div>
              </div>

              {/* 特徴 */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg p-6 text-center relative">
                  {/* 装飾アイコン - カード右上 */}
                  <div className="absolute top-2 right-2 w-6 h-6 opacity-30">
                    <Image
                      src="/images/icons/logo.png"
                      alt="装飾アイコン"
                      width={24}
                      height={24}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="text-xl font-semibold text-white mb-2">多様なメディア</h3>
                  <p className="text-gray-300 text-sm">
                    画像、動画、音楽など、あらゆる形式のクリエイティブコンテンツをサポート
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center relative">
                  {/* 装飾アイコン - カード右上 */}
                  <div className="absolute top-2 right-2 w-6 h-6 opacity-30">
                    <Image
                      src="/images/icons/logo.png"
                      alt="装飾アイコン"
                      width={24}
                      height={24}
                      className="w-full h-full object-contain transform rotate-45"
                    />
                  </div>
                  <div className="text-4xl mb-4">🌍</div>
                  <h3 className="text-xl font-semibold text-white mb-2">グローバルコミュニティ</h3>
                  <p className="text-gray-300 text-sm">
                    世界中のクリエイターとファンがつながる多言語対応プラットフォーム
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 text-center relative">
                  {/* 装飾アイコン - カード右上 */}
                  <div className="absolute top-2 right-2 w-6 h-6 opacity-30">
                    <Image
                      src="/images/icons/logo.png"
                      alt="装飾アイコン"
                      width={24}
                      height={24}
                      className="w-full h-full object-contain transform -rotate-45"
                    />
                  </div>
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-white mb-2">最新技術</h3>
                  <p className="text-gray-300 text-sm">
                    AI技術を活用した作品推薦や、ブロックチェーンによる著作権保護
                  </p>
                </div>
              </div>
            </div>

            {/* 開発チームセクション */}
            <div className="mb-16 relative">
              {/* 装飾アイコン - セクション右上 */}
              <div className="absolute -top-4 -right-4 w-12 h-12 opacity-25">
                <Image
                  src="/images/icons/logo.png"
                  alt="装飾アイコン"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain transform rotate-12"
                />
              </div>

              <div className="bg-gray-800 rounded-xl p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <div className="w-8 h-8 mr-3">
                    <Image
                      src="/images/icons/logo.png"
                      alt="装飾アイコン"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain transform rotate-90"
                    />
                  </div>
                  👨‍💻 開発チーム
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-700 rounded-lg p-6 text-center relative">
                    {/* 装飾アイコン - メンバーカード */}
                    <div className="absolute top-2 right-2 w-5 h-5 opacity-40">
                      <Image
                        src="/images/icons/logo.png"
                        alt="装飾アイコン"
                        width={20}
                        height={20}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-br from-magic-500 to-cosmic-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">👨‍💻</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">開発リーダー</h3>
                    <p className="text-gray-300 text-sm mb-3">システムアーキテクチャと技術戦略</p>
                    <div className="flex justify-center space-x-2">
                      <span className="px-2 py-1 bg-magic-500/20 text-magic-300 rounded text-xs">React</span>
                      <span className="px-2 py-1 bg-magic-500/20 text-magic-300 rounded text-xs">Django</span>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-6 text-center relative">
                    {/* 装飾アイコン - メンバーカード */}
                    <div className="absolute top-2 right-2 w-5 h-5 opacity-40">
                      <Image
                        src="/images/icons/logo.png"
                        alt="装飾アイコン"
                        width={20}
                        height={20}
                        className="w-full h-full object-contain transform rotate-45"
                      />
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-br from-magic-500 to-cosmic-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">UI/UXデザイナー</h3>
                    <p className="text-gray-300 text-sm mb-3">ユーザー体験とビジュアルデザイン</p>
                    <div className="flex justify-center space-x-2">
                      <span className="px-2 py-1 bg-magic-500/20 text-magic-300 rounded text-xs">Figma</span>
                      <span className="px-2 py-1 bg-magic-500/20 text-magic-300 rounded text-xs">Tailwind</span>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-6 text-center relative">
                    {/* 装飾アイコン - メンバーカード */}
                    <div className="absolute top-2 right-2 w-5 h-5 opacity-40">
                      <Image
                        src="/images/icons/logo.png"
                        alt="装飾アイコン"
                        width={20}
                        height={20}
                        className="w-full h-full object-contain transform -rotate-45"
                      />
                    </div>
                    <div className="w-20 h-20 bg-gradient-to-br from-magic-500 to-cosmic-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">AIエンジニア</h3>
                    <p className="text-gray-300 text-sm mb-3">機械学習とAI機能の開発</p>
                    <div className="flex justify-center space-x-2">
                      <span className="px-2 py-1 bg-magic-500/20 text-magic-300 rounded text-xs">Python</span>
                      <span className="px-2 py-1 bg-magic-500/20 text-magic-300 rounded text-xs">TensorFlow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* お問い合わせセクション */}
            <div className="mb-16 relative">
              {/* 装飾アイコン - セクション左下 */}
              <div className="absolute -bottom-4 -left-4 w-12 h-12 opacity-25">
                <Image
                  src="/images/icons/logo.png"
                  alt="装飾アイコン"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain transform rotate-180"
                />
              </div>

              <div className="bg-gray-800 rounded-xl p-8">
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <div className="w-8 h-8 mr-3">
                    <Image
                      src="/images/icons/logo.png"
                      alt="装飾アイコン"
                      width={32}
                      height={32}
                      className="w-full h-full object-contain transform -rotate-90"
                    />
                  </div>
                  📧 お問い合わせ
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">連絡先</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📧</span>
                        <div>
                          <p className="text-white font-medium">メール</p>
                          <p className="text-gray-300">contact@eldonia-nex.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🌐</span>
                        <div>
                          <p className="text-white font-medium">ウェブサイト</p>
                          <p className="text-gray-300">https://eldonia-nex.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">📱</span>
                        <div>
                          <p className="text-white font-medium">ソーシャルメディア</p>
                          <p className="text-gray-300">@EldoniaNex</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">サポート</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">❓</span>
                        <div>
                          <p className="text-white font-medium">よくある質問</p>
                          <p className="text-gray-300">FAQページをご確認ください</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🛠️</span>
                        <div>
                          <p className="text-white font-medium">技術サポート</p>
                          <p className="text-gray-300">support@eldonia-nex.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">💼</span>
                        <div>
                          <p className="text-white font-medium">ビジネス提携</p>
                          <p className="text-gray-300">partnership@eldonia-nex.com</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 統計情報 */}
            <div className="bg-gray-800 rounded-xl p-8 mb-12 relative">
              {/* 装飾アイコン - 統計セクション四隅 */}
              <div className="absolute top-4 left-4 w-8 h-8 opacity-30">
                <Image
                  src="/images/icons/logo.png"
                  alt="装飾アイコン"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute top-4 right-4 w-8 h-8 opacity-30">
                <Image
                  src="/images/icons/logo.png"
                  alt="装飾アイコン"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain transform rotate-90"
                />
              </div>
              <div className="absolute bottom-4 left-4 w-8 h-8 opacity-30">
                <Image
                  src="/images/icons/logo.png"
                  alt="装飾アイコン"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain transform -rotate-90"
                />
              </div>
              <div className="absolute bottom-4 right-4 w-8 h-8 opacity-30">
                <Image
                  src="/images/icons/logo.png"
                  alt="装飾アイコン"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain transform rotate-180"
                />
              </div>

              <h2 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
                <div className="w-6 h-6 mr-2">
                  <Image
                    src="/images/icons/logo.png"
                    alt="装飾アイコン"
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                </div>
                📊 Eldonia-Nex 統計
                <div className="w-6 h-6 ml-2">
                  <Image
                    src="/images/icons/logo.png"
                    alt="装飾アイコン"
                    width={24}
                    height={24}
                    className="w-full h-full object-contain transform rotate-180"
                  />
                </div>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-2">1,000+</div>
                  <div className="text-gray-400 text-sm">登録クリエイター</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-2">5,000+</div>
                  <div className="text-gray-400 text-sm">投稿作品</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-2">50+</div>
                  <div className="text-gray-400 text-sm">対応言語</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-500 mb-2">99.9%</div>
                  <div className="text-gray-400 text-sm">稼働率</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <Footer />
    </PageWithSidebars>
  )
}
