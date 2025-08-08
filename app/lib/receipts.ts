export interface ReceiptData {
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

const RECEIPTS_KEY = 'eldonia_receipts';

export function saveReceipt(receipt: ReceiptData) {
  if (typeof window === 'undefined') return;
  const receipts = getReceipts();
  receipts.unshift(receipt); // 新しいものを先頭に
  localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
}

export function getReceipts(): ReceiptData[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(RECEIPTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
} 