'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Receipt, Download, ArrowLeft, Printer } from 'lucide-react';

interface ReceiptData {
  orderId: string;
  date: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
}

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    // デモ用の領収書データを生成
    const orderId = params.id as string;
    const demoItems = [
      { name: 'デモ商品A', quantity: 2, price: 1500, total: 3000 },
      { name: 'デモ商品B', quantity: 1, price: 2500, total: 2500 },
    ];
    const subtotal = demoItems.reduce((sum, item) => sum + item.total, 0);
    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + tax;

    setReceiptData({
      orderId,
      date: new Date().toLocaleDateString('ja-JP'),
      items: demoItems,
      subtotal,
      tax,
      total,
    });
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!receiptData) return;
    
    // シンプルなPDF風のテキストファイルを生成
    const receiptText = `
領収書
====================

注文番号: ${receiptData.orderId}
日付: ${receiptData.date}

商品詳細:
${receiptData.items.map(item => 
  `${item.name} x${item.quantity} ¥${item.price.toLocaleString()} = ¥${item.total.toLocaleString()}`
).join('\n')}

====================
小計: ¥${receiptData.subtotal.toLocaleString()}
税金 (10%): ¥${receiptData.tax.toLocaleString()}
合計: ¥${receiptData.total.toLocaleString()}

====================
Eldonia Web Store
デモ領収書
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackToShop = () => {
    router.push('/shop');
  };

  if (!receiptData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">領収書を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={handleBackToShop}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            ショップに戻る
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              ダウンロード
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              印刷
            </button>
          </div>
        </div>

        {/* 領収書 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 print:shadow-none">
          {/* ヘッダー */}
          <div className="text-center mb-8 border-b pb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">領収書</h1>
            <p className="text-gray-600">Eldonia Web Store</p>
          </div>

          {/* 注文情報 */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">注文番号</h3>
              <p className="font-mono text-lg">{receiptData.orderId}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">購入日</h3>
              <p className="text-lg">{receiptData.date}</p>
            </div>
          </div>

          {/* 商品リスト */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">商品詳細</h3>
            <div className="space-y-3">
              {receiptData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">数量: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">¥{item.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">¥{item.price.toLocaleString()} × {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 合計 */}
          <div className="border-t pt-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">小計</span>
              <span className="font-semibold">¥{receiptData.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">税金 (10%)</span>
              <span className="font-semibold">¥{receiptData.tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-3xl font-extrabold border-t pt-6 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg px-6 py-4 shadow-lg mt-4">
              <span>合計</span>
              <span>¥{receiptData.total.toLocaleString()}</span>
            </div>
          </div>

          {/* フッター */}
          <div className="mt-8 pt-6 border-t text-center text-gray-600">
            <p className="text-sm">ご購入ありがとうございました</p>
            <p className="text-xs mt-2">この領収書はデモ用です</p>
          </div>
        </div>
      </div>
    </div>
  );
} 