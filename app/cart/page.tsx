'use client'

import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LeftSidebar from '../components/LeftSidebar'
import { useRef, useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { getCartItems, removeFromCart, updateCartQuantity, getCartTotal, getCartItemCount, onCartUpdate, clearCart } from '../lib/cart'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

// アニメーション付きカードラッパー
function AnimatedCard({ children, className = '', ...props }: { children: ReactNode, className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-in ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default function CartPage() {
  const { elementRef, isVisible } = useIntersectionObserver({ triggerOnce: false })
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const router = useRouter()

  // カートアイテムを取得
  useEffect(() => {
    const updateCart = () => {
      setCartItems(getCartItems())
    }

    // 初期読み込み
    updateCart()

    // カート更新イベントのリスナーを設定
    const cleanup = onCartUpdate(updateCart)

    return cleanup
  }, [])

  // カートアイテムを削除
  const handleRemoveFromCart = (productId: number) => {
    removeFromCart(productId)
    setCartItems(getCartItems())
  }

  // カートアイテムの数量を更新
  const handleUpdateQuantity = (productId: number, quantity: number) => {
    updateCartQuantity(productId, quantity)
    setCartItems(getCartItems())
  }

  // チェックアウトページに移動
  const handleCheckout = () => {
    if (cartItems.length === 0) return
    router.push('/checkout')
  }

  // カートをクリア
  const handleClearCart = () => {
    if (cartItems.length === 0) return

    if (confirm('カート内の商品をすべて削除しますか？')) {
      clearCart()
      setCartItems([])

      // クリア完了メッセージを表示
      const clearMessage = document.createElement('div')
      clearMessage.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full'
      clearMessage.innerHTML = `
        <div class="flex items-center gap-2">
          <span>🗑️</span>
          <span>カートをクリアしました</span>
        </div>
      `
      document.body.appendChild(clearMessage)

      setTimeout(() => {
        clearMessage.classList.remove('translate-x-full')
      }, 100)

      setTimeout(() => {
        clearMessage.classList.add('translate-x-full')
        setTimeout(() => {
          if (document.body.contains(clearMessage)) {
            document.body.removeChild(clearMessage)
          }
        }, 300)
      }, 3000)
    }
  }

  // 合計金額を計算
  const totalPrice = getCartTotal()
  const totalItems = getCartItemCount()

  return (
    <div className="min-h-screen bg-fantasy-gradient relative overflow-hidden">
      {/* 左サイドバー - PC版のみ表示 */}
      <div className="hidden lg:block">
        <LeftSidebar isOpen={isLeftSidebarOpen} onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
      </div>

      {/* メインコンテンツエリア - 左サイドバーのみ */}
      <div className={`pt-20 transition-all duration-300 ${
        isLeftSidebarOpen ? 'lg:ml-64 lg:mr-16' : 'lg:ml-16 lg:mr-16'
      }`}>
        {/* ヘッダー */}
        <Header />

        {/* メインコンテンツ */}
        <main className="relative z-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 min-h-screen">
          <div
            ref={elementRef}
            className={`transition-all duration-1000 ${
              isVisible ? 'scroll-visible' : 'scroll-hidden'
            }`}
          >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* ページタイトル */}
              <div className="mb-8">
                <h1 className="text-3xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400 mb-2">
                  ショッピングカート
                </h1>
                <p className="text-gray-300">
                  {totalItems}個の商品がカートに入っています
                </p>
              </div>

              {cartItems.length === 0 ? (
                /* 空のカート */
                <AnimatedCard className="glass-effect border border-white/10 p-12 text-center">
                  <div className="text-8xl mb-6">🛒</div>
                  <h2 className="text-2xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400 mb-4">
                    カートは空です
                  </h2>
                  <p className="text-gray-400 mb-8">
                    商品を追加してショッピングをお楽しみください
                  </p>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-medium"
                  >
                    🛍️ ショップに戻る
                  </Link>
                </AnimatedCard>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* カートアイテム一覧 */}
                  <div className="lg:col-span-2">
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <AnimatedCard key={item.id} className="glass-effect border border-white/10 p-6">
                          <div className="flex items-center gap-4">
                            {/* 商品画像 */}
                            <div className="w-20 h-20 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-lg flex items-center justify-center">
                              <div className="text-3xl">{item.image}</div>
                            </div>

                            {/* 商品情報 */}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white mb-1 truncate">{item.name}</h3>
                              <p className="text-lg font-bold text-yellow-400">¥{item.price.toLocaleString()}</p>
                            </div>

                            {/* 数量コントロール */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                                >
                                  -
                                </button>
                                <span className="text-white font-medium w-12 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                                >
                                  +
                                </button>
                              </div>

                              {/* 小計 */}
                              <div className="text-right min-w-0">
                                <p className="text-lg font-bold text-yellow-400">
                                  ¥{(item.price * item.quantity).toLocaleString()}
                                </p>
                              </div>

                              {/* 削除ボタン */}
                              <button
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="text-red-400 hover:text-red-300 transition-colors p-2"
                                title="削除"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </AnimatedCard>
                      ))}
                    </div>
                  </div>

                  {/* 注文サマリー */}
                  <div className="lg:col-span-1">
                    <AnimatedCard className="glass-effect border border-white/10 p-6 sticky top-8">
                      <h2 className="text-xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400 mb-6">
                        注文サマリー
                      </h2>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between text-gray-300">
                          <span>商品数:</span>
                          <span>{totalItems}個</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>小計:</span>
                          <span>¥{totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>配送料:</span>
                          <span>¥0</span>
                        </div>
                        <div className="border-t border-white/10 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-white">合計:</span>
                            <span className="text-2xl font-bold text-yellow-400">¥{totalPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <button
                          onClick={handleCheckout}
                          disabled={isCheckingOut || cartItems.length === 0}
                          className={`w-full py-3 px-4 rounded-md transition-all duration-300 font-medium shadow-lg ${
                            isCheckingOut || cartItems.length === 0
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                          }`}
                        >
                          {isCheckingOut ? '処理中...' : '購入'}
                        </button>
                        <button
                          onClick={handleClearCart}
                          disabled={isCheckingOut || cartItems.length === 0}
                          className={`w-full py-3 px-4 rounded-md transition-all duration-300 font-medium shadow-lg ${
                            isCheckingOut || cartItems.length === 0
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                          }`}
                        >
                          {isCheckingOut ? '処理中...' : 'カートをクリア'}
                        </button>
                        <Link
                          href="/shop"
                          className="block w-full bg-gray-700 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition-all duration-300 font-medium text-center"
                        >
                          買い物を続ける
                        </Link>
                      </div>
                    </AnimatedCard>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* フッター */}
        <Footer />
      </div>
    </div>
  )
}
