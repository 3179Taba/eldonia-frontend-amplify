"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useI18n } from '../../lib/i18n-provider';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import PageWithSidebars from '../../components/PageWithSidebars';

import { motion } from 'framer-motion';

interface GalleryPost {
  id: number;
  title: string;
  description: string;
  category: string;
  author: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  views: number;
  likes: number;
  comments: number;
  files: Array<{
    url: string;
    thumbnail_url: string;
    file_type: string;
    is_primary: boolean;
  }>;
  covers: Array<{
    url: string;
    thumbnail_url: string;
    is_cover: boolean;
  }>;
  tags: string[];
  thumbnail_url: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  comments_list: Array<{
    id: number;
    content: string;
    author: {
      id: number;
      username: string;
    };
    likes_count: number;
    created_at: string;
  }>;
}

export default function GalleryPostDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<GalleryPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const postId = params.id;
        const response = await fetch(`/api/gallery/${postId}/`);

        if (response.ok) {
          const data = await response.json();
          setPost(data);
        } else {
          throw new Error('投稿が見つかりません');
        }
      } catch (error) {
        console.error('投稿データの取得に失敗:', error);
        setError('投稿データの取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  const getCategoryName = (category: string) => {
    const categories = {
      art: 'アート',
      music: '音楽',
      video: '動画',
      photo: '写真',
      writing: '文章',
      other: 'その他'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'art': return '🖼️';
      case 'music': return '🎵';
      case 'video': return '🎥';
      case 'photo': return '📸';
      case 'writing': return '📝';
      default: return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.startsWith('text/')) return '📝';
    return '📄';
  };

  if (loading) {
    return (
      <PageWithSidebars>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
            <div className="text-white text-lg">投稿情報を読み込み中...</div>
          </div>
        </div>
      </PageWithSidebars>
    );
  }

  if (error || !post) {
    return (
      <PageWithSidebars>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-lg mb-4">投稿が見つかりません</div>
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
              {/* メディア表示 */}
              <div className="space-y-4">
                {post.files.length > 0 ? (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {post.files[selectedFile].file_type.startsWith('image/') ? (
                      <img
                        src={post.files[selectedFile].url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : post.files[selectedFile].file_type.startsWith('video/') ? (
                      <video
                        src={post.files[selectedFile].url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : post.files[selectedFile].file_type.startsWith('audio/') ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                        <audio
                          src={post.files[selectedFile].url}
                          controls
                          className="w-full max-w-md"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-4xl">{getFileTypeIcon(post.files[selectedFile].file_type)}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-4xl text-gray-400">📄</span>
                  </div>
                )}

                {/* ファイル一覧 */}
                {post.files.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {post.files.map((file, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedFile(index)}
                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                          selectedFile === index ? 'border-purple-500' : 'border-transparent'
                        }`}
                      >
                        {file.file_type.startsWith('image/') ? (
                          <img
                            src={file.thumbnail_url || file.url}
                            alt={`${post.title} - ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">{getFileTypeIcon(file.file_type)}</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 投稿情報 */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl">{getCategoryIcon(post.category)}</span>
                    <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                      {getCategoryName(post.category)}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {post.description}
                  </p>
                </div>

                {/* 統計情報 */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{post.views}</div>
                    <div className="text-sm text-gray-500">閲覧数</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{post.likes}</div>
                    <div className="text-sm text-gray-500">いいね数</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{post.comments}</div>
                    <div className="text-sm text-gray-500">コメント数</div>
                  </div>
                </div>

                {/* 作者情報 */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">作者</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {post.author.username.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {post.author.first_name} {post.author.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{post.author.username}
                      </div>
                    </div>
                  </div>
                </div>

                {/* タグ */}
                {post.tags.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">タグ</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 投稿日時 */}
                <div className="border-t pt-6">
                  <div className="text-sm text-gray-500">
                    投稿日: {formatDate(post.created_at)}
                  </div>
                  {post.updated_at !== post.created_at && (
                    <div className="text-sm text-gray-500">
                      更新日: {formatDate(post.updated_at)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* コメント */}
            {post.comments_list.length > 0 && (
              <div className="border-t p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">コメント</h3>
                <div className="space-y-4">
                  {post.comments_list.map((comment) => (
                    <div key={comment.id} className="border-b pb-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {comment.author.username.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {comment.author.username}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </div>
                      </div>
                      <p className="text-gray-600">{comment.content}</p>
                      {comment.likes_count > 0 && (
                        <div className="text-sm text-gray-500 mt-2">
                          ❤️ {comment.likes_count}
                        </div>
                      )}
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
