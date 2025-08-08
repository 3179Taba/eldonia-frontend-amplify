'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { useI18n } from '../lib/i18n-provider'
import { usePathname } from 'next/navigation'

interface MenuItem {
  href: string
  label: string
  hasDropdown?: boolean
  dropdownItems?: DropdownItem[]
}

interface DropdownItem {
  href: string
  label: string
}

export default function Navigation({ isMobile = false, onItemClick }: { isMobile?: boolean, onItemClick?: () => void }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()
  const pathname = usePathname()

  const menuItems: MenuItem[] = [
    { href: '/gallery', label: 'GALLERY' },
    { href: '/shop', label: 'SHOP' },
    { href: '/events', label: 'EVENTS' },
    { href: '/community', label: 'COMMUNITY' },
    { href: '/works', label: 'WORKS' },
  ]

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [openDropdown])

  if (isMobile) {
    return (
      <nav className="space-y-4">
        {menuItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={`block transition-all duration-300 py-3 border-b border-white/10 last:border-b-0 font-playfair font-medium hover:scale-105 text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400`}
              onClick={onItemClick}
            >
              {item.label}
            </Link>
            {item.hasDropdown && (
              <div className="pl-4 space-y-2 mt-2">
                {item.dropdownItems?.map((dropdownItem) => (
                  <Link
                    key={dropdownItem.href}
                    href={dropdownItem.href}
                    className={`block transition-all duration-300 py-2 font-exo2 text-sm text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400`}
                    onClick={onItemClick}
                  >
                    {dropdownItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    )
  }

  return (
    <nav className="hidden md:flex items-center space-x-8" ref={dropdownRef}>
      {menuItems.map((item) => (
        <div key={item.href} className="relative">
          {item.hasDropdown ? (
            <div>
              <button
                onClick={() => handleDropdownToggle(item.label)}
                className={`nav-link font-medium uppercase tracking-wider flex items-center space-x-1 ${
                  pathname.startsWith(item.href) ? 'active' : ''
                }`}
              >
                <span>{item.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.label ? 'rotate-180' : ''}`} />
              </button>
              {openDropdown === item.label && (
                <div className="absolute top-full left-0 mt-2 w-48 glass-effect rounded-lg shadow-2xl shadow-magic-500/20 z-50 cosmic-border animate-fade-in-down">
                  <div className="py-2">
                    {item.dropdownItems?.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.href}
                        href={dropdownItem.href}
                        className={`block px-4 py-3 transition-all duration-200 font-exo2 text-sm ${
                          pathname === dropdownItem.href 
                            ? 'text-white bg-gradient-to-r from-magic-500/20 to-cosmic-500/20' 
                            : 'text-white/80 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => setOpenDropdown(null)}
                      >
                        {dropdownItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              href={item.href} 
              className={`nav-link font-medium uppercase tracking-wider ${
                pathname === item.href ? 'active' : ''
              }`}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
} 