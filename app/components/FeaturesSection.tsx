'use client'

import Link from 'next/link'
import { Palette, ShoppingCart, Calendar, Users, BookOpen, DollarSign } from 'lucide-react'
import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'

export default function FeaturesSection() {
  const { elementRef, animationClass } = useIntersectionObserver({ 
    triggerOnce: false,
    threshold: 0.2,
    rootMargin: '0px 0px -100px 0px',
    animationType: 'scale'
  })
  const { t } = useI18n()

  const features = [
    {
      icon: Palette,
      title: 'GALLERY',
      description: t('galleryDesc'),
      link: '/gallery',
      color: 'magic',
      gradient: 'from-magic-500/20 via-purple-500/20 to-magic-600/20'
    },
    {
      icon: ShoppingCart,
      title: 'SHOP',
      description: t('shopDesc'),
      link: '/shop',
      color: 'emerald',
      gradient: 'from-emerald-500/20 via-green-500/20 to-emerald-600/20'
    },
    {
      icon: Calendar,
      title: 'EVENTS',
      description: t('eventsDesc'),
      link: '/events',
      color: 'amber',
      gradient: 'from-amber-500/20 via-yellow-500/20 to-amber-600/20'
    },
    {
      icon: Users,
      title: 'COMMUNITY',
      description: t('communityDesc'),
      link: '/community',
      color: 'cosmic',
      gradient: 'from-cosmic-500/20 via-blue-500/20 to-cosmic-600/20'
    },
    {
      icon: BookOpen,
      title: 'WORKS',
      description: t('storytellingDesc'),
      link: '/works',
      color: 'rose',
      gradient: 'from-rose-500/20 via-pink-500/20 to-rose-600/20'
    },
    {
      icon: DollarSign,
      title: 'MONEY',
      description: t('moneyDesc'),
      link: '/money',
      color: 'neon',
      gradient: 'from-neon-500/20 via-cyan-500/20 to-neon-600/20'
    }
  ]

  return (
    <div 
      ref={elementRef}
      className={`max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 ${animationClass}`}
    >
      <div className="text-center mb-16">
        <h2 className="section-title">
          Our Features
        </h2>
        <p className="section-subtitle">
          {t('ourFeaturesDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Link 
            key={feature.title}
            href={feature.link}
            className="section-card group block"
            style={{ 
              transitionDelay: `${Math.min(index * 150, 900)}ms`
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
          </Link>
        ))}
      </div>
    </div>
  )
} 