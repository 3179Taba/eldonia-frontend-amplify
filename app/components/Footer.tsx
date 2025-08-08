'use client'

import Image from 'next/image'
import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'
import {
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  HelpCircle,
  FileText,
  Shield,
  Users,
  Heart,
  ExternalLink
} from 'lucide-react'

export default function Footer() {
  const { elementRef, animationClass } = useIntersectionObserver({
    triggerOnce: false,
    animationType: 'scale'
  })
  const { t } = useI18n()

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter', color: 'text-blue-400 hover:text-blue-300' },
    { icon: Facebook, href: '#', label: 'Facebook', color: 'text-blue-600 hover:text-blue-500' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'text-pink-400 hover:text-pink-300' },
    { icon: Youtube, href: '#', label: 'YouTube', color: 'text-red-400 hover:text-red-300' },
    { icon: Github, href: '#', label: 'GitHub', color: 'text-gray-400 hover:text-gray-300' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'text-blue-500 hover:text-blue-400' }
  ]

  const technologies = [
    { name: 'Next.js 15', description: 'React Framework' },
    { name: 'TypeScript', description: 'Type Safety' },
    { name: 'Tailwind CSS', description: 'Styling Framework' },
    { name: 'Django 4.2', description: 'Backend Framework' },
    { name: 'PostgreSQL', description: 'Database' },
    { name: 'Docker', description: 'Containerization' }
  ]

  const support = [
    { icon: FileText, name: t('termsOfService'), href: '/support/terms-of-service' },
    { icon: HelpCircle, name: t('helpCenter'), href: '/support/faq' },
    { icon: MessageCircle, name: t('contactUs'), href: '/support/contact' },
    { icon: Mail, name: t('feedback'), href: '/support/feedback' },
    { icon: FileText, name: t('documentation'), href: '/support/tech' },
    { icon: Shield, name: t('privacyPolicy'), href: '/support/terms' },
    { icon: Users, name: t('communityGuidelines'), href: '/support' },
    {
      icon: Heart,
      name: t('pricingPlans'),
      href: '/premium'
    }
  ]

  const partners = [
    { name: 'TechCorp Studios', description: t('techPartner'), logo: '🏢' },
    { name: 'Creative Nexus', description: t('creativePartner'), logo: '🎨' },
    { name: 'Digital Dreams Inc.', description: t('digitalPartner'), logo: '💻' },
    { name: 'Artistry Alliance', description: t('artPartner'), logo: '🖼️' }
  ]

  return (
    <footer
      ref={elementRef}
      className={`relative z-10 glass-effect mt-16 ${animationClass}`}
    >
      {/* Social Media Section */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative w-8 h-8">
              <Image
                src="/images/icons/logo.png"
                alt="Eldonia-Nex Icon"
                width={32}
                height={32}
                className="rounded-lg"
              />
            </div>
            <span className="golden-text text-lg font-playfair">
              Eldonia-Nex
            </span>
          </div>

          {/* Social Media Icons */}
          <div className="flex justify-center space-x-3 mb-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className={`p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 ${social.color}`}
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          <p className="text-white/60 font-exo2 text-sm">
            {t('footerDesc')}
          </p>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Technologies Column */}
          <div>
            <h3 className="text-base font-playfair font-bold text-white mb-4">
              {t('technologies')}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {technologies.map((tech) => (
                <div key={tech.name} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-magic-400 rounded-full"></div>
                  <div>
                    <p className="text-white font-exo2 font-semibold text-xs">
                      {tech.name}
                    </p>
                    <p className="text-white/60 font-exo2 text-xs">
                      {tech.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-base font-playfair font-bold text-white mb-4">
              {t('support')}
            </h3>
            <div className="space-y-2">
              {support.map((item, index) => (
                <a
                  key={index}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-white/60 hover:text-white transition-colors font-exo2 text-sm group"
                >
                  <item.icon className="h-3 w-3" />
                  <span>{item.name}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {/* Partners Column */}
          <div>
            <h3 className="text-base font-playfair font-bold text-white mb-4">
              {t('partners')}
            </h3>
            <div className="space-y-2">
              {partners.map((partner) => (
                <div key={partner.name} className="flex items-center space-x-2 p-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
                  <span className="text-lg">{partner.logo}</span>
                  <div>
                    <p className="text-white font-exo2 font-semibold text-xs">
                      {partner.name}
                    </p>
                    <p className="text-white/60 font-exo2 text-xs">
                      {partner.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-white/60 font-exo2 text-xs">
            © 2024 Eldonia-Nex. {t('allRightsReserved')}
          </div>
        </div>
      </div>
    </footer>
  )
}
