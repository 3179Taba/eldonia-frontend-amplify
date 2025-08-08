import type { Metadata } from 'next'
import { Inter, Exo_2, Playfair_Display, Roboto_Mono, Roboto, Cinzel, Cormorant_Garamond, Lora, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './lib/auth-context'
import { I18nProvider } from './lib/i18n-provider'
import TranslationProvider from './lib/translation-provider'
import RootLayoutClient from './components/RootLayoutClient'


const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const exo2 = Exo_2({
  subsets: ['latin'],
  variable: '--font-exo2',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
})

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-bebas-neue',
  display: 'swap',
  weight: ['400'],
})

export const metadata: Metadata = {
  title: 'エルドニア オンラインストア - ファンタジー世界の商品',
  description: 'エルドニアのファンタジー世界から生まれたアート、書籍、音楽、グッズをお届けするオンラインストア',
  keywords: 'エルドニア, ファンタジー, オンラインストア, アート, 書籍, 音楽, グッズ, 魔法, 冒険',
  authors: [{ name: 'エルドニア チーム' }],
  creator: 'エルドニア',
  publisher: 'エルドニア',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://eldonia-store.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'エルドニア オンラインストア - ファンタジー世界の商品',
    description: 'エルドニアのファンタジー世界から生まれたアート、書籍、音楽、グッズをお届けするオンラインストア',
    url: 'https://eldonia-store.com',
    siteName: 'エルドニア オンラインストア',
    images: [
      {
        url: '/images/icons/logo.png',
        width: 512,
        height: 512,
        alt: 'エルドニア オンラインストア ロゴ',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'エルドニア オンラインストア - ファンタジー世界の商品',
    description: 'エルドニアのファンタジー世界から生まれたアート、書籍、音楽、グッズをお届けするオンラインストア',
    images: ['/images/icons/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/icons/logo.png',
    shortcut: '/images/icons/logo.png',
    apple: '/images/icons/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const fontVariables = `${playfair.variable} ${exo2.variable} ${inter.variable} ${robotoMono.variable} ${roboto.variable} ${cinzel.variable} ${cormorantGaramond.variable} ${lora.variable} ${bebasNeue.variable}`
  const bodyClass = `${exo2.className} antialiased`

  return (
    <html lang="ja" className={fontVariables} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/icons/logo.png" />
        <link rel="apple-touch-icon" href="/images/icons/logo.png" />
      </head>
      <body className={bodyClass} suppressHydrationWarning>
        <AuthProvider>
          <I18nProvider>
            <TranslationProvider>
              <RootLayoutClient fontVariables={fontVariables} bodyClass={bodyClass}>
                {children}
              </RootLayoutClient>
            </TranslationProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
