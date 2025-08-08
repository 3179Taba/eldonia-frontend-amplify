'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCartItems, getCartItemCount, getCartTotal, onCartUpdate, clearCart } from '@/app/lib/cart'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

interface CartIconProps {
  className?: string
}

export default function CartIcon({ className = '' }: CartIconProps) {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isHovered, setIsHovered] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  // カート内の商品数を計算
  const totalItems = getCartItemCount()
  
  // カート内の合計金額を計算
  const totalPrice = getCartTotal()

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

  // チェックアウトページに移動
  const handleCheckout = () => {
    if (cartItems.length === 0) return
    router.push('/checkout')
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* カートアイコン */}
      <Link href="/cart" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors relative">
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
          {/* 商品数バッジ */}
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems > 99 ? '99+' : totalItems}
            </span>
          )}
        </div>
        <span className="hidden lg:block text-sm font-medium">カート</span>
      </Link>

      {/* ホバー時のカート内容 */}
      {isHovered && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 glass-effect">
          <div className="p-4">
            <h3 className="text-lg font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400 mb-4">
              ショッピングカート
            </h3>
            
            {cartItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🛒</div>
                <p className="text-gray-400">カートは空です</p>
              </div>
            ) : (
              <>
                {/* カートアイテム */}
                <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded border border-white/10">
                      <div className="text-2xl">{item.image}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{item.name}</h4>
                        <p className="text-xs text-yellow-400">¥{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white w-8 text-center">×{item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 合計金額 */}
                <div className="border-t border-white/10 pt-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">合計:</span>
                    <span className="text-lg font-bold text-yellow-400">¥{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="space-y-2">
                  <Link
                    href="/cart"
                    className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-medium text-center"
                  >
                    カートを見る
                  </Link>
                  <button 
                    onClick={handleCheckout}
                    disabled={isPurchasing || cartItems.length === 0}
                    className={`block w-full py-2 px-4 rounded-md transition-all duration-300 font-medium ${
                      isPurchasing || cartItems.length === 0
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-700 text-white hover:bg-gray-600'
                    }`}
                  >
                    {isPurchasing ? '処理中...' : '購入'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 