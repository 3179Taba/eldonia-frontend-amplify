/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // ハイドレーションエラーを防ぐ設定
  reactStrictMode: false,
  // 開発環境での警告を抑制
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // 静的ファイルの最適化
  compress: true,
  poweredByHeader: false,
  
  // パフォーマンス最適化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // メモリ使用量最適化
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
    // メモリ使用量を削減
    workerThreads: false,
    cpus: 1,
  },
  
  // 開発環境での警告を抑制
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ファイルサイズ警告を無効化

  // APIプロキシ設定
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*/',
      },
    ];
  },
  // エラーページのカスタマイズ
  async redirects() {
    return [
      {
        source: '/profile',
        destination: '/settings',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  // 環境変数の設定
  env: {
    NEXT_PUBLIC_API_URL: 'http://127.0.0.1:8000/api',
  },
}

module.exports = nextConfig 