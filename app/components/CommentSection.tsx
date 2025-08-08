'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Edit3, Trash2, Reply, Send, X, MoreHorizontal, Smile } from 'lucide-react';
import { apiClient, Comment } from '../lib/api';
import { useAuth } from '../lib/auth-context';

interface CommentSectionProps {
  postId: number;
  onCommentCountChange?: (count: number) => void;
}

export default function CommentSection({ postId, onCommentCountChange }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // リアルタイム更新用のインターバル
  useEffect(() => {
    const interval = setInterval(() => {
      fetchComments();
    }, 3000); // 3秒ごとに更新

    return () => clearInterval(interval);
  }, [postId, fetchComments]);

  // コメント一覧を取得
  const fetchComments = React.useCallback(async () => {
    try {
      const response = await apiClient.getComments(postId);
      if (response.success) {
        setComments(response.comments);
        onCommentCountChange?.(response.total_count);
      }
    } catch (error) {
      console.error('コメントの取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [postId, onCommentCountChange]);

  useEffect(() => {
    fetchComments();
  }, [postId, fetchComments]);

  // コメント投稿・返信時に自動スクロール
  useEffect(() => {
    if (!loading && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [comments, loading]);

  // コメント投稿
  const handleSubmitComment = async (parentId?: number) => {
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    const content = parentId ? editContent : newComment;
    if (!content.trim()) {
      alert('コメント内容を入力してください');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiClient.createComment(postId, content, parentId);
      if (response.success) {
        // 即座にコメント一覧を再取得
        await fetchComments();

        // フォームをリセット
        if (parentId) {
          setEditContent('');
          setReplyingTo(null);
        } else {
          setNewComment('');
          // 入力フィールドにフォーカスを戻す
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      }
    } catch (error) {
      console.error('コメントの投稿に失敗:', error);
      alert('コメントの投稿に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (commentId: number) => {
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    try {
      const response = await apiClient.toggleCommentLike(commentId);
      if (response.success) {
        // 即座にコメント一覧を再取得
        await fetchComments();
      }
    } catch (error) {
      console.error('いいねの切り替えに失敗:', error);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('このコメントを削除しますか？')) return;

    try {
      const response = await apiClient.deleteComment(commentId);
      if (response.success) {
        // 即座にコメント一覧を再取得
        await fetchComments();
      }
    } catch (error) {
      console.error('コメントの削除に失敗:', error);
      alert('コメントの削除に失敗しました');
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) {
      alert('コメント内容を入力してください');
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiClient.updateComment(commentId, editContent);
      if (response.success) {
        // 即座にコメント一覧を再取得
        await fetchComments();
        setEditingComment(null);
        setEditContent('');
      }
    } catch (error) {
      console.error('コメントの更新に失敗:', error);
      alert('コメントの更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '今';
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`;
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  const renderAvatar = (username: string, avatarUrl?: string) => (
    <div className="flex-shrink-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
          {username.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );

  // LINE風のコメントアイテムのレンダリング
  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`mb-3 ${isReply ? 'ml-8' : ''}`}
      tabIndex={0}
      aria-label={`コメント by ${comment.author.username}`}
    >
      <div className="flex items-start gap-3">
        {renderAvatar(comment.author.username, comment.author.avatar)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white text-sm">{comment.author.username}</span>
            <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
            {comment.is_edited && (
              <span className="text-gray-500 text-xs">(編集済み)</span>
            )}
          </div>

          {/* コメント内容 - LINE風の吹き出し */}
          {editingComment === comment.id ? (
            <div className="mb-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-2xl px-4 py-2 resize-none border-2 border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all text-sm"
                rows={2}
                placeholder="コメントを編集..."
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleUpdateComment(comment.id)}
                  disabled={submitting}
                  className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600 disabled:opacity-50"
                >
                  更新
                </button>
                <button
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent('');
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded-full text-xs hover:bg-gray-700"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="bg-blue-500 text-white rounded-2xl px-4 py-2 max-w-xs lg:max-w-md break-words">
                <p className="text-sm leading-relaxed whitespace-pre-line">{comment.content}</p>
              </div>
              {/* 吹き出しの尻尾 */}
              <div className="absolute -left-2 top-3 w-0 h-0 border-t-4 border-t-transparent border-r-4 border-r-blue-500 border-b-4 border-b-transparent"></div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex items-center gap-3 mt-2 ml-2">
            <button
              onClick={() => handleToggleLike(comment.id)}
              className={`flex items-center gap-1 text-xs transition-colors ${comment.is_liked ? 'text-red-400' : 'text-gray-400 hover:text-red-300'}`}
              aria-label={comment.is_liked ? 'いいね解除' : 'いいね'}
            >
              <Heart className={`w-3 h-3 ${comment.is_liked ? 'fill-current' : ''}`} />
              <span>{comment.likes_count}</span>
            </button>
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-300"
              aria-label="返信"
            >
              <Reply className="w-3 h-3" />
              <span>返信</span>
            </button>
            {/* 編集・削除ボタン（自分のコメントのみ） */}
            {user && comment.author.username === user.username && (
              <div className="relative group">
                <button className="text-gray-400 hover:text-gray-300">
                  <MoreHorizontal className="w-3 h-3" />
                </button>
                <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setEditingComment(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="flex items-center gap-2 px-3 py-1 text-xs text-gray-300 hover:bg-gray-700 w-full"
                    >
                      <Edit3 className="w-3 h-3" />
                      編集
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex items-center gap-2 px-3 py-1 text-xs text-red-400 hover:bg-gray-700 w-full"
                    >
                      <Trash2 className="w-3 h-3" />
                      削除
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 返信フォーム */}
          {replyingTo === comment.id && (
            <div className="mt-3 ml-4 p-3 bg-gray-800 rounded-2xl border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">返信先: {comment.author.username}</span>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-gray-500 hover:text-gray-300 ml-auto"
                  aria-label="返信キャンセル"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-2xl px-3 py-2 resize-none mb-2 border-2 border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all text-sm"
                rows={2}
                placeholder="返信を入力..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSubmitComment(comment.id)}
                  disabled={submitting}
                  className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs hover:bg-blue-600 disabled:opacity-50"
                >
                  返信
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setEditContent('');
                  }}
                  className="px-3 py-1 bg-gray-600 text-white rounded-full text-xs hover:bg-gray-700"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          {/* 返信一覧 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-2 animate-pulse">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-12 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* コメント一覧 */}
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">まだコメントがありません</p>
            <p className="text-gray-500 text-xs">最初のコメントを投稿してみましょう！</p>
          </div>
        ) : (
          comments.map((comment, index) => renderComment(comment, false))
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* LINE風の入力フォーム */}
      {user ? (
        <div className="border-t border-gray-700 p-4 bg-gray-900">
          <div className="flex items-end gap-2">
            {renderAvatar(user.username, user.profile?.avatar)}
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-2xl px-4 py-2 resize-none border-2 border-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 transition-all text-sm"
                rows={1}
                placeholder="メッセージを入力..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-12 bottom-2 text-gray-400 hover:text-gray-300"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => handleSubmitComment()}
              disabled={submitting || !newComment.trim()}
              className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-700 p-4 bg-gray-900 text-center">
          <p className="text-gray-400 text-sm">コメントを投稿するにはログインが必要です</p>
        </div>
      )}
    </div>
  );
}
