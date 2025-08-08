'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

interface LeftSidebarProps {
  isOpen?: boolean
  onToggle?: () => void
}

export default function LeftSidebar({ isOpen = true, onToggle }: LeftSidebarProps) {
  return (
    <div className={`bg-black/20 backdrop-blur-md h-[calc(100vh-5rem)] fixed left-0 top-20 z-30 overflow-y-auto transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      <LeftSidebarContent isOpen={isOpen} onToggle={onToggle} />
    </div>
  )
}

export function LeftSidebarContent({ isOpen, onToggle }: { isOpen?: boolean; onToggle?: () => void }) {
  const pathname = usePathname()
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  const menuItems = [
    {
      title: 'Gallery',
      path: '/gallery',
      icon: '🎨',
      subItems: [
        { title: '動画', path: '/gallery/video', icon: '🎬' },
        { title: '画像', path: '/gallery/image', icon: '🖼️' },
        { title: '音楽', path: '/gallery/music', icon: '🎵' }
      ]
    },
    {
      title: 'Shop',
      path: '/shop',
      icon: '🛍️',
      subItems: [
        { title: 'アートプリント', path: '/shop/prints', icon: '🎨' },
        { title: 'アパレル', path: '/shop/apparel', icon: '👕' },
        { title: 'デジタル商品', path: '/shop/digital', icon: '📱' },
        { title: 'グッズ', path: '/shop/goods', icon: '🎁' }
      ]
    },
    {
      title: 'Events',
      path: '/events',
      icon: '🎪',
      subItems: [
        { title: '今後のイベント', path: '/events/upcoming', icon: '📅' },
        { title: '過去のイベント', path: '/events/past', icon: '📚' },
        { title: 'イベントカレンダー', path: '/events/calendar', icon: '🗓️' }
      ]
    },
    {
      title: 'Community',
      path: '/community',
      icon: '👥',
      subItems: [
        { title: 'フォーラム', path: '/community/forum', icon: '💬' },
        { title: '作品共有', path: '/community/share', icon: '🎨' },
        { title: 'コラボレーション', path: '/community/collab', icon: '🤝' },
        { title: 'チュートリアル', path: '/community/tutorials', icon: '📚' },
        { title: 'コンテスト', path: '/community/contests', icon: '🏆' }
      ]
    },
    {
      title: 'Works',
      path: '/works',
      icon: '💼',
      subItems: [
        { title: '仕事依頼', path: '/works/jobs', icon: '📋' },
        { title: '人材募集', path: '/works/recruit', icon: '👥' },
        { title: 'クリエーターアピール', path: '/works/creators', icon: '🎨' }
      ]
    },
    {
      title: 'About',
      path: '/about',
      icon: '🏰',
      subItems: [
        { title: '私たちについて', path: '/about/company', icon: '🏢' },
        { title: '開発チーム', path: '/about/team', icon: '👨‍💻' },
        { title: 'お問い合わせ', path: '/about/contact', icon: '📧' }
      ]
    }
  ]

  return (
    <div className={`p-6 ${isOpen ? '' : 'p-2'}`}>
      <div className={`flex items-center justify-between mb-6 ${isOpen ? '' : 'mb-4'}`}>
        {isOpen && <h2 className="text-xl font-playfair font-bold golden-text">メニュー</h2>}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            aria-label={isOpen ? "メニューを最小化" : "メニューを展開"}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        )}
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
          const isMainActive = pathname === item.path
          const isAccordionOpen = openCategory === item.path
          
          return (
            <div key={item.path} className="space-y-1">
              <button
                type="button"
                onClick={() => setOpenCategory(isAccordionOpen ? null : item.path)}
                className={`w-full flex items-center ${isOpen ? 'space-x-3 px-4 py-3' : 'justify-center p-3'} rounded-lg transition-all duration-300 group ${
                  isMainActive 
                    ? 'bg-magic-500/20 text-magic-300 border border-magic-500/30' 
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={isOpen ? undefined : item.title}
              >
                <span className={`${isOpen ? 'text-lg' : 'text-xl'}`}>{item.icon}</span>
                {isOpen && <span className="font-medium flex-1 text-left">{item.title}</span>}
                {isOpen && (
                  item.subItems && item.subItems.length > 0 ? (
                    isAccordionOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />
                  ) : null
                )}
              </button>
              
              {isOpen && isAccordionOpen && item.subItems && (
                <div className="ml-6 space-y-1">
                  {item.subItems.map((subItem) => {
                    const isSubActive = pathname === subItem.path
                    
                    return (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-300 text-sm ${
                          isSubActive 
                            ? 'bg-cosmic-500/20 text-cosmic-300 border border-cosmic-500/30' 
                            : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                        }`}
                      >
                        <span>{subItem.icon}</span>
                        <span>{subItem.title}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      
      {isOpen && (
        <div className="mt-8 pt-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-white/50">
              <span>📊</span>
              <span>サイト統計</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white/50">
              <span>📈</span>
              <span>トレンド</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-white/50">
              <span>🎯</span>
              <span>おすすめ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 