'use client'

import { Eye, Heart, TrendingUp, Heart as HeartIcon, Eye as EyeIcon, Share2, Play, Music, Image } from 'lucide-react'
import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'

export default function FeaturedWorksSection() {
  const { elementRef, animationClass } = useIntersectionObserver({ 
    triggerOnce: false,
    animationType: 'scale'
  })
  const { t } = useI18n()

  const mostViewedWorks = [
    {
      icon: Play,
      title: 'Epic Fantasy Animation',
      creator: 'Animation Master',
      description: t('epicFantasyAnimationDesc'),
      color: 'magic',
      gradient: 'from-magic-500/30 via-purple-500/20 to-magic-600/30',
      likes: '2.8k',
      views: '45.2k',
      type: 'video',
      badge: '🎬 Video'
    },
    {
      icon: Music,
      title: 'Cosmic Symphony',
      creator: 'Sound Artist',
      description: t('cosmicSymphonyDesc'),
      color: 'cosmic',
      gradient: 'from-cosmic-500/30 via-blue-500/20 to-cosmic-600/30',
      likes: '1.9k',
      views: '38.7k',
      type: 'music',
      badge: '🎵 Music'
    },
    {
      icon: Image,
      title: 'Cyberpunk Cityscape',
      creator: 'Digital Artist',
      description: t('cyberpunkCityscapeDesc'),
      color: 'neon',
      gradient: 'from-neon-500/30 via-cyan-500/20 to-neon-600/30',
      likes: '3.1k',
      views: '32.1k',
      type: 'image',
      badge: '🖼️ Image'
    }
  ]

  const mostLikedWorks = [
    {
      icon: Play,
      title: 'Dragon Quest Saga',
      creator: 'Epic Creator',
      description: t('dragonQuestSagaDesc'),
      color: 'amber',
      gradient: 'from-amber-500/30 via-yellow-500/20 to-amber-600/30',
      likes: '5.2k',
      views: '28.9k',
      type: 'video',
      badge: '🎬 Video'
    },
    {
      icon: Music,
      title: 'Neon Dreams',
      creator: 'Synth Master',
      description: t('neonDreamsDesc'),
      color: 'rose',
      gradient: 'from-rose-500/30 via-pink-500/20 to-rose-600/30',
      likes: '4.8k',
      views: '22.3k',
      type: 'music',
      badge: '🎵 Music'
    },
    {
      icon: Image,
      title: 'Mystic Forest',
      creator: 'Nature Artist',
      description: t('mysticForestDesc'),
      color: 'emerald',
      gradient: 'from-emerald-500/30 via-green-500/20 to-emerald-600/30',
      likes: '4.1k',
      views: '19.7k',
      type: 'image',
      badge: '🖼️ Image'
    }
  ]

  const trendingWorks = [
    {
      icon: Play,
      title: 'Space Odyssey',
      creator: 'Cosmic Creator',
      description: t('spaceOdysseyDesc'),
      color: 'cosmic',
      gradient: 'from-cosmic-500/30 via-blue-500/20 to-cosmic-600/30',
      likes: '3.7k',
      views: '41.5k',
      type: 'video',
      badge: '🎬 Video'
    },
    {
      icon: Music,
      title: 'Digital Rain',
      creator: 'Matrix Composer',
      description: t('digitalRainDesc'),
      color: 'neon',
      gradient: 'from-neon-500/30 via-cyan-500/20 to-neon-600/30',
      likes: '2.9k',
      views: '35.8k',
      type: 'music',
      badge: '🎵 Music'
    },
    {
      icon: Image,
      title: 'Steampunk World',
      creator: 'Steam Artist',
      description: t('steampunkWorldDesc'),
      color: 'amber',
      gradient: 'from-amber-500/30 via-yellow-500/20 to-amber-600/30',
      likes: '3.3k',
      views: '29.4k',
      type: 'image',
      badge: '��️ Image'
    }
  ]

  const renderWorkCard = (work: any, index: number) => (
    <div 
      key={work.title}
      className={`section-card group cursor-pointer ${animationClass}`}
      style={{ 
        transitionDelay: `${Math.min(index * 100, 600)}ms`
      }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${work.gradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`feature-icon ${work.color} group-hover:animate-glow`}>
            <work.icon className={`h-6 w-6 text-${work.color}-400 group-hover:text-${work.color}-300 transition-colors`} />
          </div>
          <span className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-white/80">
            {work.badge}
          </span>
        </div>
        
        <h3 className="text-lg font-playfair font-semibold text-white mb-2 group-hover:text-white transition-colors">
          {work.title}
        </h3>
        
        <p className="text-sm text-white/60 mb-2 font-exo2">
          by {work.creator}
        </p>
        
        <p className="text-sm text-white/80 mb-4 font-exo2 leading-relaxed">
          {work.description}
        </p>

        <div className="flex items-center justify-between text-xs text-white/60 mt-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <HeartIcon className="h-3 w-3 text-rose-400" />
              <span>{work.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <EyeIcon className="h-3 w-3 text-cosmic-400" />
              <span>{work.views}</span>
            </div>
          </div>
          <button className={`text-${work.color}-400 hover:text-${work.color}-300 transition-colors`}>
            <Share2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div 
      ref={elementRef}
      className={`max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 ${animationClass}`}
    >
      <div className="text-center mb-16">
        <h2 className="section-title">
          Featured Works
        </h2>
        <p className="section-subtitle">
          {t('featuredWorksDesc')}
        </p>
      </div>

      {/* 最多アクセス作品 */}
      <div className="mb-16">
        <h3 className="text-2xl font-playfair font-bold text-center mb-8 golden-text">
          Most Viewed Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mostViewedWorks.map((work, index) => renderWorkCard(work, index))}
        </div>
      </div>

      {/* 最多いいね作品 */}
      <div className="mb-16">
        <h3 className="text-2xl font-playfair font-bold text-center mb-8 golden-text">
          Most Liked Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mostLikedWorks.map((work, index) => renderWorkCard(work, index))}
        </div>
      </div>

      {/* 急上昇作品 */}
      <div className="mb-16">
        <h3 className="text-2xl font-playfair font-bold text-center mb-8 golden-text">
          Trending Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trendingWorks.map((work, index) => renderWorkCard(work, index))}
        </div>
      </div>
    </div>
  )
} 