'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import FeedbackButton from './FeedbackButton';

// APIベースURLを設定（環境変数がない場合はデフォルト値を使用）
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AITestPanelProps {
  className?: string;
}

interface TranslationRequest {
  text: string;
  from_lang: string;
  to_lang: string;
  context?: string;
}

export default function AITestPanel({ className = '' }: AITestPanelProps) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('translation');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 翻訳フォーム
  const [translationForm, setTranslationForm] = useState<TranslationRequest>({
    text: 'こんにちは、世界',
    from_lang: 'ja',
    to_lang: 'en',
    context: ''
  });
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  
  // テキスト生成フォーム
  const [textForm, setTextForm] = useState({
    prompt: '魔法の森の冒険',
    content_type: 'story',
    max_tokens: 200,
    temperature: 0.7
  });
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  
  // 画像生成フォーム
  const [imageForm, setImageForm] = useState({
    prompt: '魔法の森の風景',
    style: 'fantasy',
    size: '1024x1024',
    quality: 'standard'
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const translateText = async () => {
    if (!token) {
      setError('ログインが必要です');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/services/translation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(translationForm),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setTranslatedText(data.translated_text);
        setSuccess('翻訳が正常に完了しました！');
      } else {
        setError(data.error || '翻訳に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '翻訳中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const generateText = async () => {
    if (!token) {
      setError('ログインが必要です');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/services/text_generation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(textForm),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setGeneratedText(data.generated_text);
        setSuccess('テキストが正常に生成されました！');
      } else {
        setError(data.error || 'テキスト生成に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'テキスト生成中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    if (!token) {
      setError('ログインが必要です');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/services/image_generation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(imageForm),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setGeneratedImage(data.image_url);
        setSuccess('画像が正常に生成されました！');
      } else {
        setError(data.error || '画像生成に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '画像生成中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          AI機能をテストするにはログインが必要です
        </p>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        🤖 AI機能テストパネル
      </h2>

      {/* タブナビゲーション */}
      <div className="mb-6">
        <nav className="flex space-x-4">
          {[
            { id: 'translation', name: '翻訳', icon: '🌐' },
            { id: 'text-generation', name: 'テキスト生成', icon: '✍️' },
            { id: 'image-generation', name: '画像生成', icon: '🎨' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* エラー・成功メッセージ */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* 翻訳テスト */}
      {activeTab === 'translation' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              翻訳するテキスト
            </label>
            <textarea
              value={translationForm.text}
              onChange={(e) => setTranslationForm({...translationForm, text: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                元言語
              </label>
              <select
                value={translationForm.from_lang}
                onChange={(e) => setTranslationForm({...translationForm, from_lang: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ja">日本語</option>
                <option value="en">英語</option>
                <option value="zh">中国語</option>
                <option value="ko">韓国語</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                翻訳先言語
              </label>
              <select
                value={translationForm.to_lang}
                onChange={(e) => setTranslationForm({...translationForm, to_lang: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="en">英語</option>
                <option value="ja">日本語</option>
                <option value="zh">中国語</option>
                <option value="ko">韓国語</option>
              </select>
            </div>
          </div>

          <button
            onClick={translateText}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '翻訳中...' : '翻訳する'}
          </button>

          {translatedText && (
            <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
              <h3 className="font-semibold mb-2">翻訳結果:</h3>
              <p className="text-sm">{translatedText}</p>
            </div>
          )}
        </div>
      )}

      {/* テキスト生成テスト */}
      {activeTab === 'text-generation' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              プロンプト
            </label>
            <textarea
              value={textForm.prompt}
              onChange={(e) => setTextForm({...textForm, prompt: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                コンテンツタイプ
              </label>
              <select
                value={textForm.content_type}
                onChange={(e) => setTextForm({...textForm, content_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="story">物語</option>
                <option value="poem">詩</option>
                <option value="description">描写</option>
                <option value="dialogue">会話</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                最大トークン数
              </label>
              <input
                type="number"
                value={textForm.max_tokens}
                onChange={(e) => setTextForm({...textForm, max_tokens: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                min="50"
                max="500"
              />
            </div>
          </div>

          <button
            onClick={generateText}
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '生成中...' : 'テキストを生成'}
          </button>

          {generatedText && (
            <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
              <h3 className="font-semibold mb-2">生成結果:</h3>
              <div className="whitespace-pre-wrap text-sm">{generatedText}</div>
            </div>
          )}
        </div>
      )}

      {/* 画像生成テスト */}
      {activeTab === 'image-generation' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              プロンプト
            </label>
            <textarea
              value={imageForm.prompt}
              onChange={(e) => setImageForm({...imageForm, prompt: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                スタイル
              </label>
              <select
                value={imageForm.style}
                onChange={(e) => setImageForm({...imageForm, style: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="fantasy">ファンタジー</option>
                <option value="sci-fi">SF</option>
                <option value="anime">アニメ</option>
                <option value="realistic">写実</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                サイズ
              </label>
              <select
                value={imageForm.size}
                onChange={(e) => setImageForm({...imageForm, size: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="512x512">512x512</option>
                <option value="1024x1024">1024x1024</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateImage}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '生成中...' : '画像を生成'}
          </button>

          {generatedImage && (
            <div className="mt-6 p-4 bg-purple-100 border border-purple-400 text-purple-700 rounded-md">
              <h3 className="font-semibold mb-2">生成結果:</h3>
              <img
                src={generatedImage}
                alt="生成された画像"
                className="w-full max-w-md h-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
      )}

      {/* フィードバックボタン（エラーがある場合のみ表示） */}
      {error && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            このエラーについて報告しますか？
          </p>
          <FeedbackButton errorMessage={error} />
        </div>
      )}
    </div>
  );
} 