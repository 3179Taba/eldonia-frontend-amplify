'use client'

import { useI18n } from '../lib/i18n-provider'
import { 
  ImageIcon, 
  ShoppingBag, 
  Calendar, 
  Users, 
  Briefcase, 
  Info, 
  Crown, 
  FileText,
  Home,
  Heart,
  MessageCircle,
  HelpCircle,
  Shield,
  Settings
} from 'lucide-react'

export default function SitemapPage() {
  const { t } = useI18n()

  const mainPages = [
    { icon: Home, name: t('home'), href: '/', description: t('homeDesc') },
    { icon: ImageIcon, name: t('gallery'), href: '/gallery', description: t('galleryDesc') },
    { icon: ShoppingBag, name: t('shop'), href: '/shop', description: t('shopDesc') },
    { icon: Calendar, name: t('events'), href: '/events', description: t('eventsDesc') },
    { icon: Users, name: t('community'), href: '/community', description: t('communityDesc') },
    { icon: Briefcase, name: t('works'), href: '/works', description: t('worksDesc') },
  ]

  const infoPages = [
    { icon: Info, name: t('about'), href: '/about', description: t('aboutDesc') },
    { icon: Crown, name: t('premium'), href: '/premium', description: t('premiumDesc') },
    { icon: FileText, name: t('terms'), href: '/terms', description: t('termsDesc') },
  ]

  const supportPages = [
    { icon: HelpCircle, name: t('helpCenter'), href: '#', description: t('helpCenterDesc') },
    { icon: MessageCircle, name: t('contactUs'), href: '#', description: t('contactUsDesc') },
    { icon: Heart, name: t('feedback'), href: '#', description: t('feedbackDesc') },
    { icon: Shield, name: t('privacyPolicy'), href: '#', description: t('privacyPolicyDesc') },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-fantasy-900 via-fantasy-800 to-fantasy-900">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-6">
            {t('siteMap')}
          </h1>
          <p className="text-xl text-white/80 font-exo2 max-w-3xl mx-auto">
            {t('siteMapDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Main Pages */}
          <div className="section-card">
            <div className="text-center mb-6">
              <div className="feature-icon magic mx-auto mb-4">
                <Home className="h-8 w-8 text-magic-400" />
              </div>
              <h2 className="text-xl font-playfair font-bold text-white mb-2">
                {t('mainPages')}
              </h2>
              <p className="text-white/60 font-exo2 text-sm">
                {t('mainPagesDesc')}
              </p>
            </div>
            <div className="space-y-3">
              {mainPages.map((page) => (
                <a
                  key={page.name}
                  href={page.href}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                >
                  <page.icon className="h-5 w-5 text-magic-400 group-hover:text-magic-300 transition-colors" />
                  <div className="flex-1">
                    <p className="text-white font-exo2 font-semibold text-sm group-hover:text-white transition-colors">
                      {page.name}
                    </p>
                    <p className="text-white/60 font-exo2 text-xs">
                      {page.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Info Pages */}
          <div className="section-card">
            <div className="text-center mb-6">
              <div className="feature-icon cosmic mx-auto mb-4">
                <Info className="h-8 w-8 text-cosmic-400" />
              </div>
              <h2 className="text-xl font-playfair font-bold text-white mb-2">
                {t('infoPages')}
              </h2>
              <p className="text-white/60 font-exo2 text-sm">
                {t('infoPagesDesc')}
              </p>
            </div>
            <div className="space-y-3">
              {infoPages.map((page) => (
                <a
                  key={page.name}
                  href={page.href}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                >
                  <page.icon className="h-5 w-5 text-cosmic-400 group-hover:text-cosmic-300 transition-colors" />
                  <div className="flex-1">
                    <p className="text-white font-exo2 font-semibold text-sm group-hover:text-white transition-colors">
                      {page.name}
                    </p>
                    <p className="text-white/60 font-exo2 text-xs">
                      {page.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Support Pages */}
          <div className="section-card">
            <div className="text-center mb-6">
              <div className="feature-icon rose mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-rose-400" />
              </div>
              <h2 className="text-xl font-playfair font-bold text-white mb-2">
                {t('supportPages')}
              </h2>
              <p className="text-white/60 font-exo2 text-sm">
                {t('supportPagesDesc')}
              </p>
            </div>
            <div className="space-y-3">
              {supportPages.map((page) => (
                <a
                  key={page.name}
                  href={page.href}
                  className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all duration-300 group"
                >
                  <page.icon className="h-5 w-5 text-rose-400 group-hover:text-rose-300 transition-colors" />
                  <div className="flex-1">
                    <p className="text-white font-exo2 font-semibold text-sm group-hover:text-white transition-colors">
                      {page.name}
                    </p>
                    <p className="text-white/60 font-exo2 text-xs">
                      {page.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 