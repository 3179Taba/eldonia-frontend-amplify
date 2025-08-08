'use client'

import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LeftSidebar from '../components/LeftSidebar'
import TranslatableText from '../components/TranslatableText'
import { useRef, useState, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { useTranslation } from '../lib/useTranslation'
import { addToCart } from '../lib/cart'
import { apiClient } from '../lib/api'

// カード用Intersection Observerフック
function useCardInView(threshold = 0.2) {
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
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [threshold]);
  return { ref, visible };
}

// アニメーション付きカードラッパー
function AnimatedCard({ children, className = '', ...props }: { children: ReactNode, className?: string }) {
  const { ref, visible } = useCardInView();
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

// 在庫状況表示コンポーネント
function StockStatus({ stock, maxStock, lowStockThreshold }: { stock: number, maxStock: number, lowStockThreshold: number }) {
  const { t } = useTranslation();
  const stockPercentage = (stock / maxStock) * 100;
  const isOutOfStock = stock === 0;
  const isLowStock = stock <= lowStockThreshold && stock > 0;
  const isInStock = stock > lowStockThreshold;

  const getStockColor = () => {
    if (isOutOfStock) return 'text-red-500';
    if (isLowStock) return 'text-orange-500';
    return 'text-green-500';
  };

  const getStockText = () => {
    if (isOutOfStock) return t('outOfStock');
    if (isLowStock) return t('lowStock');
    return t('inStock');
  };

  const getStockIcon = () => {
    if (isOutOfStock) return '❌';
    if (isLowStock) return '⚠️';
    return '✅';
  };

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{getStockIcon()}</span>
        <span className={`text-sm font-medium ${getStockColor()}`}>
          {getStockText()}
        </span>
      </div>
      <div className="text-right">
        <div className="text-sm text-gray-400">
          {t('stock')}: {stock} / {maxStock}
        </div>
        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isOutOfStock ? 'bg-red-500' :
              isLowStock ? 'bg-orange-500' : 'bg-green-500'
            }`}
            style={{ width: `${stockPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// 管理者用在庫管理パネル
function AdminStockPanel({
  products,
  productStock,
  onIncreaseStock,
  onDecreaseStock,
  renderProductImageSmall,
  getLocalizedText
}: {
  products: any[],
  productStock: {[key: number]: number},
  onIncreaseStock: (productId: number, amount: number) => void,
  onDecreaseStock: (productId: number) => void,
  renderProductImageSmall: (product: any) => React.ReactNode,
  getLocalizedText: (text: any, fallback?: string) => string
}) {
  const { t } = useTranslation();

  return (
    <div className="glass-effect border border-white/10 p-6 rounded-xl mb-8">
      <h3 className="text-xl font-bold text-yellow-400 mb-4">
        <TranslatableText
          translationKey="adminPanel"
          fallbackText={t('adminPanel')}
          className="text-xl font-bold text-yellow-400"
        />
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
                            <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl">{renderProductImageSmall(product)}</div>
                  <h4 className="font-medium text-white text-sm">{getLocalizedText(product.name)}</h4>
                </div>
            <div className="text-sm text-gray-400 mb-3">
              <TranslatableText
                translationKey="currentStock"
                fallbackText={t('currentStock')}
                className="text-sm text-gray-400"
              />: {productStock[product.id] || product.stock} / {product.maxStock}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onDecreaseStock(product.id)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                -1
              </button>
              <button
                onClick={() => onIncreaseStock(product.id, 1)}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
              >
                +1
              </button>
              <button
                onClick={() => onIncreaseStock(product.id, 5)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                +5
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// デモ商品データ（多言語対応）
const demoProducts = [
  {
    id: 1,
    name: {
      ja: "中世風辞書 レザー装丁版",
      en: "Medieval Dictionary Leather Edition",
      zh: "中世纪词典皮革装订版",
      ko: "중세 사전 가죽 제본판"
    },
    price: 2980,
    originalPrice: 3980,
    rating: 4.8,
    reviewCount: 1247,
    image: "/shop/img/srnote_Red-covered_dictionary_with_medieval_design_leather_bo_8cfb169e-b3fa-4950-8453-feb3cbcc5215_1.png",
    category: "テキスト・小説",
    isPrime: true,
    isNew: false,
    discount: 25,
    description: {
      ja: "美しい中世風デザインのレザー装丁辞書",
      en: "Beautiful medieval-style leather-bound dictionary",
      zh: "精美中世纪风格皮革装订词典",
      ko: "아름다운 중세풍 디자인의 가죽 제본 사전"
    },
    stock: 15,
    maxStock: 50,
    lowStockThreshold: 5,
    seller: {
      id: "1",
      name: {
        ja: "魔法使いのアリス",
        en: "Alice the Wizard",
        zh: "魔法师爱丽丝",
        ko: "마법사 앨리스"
      },
      avatar: "🧙‍♀️"
    }
  },
  {
    id: 2,
    name: {
      ja: "中世風辞書 デスク版",
      en: "Medieval Dictionary Desk Edition",
      zh: "中世纪词典桌面版",
      ko: "중세 사전 책상판"
    },
    price: 1580,
    originalPrice: 1980,
    rating: 4.9,
    reviewCount: 892,
                image: "/shop/img/srnote_Medieval_dictionary_cover_on_the_desk_straight_up_angl_5c4d72e5-16fc-4926-94c7-6c2d83dea2f3_1.png",
    category: "テキスト・小説",
    isPrime: true,
    isNew: true,
    discount: 20,
    description: {
      ja: "デスクに置く中世風辞書の美しい装丁",
      en: "Beautiful medieval dictionary for desk display",
      zh: "桌面展示用中世纪词典精美装订",
      ko: "책상에 놓는 중세풍 사전의 아름다운 제본"
    },
    stock: 3,
    maxStock: 100,
    lowStockThreshold: 10,
    seller: {
      id: "2",
      name: {
        ja: "冒険者のボブ",
        en: "Bob the Adventurer",
        zh: "冒险者鲍勃",
        ko: "모험가 밥"
      },
      avatar: "🗡️"
    }
  },
  {
    id: 3,
    name: {
      ja: "ヴィンテージ懐中時計",
      en: "Vintage Pocket Watch",
      zh: "复古怀表",
      ko: "빈티지 회중시계"
    },
    price: 1280,
    originalPrice: 1580,
    rating: 4.7,
    reviewCount: 567,
                image: "/shop/img/srnote_One_beautiful_vintage_pocket_watch_on_the_desk_in_the_st_148f94ec-6173-4b4f-9f21-50f54e7a105d.png",
    category: "物品",
    isPrime: false,
    isNew: false,
    discount: 19,
    description: {
      ja: "美しいヴィンテージデザインの懐中時計",
      en: "Beautiful vintage design pocket watch",
      zh: "精美复古设计怀表",
      ko: "아름다운 빈티지 디자인의 회중시계"
    },
    stock: 0,
    maxStock: 200,
    lowStockThreshold: 20,
    seller: {
      id: "3",
      name: {
        ja: "音楽家のキャロル",
        en: "Carol the Musician",
        zh: "音乐家卡罗尔",
        ko: "음악가 캐롤"
      },
      avatar: "🎵"
    }
  },
  {
    id: 4,
    name: {
      ja: "神の剣 ハゴロモ",
      en: "Sword of God Hagoromo",
      zh: "神剑羽衣",
      ko: "신의 검 하고로모"
    },
    price: 5980,
    originalPrice: 7980,
    rating: 4.6,
    reviewCount: 234,
                image: "/shop/img/srnote_Sword_of_God_Hagoromo_--v_5.2_d3264c92-5bb4-4fce-9256-fc2a715195fc_3.png",
    category: "物品",
    isPrime: true,
    isNew: false,
    discount: 25,
    description: {
      ja: "伝説の神の剣のレプリカ",
      en: "Replica of the legendary Sword of God",
      zh: "传说神剑复制品",
      ko: "전설의 신의 검 레플리카"
    },
    stock: 8,
    maxStock: 30,
    lowStockThreshold: 5,
    seller: {
      id: "1",
      name: {
        ja: "魔法使いのアリス",
        en: "Alice the Wizard",
        zh: "魔法师爱丽丝",
        ko: "마법사 앨리스"
      },
      avatar: "🧙‍♀️"
    }
  },
  {
    id: 5,
    name: {
      ja: "最新式霊的装備",
      en: "State-of-the-art Spiritual Equipment",
      zh: "最新灵能装备",
      ko: "최신식 영적 장비"
    },
    price: 2980,
    originalPrice: 3980,
    rating: 4.8,
    reviewCount: 445,
                image: "/shop/img/srnote_State-of-the-art_spiritual_equipment_--v_5.2_09cfc2c9-af01-4f81-ba42-35e597e1a193_0.png",
    category: "物品",
    isPrime: true,
    isNew: false,
    discount: 25,
    description: {
      ja: "最新技術を駆使した霊的装備",
      en: "Spiritual equipment using latest technology",
      zh: "运用最新技术的灵能装备",
      ko: "최신 기술을 활용한 영적 장비"
    },
    stock: 25,
    maxStock: 80,
    lowStockThreshold: 15,
    seller: {
      id: "1",
      name: {
        ja: "魔法使いのアリス",
        en: "Alice the Wizard",
        zh: "魔法师爱丽丝",
        ko: "마법사 앨리스"
      },
      avatar: "🧙‍♀️"
    }
  },
  {
    id: 6,
    name: {
      ja: "高級カトラリーセット",
      en: "Noble Cutlery Set",
      zh: "贵族餐具套装",
      ko: "고급 커틀러리 세트"
    },
    price: 880,
    originalPrice: 1080,
    rating: 4.5,
    reviewCount: 678,
                image: "/shop/img/srnote_Noble_cutlery_set_beautiful_tableware_4k_8k_unreal_eng_4f5ca1fd-178f-4e66-b9ad-ebb5004126d9_3.png",
    category: "物品",
    isPrime: false,
    isNew: true,
    discount: 19,
    description: {
      ja: "美しい高級カトラリーセット",
      en: "Beautiful noble cutlery set",
      zh: "精美贵族餐具套装",
      ko: "아름다운 고급 커틀러리 세트"
    },
    stock: 45,
    maxStock: 150,
    lowStockThreshold: 25,
    seller: {
      id: "2",
      name: {
        ja: "冒険者のボブ",
        en: "Bob the Adventurer",
        zh: "冒险者鲍勃",
        ko: "모험가 밥"
      },
      avatar: "🗡️"
    }
  },
  {
    id: 7,
    name: {
      ja: "ティーセット ローズフラワー",
      en: "Tea Set Rose Flowers",
      zh: "玫瑰茶具套装",
      ko: "티세트 로즈플라워"
    },
    price: 3980,
    originalPrice: 4980,
    rating: 4.7,
    reviewCount: 334,
                image: "/shop/img/srnote_Bright_daylight_dinner_set_rose_flowers_tea_set_tablec_75752654-a99f-4b8e-9dce-c90b7a316b96_1.png",
    category: "物品",
    isPrime: true,
    isNew: false,
    discount: 20,
    description: {
      ja: "美しいローズフラワーデザインのティーセット",
      en: "Beautiful rose flower design tea set",
      zh: "精美玫瑰花卉设计茶具套装",
      ko: "아름다운 로즈플라워 디자인의 티세트"
    },
    stock: 2,
    maxStock: 40,
    lowStockThreshold: 8,
    seller: {
      id: "3",
      name: {
        ja: "音楽家のキャロル",
        en: "Carol the Musician",
        zh: "音乐家卡罗尔",
        ko: "음악가 캐롤"
      },
      avatar: "🎵"
    }
  },
  {
    id: 8,
    name: {
      ja: "魔法の杖 ジュエリー",
      en: "Magic Wand Jewelry",
      zh: "魔法杖珠宝",
      ko: "마법의 지팡이 주얼리"
    },
    price: 2480,
    originalPrice: 2980,
    rating: 4.4,
    reviewCount: 189,
                image: "/shop/img/srnote_Magic_Wand_Jewelry_--upbeta_--v_4_fe22b656-475a-4d30-b468-0b846979af17_1.png",
    category: "物品",
    isPrime: false,
    isNew: true,
    discount: 17,
    description: {
      ja: "美しいジュエリー装飾の魔法の杖",
      en: "Beautiful magic wand with jewelry decoration",
      zh: "精美珠宝装饰魔法杖",
      ko: "아름다운 주얼리 장식의 마법의 지팡이"
    },
    stock: 12,
    maxStock: 60,
    lowStockThreshold: 12,
    seller: {
      id: "2",
      name: {
        ja: "冒険者のボブ",
        en: "Bob the Adventurer",
        zh: "冒险者鲍勃",
        ko: "모험가 밥"
      },
      avatar: "🗡️"
    }
  },
  {
    id: 9,
    name: {
      ja: "魔法の杖 ジュエリー セット",
      en: "Magic Wand Jewelry Set",
      zh: "魔法杖珠宝套装",
      ko: "마법의 지팡이 주얼리 세트"
    },
    price: 3980,
    originalPrice: 4980,
    rating: 4.6,
    reviewCount: 256,
                image: "/shop/img/srnote_Magic_Wand_Jewelry_--upbeta_--v_4_fe22b656-475a-4d30-b468-0b846979af17_2.png",
    category: "物品",
    isPrime: true,
    isNew: false,
    discount: 20,
    description: {
      ja: "美しいジュエリー装飾の魔法の杖セット",
      en: "Beautiful magic wand set with jewelry decoration",
      zh: "精美珠宝装饰魔法杖套装",
      ko: "아름다운 주얼리 장식의 마법의 지팡이 세트"
    },
    stock: 5,
    maxStock: 25,
    lowStockThreshold: 5,
    seller: {
      id: "1",
      name: {
        ja: "魔法使いのアリス",
        en: "Alice the Wizard",
        zh: "魔法师爱丽丝",
        ko: "마법사 앨리스"
      },
      avatar: "🧙‍♀️"
    }
  }
];

// カテゴリーデータ（バックエンドのProductモデルと一致）
const categories = [
  {
    name: {
      ja: "すべて",
      en: "All",
      zh: "全部",
      ko: "전체"
    },
    icon: "🏠"
  },
  {
    name: {
      ja: "アート・イラスト",
      en: "Art & Illustration",
      zh: "艺术与插画",
      ko: "아트 & 일러스트"
    },
    icon: "🎨"
  },
  {
    name: {
      ja: "音楽・音声",
      en: "Music & Audio",
      zh: "音乐与音频",
      ko: "음악 & 오디오"
    },
    icon: "🎵"
  },
  {
    name: {
      ja: "動画・映像",
      en: "Video & Film",
      zh: "视频与影像",
      ko: "비디오 & 영상"
    },
    icon: "🎬"
  },
  {
    name: {
      ja: "テキスト・小説",
      en: "Text & Novel",
      zh: "文本与小说",
      ko: "텍스트 & 소설"
    },
    icon: "📚"
  },
  {
    name: {
      ja: "コード・プログラム",
      en: "Code & Program",
      zh: "代码与程序",
      ko: "코드 & 프로그램"
    },
    icon: "💻"
  },
  {
    name: {
      ja: "物品",
      en: "Goods",
      zh: "物品",
      ko: "물품"
    },
    icon: "📦"
  },
  {
    name: {
      ja: "その他",
      en: "Other",
      zh: "其他",
      ko: "기타"
    },
    icon: "🎁"
  }
];

// 商品詳細モーダルコンポーネント
function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onPurchase,
  renderProductImage,
  renderProductImageSmall,
  getLocalizedText
}: {
  product: any,
  isOpen: boolean,
  onClose: () => void,
  onPurchase: (product: any) => void,
  renderProductImage: (product: any) => React.ReactNode,
  renderProductImageSmall: (product: any) => React.ReactNode,
  getLocalizedText: (text: any, fallback?: string) => string
}) {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const images = product.images || [product.image];
  const currentStock = product.stock || 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {getLocalizedText(product.name)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 商品画像 */}
            <div className="space-y-4">
              <div className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl flex items-center justify-center p-8">
                {renderProductImage(product)}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all ${
                        selectedImage === index
                          ? 'border-yellow-400'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      {renderProductImageSmall({ ...product, image })}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 商品情報 */}
            <div className="space-y-6">
              {/* 価格・評価 */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-bold text-yellow-400">
                    ¥{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-lg text-gray-400 line-through">
                      ¥{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-600'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">({product.reviewCount})</span>
                </div>
              </div>

              {/* 在庫状況 */}
              <div>
                <StockStatus
                  stock={currentStock}
                  maxStock={product.maxStock}
                  lowStockThreshold={product.lowStockThreshold}
                />
              </div>

              {/* 数量選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <TranslatableText
                    translationKey="quantity"
                    fallbackText={t('quantity')}
                    className="block text-sm font-medium text-gray-300"
                  />
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium text-white min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock}
                    className="w-8 h-8 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 出品者情報 */}
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  <TranslatableText
                    translationKey="seller"
                    fallbackText={t('seller')}
                    className="text-sm font-medium text-gray-400"
                  />
                </h4>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{product.seller?.avatar || '👤'}</span>
                  <span className="text-white font-medium">
                    {getLocalizedText(product.seller?.name) || 'Unknown Seller'}
                  </span>
                </div>
              </div>

              {/* 商品説明 */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">
                  <TranslatableText
                    translationKey="description"
                    fallbackText={t('description')}
                    className="text-sm font-medium text-gray-400"
                  />
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {getLocalizedText(product.description)}
                </p>
              </div>

              {/* 商品レビュー */}
              <div>
                <ProductReviews
                  productId={product.id}
                  reviews={[
                    {
                      userName: "冒険者A",
                      rating: 5,
                      comment: "素晴らしい商品です！期待以上の品質でした。",
                      date: "2024-01-15"
                    },
                    {
                      userName: "魔法使いB",
                      rating: 4,
                      comment: "とても良い商品ですが、もう少し安ければ完璧です。",
                      date: "2024-01-10"
                    },
                    {
                      userName: "戦士C",
                      rating: 5,
                      comment: "最高の商品です！友達にも勧めました。",
                      date: "2024-01-05"
                    }
                  ]}
                />
              </div>

              {/* アクションボタン */}
              <div className="flex gap-3">
                <button
                  onClick={() => onPurchase(product)}
                  disabled={currentStock <= 0}
                  className={`flex-1 py-3 px-6 rounded-lg transition-all duration-300 font-medium shadow-lg text-base ${
                    currentStock > 0
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {currentStock > 0 ? (
                    <TranslatableText
                      translationKey="addToCart"
                      fallbackText={t('addToCart')}
                      className="inline-block"
                    />
                  ) : (
                    <TranslatableText
                      translationKey="outOfStock"
                      fallbackText={t('outOfStock')}
                      className="inline-block"
                    />
                  )}
                </button>
                <button className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  <TranslatableText
                    translationKey="addToWishlist"
                    fallbackText={t('addToWishlist')}
                    className="inline-block"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// お気に入り機能コンポーネント
function WishlistButton({ productId, isWishlisted, onToggle }: {
  productId: number,
  isWishlisted: boolean,
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-all duration-300 ${
        isWishlisted
          ? 'bg-red-500 text-white shadow-lg'
          : 'bg-black/50 text-gray-300 hover:bg-black/70 hover:text-white'
      }`}
    >
      {isWishlisted ? '❤️' : '🤍'}
    </button>
  );
}

// 商品比較機能コンポーネント
function CompareButton({ productId, isCompared, onToggle }: {
  productId: number,
  isCompared: boolean,
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`absolute top-3 right-12 z-20 p-2 rounded-full transition-all duration-300 ${
        isCompared
          ? 'bg-blue-500 text-white shadow-lg'
          : 'bg-black/50 text-gray-300 hover:bg-black/70 hover:text-white'
      }`}
    >
      {isCompared ? '📊' : '📈'}
    </button>
  );
}

// 商品レビューコンポーネント
function ProductReviews({ productId, reviews }: { productId: number, reviews: any[] }) {
  const { t } = useTranslation();
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!newReview.comment.trim()) return;

    setIsSubmitting(true);
    try {
      // レビュー送信処理（実際のAPI実装が必要）
      console.log('レビュー送信:', { productId, ...newReview });
      setNewReview({ rating: 5, comment: '' });
      // 成功メッセージ表示
    } catch (error) {
      console.error('レビュー送信エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-white">
        <TranslatableText
          translationKey="reviews"
          fallbackText={t('reviews')}
          className="text-lg font-medium text-white"
        /> ({reviews.length})
      </h4>

      {/* レビュー投稿フォーム */}
      <div className="bg-gray-800/50 p-4 rounded-lg">
        <h5 className="text-sm font-medium text-gray-300 mb-3">
          <TranslatableText
            translationKey="writeReview"
            fallbackText={t('writeReview')}
            className="text-sm font-medium text-gray-300"
          />
        </h5>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">
              <TranslatableText
                translationKey="rating"
                fallbackText={t('rating')}
                className="text-sm text-gray-300"
              />:
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                  className={`text-xl ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-600'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={newReview.comment}
            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
            placeholder={t('writeReviewPlaceholder')}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none"
            rows={3}
          />
          <button
            onClick={handleSubmitReview}
            disabled={isSubmitting || !newReview.comment.trim()}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <TranslatableText
                translationKey="submitting"
                fallbackText={t('submitting')}
                className="inline-block"
              />
            ) : (
              <TranslatableText
                translationKey="submitReview"
                fallbackText={t('submitReview')}
                className="inline-block"
              />
            )}
          </button>
        </div>
      </div>

      {/* レビュー一覧 */}
      <div className="space-y-3">
        {displayedReviews.map((review, index) => (
          <div key={index} className="bg-gray-800/30 p-4 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="text-white font-medium">{review.userName}</span>
              </div>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-600'}>
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="text-gray-300 text-sm">{review.comment}</p>
            <div className="text-xs text-gray-500 mt-2">{review.date}</div>
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAllReviews(!showAllReviews)}
          className="text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showAllReviews ? (
            <TranslatableText
              translationKey="showLess"
              fallbackText={t('showLess')}
              className="inline-block"
            />
          ) : (
            <TranslatableText
              translationKey="showMore"
              fallbackText={t('showMore')}
              className="inline-block"
            />
          )}
        </button>
      )}
    </div>
  );
}

export default function ShopPage() {
  const { elementRef, isVisible } = useIntersectionObserver({ triggerOnce: false })
  const { t, currentLanguage } = useTranslation()
  const lang = currentLanguage
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('すべて')
  const [sortBy, setSortBy] = useState('featured')
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [products, setProducts] = useState<any[]>([])
  const [productStock, setProductStock] = useState<{[key: number]: number}>({})
  const [showStockFilter, setShowStockFilter] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [adminMode, setAdminMode] = useState(false)

  // 新機能の状態管理
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [wishlist, setWishlist] = useState<number[]>([])
  const [compareList, setCompareList] = useState<number[]>([])
  const [showComparePanel, setShowComparePanel] = useState(false)



  // 多言語データの安全な取得関数
  const getLocalizedText = (text: any, fallback = '') => {
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text !== null) {
      return text[lang] || text['ja'] || Object.values(text)[0] || fallback;
    }
    return fallback;
  };

  // カテゴリ表示名を取得する関数
  const getCategoryDisplayName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'art': 'アート・イラスト',
      'music': '音楽・音声',
      'video': '動画・映像',
      'text': 'テキスト・小説',
      'code': 'コード・プログラム',
      'goods': '物品',
      'other': 'その他'
    };
    return categoryMap[category] || category;
  };

  const getProductImage = (product: any) => {
    // APIデータの構造に合わせて画像を取得
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      console.log(`商品 ${product.id} の画像配列:`, product.images);
      const imageUrl = product.images[0];
      console.log(`商品 ${product.id} の最初の画像URL:`, imageUrl);
      console.log(`商品 ${product.id} の画像URLがhttpで始まるか:`, imageUrl.startsWith('http'));

      // 完全なURLの場合はそのまま使用
      if (imageUrl && imageUrl.startsWith('http')) {
        console.log(`商品 ${product.id} の絶対URLを返します:`, imageUrl);
        return imageUrl;
      }

      // 相対パスの場合はそのまま返す（renderProductImageで処理）
      console.log(`商品 ${product.id} の相対URLを返します:`, imageUrl);
      return imageUrl;
    }

    if (product.image) {
      console.log(`商品 ${product.id} の画像パス:`, product.image);

      // 完全なURLの場合はそのまま使用
      if (product.image.startsWith('http')) {
        console.log(`商品 ${product.id} の絶対URLを返します:`, product.image);
        return product.image;
      }

      // 相対パスの場合はそのまま返す（renderProductImageで処理）
      if (product.image.startsWith('shop/img/')) {
        return product.image;
      } else if (product.image.startsWith('/shop/img/')) {
        return product.image;
      } else {
        return `shop/img/${product.image}`;
      }
    }

    // デフォルトの絵文字
    console.log(`商品 ${product.id} の画像が見つかりません`);
    return '🎨';
  };

  const renderProductImage = (product: any) => {
    const imageSrc = getProductImage(product);
    console.log(`商品 ${product.id} のrenderProductImage開始 - 元のimageSrc:`, imageSrc);

    // 絵文字の場合はそのまま表示
    if (imageSrc.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\u2300-\u23FF]|[\u2000-\u206F]|[\u2100-\u214F]/)) {
      return <div className="text-7xl">{imageSrc}</div>;
    }

    // 画像パスを正規化
    let normalizedImageSrc = imageSrc;
    console.log(`商品 ${product.id} の正規化前imageSrc:`, imageSrc);
    console.log(`商品 ${product.id} のimageSrcがhttpで始まるか:`, imageSrc.startsWith('http'));

    if (imageSrc.includes('.png') || imageSrc.includes('.jpg') || imageSrc.includes('.jpeg') || imageSrc.includes('.webp')) {
      // 既に完全なURLの場合はそのまま使用
      if (imageSrc && imageSrc.startsWith('http')) {
        normalizedImageSrc = imageSrc;
        console.log(`商品 ${product.id} の絶対URLをそのまま使用:`, normalizedImageSrc);
      }
      // 相対パスの場合はshop/img/プレフィックスを追加
      else if (imageSrc && !imageSrc.startsWith('/') && !imageSrc.startsWith('shop/') && !imageSrc.startsWith('http')) {
        normalizedImageSrc = `/shop/img/${imageSrc}`;
        console.log(`商品 ${product.id} の相対URLにプレフィックス追加:`, normalizedImageSrc);
      } else if (imageSrc && imageSrc.startsWith('shop/')) {
        normalizedImageSrc = `/${imageSrc}`;
        console.log(`商品 ${product.id} のshop/パスを正規化:`, normalizedImageSrc);
      } else if (imageSrc && imageSrc.startsWith('/shop/')) {
        normalizedImageSrc = imageSrc;
        console.log(`商品 ${product.id} の/shop/パスをそのまま使用:`, normalizedImageSrc);
      }
    }

    // 画像ファイルの場合はpictureタグでWebP優先・PNGフォールバック表示
    if (normalizedImageSrc.startsWith('/') || normalizedImageSrc.startsWith('http') || normalizedImageSrc.includes('.png') || normalizedImageSrc.includes('.jpg') || normalizedImageSrc.includes('.jpeg') || normalizedImageSrc.includes('.webp')) {
      console.log(`商品 ${product.id} の画像を表示:`, normalizedImageSrc);

      // WebP変換を無効化して、元の画像をそのまま使用
      return (
        <img
          src={normalizedImageSrc}
          alt={getLocalizedText(product.name)}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            console.error(`画像読み込み失敗: ${normalizedImageSrc}`);
            // 画像読み込み失敗時は絵文字を表示
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="text-7xl">🎨</div>';
            }
          }}
          onLoad={() => {
            console.log(`画像読み込み成功: ${normalizedImageSrc}`);
          }}
        />
      );
    }

    // デフォルト画像
    return <img src="/img/creater1.png" alt="商品画像" className="w-full h-full object-cover rounded-lg" />;
  };

  const renderProductImageSmall = (product: any) => {
    const imageSrc = getProductImage(product);
    console.log(`商品 ${product.id} のrenderProductImageSmall開始 - 元のimageSrc:`, imageSrc);

    // 絵文字の場合はそのまま表示
    if (imageSrc.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\u2300-\u23FF]|[\u2000-\u206F]|[\u2100-\u214F]/)) {
      return <div className="text-2xl">{imageSrc}</div>;
    }

    // 画像パスを正規化
    let normalizedImageSrc = imageSrc;
    console.log(`商品 ${product.id} のSmall正規化前imageSrc:`, imageSrc);
    console.log(`商品 ${product.id} のSmall imageSrcがhttpで始まるか:`, imageSrc.startsWith('http'));

    if (imageSrc.includes('.png') || imageSrc.includes('.jpg') || imageSrc.includes('.jpeg') || imageSrc.includes('.webp')) {
      // 既に完全なURLの場合はそのまま使用
      if (imageSrc && imageSrc.startsWith('http')) {
        normalizedImageSrc = imageSrc;
        console.log(`商品 ${product.id} のSmall絶対URLをそのまま使用:`, normalizedImageSrc);
      }
      // 相対パスの場合はshop/img/プレフィックスを追加
      else if (imageSrc && !imageSrc.startsWith('/') && !imageSrc.startsWith('shop/') && !imageSrc.startsWith('http')) {
        normalizedImageSrc = `/shop/img/${imageSrc}`;
        console.log(`商品 ${product.id} のSmall相対URLにプレフィックス追加:`, normalizedImageSrc);
      } else if (imageSrc && imageSrc.startsWith('shop/')) {
        normalizedImageSrc = `/${imageSrc}`;
        console.log(`商品 ${product.id} のSmall shop/パスを正規化:`, normalizedImageSrc);
      } else if (imageSrc && imageSrc.startsWith('/shop/')) {
        normalizedImageSrc = imageSrc;
        console.log(`商品 ${product.id} のSmall /shop/パスをそのまま使用:`, normalizedImageSrc);
      }
    }

    // 画像ファイルの場合はpictureタグでWebP優先・PNGフォールバック表示
    if (normalizedImageSrc.startsWith('/') || normalizedImageSrc.startsWith('http') || normalizedImageSrc.includes('.png') || normalizedImageSrc.includes('.jpg') || normalizedImageSrc.includes('.jpeg') || normalizedImageSrc.includes('.webp')) {
      console.log(`商品 ${product.id} の小さい画像を表示:`, normalizedImageSrc);

      // WebP変換を無効化して、元の画像をそのまま使用
      return (
        <img
          src={normalizedImageSrc}
          alt={getLocalizedText(product.name)}
          className="w-8 h-8 object-cover rounded"
          onError={(e) => {
            console.error(`小さい画像読み込み失敗: ${normalizedImageSrc}`);
            // 画像読み込み失敗時は絵文字を表示
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="text-2xl">🎨</div>';
            }
          }}
          onLoad={() => {
            console.log(`小さい画像読み込み成功: ${normalizedImageSrc}`);
          }}
        />
      );
    }

    // デフォルト画像
    return <img src="/img/creater1.png" alt="商品画像" className="w-8 h-8 object-cover rounded" />;
  };

  // 在庫データの初期化
  useEffect(() => {
    const initialStock: {[key: number]: number} = {};
    products.forEach(product => {
      initialStock[product.id] = product.stock;
    });
    setProductStock(initialStock);
  }, [products]);

  // 商品データの取得
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // デモ商品データをベースとして使用
        let allProducts = [...demoProducts];

        // APIからリアル商品データを取得して追加
        try {
          const response = await fetch('/api/backend/products/');
          if (response.ok) {
            const apiProducts = await response.json();
            console.log('APIから取得した商品データ:', apiProducts);
            console.log('API商品数:', apiProducts.length);

                         // APIデータをフロントエンド用の形式に変換
             const transformedApiProducts = apiProducts.map((product: any, index: number) => {
               console.log(`API商品 ${index + 1}:`, {
                 originalId: product.id,
                 newId: product.id + 1000,
                 name: product.name,
                 description: product.description,
                 price: product.price,
                 category: product.category,
                 category_name: product.category_name,
                 seller_name: product.seller_name,
                 seller_full_name: product.seller_full_name,
                 images: product.images
               });

               return {
                 id: product.id + 1000, // デモ商品と重複しないように1000を加算
                name: {
                  ja: product.name || '商品名なし',
                  en: product.name || 'Product Name',
                  zh: product.name || '产品名称',
                  ko: product.name || '상품명'
                },
                description: {
                  ja: product.description || '商品説明なし',
                  en: product.description || 'Product Description',
                  zh: product.description || '产品描述',
                  ko: product.description || '상품 설명'
                },
                price: product.price || 0,
                originalPrice: Math.floor((product.price || 0) * 1.3), // 30%割引を想定
                rating: product.rating || 4.5,
                reviewCount: Math.floor(Math.random() * 100) + 50, // ランダムなレビュー数
                image: product.images && Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : (product.image || '🎨'),
                category: product.category_name || product.category || 'アート・イラスト', // デフォルトカテゴリー
                stock: product.stock || 0,
                maxStock: (product.stock || 0) * 3,
                lowStockThreshold: Math.max(1, Math.floor((product.stock || 0) * 0.2)),
                seller: {
                  id: product.seller?.toString() || '1',
                  name: {
                    ja: product.seller_full_name || product.seller_name || "テスト出品者",
                    en: product.seller_full_name || product.seller_name || "Test Seller",
                    zh: product.seller_full_name || product.seller_name || "测试卖家",
                    ko: product.seller_full_name || product.seller_name || "테스트 판매자"
                  },
                  avatar: product.seller_avatar || '🧙‍♀️'
                },
                isPrime: product.is_featured || false,
                isNew: false,
                discount: 0
              };
            });

            // デモ商品とAPI商品を結合
            allProducts = [...demoProducts, ...transformedApiProducts];
            console.log('結合後の商品データ:', allProducts);
            console.log('総商品数:', allProducts.length);
            console.log('デモ商品数:', demoProducts.length);
            console.log('API商品数:', transformedApiProducts.length);
          } else {
            console.error('APIからの商品データ取得に失敗');
            console.log('デモ商品のみを使用');
          }
        } catch (apiError) {
          console.error('API商品データ取得エラー:', apiError);
          console.log('デモ商品のみを使用');
        }

        setProducts(allProducts);
      } catch (error) {
        console.error('商品データ取得エラー:', error);
        setProducts(demoProducts); // フォールバックとしてデモ商品を使用
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const productName = typeof product.name === 'string' ? product.name : getLocalizedText(product.name);
    const productDescription = typeof product.description === 'string' ? product.description : getLocalizedText(product.description);
    // デモ商品データとAPIデータの両方に対応したカテゴリ取得
    let productCategory;
    if (product.category_name) {
      // APIデータの場合
      productCategory = product.category_name;
    } else if (typeof product.category === 'string') {
      // デモ商品データの場合（文字列）
      productCategory = product.category;
    } else if (product.category && typeof product.category === 'object') {
      // デモ商品データの場合（オブジェクト）
      productCategory = getLocalizedText(product.category);
    } else {
      // フォールバック
      productCategory = 'その他';
    }

    const matchesSearch = productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         productDescription.toLowerCase().includes(searchQuery.toLowerCase())

    // カテゴリフィルターの改善
    let matchesCategory = true;
    if (selectedCategory !== 'すべて') {
      // 商品のカテゴリを取得（APIデータまたはダミーデータ）
      const productCategoryText = productCategory || 'その他';
      console.log(`商品 ${product.id} (${productName}) のカテゴリ: "${productCategoryText}", 選択カテゴリ: "${selectedCategory}"`);

      // カテゴリの比較（大文字小文字を無視）
      matchesCategory = productCategoryText.toLowerCase() === selectedCategory.toLowerCase();

      // カテゴリが一致しない場合の詳細ログ
      if (!matchesCategory) {
        console.log(`❌ カテゴリ不一致 - 商品: "${productCategoryText}" vs 選択: "${selectedCategory}"`);
      } else {
        console.log(`✅ カテゴリ一致 - 商品: "${productCategoryText}" vs 選択: "${selectedCategory}"`);
      }
    } else {
      console.log(`商品 ${product.id} (${productName}): "すべて"が選択されているため、フィルターなし`);
    }

    // 在庫フィルター
    if (showStockFilter) {
      const currentStock = productStock[product.id] || product.stock;
      if (currentStock === 0) return false; // 在庫切れを除外
    }

    const shouldInclude = matchesSearch && matchesCategory;
    console.log(`商品 ${product.id} (${productName}): 検索一致=${matchesSearch}, カテゴリ一致=${matchesCategory}, 含む=${shouldInclude}`);

    return shouldInclude;
  });

  console.log('フィルタリング後の商品数:', filteredProducts.length);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  const decreaseStock = (productId: number) => {
    setProductStock(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1)
    }));
  };

  const increaseStock = (productId: number, amount: number = 1) => {
    setProductStock(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + amount
    }));
  };

  const handlePurchase = async (product: any) => {
    const currentStock = productStock[product.id] || product.stock;
    if (currentStock > 0) {
      try {
        // 購入処理とメール送信
        const purchaseResult = await apiClient.purchaseProduct({
          product_id: product.id,
          product_name: getLocalizedText(product.name),
          product_price: product.price,
          seller_email: 'seller@example.com', // 実際の実装では出品者のメールを取得
          seller_name: getLocalizedText(product.seller.name),
          quantity: 1,
          shipping_address: {
            name: 'Test User',
            address: '123 Test Street',
            city: 'Test City',
            state: 'Test State',
            postal_code: '12345',
            country: 'Japan',
            phone: '090-1234-5678'
          },
          payment_method: 'credit_card'
        });

        if (purchaseResult.success) {
          // カートに商品を追加
          addToCart({
            id: product.id,
            name: getLocalizedText(product.name),
            price: product.price,
            image: product.image,
            description: getLocalizedText(product.description)
          })

          // 在庫を減らす
          decreaseStock(product.id);

          // 成功メッセージを表示
          const successMessage = document.createElement('div')
          successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full'
          successMessage.innerHTML = `
            <div class="flex items-center gap-2">
              <span>✅</span>
              <span>${getLocalizedText(product.name)}を購入しました！確認メールをお送りしました。</span>
            </div>
          `
          document.body.appendChild(successMessage)

          // アニメーション
          setTimeout(() => {
            successMessage.classList.remove('translate-x-full')
          }, 100)

          // 3秒後に削除
          setTimeout(() => {
            successMessage.classList.add('translate-x-full')
            setTimeout(() => {
              document.body.removeChild(successMessage)
            }, 300)
          }, 3000)
        } else {
          alert(`購入処理に失敗しました: ${purchaseResult.error}`);
        }
      } catch (error) {
        console.error('購入処理エラー:', error);
        alert('購入処理中にエラーが発生しました');
      }
    } else {
      alert('在庫切れです。');
    }
  };



  // APIデータから商品情報を取得する関数
  const getProductInfo = (product: any) => {
    if (!product) return null;

    // APIデータの構造に合わせて情報を取得
    return {
      id: product.id,
      name: {
        ja: product.name || '商品名なし',
        en: product.name || 'Product Name',
        zh: product.name || '产品名称',
        ko: product.name || '상품명'
      },
      description: {
        ja: product.description || '商品説明なし',
        en: product.description || 'Product Description',
        zh: product.description || '产品描述',
        ko: product.description || '상품 설명'
      },
      longDescription: {
        ja: product.description || '詳細な商品説明がありません。',
        en: product.description || 'No detailed product description available.',
        zh: product.description || '没有详细的产品描述。',
        ko: product.description || '상세한 상품 설명이 없습니다.'
      },
      price: product.price || 0,
      originalPrice: Math.floor((product.price || 0) * 1.3), // 30%割引を想定
      rating: product.rating || 4.5,
      reviewCount: Math.floor(Math.random() * 100) + 50, // ランダムなレビュー数
      image: product.images && Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : (product.image || '🎨'),
      category: product.category_name || product.category || 'その他',
      stock: product.stock || 0,
      maxStock: (product.stock || 0) * 3,
      lowStockThreshold: Math.max(1, Math.floor((product.stock || 0) * 0.2)),
      seller: {
        id: product.seller?.toString() || '1',
        name: {
          ja: product.seller_full_name || product.seller_name || "テスト出品者",
          en: product.seller_full_name || product.seller_name || "Test Seller",
          zh: product.seller_full_name || product.seller_name || "测试卖家",
          ko: product.seller_full_name || product.seller_name || "테스트 판매자"
        },
        avatar: product.seller_avatar || '🧙‍♀️'
      },
      isPrime: product.is_featured || false,
      isNew: false,
      discount: 0,
      specifications: {
        format: "デジタルファイル",
        delivery: "即座にダウンロード",
        license: "個人利用",
        fileSize: "約10MB"
      },
      reviews: [
        {
          id: 1,
          user: "ユーザーA",
          avatar: "👤",
          rating: 5,
          comment: "素晴らしい商品です！期待以上の品質でした。",
          date: "2024-01-15"
        },
        {
          id: 2,
          user: "ユーザーB",
          avatar: "👤",
          rating: 4,
          comment: "とても良い商品ですが、もう少し安ければ完璧です。",
          date: "2024-01-10"
        },
        {
          id: 3,
          user: "ユーザーC",
          avatar: "👤",
          rating: 5,
          comment: "最高の商品です！友達にも勧めました。",
          date: "2024-01-05"
        }
      ]
    };
  };

  return (
    <div className="min-h-screen bg-fantasy-gradient relative overflow-hidden">
      {/* 左サイドバー - PC版のみ表示 */}
      <div className="hidden lg:block">
        <LeftSidebar isOpen={isLeftSidebarOpen} onToggle={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
      </div>

      {/* メインコンテンツエリア */}
      <div className={`pt-20 transition-all duration-300 ${
        isLeftSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
      }`}>
        {/* ヘッダー */}
        <Header />

        {/* メインコンテンツ */}
        <main className="relative z-20 min-h-screen">
          <div
            ref={elementRef}
            className={`transition-all duration-1000 w-full ${
              isVisible ? 'scroll-visible' : 'scroll-hidden'
            }`}
          >
            {/* コンテンツ全体を横幅いっぱいに */}
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
              {/* ヒーローセクション */}
              <div className="relative pt-5 pb-16 overflow-hidden mb-8">
                {/* 装飾要素 */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl animate-bounce"></div>
                <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>

                <div className="relative z-10">
                  {/* ヘッダー */}
                  <div className="text-center mb-8">
                    <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-200 mb-2 font-bebas-neue tracking-wider">
                      ELDONIA SHOP
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                      <span className="text-amber-400 text-sm font-cormorant-garamond tracking-widest italic">
                        DIGITAL MARKETPLACE
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
                    </div>
                  </div>

                  {/* サブタイトル */}
                  <p className="text-gray-300 text-lg font-lora leading-relaxed italic mt-6 text-center max-w-3xl mx-auto">
                    Discover unique digital products from talented creators around the world
                  </p>
                </div>
              </div>

              {/* 検索・フィルターセクション */}
              <div className="mb-8 rounded-xl p-6 -mt-20">
                {/* 検索バー */}
                <div className="max-w-3xl mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-6 py-4 bg-gray-800/50 border border-white/20 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400 text-lg"
                    />
                    <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-medium">
                      <TranslatableText
                        translationKey="searchProducts"
                        fallbackText={t('searchProducts')}
                        className="inline-block"
                      />
                    </button>
                  </div>
                </div>

                {/* カテゴリーフィルター */}
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {categories.map((category) => (
                      <button
                        key={getLocalizedText(category.name)}
                        onClick={() => setSelectedCategory(getLocalizedText(category.name))}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          selectedCategory === getLocalizedText(category.name)
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-white/10'
                        }`}
                      >
                        {category.icon} {getLocalizedText(category.name)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ソート・フィルターオプション */}
                <div className="flex flex-wrap items-center gap-4">
                  {/* ソートオプション */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">
                      <TranslatableText
                        translationKey="sortBy"
                        fallbackText={t('sortBy')}
                        className="text-sm text-gray-300"
                      />:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-gray-800/50 border border-white/20 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white"
                    >
                      <option value="featured">{t('recommended')}</option>
                      <option value="price-low">{t('priceLowToHigh')}</option>
                      <option value="price-high">{t('priceHighToLow')}</option>
                      <option value="rating">{t('rating')}</option>
                      <option value="newest">{t('newestFirst')}</option>
                    </select>
                  </div>

                  {/* 在庫フィルター */}
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={showStockFilter}
                        onChange={(e) => setShowStockFilter(e.target.checked)}
                        className="w-4 h-4 text-yellow-500 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
                      />
                      <span>
                        <TranslatableText
                          translationKey="inStockOnly"
                          fallbackText={t('inStockOnly')}
                          className="text-sm text-gray-300"
                        />
                      </span>
                    </label>
                  </div>

                  {/* 商品数表示 */}
                  <div className="text-sm text-gray-300">
                    {filteredProducts.length} <TranslatableText
                      translationKey="itemsFound"
                      fallbackText={t('itemsFound')}
                      className="text-sm text-gray-300"
                    />
                  </div>

                  {/* 管理者モード切り替え */}
                  <button
                    onClick={() => setAdminMode(!adminMode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      adminMode
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-white/10'
                    }`}
                  >
                    {adminMode ? '👑 管理' : '🔧 管理'}
                  </button>

                  {/* 在庫パネル表示切り替え */}
                  {adminMode && (
                    <button
                      onClick={() => setShowAdminPanel(!showAdminPanel)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        showAdminPanel
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                          : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-white/10'
                      }`}
                    >
                      {showAdminPanel ? '📦 非表示' : '📦 表示'}
                    </button>
                  )}
                </div>
              </div>

              {/* 商品グリッド - レスポンシブで横幅いっぱい */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                {sortedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                    className="block"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <AnimatedCard className="glass-effect border border-white/10 hover:border-yellow-400/30 transition-all duration-300 overflow-hidden group rounded-xl flex flex-col h-full cursor-pointer">
                      {/* セクション1: 出品者情報 + 商品画像 */}
                      <div className="relative">
                        {/* お気に入り・比較ボタン */}
                        <WishlistButton
                          productId={product.id}
                          isWishlisted={wishlist.includes(product.id)}
                          onToggle={() => {
                            setWishlist(prev =>
                              prev.includes(product.id)
                                ? prev.filter(id => id !== product.id)
                                : [...prev, product.id]
                            )
                          }}
                        />
                        <CompareButton
                          productId={product.id}
                          isCompared={compareList.includes(product.id)}
                          onToggle={() => {
                            setCompareList(prev =>
                              prev.includes(product.id)
                                ? prev.filter(id => id !== product.id)
                                : [...prev, product.id]
                            )
                          }}
                        />

                        {/* 出品者情報 */}
                        <div className="absolute top-3 left-3 z-10">
                          <div
                            className="flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm hover:bg-black/70 transition-all duration-300 border border-white/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-xl">{product.seller.avatar}</span>
                            <span className="font-medium">{typeof product.seller?.name === 'string' ? product.seller.name : getLocalizedText(product.seller?.name)}</span>
                          </div>
                        </div>

                        {/* 商品画像 */}
                        <div className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-700/50 flex items-center justify-center group-hover:from-gray-700/50 group-hover:to-gray-600/50 transition-all duration-300 overflow-hidden">
                          <div className="w-full h-full transform group-hover:scale-110 transition-transform duration-300">
                            {renderProductImage(product)}
                          </div>
                        </div>

                        {/* バッジ - 画像の下部に配置 */}
                        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                          {product.isPrime && (
                            <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-lg shadow-lg">Prime</span>
                          )}
                          {product.isNew && (
                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-lg shadow-lg">NEW</span>
                          )}
                          {product.discount > 0 && (
                            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-lg shadow-lg">-{product.discount}%</span>
                          )}
                        </div>
                      </div>

                      {/* 商品名（独立セクション） */}
                      <div className="px-6 pt-4 pb-3">
                        <h3 className="font-medium text-white line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300 text-lg leading-tight">
                          {typeof product.name === 'string' ? product.name : getLocalizedText(product.name)}
                        </h3>
                      </div>

                      {/* セクション2: 価格・評価・説明 */}
                      <div className="px-6 pb-4 flex flex-col flex-grow">
                        {/* 価格 */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl font-bold text-yellow-400">¥{product.price.toLocaleString()}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-base text-gray-400 line-through">¥{product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>

                        {/* 評価 */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-600'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">({product.reviewCount || 0})</span>
                        </div>

                        {/* 商品説明 */}
                        <p className="text-base text-gray-300 mb-4 line-clamp-2">
                          {typeof product.description === 'string' ? product.description : getLocalizedText(product.description)}
                        </p>
                      </div>

                      {/* セクション3: カテゴリー・在庫・ボタン */}
                      <div className="px-6 pb-6">
                        {/* カテゴリー */}
                        <div className="text-sm text-gray-500 mb-3">
                          {typeof product.category === 'string' ? product.category : getLocalizedText(product.category)}
                        </div>

                        {/* 在庫状況表示 */}
                        <div className="mb-4">
                          <StockStatus
                            stock={productStock[product.id] || product.stock}
                            maxStock={product.maxStock}
                            lowStockThreshold={product.lowStockThreshold}
                          />
                        </div>

                                                {/* アクションボタン */}
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedProduct(product)
                              setIsModalOpen(true)
                            }}
                            className="flex-1 py-2 px-4 rounded-lg transition-all duration-300 font-medium shadow-lg text-sm bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                          >
                            <TranslatableText
                              translationKey="viewDetails"
                              fallbackText={t('viewDetails')}
                              className="inline-block"
                            />
                          </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handlePurchase(product)
                          }}
                          disabled={productStock[product.id] <= 0}
                            className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 font-medium shadow-lg text-sm ${
                            productStock[product.id] > 0
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                            {productStock[product.id] > 0 ? '🛒' : '❌'}
                        </button>
                        </div>
                      </div>
                    </AnimatedCard>
                  </Link>
                ))}
              </div>

              {/* 商品が見つからない場合 */}
              {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-8xl mb-6">🔍</div>
                  <h3 className="text-2xl font-medium text-white mb-3">
                    <TranslatableText
                      translationKey="noProductsFound"
                      fallbackText={t('noProductsFound')}
                      className="text-2xl font-medium text-white"
                    />
                  </h3>
                  <p className="text-gray-400 text-lg">
                    <TranslatableText
                      translationKey="noProductsFoundDesc"
                      fallbackText={t('noProductsFoundDesc')}
                      className="text-gray-400 text-lg"
                    />
                  </p>
                </div>
              )}

              {/* おすすめセクション */}
              <div className="mt-20">
                <h2 className="text-3xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400 mb-8">
                  <TranslatableText
                    translationKey="recommendedProducts"
                    fallbackText={t('recommendedProducts')}
                    className="text-3xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400"
                  />
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {products.slice(0, 4).map((product) => (
                    <AnimatedCard key={product.id} className="glass-effect border border-white/10 hover:border-yellow-400/30 transition-all duration-300 overflow-hidden group rounded-xl flex flex-col h-full">
                      {/* セクション1: 商品画像 */}
                      <div className="relative">
                        <div className="aspect-square bg-gradient-to-br from-amber-900/30 to-orange-900/30 flex items-center justify-center p-6 group-hover:from-amber-800/40 group-hover:to-orange-800/40 transition-all duration-300">
                          {renderProductImage(product)}
                        </div>
                        <div className="absolute top-3 left-3">
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm px-3 py-1 rounded-lg shadow-lg">
                            <TranslatableText
                              translationKey="recommended"
                              fallbackText={t('recommended')}
                              className="inline-block"
                            />
                          </span>
                        </div>
                      </div>

                      {/* 商品名（独立セクション） */}
                      <div className="px-6 pt-4 pb-3">
                        <h3 className="font-medium text-white line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300 text-lg leading-tight">
                          {getLocalizedText(product.name)}
                        </h3>
                      </div>

                      {/* セクション2: 価格・評価 */}
                      <div className="px-6 pb-4 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xl font-bold text-yellow-400">¥{product.price.toLocaleString()}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-base text-gray-400 line-through">¥{product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-600'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">({product.reviewCount})</span>
                        </div>
                      </div>

                      {/* セクション3: ボタン */}
                      <div className="px-6 pb-6">
                        <Link
                          href={`/product/${product.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-3 px-6 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 font-medium shadow-lg text-base">
                            <TranslatableText
                              translationKey="viewDetails"
                              fallbackText={t('viewDetails')}
                              className="inline-block"
                            />
                          </button>
                        </Link>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
              </div>

              {/* 統計情報 */}
              <div className="mt-20 glass-effect border border-white/10 p-8 rounded-xl">
                <h2 className="text-2xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400 mb-8 text-center">
                  <TranslatableText
                    translationKey="storeStatistics"
                    fallbackText={t('storeStatistics')}
                    className="text-2xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400"
                  />
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { value: '1,234', label: t('totalProducts') },
                    { value: '89', label: t('totalSellers') },
                    { value: '4.8', label: t('averageRating') },
                    { value: '12,345', label: t('totalSales') }
                  ].map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">{stat.value}</div>
                      <div className="text-base text-gray-300">
                        <TranslatableText
                          translationKey={stat.label === t('totalProducts') ? 'totalProducts' :
                                         stat.label === t('totalSellers') ? 'totalSellers' :
                                         stat.label === t('averageRating') ? 'averageRating' : 'totalSales'}
                          fallbackText={stat.label}
                          className="text-base text-gray-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 管理者用在庫管理パネル */}
              {showAdminPanel && (
                <AdminStockPanel
                  products={products}
                  productStock={productStock}
                  onIncreaseStock={increaseStock}
                  onDecreaseStock={decreaseStock}
                  renderProductImageSmall={renderProductImageSmall}
                  getLocalizedText={getLocalizedText}
                />
              )}

              {/* 比較パネル */}
              {showComparePanel && compareList.length > 0 && (
                <div className="mt-8 glass-effect border border-white/10 p-6 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-yellow-400">
                      <TranslatableText
                        translationKey="compareProducts"
                        fallbackText={t('compareProducts')}
                        className="text-xl font-bold text-yellow-400"
                      />
                    </h3>
                    <button
                      onClick={() => setShowComparePanel(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {compareList.map(productId => {
                      const product = products.find(p => p.id === productId)
                      if (!product) return null
                      return (
                        <div key={productId} className="bg-gray-800/50 p-4 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="text-2xl">{renderProductImageSmall(product)}</div>
                            <h4 className="font-medium text-white text-sm">{getLocalizedText(product.name)}</h4>
                          </div>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>価格: ¥{product.price.toLocaleString()}</div>
                            <div>評価: {product.rating}/5 ({product.reviewCount})</div>
                            <div>在庫: {productStock[product.id] || product.stock}</div>
                          </div>
                          <button
                            onClick={() => setCompareList(prev => prev.filter(id => id !== productId))}
                            className="mt-2 w-full py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            <TranslatableText
                              translationKey="removeFromCompare"
                              fallbackText={t('removeFromCompare')}
                              className="inline-block"
                            />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* お気に入り・比較パネル切り替えボタン */}
              <div className="mt-8 flex gap-4">
                {wishlist.length > 0 && (
                  <button
                    onClick={() => setShowComparePanel(false)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ❤️ <TranslatableText
                      translationKey="wishlist"
                      fallbackText={t('wishlist')}
                      className="inline-block"
                    /> ({wishlist.length})
                  </button>
                )}
                {compareList.length > 0 && (
                  <button
                    onClick={() => setShowComparePanel(!showComparePanel)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    📊 <TranslatableText
                      translationKey="compare"
                      fallbackText={t('compare')}
                      className="inline-block"
                    /> ({compareList.length})
                  </button>
                )}
              </div>


            </div>
          </div>
        </main>
        <Footer />
      </div>



      {/* 商品詳細モーダル */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedProduct(null)
        }}
        onPurchase={handlePurchase}
        renderProductImage={renderProductImage}
        renderProductImageSmall={renderProductImageSmall}
        getLocalizedText={getLocalizedText}
      />
    </div>
  );
}
