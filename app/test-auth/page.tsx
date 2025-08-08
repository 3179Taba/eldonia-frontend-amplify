'use client';

import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useAuth } from '@/app/lib/auth-context';

export default function TestAuthPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testResult, setTestResult] = useState<string>('');
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    checkSupabaseStatus();
  }, []);

  const checkSupabaseStatus = async () => {
    console.log('🔍 Supabase設定状況を確認中...');
    
    const configured = isSupabaseConfigured();
    console.log('Supabase設定済み:', configured);
    
    if (configured) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('セッション取得エラー:', error);
          setTestResult(`❌ セッション取得エラー: ${error.message}`);
        } else {
          console.log('現在のセッション:', session);
          setSessionInfo(session);
          setTestResult('✅ Supabase設定正常、セッション取得成功');
        }
      } catch (err) {
        console.error('Supabase接続エラー:', err);
        setTestResult(`❌ Supabase接続エラー: ${err}`);
      }
    } else {
      setTestResult('⚠️ Supabase環境変数が設定されていません');
    }
  };

  const handleTestSignup = async () => {
    if (!email || !password) {
      setTestResult('❌ メールアドレスとパスワードを入力してください');
      return;
    }

    setTestResult('🔄 テストサインアップ中...');
    setDebugInfo('');
    
    try {
      console.log('サインアップ試行:', { email, password: '***' });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      console.log('サインアップ結果:', { data, error });

      if (error) {
        setTestResult(`❌ サインアップエラー: ${error.message}`);
        setDebugInfo(`エラー詳細: ${JSON.stringify(error, null, 2)}`);
      } else {
        if (data.user && !data.session) {
          setTestResult(`✅ サインアップ成功: ${data.user.email} (確認メール送信済み)`);
          setDebugInfo(`ユーザー情報: ${JSON.stringify(data.user, null, 2)}`);
        } else if (data.session) {
          setTestResult(`✅ サインアップ成功: ${data.user?.email} (自動ログイン)`);
          setDebugInfo(`セッション情報: ${JSON.stringify(data.session, null, 2)}`);
        } else {
          setTestResult(`⚠️ サインアップ結果不明: ${JSON.stringify(data, null, 2)}`);
        }
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setTestResult(`❌ サインアップ例外: ${err}`);
      setDebugInfo(`例外詳細: ${JSON.stringify(err, null, 2)}`);
    }
  };

  const handleTestLogin = async () => {
    if (!email || !password) {
      setTestResult('❌ メールアドレスとパスワードを入力してください');
      return;
    }

    setTestResult('🔄 テストログイン中...');
    setDebugInfo('');
    
    try {
      console.log('ログイン試行:', { email, password: '***' });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('ログイン結果:', { data, error });

      if (error) {
        setTestResult(`❌ ログインエラー: ${error.message}`);
        setDebugInfo(`エラー詳細: ${JSON.stringify(error, null, 2)}`);
      } else {
        setTestResult(`✅ ログイン成功: ${data.user?.email}`);
        setDebugInfo(`ユーザー情報: ${JSON.stringify(data.user, null, 2)}`);
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      setTestResult(`❌ ログイン例外: ${err}`);
      setDebugInfo(`例外詳細: ${JSON.stringify(err, null, 2)}`);
    }
  };

  const handleTestLogout = async () => {
    setTestResult('🔄 ログアウト中...');
    setDebugInfo('');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setTestResult(`❌ ログアウトエラー: ${error.message}`);
        setDebugInfo(`エラー詳細: ${JSON.stringify(error, null, 2)}`);
      } else {
        setTestResult('✅ ログアウト成功');
        setDebugInfo('');
      }
    } catch (err) {
      setTestResult(`❌ ログアウト例外: ${err}`);
      setDebugInfo(`例外詳細: ${JSON.stringify(err, null, 2)}`);
    }
  };

  const handleTestSignupWithoutEmail = async () => {
    setTestResult('🔄 メール確認なしでサインアップ中...');
    setDebugInfo('');
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'testuser@eldonia.com',
        password: 'TestPassword123!',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      });

      if (error) {
        setTestResult(`❌ テストサインアップエラー: ${error.message}`);
        setDebugInfo(`エラー詳細: ${JSON.stringify(error, null, 2)}`);
      } else {
        setTestResult(`✅ テストサインアップ成功: ${data.user?.email}`);
        setDebugInfo(`ユーザー情報: ${JSON.stringify(data.user, null, 2)}`);
      }
    } catch (err) {
      setTestResult(`❌ テストサインアップ例外: ${err}`);
      setDebugInfo(`例外詳細: ${JSON.stringify(err, null, 2)}`);
    }
  };

  const handleTestSignupWithValidEmail = async () => {
    setTestResult('🔄 有効メールでサインアップ中...');
    setDebugInfo('');
    
    // タイムスタンプを含むユニークなメールアドレス
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@eldonia.com`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TestPassword123!',
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      });

      if (error) {
        setTestResult(`❌ 有効メールサインアップエラー: ${error.message}`);
        setDebugInfo(`エラー詳細: ${JSON.stringify(error, null, 2)}`);
      } else {
        if (data.session) {
          setTestResult(`✅ 有効メールサインアップ成功: ${data.user?.email} (自動ログイン)`);
          setDebugInfo(`セッション情報: ${JSON.stringify(data.session, null, 2)}`);
        } else {
          setTestResult(`✅ 有効メールサインアップ成功: ${data.user?.email} (確認メール送信済み)`);
          setDebugInfo(`ユーザー情報: ${JSON.stringify(data.user, null, 2)}`);
        }
        
        // 認証状態を手動で更新
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      setTestResult(`❌ 有効メールサインアップ例外: ${err}`);
      setDebugInfo(`例外詳細: ${JSON.stringify(err, null, 2)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔐 Supabase認証テスト</h1>
        
        {/* 環境変数確認 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">📋 環境変数確認</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-48">NEXT_PUBLIC_SUPABASE_URL:</span>
              <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-400' : 'text-red-400'}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 設定済み' : '❌ 未設定'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-48">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-400' : 'text-red-400'}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定'}
              </span>
            </div>
            <div className="flex items-center">
              <span className="w-48">Supabase設定状態:</span>
              <span className={isSupabaseConfigured() ? 'text-green-400' : 'text-yellow-400'}>
                {isSupabaseConfigured() ? '✅ 正常' : '⚠️ ダミー値使用中'}
              </span>
            </div>
          </div>
        </div>

        {/* 認証状態 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 認証状態</h2>
          <div className="space-y-2">
            <div>認証状態: {loading ? '🔄 読み込み中...' : (isAuthenticated ? '✅ ログイン済み' : '❌ 未ログイン')}</div>
            {user && (
              <div>
                <div>ユーザーID: {user.id}</div>
                <div>メール: {user.email}</div>
                <div>ユーザー名: {user.username}</div>
              </div>
            )}
          </div>
        </div>

        {/* セッション情報 */}
        {sessionInfo && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">🔑 セッション情報</h2>
            <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(sessionInfo, null, 2)}
            </pre>
          </div>
        )}

        {/* テスト結果 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 テスト結果</h2>
          <div className="bg-gray-700 p-4 rounded">
            {testResult || 'テストを実行してください'}
          </div>
        </div>

        {/* デバッグ情報 */}
        {debugInfo && (
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">🐛 デバッグ情報</h2>
            <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto">
              {debugInfo}
            </pre>
          </div>
        )}

        {/* 認証テスト */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 認証テスト</h2>
          <div className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-white"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-white"
              />
            </div>
            <div className="flex space-x-4 flex-wrap">
              <button
                onClick={handleTestSignup}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                テストサインアップ
              </button>
              <button
                onClick={handleTestLogin}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                テストログイン
              </button>
              <button
                onClick={handleTestLogout}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded"
              >
                テストログアウト
              </button>
              <button
                onClick={handleTestSignupWithoutEmail}
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded"
              >
                テストサインアップ（固定値）
              </button>
              <button
                onClick={handleTestSignupWithValidEmail}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded"
              >
                テストサインアップ（有効メール）
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              >
                認証状態更新
              </button>
            </div>
          </div>
        </div>

        {/* ナビゲーション */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🔗 ナビゲーション</h2>
          <div className="space-y-2">
            <a href="/auth/login" className="block text-blue-400 hover:text-blue-300">
              → ログインページ
            </a>
            <a href="/auth/signup" className="block text-blue-400 hover:text-blue-300">
              → サインアップページ
            </a>
            <a href="/" className="block text-blue-400 hover:text-blue-300">
              → ホームページ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 