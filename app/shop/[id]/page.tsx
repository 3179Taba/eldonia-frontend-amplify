"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useI18n } from '../../lib/i18n-provider';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageWithSidebars from '../../components/PageWithSidebars';
import TranslatableText from '../../components/TranslatableText';
import { motion } from 'framer-motion';

interface ShopProduct {
  id: number;
  name: string;
  description: string;
  category: string;
  seller: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  price: number;
  stock: number;
  views: number;
  sales: number;
  revenue: number;
  images: Array<{
    url: string;
    thumbnail_url: string;
    alt_text: string;
    is_main: boolean;
  }>;
  main_image_url: string | null;
  thumbnail_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  reviews: Array<{
    id: number;
    rating: number;
    comment: string;
    user: {
      id: number;
      username: string;
    };
    created_at: string;
  }>;
}

export default function ShopProductDetailPage() {
  const params = useParams();
  const { t } = useI18n();
  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const productId = params.id;
        const response = await fetch(`/api/shop/${productId}/`);

        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          throw new Error('商品が見つかりません');
        }
      } catch (error) {
        console.error('商品データの取得に失敗:', error);
        setError('商品データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const getCategoryName = (category: string) => {
    const categories = {
      art: 'アート',
      goods: 'グッズ',
      digital: 'デジタル',
      service: 'サービス',
      music: '音楽',
      video: '動画',
      other: 'その他'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <PageWithSidebars>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <div className="text-white text-lg">商品情報を読み込み中...</div>
          </div>
        </div>
      </PageWithSidebars>
    );
  }

  if (error || !product) {
    return (
      <PageWithSidebars>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-lg mb-4">商品が見つかりません</div>
            <button
              onClick={() => window.history.back()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      </PageWithSidebars>
    );
  }

  return (
    <PageWithSidebars>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* 商品画像 */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {product.main_image_url ? (
                    <img
                      src={product.main_image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">🖼️</span>
                    </div>
                  )}
                </div>

                {/* サブ画像 */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                          selectedImage === index ? 'border-purple-500' : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image.thumbnail_url || image.url}
                          alt={image.alt_text}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 商品情報 */}
              <div className="space-y-6">
                <div>
                  <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    {getCategoryName(product.category)}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {product.description}
                  </p>
                </div>

                {/* 価格情報 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {formatPrice(product.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    在庫: {product.stock}個
                  </div>
                </div>

                {/* 出品者情報 */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">出品者</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {product.seller.username.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {product.seller.first_name} {product.seller.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{product.seller.username}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 統計情報 */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{product.views}</div>
                    <div className="text-sm text-gray-500">閲覧数</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{product.sales}</div>
                    <div className="text-sm text-gray-500">売上数</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatPrice(product.revenue)}
                    </div>
                    <div className="text-sm text-gray-500">売上金額</div>
                  </div>
                </div>

                {/* 購入ボタン */}
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors">
                  購入する
                </button>
              </div>
            </div>

            {/* レビュー */}
            {product.reviews.length > 0 && (
              <div className="border-t p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">レビュー</h3>
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {review.user.username.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {review.user.username}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                      <div className="text-sm text-gray-500 mt-2">
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </main>

        <Footer />
      </div>
    </PageWithSidebars>
  );
}
