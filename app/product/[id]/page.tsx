'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { addToCart, getCartItemCount, onCartUpdate } from '@/app/lib/cart'
import { useTranslation } from '@/app/lib/useTranslation'
import TranslatableText from '@/app/components/TranslatableText'

// shopページと同じ商品データ
const products = [
  {
    id: 1,
    name: {
      ja: "エルドニア ファンタジーアートコレクション",
      en: "Eldonia Fantasy Art Collection",
      zh: "埃尔多尼亚奇幻艺术收藏",
      ko: "엘도니아 판타지 아트 컬렉션"
    },
    price: 2980,
    originalPrice: 3980,
    rating: 4.8,
    reviewCount: 1247,
    image: "🎨",
    category: {
      ja: "アート",
      en: "Art",
      zh: "艺术",
      ko: "아트"
    },
    isPrime: true,
    isNew: false,
    discount: 25,
    description: {
      ja: "美しいファンタジー世界を描いたアート作品集",
      en: "Beautiful art collection depicting fantasy worlds",
      zh: "描绘美丽奇幻世界的艺术作品集",
      ko: "아름다운 판타지 세계를 그린 아트 작품집"
    },
    longDescription: {
      ja: "このアートコレクションは、エルドニア世界の美しい風景とキャラクターを描いた作品集です。\n\n特徴：\n• 高解像度のデジタルアート\n• 印刷可能な高品質ファイル\n• 商用利用可能なライセンス\n• 複数のファイル形式対応\n• デスクトップ・モバイル壁紙含む",
      en: "This art collection features beautiful landscapes and characters from the Eldonia world.\n\nFeatures:\n• High-resolution digital art\n• Print-ready high-quality files\n• Commercial use license\n• Multiple file formats\n• Desktop and mobile wallpapers included",
      zh: "这个艺术收藏描绘了埃尔多尼亚世界的美丽风景和角色。\n\n特点：\n• 高分辨率数字艺术\n• 可打印的高质量文件\n• 商业使用许可\n• 多种文件格式\n• 包含桌面和移动壁纸",
      ko: "이 아트 컬렉션은 엘도니아 세계의 아름다운 풍경과 캐릭터를 그린 작품집입니다.\n\n특징:\n• 고해상도 디지털 아트\n• 인쇄 가능한 고품질 파일\n• 상업적 사용 라이센스\n• 여러 파일 형식 지원\n• 데스크톱 및 모바일 배경화면 포함"
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
    },
    specifications: {
      ja: {
        format: "PNG, JPG, PDF",
        resolution: "4K (3840x2160)",
        fileSize: "約500MB",
        license: "商用利用可能",
        delivery: "即座にダウンロード"
      },
      en: {
        format: "PNG, JPG, PDF",
        resolution: "4K (3840x2160)",
        fileSize: "~500MB",
        license: "Commercial use allowed",
        delivery: "Instant download"
      },
      zh: {
        format: "PNG, JPG, PDF",
        resolution: "4K (3840x2160)",
        fileSize: "约500MB",
        license: "允许商业使用",
        delivery: "即时下载"
      },
      ko: {
        format: "PNG, JPG, PDF",
        resolution: "4K (3840x2160)",
        fileSize: "약 500MB",
        license: "상업적 사용 허용",
        delivery: "즉시 다운로드"
      }
    },
    reviews: [
      {
        id: 1,
        user: "冒険者A",
        avatar: "🗡️",
        rating: 5,
        comment: "素晴らしいアート作品です！期待以上の品質でした。",
        date: "2024-01-15"
      },
      {
        id: 2,
        user: "魔法使いB",
        avatar: "🧙‍♀️",
        rating: 4,
        comment: "とても美しい作品ですが、もう少し安ければ完璧です。",
        date: "2024-01-10"
      },
      {
        id: 3,
        user: "戦士C",
        avatar: "⚔️",
        rating: 5,
        comment: "最高のアート作品です！友達にも勧めました。",
        date: "2024-01-05"
      }
    ]
  },
  {
    id: 2,
    name: {
      ja: "魔法の物語 完全版",
      en: "Magical Tales Complete Edition",
      zh: "魔法故事完整版",
      ko: "마법 이야기 완전판"
    },
    price: 1580,
    originalPrice: 1980,
    rating: 4.9,
    reviewCount: 892,
    image: "📚",
    category: {
      ja: "書籍",
      en: "Books",
      zh: "书籍",
      ko: "도서"
    },
    isPrime: true,
    isNew: true,
    discount: 20,
    description: {
      ja: "人気ファンタジー小説の完全版",
      en: "Complete edition of popular fantasy novels",
      zh: "热门奇幻小说的完整版",
      ko: "인기 판타지 소설의 완전판"
    },
    longDescription: {
      ja: "この完全版には、シリーズ全巻が含まれており、追加の短編小説や著者による解説も収録されています。\n\n内容：\n• 全5巻の長編小説\n• 3つの短編小説\n• 著者による解説と注釈\n• 世界観ガイド\n• キャラクター紹介",
      en: "This complete edition includes all volumes of the series, plus additional short stories and author commentary.\n\nContents:\n• All 5 volumes of the novel series\n• 3 short stories\n• Author commentary and notes\n• World guide\n• Character profiles",
      zh: "这个完整版包含系列的所有卷册，以及额外的短篇小说和作者评论。\n\n内容：\n• 全5卷长篇小说\n• 3个短篇小说\n• 作者评论和注释\n• 世界观指南\n• 角色介绍",
      ko: "이 완전판에는 시리즈 전권이 포함되어 있으며, 추가 단편소설과 저자의 해설도 수록되어 있습니다.\n\n내용:\n• 전 5권의 장편소설\n• 3개의 단편소설\n• 저자의 해설과 주석\n• 세계관 가이드\n• 캐릭터 소개"
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
    },
    specifications: {
      ja: {
        format: "EPUB, PDF, MOBI",
        pages: "約800ページ",
        language: "日本語",
        fileSize: "約50MB",
        delivery: "即座にダウンロード"
      },
      en: {
        format: "EPUB, PDF, MOBI",
        pages: "~800 pages",
        language: "English",
        fileSize: "~50MB",
        delivery: "Instant download"
      },
      zh: {
        format: "EPUB, PDF, MOBI",
        pages: "约800页",
        language: "中文",
        fileSize: "约50MB",
        delivery: "即时下载"
      },
      ko: {
        format: "EPUB, PDF, MOBI",
        pages: "약 800페이지",
        language: "한국어",
        fileSize: "약 50MB",
        delivery: "즉시 다운로드"
      }
    },
    reviews: [
      {
        id: 4,
        user: "読書家D",
        avatar: "📖",
        rating: 5,
        comment: "素晴らしい物語です。完全版の価値があります。",
        date: "2024-01-20"
      },
      {
        id: 5,
        user: "ファンタジー愛好者E",
        avatar: "🐉",
        rating: 4,
        comment: "世界観が素晴らしく、キャラクターも魅力的です。",
        date: "2024-01-18"
      }
    ]
  },
  {
    id: 3,
    name: {
      ja: "エルドニア サウンドトラック",
      en: "Eldonia Soundtrack",
      zh: "埃尔多尼亚原声带",
      ko: "엘도니아 사운드트랙"
    },
    price: 1280,
    originalPrice: 1580,
    rating: 4.7,
    reviewCount: 567,
    image: "🎵",
    category: {
      ja: "音楽",
      en: "Music",
      zh: "音乐",
      ko: "음악"
    },
    isPrime: false,
    isNew: false,
    discount: 19,
    description: {
      ja: "ゲーム世界の美しい音楽集",
      en: "Beautiful music collection from the game world",
      zh: "游戏世界的美丽音乐集",
      ko: "게임 세계의 아름다운 음악집"
    },
    longDescription: {
      ja: "エルドニア世界の美しい音楽を収録したサウンドトラックです。\n\n収録内容：\n• メインテーマ曲\n• 各エリアのBGM\n• 戦闘音楽\n• 環境音\n• ボーナストラック",
      en: "Soundtrack featuring beautiful music from the Eldonia world.\n\nTrack list:\n• Main theme\n• Area BGM\n• Battle music\n• Ambient sounds\n• Bonus tracks",
      zh: "收录了埃尔多尼亚世界美丽音乐的原声带。\n\n收录内容：\n• 主题曲\n• 各区域BGM\n• 战斗音乐\n• 环境音\n• 奖励曲目",
      ko: "엘도니아 세계의 아름다운 음악을 수록한 사운드트랙입니다.\n\n수록 내용:\n• 메인 테마곡\n• 각 지역의 BGM\n• 전투 음악\n• 환경음\n• 보너스 트랙"
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
    },
    specifications: {
      ja: {
        format: "MP3, FLAC, WAV",
        tracks: "25曲",
        duration: "約75分",
        quality: "320kbps",
        delivery: "即座にダウンロード"
      },
      en: {
        format: "MP3, FLAC, WAV",
        tracks: "25 tracks",
        duration: "~75 minutes",
        quality: "320kbps",
        delivery: "Instant download"
      },
      zh: {
        format: "MP3, FLAC, WAV",
        tracks: "25首",
        duration: "约75分钟",
        quality: "320kbps",
        delivery: "即时下载"
      },
      ko: {
        format: "MP3, FLAC, WAV",
        tracks: "25곡",
        duration: "약 75분",
        quality: "320kbps",
        delivery: "즉시 다운로드"
      }
    },
    reviews: [
      {
        id: 6,
        user: "音楽愛好者F",
        avatar: "🎼",
        rating: 5,
        comment: "美しい音楽です。作業中に聴くのに最適です。",
        date: "2024-01-25"
      }
    ]
  }
];

export default function ProductDetailPage() {
  const params = useParams()
  const productId = parseInt(params.id as string)
  const { t, currentLanguage } = useTranslation()
  const lang = currentLanguage

  const [selectedImage, setSelectedImage] = useState(0)

  const [activeTab, setActiveTab] = useState('description')
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [products, setProducts] = useState<any[]>([])

  // 多言語データの安全な取得関数
  const getLocalizedText = (text: any, fallback = '') => {
    if (typeof text === 'string') return text;
    if (typeof text === 'object' && text !== null) {
      return text[lang] || text['ja'] || Object.values(text)[0] || fallback;
    }
    return fallback;
  };

  // 商品画像の取得関数
  const getProductImage = (product: any) => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    if (product.image) {
      return product.image;
    }
    return '🎨';
  };

  // 商品画像の表示関数
  const renderProductImage = (product: any, size = 'large') => {
    let imageSrc;
    if (product.image && typeof product.image === 'string') {
      imageSrc = product.image;
    } else {
      imageSrc = getProductImage(product);
    }

    // 絵文字の場合はそのまま表示
    if (imageSrc.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\u2300-\u23FF]|[\u2000-\u206F]|[\u2100-\u214F]/)) {
      return <div className={size === 'large' ? "text-9xl" : "text-4xl"}>{imageSrc}</div>;
    }

    // 画像パスを正規化
    let normalizedImageSrc = imageSrc;
    if (imageSrc.includes('.png') || imageSrc.includes('.jpg') || imageSrc.includes('.jpeg')) {
      if (!imageSrc.startsWith('/') && !imageSrc.startsWith('http') && !imageSrc.startsWith('shop/')) {
        normalizedImageSrc = `/shop/img/${imageSrc}`;
      } else if (imageSrc.startsWith('shop/')) {
        normalizedImageSrc = `/${imageSrc}`;
      }
    }

    if (normalizedImageSrc.startsWith('/') || normalizedImageSrc.startsWith('http') || normalizedImageSrc.includes('.png') || normalizedImageSrc.includes('.jpg') || normalizedImageSrc.includes('.jpeg')) {
      return (
        <img
          src={normalizedImageSrc}
          alt={getLocalizedText(product.name)}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            console.error(`画像読み込み失敗: ${normalizedImageSrc}`);
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="text-9xl">🎨</div>';
            }
          }}
        />
      );
    }

    return <img src="/img/creater1.png" alt="商品画像" className="w-full h-full object-cover rounded-lg" />;
  };

  // APIデータから商品情報を取得する関数
  const getProductInfo = (product: any) => {
    if (!product) return null;

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
      originalPrice: Math.floor((product.price || 0) * 1.3),
      rating: product.rating || 4.5,
      reviewCount: Math.floor(Math.random() * 100) + 50,
      image: product.images && Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : (product.image || '🎨'),
      images: product.images || [product.image || '🎨'],
      category: {
        ja: product.category || 'その他',
        en: product.category || 'Other',
        zh: product.category || '其他',
        ko: product.category || '기타'
      },
      stock: product.stock || 0,
      maxStock: (product.stock || 0) * 3,
      lowStockThreshold: Math.max(1, Math.floor((product.stock || 0) * 0.2)),
      seller: {
        id: product.seller?.toString() || '1',
        name: {
          ja: "テスト出品者",
          en: "Test Seller",
          zh: "测试卖家",
          ko: "테스트 판매자"
        },
        avatar: '��‍♀️'
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

  // 商品データの取得
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${apiUrl}/products/`);

        if (!response.ok) {
          throw new Error('商品データの取得に失敗しました');
        }

        const data = await response.json();
        console.log('APIから取得した商品データ:', data);
        setProducts(data);
      } catch (error) {
        console.error('商品データ取得エラー:', error);
        console.log('ダミーデータを使用します');
        setProducts(products);
      }
    };

    fetchProducts();
  }, [products]);

  // カートアイテム数を取得
  useEffect(() => {
    setCartItemCount(getCartItemCount())

    const cleanup = onCartUpdate(() => {
      setCartItemCount(getCartItemCount())
    })

    return cleanup
  }, [])

  const rawProduct = products.find(p => p.id === productId)
  const product = getProductInfo(rawProduct)

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="text-8xl mb-6">❌</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              <TranslatableText
                translationKey="productNotFound"
                fallbackText={t('productNotFound')}
                className="text-3xl font-bold text-white"
              />
            </h1>
            <p className="text-gray-400 mb-8">
              <TranslatableText
                translationKey="productNotFoundDesc"
                fallbackText={t('productNotFoundDesc')}
                className="text-gray-400"
              />
            </p>
            <Link
              href="/shop"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-medium"
            >
              <TranslatableText
                translationKey="backToShop"
                fallbackText={t('backToShop')}
                className="inline-block"
              />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleAddToCart = async () => {
    if (isAddingToCart) return

    setIsAddingToCart(true)

    try {
             addToCart({
        id: product.id,
        name: getLocalizedText(product.name),
        price: product.price,
        image: product.image,
        description: getLocalizedText(product.description)
      })

      const successMessage = document.createElement('div')
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full'
      successMessage.innerHTML = `
        <div class="flex items-center gap-2">
          <span>✅</span>
                     <span>${getLocalizedText(product.name)}をカートに追加しました！</span>
        </div>
      `
      document.body.appendChild(successMessage)

      setTimeout(() => {
        successMessage.classList.remove('translate-x-full')
      }, 100)

      setTimeout(() => {
        successMessage.classList.add('translate-x-full')
        setTimeout(() => {
          document.body.removeChild(successMessage)
        }, 300)
      }, 3000)

    } catch (error) {
      console.error('カートへの追加に失敗しました:', error)

      const errorMessage = document.createElement('div')
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full'
      errorMessage.innerHTML = `
        <div class="flex items-center gap-2">
          <span>❌</span>
          <span>カートへの追加に失敗しました</span>
        </div>
      `
      document.body.appendChild(errorMessage)

      setTimeout(() => {
        errorMessage.classList.remove('translate-x-full')
      }, 100)

      setTimeout(() => {
        errorMessage.classList.add('translate-x-full')
        setTimeout(() => {
          document.body.removeChild(errorMessage)
        }, 300)
      }, 3000)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 4)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-8 pt-24">
        {/* パンくずリスト */}
        <nav className="mb-8">
          <ol className="flex items-center flex-wrap gap-2 text-sm text-gray-400">
            <li><Link href="/" className="hover:text-yellow-400 transition-colors whitespace-nowrap">
              <TranslatableText
                translationKey="home"
                fallbackText={t('home')}
                className="hover:text-yellow-400 transition-colors"
              />
            </Link></li>
            <li className="text-gray-500">/</li>
            <li><Link href="/shop" className="hover:text-yellow-400 transition-colors whitespace-nowrap">
              <TranslatableText
                translationKey="shop"
                fallbackText={t('shop')}
                className="hover:text-yellow-400 transition-colors"
              />
            </Link></li>
            <li className="text-gray-500">/</li>
            <li><Link href={`/shop?category=${getLocalizedText(product.category)}`} className="hover:text-yellow-400 transition-colors max-w-xs truncate" title={getLocalizedText(product.category)}>{getLocalizedText(product.category)}</Link></li>
            <li className="text-gray-500">/</li>
            <li className="text-white max-w-xs truncate" title={getLocalizedText(product.name)}>{getLocalizedText(product.name)}</li>
          </ol>
        </nav>

        {/* Amazon風商品詳細レイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* 左側: 画像ギャラリー */}
          <div className="space-y-4">
            {/* メイン画像 */}
            <div className="aspect-square bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl overflow-hidden border border-white/10">
              {renderProductImage({
                ...product,
                image: product.images && product.images.length > selectedImage
                  ? product.images[selectedImage]
                  : product.image
              })}
            </div>

            {/* サブ画像ギャラリー */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.slice(0, 5).map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-800/50 rounded-lg flex items-center justify-center p-2 border-2 transition-all duration-300 ${
                      selectedImage === index
                        ? 'border-yellow-400 bg-gray-700/50'
                        : 'border-transparent hover:border-gray-600'
                    }`}
                  >
                    {renderProductImage({...product, image: image}, 'small')}
                  </button>
                ))}
              </div>
            )}

            {/* バッジ */}
            <div className="flex gap-2">
              {product.isPrime && (
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm px-3 py-1 rounded-lg">Prime</span>
              )}
              {product.isNew && (
                <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-3 py-1 rounded-lg">NEW</span>
              )}
              {product.discount > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-3 py-1 rounded-lg">-{product.discount}%</span>
              )}
            </div>
          </div>

          {/* 右側: 商品情報 */}
          <div className="space-y-6">
            {/* 商品名 */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 break-words leading-tight">{getLocalizedText(product.name)}</h1>
              <p className="text-gray-400 break-words">{getLocalizedText(product.category)}</p>
            </div>

            {/* Amazon風価格表示 */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-4">
                <span className="text-5xl font-bold text-yellow-400">¥{product.price.toLocaleString()}</span>
                {product.originalPrice > product.price && (
                  <span className="text-2xl text-gray-400 line-through">¥{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              {product.originalPrice > product.price && (
                <div className="flex items-center gap-2">
                  <span className="bg-red-500 text-white text-sm px-2 py-1 rounded">割引</span>
                  <span className="text-green-400 text-sm">
                    ¥{(product.originalPrice - product.price).toLocaleString()} お得
                  </span>
                </div>
              )}
            </div>

            {/* タブセクション */}
            <div className="space-y-4">
              <div className="flex border-b border-gray-700">
                {[
                  { id: 'description', label: t('description') },
                  { id: 'specifications', label: t('specifications') },
                  { id: 'reviews', label: t('reviews') }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-3 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-yellow-400 border-b-2 border-yellow-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* タブコンテンツ */}
              <div className="p-4 bg-gray-800/30 rounded-lg">
                {activeTab === 'description' && (
                  <div className="prose prose-invert max-w-none">
                    <h3 className="text-white font-medium mb-2">商品紹介</h3>
                    <p className="text-gray-300 leading-relaxed">{getLocalizedText(product.description)}</p>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="space-y-4">
                    <h3 className="text-white font-medium mb-2">商品仕様</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="flex justify-between p-3 bg-gray-700/30 rounded-lg">
                          <span className="text-gray-400 capitalize">{key}</span>
                          <span className="text-white">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    <h3 className="text-white font-medium mb-2">レビュー</h3>
                    <div className="space-y-4">
                      {product.reviews.map((review) => (
                        <div key={review.id} className="p-4 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">{review.avatar}</span>
                            <div>
                              <p className="text-white font-medium">{review.user}</p>
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-600'}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-300">{review.comment}</p>
                          <p className="text-gray-500 text-sm mt-2">{review.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 評価とレビュー */}
            <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-600'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-gray-400">({product.reviewCount}件のレビュー)</span>
              <span className="text-blue-400 text-sm underline cursor-pointer">レビューを書く</span>
            </div>

            {/* 在庫状況 */}
            <div className="flex items-center gap-2 p-4 bg-gray-800/30 rounded-lg">
              <span className={`w-3 h-3 rounded-full ${product.stock > product.lowStockThreshold ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-gray-300">
                {product.stock > 0 ? `在庫: ${product.stock}個` : '在庫切れ'}
              </span>
              {product.stock <= product.lowStockThreshold && product.stock > 0 && (
                <span className="text-orange-400 text-sm">残りわずか</span>
              )}
            </div>

            {/* 出品者情報 */}
            <div className="flex items-center gap-3 p-4 bg-gray-800/30 rounded-lg">
              <span className="text-2xl flex-shrink-0">{product.seller.avatar}</span>
              <div className="min-w-0 flex-1">
                <p className="text-white font-medium break-words">{getLocalizedText(product.seller.name)}</p>
                <p className="text-gray-400 text-sm">
                  <TranslatableText
                    translationKey="seller"
                    fallbackText={t('seller')}
                    className="text-gray-400 text-sm"
                  />
                </p>
              </div>
            </div>

                         {/* Amazon風購入セクション */}
             <div className="space-y-4 p-6 bg-gray-800/30 rounded-lg border border-white/10">
               <div className="space-y-3">
                {/* メイン購入ボタン */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || isAddingToCart}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 ${
                    product.stock > 0 && !isAddingToCart
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 shadow-lg hover:shadow-xl'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isAddingToCart ? (
                    <TranslatableText
                      translationKey="adding"
                      fallbackText={t('adding')}
                      className="inline-block"
                    />
                  ) : product.stock > 0 ? (
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

                {/* カートボタン */}
                <Link
                  href="/cart"
                  className="flex items-center justify-center py-3 px-6 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all duration-300 relative"
                >
                  <span className="text-xl mr-2">🛒</span>
                  <span>カートを見る</span>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>



        {/* Amazon風関連商品セクション */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 mb-16">
            <div className="bg-gray-800/50 border border-white/10 rounded-xl p-8">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400 mb-8">
                <TranslatableText
                  translationKey="relatedProducts"
                  fallbackText={t('relatedProducts')}
                  className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-orange-400"
                />
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => {
                  const relatedProductInfo = getProductInfo(relatedProduct);
                  return (
                    <Link
                      key={relatedProduct.id}
                      href={`/product/${relatedProduct.id}`}
                      className="group block bg-gray-900/50 border border-white/10 rounded-xl overflow-hidden hover:border-yellow-400/30 hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105"
                    >
                      <div className="aspect-square bg-gradient-to-br from-gray-700/50 to-gray-600/50 flex items-center justify-center p-6 overflow-hidden group-hover:from-gray-600/50 group-hover:to-gray-500/50 transition-all duration-300">
                        {renderProductImage(relatedProductInfo)}
                      </div>

                      <div className="p-4 space-y-3">
                        <h3 className="text-white font-medium text-sm line-clamp-2 group-hover:text-yellow-400 transition-colors duration-300">
                          {getLocalizedText(relatedProductInfo?.name) || getLocalizedText(relatedProduct.name)}
                        </h3>

                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-bold text-lg">¥{relatedProduct.price.toLocaleString()}</span>
                          {relatedProduct.originalPrice > relatedProduct.price && (
                            <span className="text-gray-400 text-sm line-through">¥{relatedProduct.originalPrice.toLocaleString()}</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex text-yellow-400 text-sm">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < Math.floor(relatedProduct.rating) ? 'text-yellow-400' : 'text-gray-600'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-gray-400 text-xs">({relatedProduct.reviewCount || 0})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${relatedProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-gray-300 text-xs">
                            {relatedProduct.stock > 0 ? `在庫: ${relatedProduct.stock}個` : '在庫切れ'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm">{relatedProductInfo?.seller?.avatar || '👤'}</span>
                          <span className="text-gray-400 text-xs truncate">
                            {getLocalizedText(relatedProductInfo?.seller?.name) || '出品者'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="text-center mt-8">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 font-medium"
                >
                  <span>
                    <TranslatableText
                      translationKey="viewAllProducts"
                      fallbackText={t('viewAllProducts')}
                      className="inline-block"
                    />
                  </span>
                  <span className="text-xl">→</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
