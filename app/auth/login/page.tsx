'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') ?? '/';
  const { isAuthenticated, loading: authLoading, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // デバッグ情報
  useEffect(() => {
    console.log('LoginPage mounted');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('authLoading:', authLoading);
    console.log('redirectPath:', redirectPath);
  }, [isAuthenticated, authLoading, redirectPath]);

  // 既にログインしている場合はリダイレクト
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      console.log('User is authenticated, redirecting to:', redirectPath);
      router.replace(redirectPath);
    }
  }, [isAuthenticated, authLoading, router, redirectPath]);

  const handleLogin = async () => {
    console.log('handleLogin called');
    setError(null);
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();
      setLoading(false);
      
      if (response.ok) {
        console.log('Login successful:', data.user);
        // 認証コンテキストにユーザー情報とトークンを保存
        login(data.user, data.token);
        router.replace(redirectPath);
      } else {
        setError(data.error || 'ログインに失敗しました。');
      }
    } catch (err) {
      setLoading(false);
      setError('ログインに失敗しました。サーバーに接続できません。');
      console.error('Login error:', err);
    }
  };

  const handleDemoLogin = () => {
    console.log('handleDemoLogin called');
    // デモ用の一時的なログイン
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace(redirectPath);
    }, 1000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-effect rounded-lg p-8 cosmic-border">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ログイン</h1>
            <p className="text-white/70">アカウントにログインしてください</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-white/80 font-medium mb-2">
                ユーザー名
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="ユーザー名を入力"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-white/80 font-medium mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
                  placeholder="パスワードを入力"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ログイン中...
                </div>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={handleDemoLogin}
              className="text-white/60 hover:text-white/80 text-sm"
            >
              デモモードでログイン
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-white/60 text-sm">
              アカウントをお持ちでない方は{' '}
              <button
                onClick={() => router.push('/auth/signup')}
                className="text-purple-400 hover:text-purple-300 underline"
              >
                新規登録
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 