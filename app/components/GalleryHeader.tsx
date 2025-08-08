'use client'


import TranslatableText from './TranslatableText'

interface GalleryHeaderProps {
  title?: string
  subtitle?: string
  showIcon?: boolean
  className?: string
}

export default function GalleryHeader({ 
  title = "CREATIVE GALLERY", 
  subtitle = "DIGITAL ARTWORK",
  showIcon = true,
  className = ""
}: GalleryHeaderProps) {
  return (
    <div className={`${className}`}>
      <div className="text-center">
        <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 mb-2 font-bebas-neue tracking-wider">
          {title}
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
          <span className="text-amber-400 text-sm font-cormorant-garamond tracking-widest italic">
            <TranslatableText translationKey="gallerySubtitle" fallbackText={subtitle} />
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
        </div>
      </div>
    </div>
  )
} 