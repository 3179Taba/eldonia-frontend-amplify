export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  description?: string
}

const CART_STORAGE_KEY = 'eldonia_cart'

// カートアイテムを取得
export const getCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY)
    return cartData ? JSON.parse(cartData) : []
  } catch (error) {
    console.error('カートデータの取得に失敗しました:', error)
    return []
  }
}

// カートアイテムを保存
const saveCartItems = (items: CartItem[]): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    // カート更新イベントを発火
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: items }))
  } catch (error) {
    console.error('カートデータの保存に失敗しました:', error)
  }
}

// カートに商品を追加
export const addToCart = (item: Omit<CartItem, 'quantity'>): void => {
  const currentItems = getCartItems()
  const existingItemIndex = currentItems.findIndex(cartItem => cartItem.id === item.id)
  
  if (existingItemIndex >= 0) {
    // 既存の商品の数量を増やす
    currentItems[existingItemIndex].quantity += 1
  } else {
    // 新しい商品を追加
    currentItems.push({ ...item, quantity: 1 })
  }
  
  saveCartItems(currentItems)
}

// カートから商品を削除
export const removeFromCart = (productId: number): void => {
  const currentItems = getCartItems()
  const updatedItems = currentItems.filter(item => item.id !== productId)
  saveCartItems(updatedItems)
}

// カートアイテムの数量を更新
export const updateCartQuantity = (productId: number, quantity: number): void => {
  if (quantity <= 0) {
    removeFromCart(productId)
    return
  }
  
  const currentItems = getCartItems()
  const updatedItems = currentItems.map(item => 
    item.id === productId ? { ...item, quantity } : item
  )
  saveCartItems(updatedItems)
}

// カートをクリア
export const clearCart = (): void => {
  saveCartItems([])
}

// カートの合計金額を計算
export const getCartTotal = (): number => {
  const items = getCartItems()
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

// カートの商品数を取得
export const getCartItemCount = (): number => {
  const items = getCartItems()
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

// カートが空かどうかをチェック
export const isCartEmpty = (): boolean => {
  return getCartItems().length === 0
}

// カート更新イベントのリスナーを追加
export const onCartUpdate = (callback: (items: CartItem[]) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {}
  
  const handleCartUpdate = (event: CustomEvent) => {
    callback(event.detail)
  }
  
  window.addEventListener('cartUpdated', handleCartUpdate as EventListener)
  
  // クリーンアップ関数を返す
  return () => {
    window.removeEventListener('cartUpdated', handleCartUpdate as EventListener)
  }
} 