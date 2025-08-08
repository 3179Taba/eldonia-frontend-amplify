'use client'

import { useEffect } from 'react'
import { useTranslation } from '../lib/useTranslation'
import { useAuth } from '../lib/auth-context'
import APILanguageSelector from './APILanguageSelector'
import TranslatableText from './TranslatableText'
import UserLanguageMatcher from './UserLanguageMatcher'

export default function TranslationExample() {
  const { user, isAuthenticated } = useAuth()
  const { 
    currentLanguage, 
    currentStyle, 
    translations, 
    isLoading, 
    error, 
    translatePage,
    userLanguage,
    syncWithUserLanguage
  } = useTranslation()

  // ページ読み込み時に翻訳を取得
  useEffect(() => {
    translatePage('general')
  }, [translatePage])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4 text-white">API翻訳機能デモ</h1>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-300">
              現在の言語: {currentLanguage} | スタイル: {currentStyle}
            </p>
            {isAuthenticated && (
              <p className="text-sm text-gray-300">
                ユーザー言語設定: {userLanguage || '未設定'}
              </p>
            )}
            {isLoading && <p className="text-sm text-blue-400">翻訳中...</p>}
            {error && <p className="text-sm text-red-400">エラー: {error}</p>}
          </div>
          <APILanguageSelector />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 翻訳キーを使用した例 */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/20">
          <h2 className="text-xl font-semibold mb-4 text-white">翻訳キーを使用</h2>
          
          <TranslatableText 
            fallbackText="サイト名" 
            translationKey="siteName" 
            className="block mb-2 text-gray-200"
          />
          
          <TranslatableText 
            fallbackText="ナビゲーション" 
            translationKey="navigation" 
            className="block mb-2 text-gray-200"
          />
          
          <TranslatableText 
            fallbackText="検索" 
            translationKey="search" 
            className="block mb-2 text-gray-200"
          />
          
          <TranslatableText 
            fallbackText="ログイン" 
            translationKey="login" 
            className="block mb-2 text-gray-200"
          />
        </div>

        {/* 自動翻訳を使用した例 */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/20">
          <h2 className="text-xl font-semibold mb-4 text-white">自動翻訳</h2>
          
          <TranslatableText 
            fallbackText="エルドニアへようこそ！" 
            translationKey="welcomeMessage"
            autoTranslate={true}
            className="block mb-2 text-gray-200"
          />
          
          <TranslatableText 
            fallbackText="ファンタジーとSFの世界を体験してください。" 
            translationKey="fantasyExperience"
            autoTranslate={true}
            className="block mb-2 text-gray-200"
          />
          
          <TranslatableText 
            fallbackText="クリエイターとつながり、素晴らしい作品を共有しましょう。" 
            translationKey="connectCreators"
            autoTranslate={true}
            className="block mb-2 text-gray-200"
          />
        </div>

        {/* ユーザー言語マッチングの例 */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/20">
          <h2 className="text-xl font-semibold mb-4 text-white">ユーザー言語マッチング</h2>
          
          {isAuthenticated ? (
            <>
              <UserLanguageMatcher 
                content="この投稿は日本語で書かれています。"
                contentLanguage="ja"
                autoTranslate={true}
                showLanguageInfo={true}
                className="mb-4"
              />
              
              <UserLanguageMatcher 
                content="This post is written in English."
                contentLanguage="en"
                autoTranslate={true}
                showLanguageInfo={true}
                className="mb-4"
              />
              
              <UserLanguageMatcher 
                content="이 게시물은 한국어로 작성되었습니다."
                contentLanguage="ko"
                autoTranslate={true}
                showLanguageInfo={true}
                className="mb-4"
              />
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-blue-300 mb-4">
                🔐 ログインが必要です
              </div>
              <p className="text-gray-300 text-sm mb-4">
                ユーザー言語マッチング機能を使用するには、アカウントにログインしてください。
              </p>
              <div className="space-y-2 text-xs text-gray-400">
                <p>• プロフィール設定で言語を選択</p>
                <p>• 投稿の言語と異なる場合に自動翻訳</p>
                <p>• 翻訳の切り替えが可能</p>
              </div>
            </div>
          )}
        </div>

        {/* 動的コンテンツの例 */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/20">
          <h2 className="text-xl font-semibold mb-4 text-white">動的コンテンツ</h2>
          
          <TranslatableText 
            fallbackText="このセクションでは、ユーザーが投稿したコンテンツが動的に翻訳されます。" 
            translationKey="dynamicContentSection"
            autoTranslate={true}
            className="mb-4 text-gray-200"
          />
          
          <div className="space-y-2">
            <TranslatableText 
              fallbackText="最新の投稿" 
              translationKey="latestPosts"
              autoTranslate={true}
              className="font-medium text-gray-200"
            />
            <TranslatableText 
              fallbackText="人気の作品" 
              translationKey="popularWorks"
              autoTranslate={true}
              className="font-medium text-gray-200"
            />
            <TranslatableText 
              fallbackText="おすすめコンテンツ" 
              translationKey="recommendedContent"
              autoTranslate={true}
              className="font-medium text-gray-200"
            />
          </div>
        </div>

        {/* 投稿コンテンツの例 */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/20">
          <h2 className="text-xl font-semibold mb-4 text-white">投稿コンテンツ</h2>
          
          {isAuthenticated ? (
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-white mb-2">英語投稿</h3>
                <UserLanguageMatcher 
                  content="Check out my latest artwork! I spent hours creating this digital painting."
                  contentLanguage="en"
                  autoTranslate={true}
                />
              </div>
              
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium text-white mb-2">韓国語投稿</h3>
                <UserLanguageMatcher 
                  content="새로운 음악 작품을 공유합니다. 여러분의 의견을 들려주세요!"
                  contentLanguage="ko"
                  autoTranslate={true}
                />
              </div>
              
              <div className="border-l-4 border-red-500 pl-4">
                <h3 className="font-medium text-white mb-2">中国語投稿</h3>
                <UserLanguageMatcher 
                  content="分享我的最新摄影作品，希望大家喜欢！"
                  contentLanguage="zh"
                  autoTranslate={true}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-blue-300 mb-3">
                📝 投稿コンテンツの自動翻訳
              </div>
              <p className="text-gray-300 text-sm">
                ログインすると、異なる言語で書かれた投稿が自動的に翻訳されます。
              </p>
            </div>
          )}
        </div>

        {/* 翻訳状態の表示 */}
        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/20">
          <h2 className="text-xl font-semibold mb-4 text-white">翻訳状態</h2>
          
          <div className="space-y-2 text-sm text-gray-200">
            <p>言語: <span className="font-medium text-white">{currentLanguage}</span></p>
            <p>スタイル: <span className="font-medium text-white">{currentStyle}</span></p>
            <p>翻訳数: <span className="font-medium text-white">{Object.keys(translations).length}</span></p>
            <p>状態: <span className={`font-medium ${isLoading ? 'text-blue-400' : 'text-green-400'}`}>
              {isLoading ? '翻訳中' : '完了'}
            </span></p>
            {isAuthenticated && (
              <p>ユーザー言語: <span className="font-medium text-white">{userLanguage || '未設定'}</span></p>
            )}
          </div>
          
          {userLanguage && userLanguage !== currentLanguage && isAuthenticated && (
            <button
              onClick={syncWithUserLanguage}
              className="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              ユーザー言語に同期
            </button>
          )}
          
          {!isAuthenticated && (
            <div className="mt-3 text-xs text-gray-400">
              💡 ログインすると、ユーザー言語設定との同期が可能になります
            </div>
          )}
          
          {Object.keys(translations).length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-white">利用可能な翻訳:</h3>
              <div className="bg-black/30 p-3 rounded text-xs max-h-32 overflow-y-auto text-gray-200">
                {Object.entries(translations).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <span className="font-medium text-white">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 使用方法の説明 */}
      <div className="mt-8 bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold mb-4 text-white">使用方法</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2 text-white">1. 翻訳キーを使用</h3>
            <pre className="bg-gray-800/80 text-green-400 p-3 rounded text-sm overflow-x-auto border border-gray-600">
{`<TranslatableText 
  fallbackText="ログイン" 
  translationKey="login" 
/>`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 text-white">2. 自動翻訳を使用</h3>
            <pre className="bg-gray-800/80 text-green-400 p-3 rounded text-sm overflow-x-auto border border-gray-600">
{`<TranslatableText 
  fallbackText="エルドニアへようこそ！" 
  translationKey="welcomeMessage"
  autoTranslate={true}
/>`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 text-white">3. ユーザー言語マッチング</h3>
            <pre className="bg-gray-800/80 text-green-400 p-3 rounded text-sm overflow-x-auto border border-gray-600">
{`<UserLanguageMatcher 
  content="投稿内容"
  contentLanguage="ja"
  autoTranslate={true}
  showLanguageInfo={true}
/>`}
            </pre>
          </div>
          
          <div>
            <h3 className="font-medium mb-2 text-white">4. 言語判定</h3>
            <pre className="bg-gray-800/80 text-green-400 p-3 rounded text-sm overflow-x-auto border border-gray-600">
{`const { shouldTranslate } = useTranslation()
const needsTranslation = shouldTranslate('ja') // 日本語から翻訳が必要か`}
            </pre>
          </div>
        </div>
      </div>

      {/* ユーザー言語設定の説明 */}
      {!isAuthenticated && (
        <div className="mt-6 bg-blue-500/20 border border-blue-500/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">💡 ユーザー言語マッチング機能</h3>
          <p className="text-blue-200 mb-3">
            ログインすると、あなたの言語設定に基づいて投稿内容が自動的に翻訳されます。
          </p>
          <div className="space-y-2 text-sm text-blue-200">
            <p>• プロフィール設定で言語を選択</p>
            <p>• 投稿の言語と異なる場合に自動翻訳</p>
            <p>• 翻訳の切り替えが可能</p>
            <p>• 言語情報の表示</p>
          </div>
        </div>
      )}
    </div>
  )
} 