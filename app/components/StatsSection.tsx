'use client'

import { Users, Palette, Heart, Calendar } from 'lucide-react'
import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'

export default function StatsSection() {
  const { elementRef, animationClass } = useIntersectionObserver({ 
    triggerOnce: false,
    animationType: 'scale'
  })
  const { t } = useI18n()

  const stats = [
    { 
      value: '1,500+', 
      label: t('creators'), 
      color: 'magic',
      icon: Users,
      description: t('activeCreators')
    },
    { 
      value: '5,200+', 
      label: t('works'), 
      color: 'cosmic',
      icon: Palette,
      description: t('postedWorks')
    },
    { 
      value: '25,000+', 
      label: t('fans'), 
      color: 'rose',
      icon: Heart,
      description: t('communityMembers')
    },
    { 
      value: '150+', 
      label: t('eventCount'), 
      color: 'amber',
      icon: Calendar,
      description: t('heldEvents')
    }
  ]

  return (
    <div 
      ref={elementRef}
      className={`max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 ${animationClass}`}
    >
      <div className="text-center mb-16">
        <h2 className="section-title">
          {t('communityGrowth')}
        </h2>
        <p className="section-subtitle">
          {t('communityGrowthDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <div 
            key={stat.label}
            className="stat-card group"
            style={{ 
              transitionDelay: `${Math.min(index * 100, 600)}ms`
            }}
          >
            <div className="text-center">
              <div className={`feature-icon ${stat.color} mx-auto mb-4 group-hover:animate-glow`}>
                <stat.icon className={`h-8 w-8 text-${stat.color}-400 group-hover:text-${stat.color}-300 transition-colors`} />
              </div>
              
              <div className={`text-3xl md:text-4xl font-roboto font-bold text-${stat.color}-400 
                              mb-2 group-hover:text-${stat.color}-300 transition-colors leading-none`}>
                {stat.value}
              </div>
              
              <div className="text-white font-exo2 font-semibold mb-1">
                {stat.label}
              </div>
              
              <div className="text-white/60 font-exo2 text-sm">
                {stat.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-16">
        <div className="section-card inline-block">
          <h3 className="text-2xl font-playfair font-bold mb-4">
            <span className="golden-text">{t('joinGrowingCommunity')}</span>
          </h3>
          <p className="text-white/80 font-exo2 mb-6">
            {t('joinGrowingCommunityDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="magic-button">
              <Users className="inline-block w-5 h-5 mr-2" />
              {t('joinCommunity')}
            </button>
            <button className="px-6 py-3 bg-transparent border-2 border-cosmic-400 text-cosmic-200 
                              hover:bg-cosmic-400/20 hover:text-white rounded-lg font-exo2 font-semibold 
                              transition-all duration-300 cosmic-border">
              <Heart className="inline-block w-5 h-5 mr-2" />
              {t('postWork')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 