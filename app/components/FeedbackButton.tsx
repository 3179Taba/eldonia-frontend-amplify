'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';

// APIベースURLを設定
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FeedbackData {
  title: string;
  content: string;
  feedback_type: 'bug' | 'feature' | 'ui_ux' | 'performance' | 'other';
  user_email?: string;
  error_message?: string;
  page_url?: string;
}

interface FeedbackButtonProps {
  className?: string;
  errorMessage?: string;
}

export default function FeedbackButton({ className = '', errorMessage }: FeedbackButtonProps) {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    title: '',
    content: '',
    feedback_type: 'other',
    user_email: '',
    error_message: errorMessage || '',
    page_url: typeof window !== 'undefined' ? window.location.href : '',
  });

  // エラーメッセージが変更された場合の処理
  useEffect(() => {
    if (errorMessage) {
      setFeedbackData(prev => ({
        ...prev,
        error_message: errorMessage,
        feedback_type: 'bug',
        title: errorMessage.length > 50 ? errorMessage.substring(0, 50) + '...' : errorMessage
      }));
    }
  }, [errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/api/feedback/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSuccess(true);
      setFeedbackData({
        title: '',
        content: '',
        feedback_type: 'other',
        user_email: '',
        error_message: '',
        page_url: typeof window !== 'undefined' ? window.location.href : '',
      });

      // 3秒後にモーダルを閉じる
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'フィードバックの送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FeedbackData, value: string) => {
    setFeedbackData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <>
      {/* フィードバックボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all duration-200 z-50 ${className}`}
        title="フィードバックを送信"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      {/* モーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  フィードバックを送信
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  フィードバックを送信しました。ありがとうございます！
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* フィードバック種別 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    種別
                  </label>
                  <select
                    value={feedbackData.feedback_type}
                    onChange={(e) => handleInputChange('feedback_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="bug">バグ報告</option>
                    <option value="feature">機能要望</option>
                    <option value="ui_ux">UI/UX改善</option>
                    <option value="performance">パフォーマンス</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                {/* タイトル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    タイトル *
                  </label>
                  <input
                    type="text"
                    value={feedbackData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="簡潔なタイトルを入力してください"
                    required
                  />
                </div>

                {/* 内容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    内容 *
                  </label>
                  <textarea
                    value={feedbackData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="詳細な内容を入力してください"
                    required
                  />
                </div>

                {/* メールアドレス（任意） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    メールアドレス（任意）
                  </label>
                  <input
                    type="email"
                    value={feedbackData.user_email}
                    onChange={(e) => handleInputChange('user_email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="連絡先として使用（任意）"
                  />
                </div>

                {/* エラーメッセージ（自動設定） */}
                {feedbackData.error_message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      エラーメッセージ
                    </label>
                    <textarea
                      value={feedbackData.error_message}
                      onChange={(e) => handleInputChange('error_message', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white bg-gray-50 dark:bg-gray-600"
                      placeholder="エラーメッセージ"
                      readOnly
                    />
                  </div>
                )}

                {/* ボタン */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '送信中...' : '送信'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 