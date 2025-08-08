'use client'

import { useIntersectionObserver } from '../../lib/useIntersectionObserver'
import { useI18n } from '../../lib/i18n-provider'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import LeftSidebar from '../../components/LeftSidebar'
import { useRef, useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'

// ダミーユーザーデータ
const dummyUsers = {
  '1': {
    id: '1',
    name: '魔法使いのアリス',
    avatar: '🧙‍♀️',
    bio: 'エルドニアの魔法学院を卒業した魔法使い。美しい魔法のアイテムを制作しています。',
    rating: 4.9,
    reviewCount: 1247,
    followerCount: 8920,
    followingCount: 234,
    joinDate: '2023年3月',
    location: 'エルドニア魔法学院',
    specialty: '魔法アイテム制作',
    products: [
      { id: 1, name: 'エルドニア ファンタジーアートコレクション', price: 2980, image: '🎨' },
      { id: 4, name: '魔法使いの杖 レプリカ', price: 5980, image: '🪄' },
      { id: 5, name: 'エルドニア ワールドマップ', price: 2980, image: '🗺️' }
    ]
  },
  '2': {
    id: '2',
    name: '冒険者のボブ',
    avatar: '🗡️',
    bio: 'エルドニア大陸を旅する冒険者。各地で見つけた珍しいアイテムを販売しています。',
    rating: 4.7,
    reviewCount: 892,
    followerCount: 5670,
    followingCount: 156,
    joinDate: '2022年8月',
    location: 'エルドニア大陸各地',
    specialty: '冒険グッズ',
    products: [
      { id: 2, name: '魔法の物語 完全版', price: 1580, image: '📚' },
      { id: 6, name: '冒険者の日記帳', price: 880, image: '📖' },
      { id: 8, name: '魔法の調合キット', price: 2480, image: '🧪' }
    ]
  },
  '3': {
    id: '3',
    name: '音楽家のキャロル',
    avatar: '🎵',
    bio: 'エルドニアの宮廷音楽家。美しい音楽と楽器を制作・販売しています。',
    rating: 4.8,
    reviewCount: 567,
    followerCount: 3450,
    followingCount: 89,
    joinDate: '2023年1月',
    location: 'エルドニア宮廷',
    specialty: '音楽・楽器',
    products: [
      { id: 3, name: 'エルドニア サウンドトラック', price: 1280, image: '🎵' },
      { id: 7, name: 'エルドニア キャラクターコレクション', price: 3980, image: '🎭' }
    ]
  }
}

// アニメーション付きカードラッパー
function AnimatedCard({ children, className = '', ...props }: { children: ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-in ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { elementRef, isVisible } = useIntersectionObserver({ triggerOnce: false })
  const { t } = useI18n()
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params
      setUserId(resolvedParams.id)
      const foundUser = dummyUsers[resolvedParams.id as keyof typeof dummyUsers]
      setUser(foundUser)
    }
    resolveParams()
  }, [params])

  if (!user) {
    return (
      <div className="min-h-screen bg-fantasy-gradient relative overflow-hidden">
        <div className="pt-20 text-center">
          <h1 className="text-2xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400">
            ユーザーが見つかりません
          </h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-fantasy-gradient relative overflow-hidden">
      {/* 左サイドバー - PC版のみ表示 */}
      <div className="hidden lg:block">
        <LeftSidebar isOpen={isLeftSidebarOpen} onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
      </div>

      {/* メインコンテンツエリア - 左サイドバーのみ */}
      <div className={`pt-20 transition-all duration-300 ${
        isLeftSidebarOpen ? 'lg:ml-64 lg:mr-16' : 'lg:ml-16 lg:mr-16'
      }`}>
        {/* ヘッダー */}
        <Header />

        {/* メインコンテンツ */}
        <main className="relative z-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
          <div
            ref={elementRef}
            className={`transition-all duration-1000 ${
              isVisible ? 'scroll-visible' : 'scroll-hidden'
            }`}
          >
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* ユーザープロフィールヘッダー */}
              <AnimatedCard className="glass-effect border border-white/10 p-8 mb-8">
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-8xl">{user.avatar}</div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400 mb-2">
                      {user.name}
                    </h1>
                    <p className="text-gray-300 mb-4">{user.bio}</p>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★</span>
                        <span>{user.rating}</span>
                        <span>({user.reviewCount}件)</span>
                      </div>
                      <div>フォロワー: {user.followerCount.toLocaleString()}</div>
                      <div>フォロー: {user.followingCount}</div>
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-medium shadow-lg">
                    フォロー
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">参加日:</span>
                    <div className="text-white">{user.joinDate}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">所在地:</span>
                    <div className="text-white">{user.location}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">専門分野:</span>
                    <div className="text-white">{user.specialty}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">商品数:</span>
                    <div className="text-white">{user.products.length}点</div>
                  </div>
                </div>
              </AnimatedCard>

              {/* 出品商品 */}
              <div>
                <h2 className="text-2xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400 mb-6">
                  {user.name}の商品
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {user.products.map((product) => (
                    <AnimatedCard key={product.id} className="glass-effect border border-white/10 hover:border-yellow-400/30 transition-all duration-300 overflow-hidden group">
                      <div className="relative">
                        <div className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-700/50 flex items-center justify-center p-4 group-hover:from-gray-700/50 group-hover:to-gray-600/50 transition-all duration-300">
                          <div className="text-6xl">{product.image}</div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-white mb-2 line-clamp-2 hover:text-yellow-400 cursor-pointer transition-colors duration-300">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-yellow-400">¥{product.price.toLocaleString()}</span>
                        </div>
                        <Link
                          href={`/shop?product=${product.id}`}
                          className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-medium shadow-lg text-center mt-3"
                        >
                          商品詳細
                        </Link>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </div>

              {/* 戻るボタン */}
              <div className="mt-8 text-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-gray-800/50 text-white px-6 py-3 rounded-md hover:bg-gray-700/50 transition-all duration-300 border border-white/10"
                >
                  ← ショップに戻る
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* フッター */}
        <Footer />
      </div>
    </div>
  )
}
