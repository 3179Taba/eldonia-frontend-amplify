'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  FileText,
  Image,
  Video,
  Music,
  Code,
  BookOpen,
  Plus,
  X,
  Tag
} from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import Logo from '../../../components/Logo';

interface Post {
  id: number;
  title: string;
  description: string;
  category: string;
  visibility: 'public' | 'private' | 'draft' | 'published';
  tags: string[];
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
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { token, isAuthenticated } = useAuth();
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    const fetchPost = async () => {
      if (!token || !postId) return;
      
      try {
        setLoading(true);
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
        setPost(data);
        
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
        if ((data.category === 'image' || data.category === 'art' || data.category === 'photo') && data.files && data.files.length > 0) {
          const imageFile = data.files.find(file => file.file_type.startsWith('image/'));
          if (imageFile) {
            setImagePreview(imageFile.file_url);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '投稿の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [token, postId]);

  // 投稿を更新
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !post) return;

    try {
      setSaving(true);
      
      // FormDataを使用してファイルとデータを送信
      const formData = new FormData();
      formData.append('title', post.title);
      formData.append('description', post.description);
      formData.append('category', post.category);
      formData.append('visibility', post.visibility);
      formData.append('tags', JSON.stringify(post.tags));
      
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
      
      // 音楽ファイルを追加
      if (audioFile) {
        formData.append('audio_file', audioFile);
      }
      
      // 画像ファイルを追加
      if (imageFile) {
        formData.append('image_file', imageFile);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/${postId}/update/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('投稿の更新に失敗しました');
      }

      alert('投稿を更新しました');
      router.push('/settings/posts');
    } catch (err) {
      setError(err instanceof Error ? err.message : '投稿の更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // タグを追加
  const addTag = () => {
    if (tagInput.trim() && post && !post.tags.includes(tagInput.trim())) {
      setPost(prev => prev ? { ...prev, tags: [...prev.tags, tagInput.trim()] } : null);
      setTagInput('');
    }
  };

  // タグを削除
  const removeTag = (tagToRemove: string) => {
    if (post) {
      setPost({ ...post, tags: post.tags.filter(tag => tag !== tagToRemove) });
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">ログインが必要です</h1>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ログインする
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">投稿が見つかりません</h1>
          <button
            onClick={() => router.push('/settings/posts')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            投稿一覧に戻る
          </button>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/settings/posts')}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">投稿を編集</h1>
            <p className="text-white/70">投稿の内容を編集できます</p>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500/50 rounded-xl text-red-300 backdrop-blur-sm">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本情報 */}
          <div className="glass-effect rounded-lg p-6 cosmic-border">
            <h2 className="text-xl font-semibold text-white mb-6">基本情報</h2>
            
            <div className="space-y-6">
              {/* タイトル */}
              <div>
                <label className="block text-white/80 font-medium mb-2">タイトル</label>
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  placeholder="投稿のタイトルを入力"
                  required
                />
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-white/80 font-medium mb-2">説明</label>
                <textarea
                  value={post.description}
                  onChange={(e) => setPost({ ...post, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 resize-none"
                  placeholder="投稿の説明を入力"
                />
              </div>

              {/* カテゴリー */}
              <div>
                <label className="block text-white/80 font-medium mb-2">カテゴリー</label>
                <div className="flex items-center gap-3 p-3 bg-white/10 border border-white/20 rounded-lg">
                  {getCategoryIcon(post.category)}
                  <span className="text-white">{getCategoryName(post.category)}</span>
                </div>
                <p className="text-white/60 text-sm mt-2">カテゴリーは変更できません</p>
              </div>

              {/* サムネイル画像 */}
              <div>
                <label className="block text-white/80 font-medium mb-2">
                  サムネイル画像
                  {post.category === 'writing' && (
                    <span className="text-yellow-400 text-sm ml-2">※ Galleryページのカード表示に必要</span>
                  )}
                </label>
                <div className="space-y-4">
                  {/* デバッグ情報 */}
                  <div className="text-xs text-white/50 bg-black/20 p-2 rounded">
                    <p>coverPreview: {coverPreview ? 'あり' : 'なし'}</p>
                    <p>coverImage: {coverImage ? 'あり' : 'なし'}</p>
                    <p>post.covers: {post.covers?.length || 0}件</p>
                  </div>
                  
                  {/* 現在のサムネイル表示 */}
                  {coverPreview && (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="現在のサムネイル"
                        className="w-full max-w-xs h-48 object-cover rounded-lg border border-white/20"
                      />
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        現在のサムネイル
                      </div>
                    </div>
                  )}
                  
                  {/* 新しいサムネイルアップロード */}
                  {post.category === 'writing' && !coverPreview && !coverImage && (
                    <div className="bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
                      <p className="text-yellow-300 text-sm">
                        💡 <strong>テキスト投稿にはサムネイル画像をアップロードすることをお勧めします</strong><br/>
                        Galleryページで美しいカード表示になります
                      </p>
                    </div>
                  )}
                  
                  {coverImage ? (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(coverImage)}
                        alt="新しいサムネイル"
                        className="w-full max-w-xs h-48 object-cover rounded-lg border border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage(null);
                          setCoverPreview(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute top-2 left-2 bg-blue-600/80 text-white text-xs px-2 py-1 rounded">
                        新しいサムネイル
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>

              {/* 動画ファイルアップロード */}
              {post.category === 'video' && (
                <div>
                  <label className="block text-white/80 font-medium mb-2">動画ファイル</label>
                  <div className="space-y-4">
                    {/* 現在の動画ファイル表示 */}
                    {videoPreview && (
                      <div className="relative">
                        <video
                          src={videoPreview}
                          controls
                          className="w-full max-w-xs h-48 object-cover rounded-lg border border-white/20"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          現在の動画ファイル
                        </div>
                      </div>
                    )}
                    
                    {/* 新しい動画ファイルアップロード */}
                    {videoFile ? (
                      <div className="relative">
                        <video
                          src={URL.createObjectURL(videoFile)}
                          controls
                          className="w-full max-w-xs h-48 object-cover rounded-lg border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setVideoFile(null);
                            setVideoPreview(null);
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute top-2 left-2 bg-blue-600/80 text-white text-xs px-2 py-1 rounded">
                          新しい動画ファイル
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
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
                          className="cursor-pointer block"
                        >
                          <div className="text-white/60 mb-2">
                            <Video className="h-12 w-12 mx-auto mb-2" />
                            <p>動画ファイルをアップロード</p>
                            <p className="text-sm text-white/40">MP4, WebM, Ogg (最大10MB)</p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* 音楽ファイルアップロード */}
              {(post.category === 'music' || post.category === 'audio') && (
                <div>
                  <label className="block text-white/80 font-medium mb-2">音楽ファイル</label>
                  <div className="space-y-4">
                    {/* 現在の音楽ファイル表示 */}
                    {audioPreview && (
                      <div className="relative">
                        <audio
                          src={audioPreview}
                          controls
                          className="w-full max-w-xs rounded-lg border border-white/20"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          現在の音楽ファイル
                        </div>
                      </div>
                    )}
                    
                    {/* 新しい音楽ファイルアップロード */}
                    {audioFile ? (
                      <div className="relative">
                        <audio
                          src={URL.createObjectURL(audioFile)}
                          controls
                          className="w-full max-w-xs rounded-lg border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setAudioFile(null);
                            setAudioPreview(null);
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute top-2 left-2 bg-blue-600/80 text-white text-xs px-2 py-1 rounded">
                          新しい音楽ファイル
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
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
                          className="cursor-pointer block"
                        >
                          <div className="text-white/60 mb-2">
                            <Music className="h-12 w-12 mx-auto mb-2" />
                            <p>音楽ファイルをアップロード</p>
                            <p className="text-sm text-white/40">MP3, WAV, OGG (最大10MB)</p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* 画像ファイルアップロード */}
              {(post.category === 'image' || post.category === 'art' || post.category === 'photo') && (
                <div>
                  <label className="block text-white/80 font-medium mb-2">画像ファイル</label>
                  <div className="space-y-4">
                    {/* 現在の画像ファイル表示 */}
                    {imagePreview && (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="現在の画像"
                          className="w-full max-w-xs h-48 object-cover rounded-lg border border-white/20"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          現在の画像ファイル
                        </div>
                      </div>
                    )}
                    
                    {/* 新しい画像ファイルアップロード */}
                    {imageFile ? (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(imageFile)}
                          alt="新しい画像"
                          className="w-full max-w-xs h-48 object-cover rounded-lg border border-white/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute top-2 left-2 bg-blue-600/80 text-white text-xs px-2 py-1 rounded">
                          新しい画像ファイル
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
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
                          className="cursor-pointer block"
                        >
                          <div className="text-white/60 mb-2">
                            <Image className="h-12 w-12 mx-auto mb-2" />
                            <p>画像ファイルをアップロード</p>
                            <p className="text-sm text-white/40">JPG, PNG, GIF (最大5MB)</p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* タグ */}
          <div className="glass-effect rounded-lg p-6 cosmic-border">
            <h2 className="text-xl font-semibold text-white mb-6">タグ</h2>
            
            <div className="space-y-4">
              {/* タグ入力 */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                  placeholder="タグを入力してEnter"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* 選択されたタグ */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600/30 border border-blue-400/50 text-white rounded-full text-sm"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-blue-300 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 公開設定 */}
          <div className="glass-effect rounded-lg p-6 cosmic-border">
            <h2 className="text-xl font-semibold text-white mb-6">公開設定</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 font-medium mb-2">投稿の状態</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={post.visibility === 'public' || post.visibility === 'published'}
                      onChange={(e) => setPost({ ...post, visibility: e.target.value as 'public' | 'private' | 'draft' | 'published' })}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-white">公開</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={post.visibility === 'private'}
                      onChange={(e) => setPost({ ...post, visibility: e.target.value as 'public' | 'private' | 'draft' | 'published' })}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-white">非公開</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="draft"
                      checked={post.visibility === 'draft'}
                      onChange={(e) => setPost({ ...post, visibility: e.target.value as 'public' | 'private' | 'draft' | 'published' })}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-white">下書き</span>
                  </label>
                </div>
              </div>
              
              <div className="text-sm text-white/60">
                {post.visibility === 'public' || post.visibility === 'published' ? (
                  <p>投稿は公開され、他のユーザーが閲覧できるようになります。</p>
                ) : post.visibility === 'private' ? (
                  <p>投稿は非公開になり、他のユーザーには表示されません。</p>
                ) : (
                  <p>下書きとして保存され、後で編集・公開できます。</p>
                )}
              </div>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/settings/posts')}
              className="px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  保存
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 