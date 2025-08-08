"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'
import Header from '../components/Header'
import Footer from '../components/Footer'
import PageWithSidebars from '../components/PageWithSidebars'

import GalleryHeader from '../components/GalleryHeader'

import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '../lib/api'

interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  file_type?: string;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  created_at?: string;
  views?: number;
  likes?: number;
  files?: any[];
  covers?: Array<{
    id: number;
    file_url: string;
    original_name: string;
    file_type: string;
  }>;
  tags?: string[];
  thumbnail_url?: string;
  cover_image_url?: string;
}

// サンプルデータを削除 - バックエンドの実際のデータのみを使用

export default function GalleryPage() {
  const router = useRouter();
  const { elementRef, isVisible } = useIntersectionObserver({ triggerOnce: false })
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState<{ [key: number]: boolean }>({});
  const [subs, setSubs] = useState<{ [key: number]: boolean }>({});


  // いいね機能
  const toggleLike = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiClient.toggleLike(postId);
      if (response.success) {
        setLikes(prev => ({ ...prev, [postId]: response.is_liked }));
        // 投稿のいいね数を更新
        setPosts(prev => prev.map(post =>
          post.id === postId
            ? { ...post, likes: response.likes_count }
            : post
        ));
      }
    } catch (error) {
      console.error('いいねの切り替えに失敗:', error);
      alert('いいねの操作に失敗しました');
    }
  };

  // チャンネル登録機能
  const toggleSub = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await apiClient.toggleSubscribe(postId);
      if (response.success) {
        setSubs(prev => ({ ...prev, [postId]: response.is_subscribed }));
      }
    } catch (error) {
      console.error('チャンネル登録の切り替えに失敗:', error);
      alert('チャンネル登録の操作に失敗しました');
    }
  };

  // 動画再生機能
  const playVideo = (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('動画詳細ページに移動:', postId);
    router.push(`/post/${postId}`);
  };



  // 投稿データを取得
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log('投稿データを取得中...')
        setLoading(true);
        setError(null);

        // フロントエンドAPIルートを使用
        const response = await fetch("/api/posts/", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('APIレスポンス:', response.status, response.ok)

        if (response.ok) {
          const data = await response.json();
          console.log('取得したデータ:', data)

          if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            // ギャラリーAPIの形式でデータを変換
            const convertedPosts = data.items.map((item: any) => {
              // IDを投稿IDとして使用
              const postId = typeof item.id === 'string' ? parseInt(item.id) : item.id;
              console.log('ID設定:', item.id, '→', postId);

              return {
                id: postId,
                title: item.title,
                description: item.description,
                category: item.category,
                file_type: item.type,
                author: item.author,
                created_at: item.created_at,
                views: item.views || 0,
                likes: item.likes || 0,
                files: item.files || [],
                covers: item.covers || [],
                tags: item.tags || [],
                thumbnail_url: item.thumbnail_url,
                cover_image_url: item.cover_image_url
              };
            });
            setPosts(convertedPosts);
            console.log('投稿データを設定完了:', convertedPosts.length, '件')
          } else {
            // APIが空の場合は空の配列を設定
            console.log('APIが空のため、データなし')
            setPosts([]);
          }
    } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error('ギャラリーデータの取得に失敗:', error);
        setError('データの取得に失敗しました。');
        // エラー時は空の配列を設定
        setPosts([]);
      } finally {
        setLoading(false);
        console.log('ローディング完了')
      }
    };

    fetchPosts();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'image':
      case 'art': return '🖼️';
      case 'video': return '🎥';
      case 'audio':
      case 'music': return '🎵';
      case 'text':
      case 'writing': return '📜';
      case 'other': return '📄';
      default: return '📄';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'image':
      case 'art': return 'from-blue-500 to-purple-500';
      case 'video': return 'from-red-500 to-pink-500';
      case 'audio':
      case 'music': return 'from-green-500 to-teal-500';
      case 'text':
      case 'writing': return 'from-yellow-500 to-orange-500';
      case 'other': return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  // カテゴリー名を英語に変換
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'image':
      case 'art': return 'Images';
      case 'video': return 'Videos';
      case 'audio':
      case 'music': return 'Music';
      case 'text':
      case 'writing': return 'Text';
      case 'other': return 'Other';
      default: return 'Other';
    }
  };

  const categories = [
    { id: 'all', name: 'All', icon: '🎬', count: posts.length },
    { id: 'image', name: 'Images', icon: '🖼️', count: posts.filter(p => p.category === 'image' || p.category === 'art').length },
    { id: 'video', name: 'Videos', icon: '🎥', count: posts.filter(p => p.category === 'video').length },
    { id: 'audio', name: 'Music', icon: '🎵', count: posts.filter(p => p.category === 'audio' || p.category === 'music').length },
    { id: 'text', name: 'Text', icon: '📜', count: posts.filter(p => p.category === 'text' || p.category === 'writing').length },
  ];

  const filteredPosts = posts.filter(post => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'image') return post.category === 'image' || post.category === 'art';
    if (selectedCategory === 'audio') return post.category === 'audio' || post.category === 'music';
    if (selectedCategory === 'text') return post.category === 'text' || post.category === 'writing';
    return post.category === selectedCategory;
  });

  // サムネイル生成関数
  const getThumbnail = (post: Post, height: string = '224px') => {
    // 1. まずAPIから返されたサムネイルURLを優先（blob URLは除外）
    if (post.thumbnail_url && !post.thumbnail_url.startsWith('blob:')) {
      // 画像ファイルの場合はimgタグを使用
      return (
        <div className="w-full relative overflow-hidden bg-gray-800 cursor-pointer group" style={{ height }}>
          <img
            src={post.thumbnail_url}
            alt={post.title}
            className="w-full object-cover transition-all duration-500 group-hover:scale-110"
            style={{ height: '100%' }}
            onError={(e) => {
              // エラーログを出力しない（テストデータのため）
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              // カテゴリーに応じたフォールバックUIを表示
              const category = post.category || 'other';
              const icon = getCategoryIcon(category);
              const color = getCategoryColor(category);
              const name = getCategoryName(category);
              target.parentElement!.innerHTML = `
                <div class="w-full bg-gradient-to-br ${color} flex items-center justify-center relative overflow-hidden cursor-pointer group" style="height: 100%">
                  <div class="text-white text-center">
                    <div class="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">${icon}</div>
                    <div class="text-sm font-medium">${name}</div>
                    <div class="text-xs mt-2 opacity-80">${post.title}</div>
                  </div>
                  <div class="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
                    ${icon} ${name}
                  </div>
                </div>
              `;
            }}
            onLoad={() => {
              console.log('サムネイル読み込み成功:', post.thumbnail_url, '投稿ID:', post.id);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
            {getCategoryIcon(post.category)} {getCategoryName(post.category)}
          </div>
        </div>
      );
    }

    // 2. カバー画像URLをチェック（blob URLは除外）
    if (post.cover_image_url && !post.cover_image_url.startsWith('blob:')) {
      return (
        <div className="w-full relative overflow-hidden bg-gray-800 cursor-pointer group" style={{ height }}>
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full object-cover transition-all duration-500 group-hover:scale-110"
            style={{ height: '100%' }}
            onError={(e) => {
              // エラーログを出力しない（テストデータのため）
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              // カテゴリーに応じたフォールバックUIを表示
              const category = post.category || 'other';
              const icon = getCategoryIcon(category);
              const color = getCategoryColor(category);
              const name = getCategoryName(category);
              target.parentElement!.innerHTML = `
                <div class="w-full bg-gradient-to-br ${color} flex items-center justify-center relative overflow-hidden cursor-pointer group" style="height: 100%">
                  <div class="text-white text-center">
                    <div class="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">${icon}</div>
                    <div class="text-sm font-medium">${name}</div>
                    <div class="text-xs mt-2 opacity-80">${post.title}</div>
                  </div>
                  <div class="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
                    ${icon} ${name}
                  </div>
                </div>
              `;
            }}
            onLoad={() => {
              console.log('カバー画像読み込み成功:', post.cover_image_url, '投稿ID:', post.id);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
            🎵 Music
          </div>
        </div>
      );
    }

    // 3. ファイルがある場合はファイルのサムネイルを表示
    if (post.files && post.files.length > 0) {
      const file = post.files[0]; // 最初のファイルを使用

      if (file.file_type.startsWith('image/')) {
        // blob URLまたはnullの場合はフォールバックUIを表示
        if (!file.file_url || file.file_url.startsWith('blob:')) {
          return (
            <div className="w-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center relative overflow-hidden cursor-pointer group" style={{ height }}>
              <div className="text-white text-center">
                <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">🖼️</div>
                <div className="text-sm font-medium">Image</div>
                <div className="text-xs mt-2 opacity-80">{post.title}</div>
              </div>
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
                🖼️ Images
              </div>
            </div>
          );
        }

        return (
          <div className="w-full relative overflow-hidden bg-gray-800 cursor-pointer group" style={{ height }}>
            <img
              src={file.file_url}
              alt={post.title}
              className="w-full object-cover transition-all duration-500 group-hover:scale-110"
              style={{ height: '100%' }}
              onError={(e) => {
                console.error('画像読み込みエラー:', file.file_url, '投稿ID:', post.id);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center relative overflow-hidden cursor-pointer group" style="height: 100%">
                    <div class="text-white text-center">
                      <div class="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">🖼️</div>
                      <div class="text-sm font-medium">Image</div>
                      <div class="text-xs mt-2 opacity-80">${post.title}</div>
                    </div>
                    <div class="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
                      🖼️ Images
                    </div>
                  </div>
                `;
              }}
              onLoad={() => {
                console.log('画像読み込み成功:', file.file_url, '投稿ID:', post.id);
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
              🖼️ Images
            </div>
          </div>
        );
      }

            if (file.file_type.startsWith('video/')) {
        // blob URLまたはnullの場合はフォールバックUIを表示
        if (!file.file_url || file.file_url.startsWith('blob:')) {
          return (
            <div className="w-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center relative overflow-hidden cursor-pointer group" style={{ height }}>
              <div className="text-white text-center">
                <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">🎥</div>
                <div className="text-sm font-medium">Video</div>
                <div className="text-xs mt-2 opacity-80">{post.title}</div>
              </div>
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
                🎥 Videos
              </div>
            </div>
          );
        }

        return (
          <div className="w-full relative overflow-hidden bg-gray-800 group" style={{ height }}>
            <video
              src={file.file_url}
              className="w-full object-cover transition-all duration-500 group-hover:scale-110"
              style={{ height: '100%' }}
              preload="metadata"
              muted
              playsInline
              onError={(e) => {
                // エラーログを出力しない（テストデータのため）
                const target = e.target as HTMLVideoElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center relative overflow-hidden cursor-pointer group" style="height: 100%">
                    <div class="text-white text-center">
                      <div class="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">🎥</div>
                      <div class="text-sm font-medium">Video</div>
                      <div class="text-xs mt-2 opacity-80">${post.title}</div>
                    </div>
                    <div class="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
                      🎥 Videos
                    </div>
                  </div>
                `;
              }}
              onLoadedMetadata={() => {
                console.log('動画読み込み成功:', file.file_url, '投稿ID:', post.id);
              }}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                onClick={(e) => playVideo(post.id, e)}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-medium border border-white/30 hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
              >
                ▶ 再生
              </button>
            </div>
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
              🎥 Videos
            </div>
          </div>
        );
      }

      if (file.file_type.startsWith('audio/')) {
      return (
          <div className="w-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center relative overflow-hidden cursor-pointer group" style={{ height }}>
            <div className="text-white text-center">
              <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">🎵</div>
              <div className="text-sm font-medium">Music</div>
              <div className="text-xs mt-2 opacity-80">
                {file.original_name.replace(/\.[^/.]+$/, '')}
              </div>
              <div className="text-xs mt-1 opacity-60">
                👆 Click for details
              </div>
            </div>
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
              🎵 Music
          </div>
          {/* ホバー時のオーバーレイ */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  🎧 Listen to Music
              </div>
            </div>
          </div>
        </div>
      );
    }
    }

             // 音楽投稿の場合、ジャケット画像を探す
         if (post.category === 'music' || post.file_type === 'music') {
           // まずcovers配列からジャケット画像を探す
           const coverImage = post.covers?.[0];
           if (coverImage && coverImage.file_url) {
             return (
               <div className="w-full relative overflow-hidden bg-gray-800 cursor-pointer group" style={{ height }}>
                 <img
                   src={coverImage.file_url}
                   alt={post.title}
                   className="w-full object-cover transition-all duration-500 group-hover:scale-110"
                   style={{ height: '100%' }}
                   onError={(e) => {
                     // 画像読み込みエラー時のフォールバック
                     const target = e.target as HTMLImageElement;
                     target.style.display = 'none';
                     target.parentElement!.innerHTML = `
                       <div class="w-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center relative overflow-hidden cursor-pointer group" style="height: ${height}">
                         <div class="text-white text-center">
                           <div class="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">🎵</div>
                           <div class="text-sm font-medium">Music</div>
                           <div class="text-xs mt-2 opacity-80">${post.title}</div>
                         </div>
                         <div class="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
                           🎵 Music
                         </div>
                       </div>
                     `;
                   }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
                   🎵 Music
                 </div>
                 {/* 音楽再生ボタン */}
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                   <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                     <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                       🎧 Listen to Music
                     </div>
                   </div>
                 </div>
               </div>
             );
           }

           // フォールバック: files配列から画像ファイルを探す
           const imageFile = post.files?.find(file => file.file_type.startsWith('image/'));
           if (imageFile) {
        return (
          <div className="w-full relative overflow-hidden bg-gray-800 cursor-pointer group" style={{ height }}>
            <img
              src={imageFile.file_url}
              alt={post.title}
              className="w-full object-cover transition-all duration-500 group-hover:scale-110"
              style={{ height: '100%' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
              🎵 Music
            </div>
            {/* 音楽再生ボタン */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/30">
                  🎧 Listen to Music
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    // ファイルがない場合やその他の場合はカテゴリー別のデフォルトサムネイル
    return (
      <div className={`w-full bg-gradient-to-br ${getCategoryColor(post.category)} flex items-center justify-center relative overflow-hidden group`} style={{ height }}>
          <div className="text-white text-center">
          <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">{getCategoryIcon(post.category)}</div>
          <div className="text-sm font-medium">{getCategoryName(post.category)}</div>
          </div>
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-white/20">
          {getCategoryIcon(post.category)} {getCategoryName(post.category)}
        </div>
      </div>
    );
  };

  // ファイルサイズをフォーマット
  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 投稿日時をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <PageWithSidebars showRightSidebar={false}>
      <Header />
      <main className="relative z-20 min-h-screen">
        {/* ヒーローセクション */}
        <div className="relative pt-5 pb-16 overflow-hidden">
          {/* 背景グラデーション */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900"></div>

          {/* 装飾要素 */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>

          <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
            {/* ヘッダー */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative mb-12"
            >
              <GalleryHeader
                title="CREATIVE GALLERY"
                subtitle="DIGITAL ARTWORK"
                showIcon={true}
              />

              {/* サブタイトル */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-gray-300 text-lg font-lora leading-relaxed italic mt-6 text-center max-w-3xl mx-auto"
              >
                Discover amazing creations from talented artists around the world
              </motion.p>
            </motion.div>

            {/* エラーメッセージ */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-4 bg-red-600/20 border border-red-500/50 rounded-xl text-red-300 backdrop-blur-sm"
              >
                <p>{error}</p>
              </motion.div>
            )}

            {/* カテゴリーフィルター */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12"
            >
              <div className="flex flex-wrap justify-center gap-4">
                {categories.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/25'
                        : 'bg-white/10 backdrop-blur-sm text-gray-300 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedCategory === category.id
                        ? 'bg-white/20'
                        : 'bg-black/20'
                    }`}>
                      {category.count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="relative px-4 sm:px-6 lg:px-8 pb-16">
          {/* ローディング状態 */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="animate-pulse"
                >
                  <div className="bg-gray-800/50 rounded-2xl mb-4" style={{ height: '300px' }}></div>
                  <div className="bg-gray-800/50 h-6 rounded-lg mb-3"></div>
                  <div className="bg-gray-800/50 h-4 rounded-lg w-3/4"></div>
                </motion.div>
              ))}
            </div>
          )}

          {/* 作品グリッド */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
            >
              <AnimatePresence>
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={`post-${post.id}-${index}`}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -30, scale: 0.9 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group cursor-pointer bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 border border-white/5 flex flex-col min-h-[500px]"
                    onClick={() => {
                      console.log('カードクリック - 投稿ID:', post.id, 'タイプ:', typeof post.id, 'タイトル:', post.title);
                      if (post.files && post.files.length > 0 && post.files[0].file_type.startsWith('audio/')) {
                        console.log('音楽カードクリック - 詳細ページに遷移:', post.id, post.title);
                        router.push(`/post/${post.id}`);
                      } else {
                        console.log('投稿カードクリック - 詳細ページに遷移:', post.id, post.title);
                        router.push(`/post/${post.id}`);
                      }
                    }}
                  >
                    {/* サムネイル */}
                    {getThumbnail(post, '300px')}

                    {/* コンテンツ */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-bold text-white text-xl mb-3 line-clamp-2 group-hover:text-purple-300 transition-colors duration-300 min-h-[3rem]">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[3.5rem] leading-relaxed">
                        {post.description}
                      </p>

                      {/* ファイル情報 */}
                      <div className="mb-4 min-h-[2.5rem]">
                        {post.files && post.files.length > 0 ? (
                          <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <div className="flex items-center justify-between text-xs text-gray-300">
                              <span>📁 {post.files.length} files</span>
                              {post.files[0].file_size && (
                                <span>{formatFileSize(post.files[0].file_size)}</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>📁 No files</span>
                              <span>-</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* タグ */}
                      <div className="mb-4 min-h-[2rem]">
                        {post.tags && post.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/20 backdrop-blur-sm"
                              >
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="text-gray-500 text-xs">
                                +{post.tags.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-gray-500 text-xs opacity-50">
                              No tags
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm font-medium">
                            {post.author?.username || 'Unknown'}
                          </span>
                          {post.created_at && (
                            <span className="text-gray-600 text-xs">
                              {formatDate(post.created_at)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                          <span className="flex items-center gap-1">
                            <span className="text-purple-400">👁️</span> {post.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-red-400">❤️</span> {post.likes || 0}
                          </span>
                        </div>
                      </div>

                      {/* インタラクションボタン */}
                      <div className="flex items-center justify-between pt-4 gap-3 mt-auto">
                        <button
                          onClick={(e) => toggleLike(post.id, e)}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium backdrop-blur-sm transition-all duration-300 transform hover:scale-105 ${
                            likes[post.id]
                              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/25'
                              : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                          }`}
                        >
                          ❤️ {likes[post.id] ? 'いいね済み' : 'いいね'}
                        </button>
                        <button
                          onClick={(e) => toggleSub(post.id, e)}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium backdrop-blur-sm transition-all duration-300 transform hover:scale-105 ${
                            subs[post.id]
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                              : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                          }`}
                        >
                          🔔 {subs[post.id] ? '登録済み' : '登録'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* 空の状態 */}
          {!loading && filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="text-8xl mb-6">🎬</div>
              <h3 className="text-3xl font-bold text-white mb-4">
                作品が見つかりません
              </h3>
              <p className="text-gray-400 text-lg">
                他のカテゴリーを試してみてください
              </p>
            </motion.div>
          )}

          {/* おすすめセクション */}
          {!loading && posts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-20"
            >
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                🔥 おすすめ作品
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.slice(0, 3).map((post, index) => (
                  <motion.div
                    key={`featured-${post.id}-${index}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden group cursor-pointer hover:from-gray-700/50 hover:to-gray-800/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 border border-white/5 flex flex-col min-h-[450px]"
                  >
                    <div className="relative">
                      {getThumbnail(post, '300px')}
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20">
                        🔥 トレンド
                      </div>
                    </div>
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="font-bold text-white text-xl mb-3 min-h-[3rem]">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[3rem] leading-relaxed">
                        {post.description}
                      </p>

                      {/* タグ */}
                      <div className="mb-4 min-h-[2rem]">
                        {post.tags && post.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {post.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/20 backdrop-blur-sm"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <span className="text-gray-500 text-xs opacity-50">
                              No tags
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm font-medium">
                            {post.author?.username || 'Unknown'}
                          </span>
                          {post.created_at && (
                            <span className="text-gray-600 text-xs">
                              {formatDate(post.created_at)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                          <span className="flex items-center gap-1">
                            <span className="text-purple-400">👁️</span> {post.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-red-400">❤️</span> {post.likes || 0}
                          </span>
                        </div>
                      </div>

                      {/* インタラクションボタン */}
                      <div className="flex items-center justify-between mt-auto pt-4 gap-3">
                        <button
                          onClick={(e) => toggleLike(post.id, e)}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium backdrop-blur-sm transition-all duration-300 transform hover:scale-105 ${
                            likes[post.id]
                              ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/25'
                              : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                          }`}
                        >
                          ❤️ {likes[post.id] ? 'いいね済み' : 'いいね'}
                        </button>
                        <button
                          onClick={(e) => toggleSub(post.id, e)}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium backdrop-blur-sm transition-all duration-300 transform hover:scale-105 ${
                            subs[post.id]
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25'
                              : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                          }`}
                        >
                          🔔 {subs[post.id] ? '登録済み' : '登録'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />


    </PageWithSidebars>
  )
}
