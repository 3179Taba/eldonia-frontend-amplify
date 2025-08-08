'use client'

import { Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'
import { useAuth } from '../lib/auth-context'
import { getUserLevelInfo, canUserPost } from '../lib/user-levels'
import TranslatableText from './TranslatableText'

export default function HeroSection() {
  const { elementRef, animationClass } = useIntersectionObserver({ 
    triggerOnce: false,
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    animationType: 'scale'
  })
  const { t } = useI18n()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const handleGalleryClick = () => {
    router.push('/gallery')
  }

  const handlePostClick = () => {
    if (!isAuthenticated) {
      // ログインしていない場合はログインページへ
      router.push('/auth/login')
      return
    }

    const levelInfo = getUserLevelInfo(user)
    
    if (levelInfo.level === 'super') {
      // スーパーユーザーの場合は投稿ルールページへ
      router.push('/post/rules')
    } else if (canUserPost(user)) {
      // 一般・ビジネスユーザーの場合は投稿ルールページへ
      router.push('/post/rules')
    } else {
      // 投稿権限がない場合
      alert('投稿権限がありません。')
    }
  }

  return (
    <div 
      ref={elementRef}
      className={`min-h-[80vh] flex flex-col justify-center items-center relative pt-16 pb-8 initial-visible ${animationClass}`}
    >
      {/* コンテンツ */}
      <div className="text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-5xl md:text-7xl font-playfair font-bold mb-8">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400">
              <span className="inline-block text-5xl md:text-7xl">Welcome to</span>
              <span className="inline-block text-5xl md:text-7xl mx-2">Eldonia-Nex</span>
            </span>
          </h2>
          <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed font-exo2">
            <TranslatableText 
              translationKey="heroSubtitle"
              fallbackText={t('heroSubtitle')}
              className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed font-exo2"
            />
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button 
            onClick={handlePostClick}
            className="magic-button text-lg"
          >
            <Sparkles className="inline-block w-6 h-6 mr-3" />
            <TranslatableText 
              translationKey="postWork"
              fallbackText={t('postWork')}
              className="inline-block"
            />
          </button>
          <button 
            onClick={handleGalleryClick}
            className="px-8 py-4 bg-transparent border-2 border-cosmic-400 text-cosmic-200 hover:bg-cosmic-400/20 hover:text-white rounded-lg text-lg font-exo2 font-semibold transition-all duration-300 cosmic-border"
          >
            <TranslatableText 
              translationKey="exploreGallery"
              fallbackText={t('exploreGallery')}
              className="inline-block"
            />
          </button>
        </div>
      </div>
    </div>
  )
} 