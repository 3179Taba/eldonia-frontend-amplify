'use client'

import Link from 'next/link'
import Image from 'next/image'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
}

export default function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  return (
    <Link href="/" className="flex items-center space-x-3">
      <div className={`relative ${sizeClasses[size]}`}>
        <Image
          src="/images/icons/logo.png"
          alt="Eldonia-Nex"
          width={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 48 : 64}
          height={size === 'sm' ? 24 : size === 'md' ? 32 : size === 'lg' ? 48 : 64}
          className="rounded-lg"
          priority={size === 'lg' || size === 'xl'}
        />
      </div>
      {showText && (
        <span className={`font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400 ${textClasses[size]}`}>
          Eldonia-Nex
        </span>
      )}
    </Link>
  )
} 