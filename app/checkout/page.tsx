'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart, CreditCard, Receipt, ArrowLeft } from 'lucide-react';
import { getCartItems, clearCart } from '../lib/cart';
import { saveReceipt } from '../lib/receipts';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const items = getCartItems();
    if (items.length === 0) {
      router.push('/shop');
      return;
    }
    setCartItems(items);
  }, [router]);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.floor(totalAmount * 0.1); // 10%の税金
  const finalTotal = totalAmount + tax;

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    // デモ購入処理（実際の決済は行われません）
    try {
      // 注文IDを生成
      const newOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setOrderId(newOrderId);
      
      // 購入処理のシミュレーション
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 領収書データを保存
      saveReceipt({
        orderId: newOrderId,
        date: new Date().toLocaleDateString('ja-JP'),
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal: totalAmount,
        tax: tax,
        total: finalTotal,
      });
      
      // カートをクリア
      clearCart();
      setOrderComplete(true);
    } catch (error) {
      console.error('購入処理エラー:', error);
      alert('購入処理中にエラーが発生しました。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackToShop = () => {
    router.push('/shop');
  };

  const handleViewReceipt = () => {
    router.push(`/receipt/${orderId}`);
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Receipt className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">購入完了！</h1>
            <p className="text-gray-600 mb-6">
              ご購入ありがとうございます。注文は正常に処理されました。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">注文番号</p>
              <p className="font-mono text-lg font-semibold text-gray-900">{orderId}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleViewReceipt}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Receipt className="w-5 h-5" />
                領収書を表示
              </button>
              <button
                onClick={handleBackToShop}
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                ショップに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <button
            onClick={handleBackToShop}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            ショップに戻る
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 注文内容 */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              注文内容
            </h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">数量: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ¥{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">小計</span>
                <span className="font-semibold">¥{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">税金 (10%)</span>
                <span className="font-semibold">¥{tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>合計</span>
                <span>¥{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 決済情報 */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6" />
              決済情報
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">デモ決済</h3>
                <p className="text-sm text-blue-700">
                  この購入はデモ用です。実際の決済は行われません。
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カード番号
                  </label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      有効期限
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVC
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePurchase}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    処理中...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    ¥{finalTotal.toLocaleString()} で購入
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                このボタンをクリックすると、デモ購入が完了します。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 