'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  FileText,
  Image,
  Video,
  Music,
  Code,
  BookOpen,
  Calendar,
  Heart,
  MessageCircle,
  MoreVertical,
  Save,
  Loader2,
  X,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import Logo from '../../components/Logo';

interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  visibility: 'public' | 'private' | 'draft' | 'published';
  created_at: string;
  updated_at: string;
  views?: number;
  likes?: number;
  comments_count?: number;
  files?: Array<{
    id: number;
    file_url: string;
    original_name: string;
    file_type: string;
  }>;
  covers?: Array<{
    id: number;
    file_url: string;
    original_name: string;
    file_type: string;
  }>;
  tags: string[];
}

export default function PostsPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 編集モード用の状態
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 投稿データを取得
  useEffect(() => {
    const fetchPosts = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery/my/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('投稿の取得に失敗しました');
        }

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '投稿の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [token]);

  // 投稿の削除
  const deletePost = async (postId: number) => {
    if (!token) return;

    try {
      setDeleting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('投稿の削除に失敗しました');
      }

      // 投稿一覧から削除
      setPosts(prev => prev.filter(post => post.id !== postId));
      setShowDeleteModal(false);
      setSelectedPost(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿の削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  // 投稿の公開状態を切り替え
  const toggleVisibility = async (postId: number, currentVisibility: string) => {
    if (!token) return;

    const newVisibility = currentVisibility === 'public' ? 'private' : 'public';

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/update/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visibility: newVisibility }),
      });

      if (!response.ok) {
        throw new Error('投稿の更新に失敗しました');
      }

      // 投稿一覧を更新
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, visibility: newVisibility as 'public' | 'private' | 'draft' | 'published' }
          : post
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿の更新に失敗しました');
    }
  };

  // 編集モードを開始
  const startEditing = async (postId: number) => {
    if (!token) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('投稿の取得に失敗しました');
      }

      const data = await response.json();
      setEditingPost(data);

      // 既存のサムネイル画像のプレビューを設定
      if (data.covers && data.covers.length > 0) {
        setCoverPreview(data.covers[0].file_url);
      }

      // 既存の動画ファイルのプレビューを設定
      if (data.category === 'video' && data.files && data.files.length > 0) {
        const videoFile = data.files.find(file => file.file_type.startsWith('video/'));
        if (videoFile) {
          setVideoPreview(videoFile.file_url);
        }
      }

      // 既存の音楽ファイルのプレビューを設定
      if ((data.category === 'music' || data.category === 'audio') && data.files && data.files.length > 0) {
        const audioFile = data.files.find(file => file.file_type.startsWith('audio/'));
        if (audioFile) {
          setAudioPreview(audioFile.file_url);
        }
      }

      // 既存の画像ファイルのプレビューを設定
      if (data.category === 'image' && data.files && data.files.length > 0) {
        const imageFile = data.files.find(file => file.file_type.startsWith('image/'));
        if (imageFile) {
          setImagePreview(imageFile.file_url);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿の取得に失敗しました');
    }
  };

  // 編集をキャンセル
  const cancelEditing = () => {
    setEditingPost(null);
    setCoverImage(null);
    setCoverPreview(null);
    setVideoFile(null);
    setVideoPreview(null);
    setAudioFile(null);
    setAudioPreview(null);
    setImageFile(null);
    setImagePreview(null);
    setTagInput('');
    setError(null);
  };

  // 投稿を保存
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost || !token) return;

    try {
      setSaving(true);
      setError(null);

      const formData = new FormData();
      formData.append('title', editingPost.title);
      formData.append('description', editingPost.description);
      formData.append('category', editingPost.category);
      formData.append('visibility', editingPost.visibility);
      formData.append('tags', JSON.stringify(editingPost.tags));

      // サムネイル画像を追加
      if (coverImage) {
        console.log('サムネイル画像を追加:', coverImage.name, coverImage.size, coverImage.type);
        formData.append('cover_image', coverImage);
      } else {
        console.log('サムネイル画像が選択されていません');
      }

      // 動画ファイルを追加
      if (videoFile) {
        formData.append('video_file', videoFile);
      }

      // 音声ファイルを追加
      if (audioFile) {
        formData.append('audio_file', audioFile);
      }

      // 画像ファイルを追加
      if (imageFile) {
        formData.append('image_file', imageFile);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${editingPost.id}/update/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('投稿の更新に失敗しました');
      }

      const updatedPost = await response.json();

      // 投稿一覧を更新
      setPosts(prev => prev.map(post =>
        post.id === editingPost.id ? updatedPost : post
      ));

      // 編集モードを終了
      cancelEditing();
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // タグを追加
  const addTag = () => {
    if (tagInput.trim() && editingPost && !editingPost.tags.includes(tagInput.trim())) {
      setEditingPost({
        ...editingPost,
        tags: [...editingPost.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  // タグを削除
  const removeTag = (tagToRemove: string) => {
    if (editingPost) {
      setEditingPost({
        ...editingPost,
        tags: editingPost.tags.filter(tag => tag !== tagToRemove)
      });
    }
  };

  // カテゴリーアイコンを取得
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'image':
      case 'art':
      case 'photo':
        return <Image className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
      case 'music':
        return <Music className="w-4 h-4" />;
      case 'text':
      case 'writing':
        return <FileText className="w-4 h-4" />;
      case 'other':
        return <Code className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // カテゴリー名を取得
  const getCategoryName = (category: string) => {
    switch (category) {
      case 'image':
      case 'art':
      case 'photo':
        return '画像';
      case 'video':
        return '動画';
      case 'audio':
      case 'music':
        return '音楽';
      case 'text':
      case 'writing':
        return 'テキスト';
      case 'other':
        return 'その他';
      default:
        return 'その他';
    }
  };

  // 公開状態の表示名を取得
  const getVisibilityName = (visibility: string) => {
    switch (visibility) {
      case 'public':
      case 'published':
        return '公開';
      case 'private':
        return '非公開';
      case 'draft':
        return '下書き';
      default:
        return '不明';
    }
  };

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">ログインが必要です</h1>
          <Link href="/auth/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ログインする
          </Link>
        </div>
      </div>
    );
  }

  // 編集モードの場合は編集フォームを表示
  if (editingPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* ヘッダー */}
        <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex items-center space-x-4">
                <Logo size="lg" showText={true} />
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={cancelEditing}
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">投稿を編集</h1>
                <p className="text-white/70">投稿の内容を編集できます</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={cancelEditing}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    保存
                  </>
                )}
              </button>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-500/50 rounded-xl text-red-300 backdrop-blur-sm">
              <p>{error}</p>
            </div>
          )}

          {/* 編集フォーム */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 基本情報 */}
            <div className="glass-effect rounded-lg p-6 cosmic-border">
              <h3 className="text-lg font-semibold text-white mb-4">基本情報</h3>

              <div className="space-y-4">
                {/* タイトル */}
                <div>
                  <label className="block text-white/80 font-medium mb-2">タイトル</label>
                  <input
                    type="text"
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({...editingPost, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="投稿のタイトルを入力"
                    required
                  />
                </div>

                {/* 説明 */}
                <div>
                  <label className="block text-white/80 font-medium mb-2">説明</label>
                  <textarea
                    value={editingPost.description}
                    onChange={(e) => setEditingPost({...editingPost, description: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder="投稿の説明を入力"
                  />
                </div>

                {/* カテゴリー */}
                <div>
                  <label className="block text-white/80 font-medium mb-2">カテゴリー</label>
                  <select
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({...editingPost, category: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="writing">テキスト</option>
                    <option value="image">画像</option>
                    <option value="video">動画</option>
                    <option value="music">音楽</option>
                    <option value="manga">漫画</option>
                    <option value="code">コード</option>
                  </select>
                </div>

                {/* 公開設定 */}
                <div>
                  <label className="block text-white/80 font-medium mb-2">公開設定</label>
                  <select
                    value={editingPost.visibility}
                    onChange={(e) => setEditingPost({...editingPost, visibility: e.target.value as any})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">公開</option>
                    <option value="private">非公開</option>
                    <option value="draft">下書き</option>
                  </select>
                </div>

                {/* タグ */}
                <div>
                  <label className="block text-white/80 font-medium mb-2">タグ</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="タグを入力してEnter"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-sm"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* サムネイル画像 */}
            <div className="glass-effect rounded-lg p-6 cosmic-border">
              <label className="block text-white/80 font-medium mb-2">
                サムネイル画像
                {editingPost.category === 'writing' && (
                  <span className="text-yellow-400 text-sm ml-2">※ Galleryページのカード表示に必要</span>
                )}
              </label>

              {editingPost.category === 'writing' && !coverPreview && !coverImage && (
                <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
                  <p className="text-yellow-300 text-sm">
                    💡 <strong>テキスト投稿にはサムネイル画像をアップロードすることをお勧めします</strong><br/>
                    Galleryページで美しいカード表示になります
                  </p>
                </div>
              )}

              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center bg-white/5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('サムネイル画像が選択されました:', file.name, file.size, file.type);
                      setCoverImage(file);
                      setCoverPreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                  id="cover-image-input"
                />
                <label
                  htmlFor="cover-image-input"
                  className="cursor-pointer block hover:bg-white/10 p-4 rounded-lg transition-colors"
                >
                  <div className="text-white/60 mb-2">
                    <Image className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-lg font-medium">サムネイル画像をアップロード</p>
                    <p className="text-sm text-white/40">JPG, PNG, GIF (最大5MB)</p>
                    <p className="text-xs text-white/30 mt-2">クリックしてファイルを選択</p>
                  </div>
                </label>
              </div>

              {coverPreview && (
                <div className="mt-4">
                  <img
                    src={coverPreview}
                    alt="サムネイルプレビュー"
                    className="w-32 h-32 object-cover rounded-lg border border-white/20"
                  />
                </div>
              )}
            </div>

            {/* カテゴリー別ファイルアップロード */}
            {editingPost.category === 'video' && (
              <div className="glass-effect rounded-lg p-6 cosmic-border">
                <label className="block text-white/80 font-medium mb-2">動画ファイル</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center bg-white/5">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setVideoFile(file);
                        setVideoPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                    id="video-file-input"
                  />
                  <label
                    htmlFor="video-file-input"
                    className="cursor-pointer block hover:bg-white/10 p-4 rounded-lg transition-colors"
                  >
                    <div className="text-white/60 mb-2">
                      <Video className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-lg font-medium">動画ファイルをアップロード</p>
                      <p className="text-sm text-white/40">MP4, AVI, MOV (最大100MB)</p>
                    </div>
                  </label>
                </div>
                {videoPreview && (
                  <div className="mt-4">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-w-md rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}

            {(editingPost.category === 'music' || editingPost.category === 'audio') && (
              <div className="glass-effect rounded-lg p-6 cosmic-border">
                <label className="block text-white/80 font-medium mb-2">音声ファイル</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center bg-white/5">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAudioFile(file);
                        setAudioPreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                    id="audio-file-input"
                  />
                  <label
                    htmlFor="audio-file-input"
                    className="cursor-pointer block hover:bg-white/10 p-4 rounded-lg transition-colors"
                  >
                    <div className="text-white/60 mb-2">
                      <Music className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-lg font-medium">音声ファイルをアップロード</p>
                      <p className="text-sm text-white/40">MP3, WAV, OGG (最大50MB)</p>
                    </div>
                  </label>
                </div>
                {audioPreview && (
                  <div className="mt-4">
                    <audio controls className="w-full">
                      <source src={audioPreview} />
                    </audio>
                  </div>
                )}
              </div>
            )}

            {editingPost.category === 'image' && (
              <div className="glass-effect rounded-lg p-6 cosmic-border">
                <label className="block text-white/80 font-medium mb-2">画像ファイル</label>
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center bg-white/5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="hidden"
                    id="image-file-input"
                  />
                  <label
                    htmlFor="image-file-input"
                    className="cursor-pointer block hover:bg-white/10 p-4 rounded-lg transition-colors"
                  >
                    <div className="text-white/60 mb-2">
                      <Image className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-lg font-medium">画像ファイルをアップロード</p>
                      <p className="text-sm text-white/40">JPG, PNG, GIF (最大10MB)</p>
                    </div>
                  </label>
                </div>
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="画像プレビュー"
                      className="w-32 h-32 object-cover rounded-lg border border-white/20"
                    />
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ヘッダー */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Logo size="lg" showText={true} />
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">投稿一覧</h1>
              <p className="text-white/70">あなたの投稿を管理できます</p>
            </div>
          </div>
          <Link
            href="/post/create"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新規投稿を作成
          </Link>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500/50 rounded-xl text-red-300 backdrop-blur-sm">
            <p>{error}</p>
          </div>
        )}

        {/* 投稿一覧 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white/70 mt-4">読み込み中...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-white/50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">投稿がありません</h3>
            <p className="text-white/70 mb-6">最初の投稿を作成してみましょう</p>
            <Link
              href="/post/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新規投稿を作成
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="glass-effect rounded-lg p-6 cosmic-border hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-white/10 rounded-lg">
                        {getCategoryIcon(post.category)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            {getCategoryIcon(post.category)}
                            {getCategoryName(post.category)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(post.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {post.description && (
                      <p className="text-white/70 mb-4 line-clamp-2">{post.description}</p>
                    )}

                    {/* タグ */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 5).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-white/10 text-white/80 rounded-full text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                        {post.tags.length > 5 && (
                          <span className="px-2 py-1 bg-white/10 text-white/60 rounded-full text-xs">
                            +{post.tags.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {/* 統計情報 */}
                    <div className="flex items-center gap-6 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views || 0} 閲覧
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likes || 0} いいね
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {post.comments_count || 0} コメント
                      </span>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex items-center gap-2 ml-4">
                    {/* 公開状態切り替え */}
                    <button
                      onClick={() => toggleVisibility(post.id, post.visibility)}
                      className={`p-2 rounded-lg transition-colors ${
                        post.visibility === 'public' || post.visibility === 'published'
                          ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                          : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                      }`}
                      title={post.visibility === 'public' || post.visibility === 'published' ? '非公開にする' : '公開する'}
                    >
                      {post.visibility === 'public' || post.visibility === 'published' ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>

                    {/* 編集 */}
                    <button
                      onClick={() => startEditing(post.id)}
                      className="p-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors"
                      title="編集"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* 削除 */}
                    <button
                      onClick={() => {
                        setSelectedPost(post);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 公開状態バッジ */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.visibility === 'public' || post.visibility === 'published'
                        ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                        : post.visibility === 'draft'
                        ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {getVisibilityName(post.visibility)}
                    </span>
                  </div>

                  <Link
                    href={`/post/${post.id}`}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    詳細を見る →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 削除確認モーダル */}
      {showDeleteModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">投稿を削除</h3>
            <p className="text-white/70 mb-6">
              「{selectedPost.title}」を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                disabled={deleting}
              >
                キャンセル
              </button>
              <button
                onClick={() => deletePost(selectedPost.id)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={deleting}
              >
                {deleting ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
