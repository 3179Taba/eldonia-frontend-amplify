'use client'

import { Palette, Sparkles, LucideIcon } from 'lucide-react'
import TranslatableText from './TranslatableText'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  iconEmoji?: string
  showIcon?: boolean
  className?: string
  titleClassName?: string
  subtitleClassName?: string
  backgroundGradient?: string
  iconGradient?: string
}

export default function PageHeader({ 
  title, 
  subtitle,
  icon: IconComponent = Palette,
  iconEmoji = "🎨",
  showIcon = true,
  className = "",
  titleClassName = "text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 mb-2 font-bebas-neue tracking-wider",
  subtitleClassName = "text-amber-400 text-sm font-cormorant-garamond tracking-widest italic",
  backgroundGradient = "bg-gradient-to-r from-gray-900/80 via-gray-800/80 to-gray-900/80",
  iconGradient = "bg-gradient-to-br from-purple-500 to-cyan-400"
}: PageHeaderProps) {
  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 ${className}`}>
      <div className="flex items-center gap-4">
        {showIcon && (
          <div className={`w-16 h-16 ${iconGradient} rounded-lg flex items-center justify-center relative`}>
            {IconComponent ? (
              <IconComponent className="w-8 h-8 text-white" />
            ) : (
              <span className="text-2xl">{iconEmoji}</span>
            )}
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-2 h-2 text-white" />
            </div>
          </div>
        )}
        
        <div className="flex-1">
          <h1 className={titleClassName}>
            {title}
          </h1>
          {subtitle && (
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
              <span className={subtitleClassName}>
                <TranslatableText translationKey="pageSubtitle" fallbackText={subtitle} />
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 