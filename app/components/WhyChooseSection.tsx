'use client'

import { Crown, Heart, Zap, Shield, Users, Sparkles } from 'lucide-react'
import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'

export default function WhyChooseSection() {
  const { elementRef, animationClass } = useIntersectionObserver({ 
    triggerOnce: false,
    animationType: 'scale'
  })
  const { t } = useI18n()

  const features = [
    {
      icon: Crown,
      title: 'Unlimited Creativity',
      description: t('unlimitedCreativityDesc'),
      color: 'magic',
      gradient: 'from-magic-500/20 to-magic-600/20'
    },
    {
      icon: Heart,
      title: 'Global Community',
      description: t('globalCommunityDesc'),
      color: 'rose',
      gradient: 'from-rose-500/20 to-rose-600/20'
    },
    {
      icon: Zap,
      title: 'Advanced Tools',
      description: t('advancedToolsDesc'),
      color: 'amber',
      gradient: 'from-amber-500/20 to-amber-600/20'
    },
    {
      icon: Shield,
      title: 'Secure Platform',
      description: t('securePlatformDesc'),
      color: 'emerald',
      gradient: 'from-emerald-500/20 to-emerald-600/20'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: t('collaborationDesc'),
      color: 'cosmic',
      gradient: 'from-cosmic-500/20 to-cosmic-600/20'
    },
    {
      icon: Sparkles,
      title: 'Growth Support',
      description: t('growthSupportDesc'),
      color: 'neon',
      gradient: 'from-neon-500/20 to-neon-600/20'
    }
  ]

  return (
    <div 
      ref={elementRef}
      className={`max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 ${animationClass}`}
    >
      <div className="text-center mb-16">
        <h2 className="section-title">
          Why Choose FantasyVerse
        </h2>
        <p className="section-subtitle">
          {t('whyChooseDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div 
            key={feature.title}
            className="section-card group"
            style={{ 
              transitionDelay: `${Math.min(index * 100, 600)}ms`
            }}
          >
            <div className="flex items-center mb-6">
              <div className={`feature-icon ${feature.color} group-hover:animate-glow`}>
                <feature.icon className={`h-10 w-10 text-${feature.color}-400 group-hover:text-${feature.color}-300 transition-colors`} />
              </div>
              <h3 className="text-xl font-playfair font-semibold text-white ml-4 group-hover:text-white transition-colors">
                {feature.title}
              </h3>
            </div>
            
            <p className="text-white/80 mb-6 font-exo2 leading-relaxed group-hover:text-white/90 transition-colors">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="text-center mt-16">
        <div className="section-card inline-block">
          <h3 className="text-2xl font-playfair font-bold mb-4">
            <span className="golden-text">Get Started Today</span>
          </h3>
          <p className="text-white/80 font-exo2 mb-6">
            {t('getStartedDesc')}
          </p>
          <button className="magic-button">
            <Sparkles className="inline-block w-5 h-5 mr-2" />
            {t('startFree')}
          </button>
        </div>
      </div>
    </div>
  )
} 