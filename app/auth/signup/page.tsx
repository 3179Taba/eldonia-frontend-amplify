'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useAuth } from '@/app/lib/auth-context';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');
  const referralCode = searchParams.get('referral');
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [referralCodeInput, setReferralCodeInput] = useState(referralCode || '');

  // デバッグ情報
  useEffect(() => {
    console.log('SignupPage mounted');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('authLoading:', authLoading);
    console.log('plan:', plan);
    console.log('referralCode:', referralCode);
  }, [isAuthenticated, authLoading, plan, referralCode]);

  // 既にログインしている場合はリダイレクト
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('User is authenticated, redirecting to home');
      router.replace('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // 紹介コード機能が利用可能かチェック
  const isReferralEnabled = () => {
    if (!plan) return false;
    const planLevel = plan.toLowerCase();
    return planLevel === 'standard' || planLevel === 'premium' || planLevel === 'business';
  };

  const handleSignup = async () => {
    console.log('handleSignup called');
    if (!isSupabaseConfigured()) {
      // Supabaseが設定されていない場合はデモモードで処理
      console.log('Supabase not configured, using demo mode');
      handleDemoSignup();
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            plan: plan || 'free',
            referral_code: isReferralEnabled() ? referralCodeInput : null
          }
        }
      });
      setLoading(false);

      if (error) {
        setError(error.message);
      } else if (data.user) {
        console.log('Signup successful:', data.user.email);
        setSuccess('確認メールを送信しました。メールをご確認ください。');
        // 認証コンテキストが自動的に状態を更新するので、ここでは何もしない
      }
    } catch {
      setLoading(false);
      setError('サインアップに失敗しました。Supabaseの設定を確認してください。');
    }
  };

  const handleGitHubSignup = async () => {
    console.log('handleGitHubSignup called');
    if (!isSupabaseConfigured()) {
      setError('Supabaseが設定されていません。GitHub認証は利用できません。');
      return;
    }

    setError(null);
    setSuccess(null);
    setGithubLoading(true);

    try {
      const redirectUrl = plan
        ? `${window.location.origin}/auth/callback?plan=${encodeURIComponent(plan)}${isReferralEnabled() && referralCodeInput ? `&referral=${encodeURIComponent(referralCodeInput)}` : ''}`
        : `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        setError(error.message);
        setGithubLoading(false);
      }
      // 成功時はリダイレクトされるので、ここでは何もしない
    } catch {
      setGithubLoading(false);
      setError('GitHubサインアップに失敗しました。');
    }
  };

  const handleDemoSignup = () => {
    console.log('handleDemoSignup called');
    // デモ用の一時的なサインアップ
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('デモアカウントが作成されました！');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    }, 1000);
  };

  const getPlanInfo = () => {
    switch (plan) {
      case 'Free':
        return { name: '一般プラン', description: '無料プランで登録します' };
      case 'Standard':
        return { name: 'スタンダードプラン', description: '¥800/月のスタンダードプランで登録します' };
      case 'Premium':
        return { name: 'プレミアムプラン', description: '¥1,500/月のプレミアムプランで登録します' };
      case 'Business':
        return { name: 'ビジネスプラン', description: '¥10,000/月のビジネスプランで登録します' };
      default:
        return null;
    }
  };

  const planInfo = getPlanInfo();

  // 認証状態の読み込み中は何も表示しない
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-white text-center">新規登録</h1>

        {planInfo && (
          <div className="w-full mb-4 p-4 bg-blue-100 border border-blue-400 rounded">
            <p className="text-blue-800 text-sm font-semibold mb-1">
              {planInfo.name}
            </p>
            <p className="text-blue-700 text-xs">
              {planInfo.description}
            </p>
          </div>
        )}

        {!isSupabaseConfigured() && (
          <div className="w-full mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
            <p className="text-yellow-800 text-sm mb-2">
              ⚠️ Supabaseプロジェクトが設定されていません
            </p>
            <p className="text-yellow-700 text-xs">
              現在はデモモードで動作しています。実際のSupabaseプロジェクトを作成し、.env.localファイルに環境変数を設定してください。
            </p>
          </div>
        )}

        <div className="w-full space-y-4">
          {/* GitHubサインアップボタン */}
          <button
            disabled={githubLoading || !isSupabaseConfigured()}
            onClick={handleGitHubSignup}
            className="w-full bg-gray-800 text-white py-3 rounded disabled:opacity-50 hover:bg-gray-700 transition-colors border border-gray-600 flex items-center justify-center space-x-2"
          >
            {githubLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
              </svg>
            )}
            <span>{githubLoading ? '処理中...' : 'GitHubで登録'}</span>
          </button>

          {/* 区切り線 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">または</span>
            </div>
          </div>

          <input
            className="w-full p-3 border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* パスワード入力フィールド（目のアイコン付き） */}
          <div className="relative">
            <input
              className="w-full p-3 pr-12 border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400"
              type={showPassword ? "text" : "password"}
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* 紹介コード入力欄（スタンダードプラン以上で紹介コードがある場合のみ表示） */}
          {isReferralEnabled() && (referralCode || referralCodeInput) && (
            <div className="space-y-2">
              <input
                className="w-full p-3 border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400"
                type="text"
                placeholder="紹介コード（任意）"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value)}
              />
              {referralCode && (
                <div className="p-2 bg-green-100 border border-green-400 rounded text-green-800 text-xs">
                  QRコードから紹介コードを読み取りました: {referralCode}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            disabled={loading}
            onClick={handleSignup}
            className="w-full bg-green-600 text-white py-3 rounded disabled:opacity-50 hover:bg-green-700 transition-colors"
          >
            {loading ? '処理中...' : '新規登録'}
          </button>

          <p className="text-center text-sm text-gray-300">
            すでにアカウントをお持ちですか？{' '}
            <span
              className="text-blue-400 cursor-pointer underline hover:text-blue-300"
              onClick={() => router.push('/auth/login')}
            >
              ログイン
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
