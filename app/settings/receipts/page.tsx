'use client';

import { useEffect, useState } from 'react';
import { getReceipts, ReceiptData } from '../../lib/receipts';
import Link from 'next/link';

export default function ReceiptsListPage() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);

  useEffect(() => {
    setReceipts(getReceipts());
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">領収書一覧</h1>
        {receipts.length === 0 ? (
          <div className="text-gray-500 text-center py-16">領収書はありません</div>
        ) : (
          <div className="space-y-4">
            {receipts.map((r) => (
              <div key={r.orderId} className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="font-mono text-sm text-gray-500">注文番号: {r.orderId}</div>
                  <div className="text-lg font-bold">合計: <span className="text-orange-500">¥{r.total.toLocaleString()}</span></div>
                  <div className="text-gray-600 text-sm">日付: {r.date}</div>
                </div>
                <Link href={`/receipt/${r.orderId}`} className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors font-medium text-center">表示</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 