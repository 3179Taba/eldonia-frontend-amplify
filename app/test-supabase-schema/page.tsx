'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TestSupabaseSchemaPage() {
  const [testResults, setTestResults] = useState<{
    tables: { [key: string]: boolean };
    rls: { [key: string]: boolean };
    storage: { [key: string]: boolean };
    errors: string[];
  }>({
    tables: {},
    rls: {},
    storage: {},
    errors: []
  });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const runAllTests = async () => {
    setLoading(true);
    setTestResults({
      tables: {},
      rls: {},
      storage: {},
      errors: []
    });

    const results = {
      tables: {} as { [key: string]: boolean },
      rls: {} as { [key: string]: boolean },
      storage: {} as { [key: string]: boolean },
      errors: [] as string[]
    };

    try {
      // テーブル存在確認
      await testTables(results);
      
      // RLSポリシー確認
      await testRLSPolicies(results);
      
      // ストレージバケット確認
      await testStorageBuckets(results);
      
    } catch (error) {
      results.errors.push(`テスト実行エラー: ${error}`);
    }

    setTestResults(results);
    setLoading(false);
  };

  const testTables = async (results: any) => {
    const tables = [
      'user_profiles',
      'categories',
      'posts',
      'post_files',
      'events',
      'articles',
      'chat_rooms',
      'chat_room_participants',
      'chat_messages',
      'user_interests',
      'user_search_history',
      'user_interactions'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          results.errors.push(`${table}テーブルエラー: ${error.message}`);
          results.tables[table] = false;
        } else {
          results.tables[table] = true;
        }
      } catch (err) {
        results.errors.push(`${table}テーブル例外: ${err}`);
        results.tables[table] = false;
      }
    }
  };

  const testRLSPolicies = async (results: any) => {
    // RLSポリシーの確認（簡易版）
    const tables = ['user_profiles', 'posts', 'chat_messages'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error && error.message.includes('RLS')) {
          results.rls[table] = false;
          results.errors.push(`${table} RLSエラー: ${error.message}`);
        } else {
          results.rls[table] = true;
        }
      } catch (err) {
        results.rls[table] = false;
        results.errors.push(`${table} RLS例外: ${err}`);
      }
    }
  };

  const testStorageBuckets = async (results: any) => {
    const buckets = ['post-files', 'avatars', 'gallery', 'temp'];
    
    for (const bucket of buckets) {
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .list('', { limit: 1 });

        if (error) {
          results.storage[bucket] = false;
          results.errors.push(`${bucket}バケットエラー: ${error.message}`);
        } else {
          results.storage[bucket] = true;
        }
      } catch (err) {
        results.storage[bucket] = false;
        results.errors.push(`${bucket}バケット例外: ${err}`);
      }
    }
  };

  const testUserProfileCreation = async () => {
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          first_name: 'Test',
          last_name: 'User',
          email: user.email,
          plan: 'free',
          language: 'ja'
        })
        .select();

      if (error) {
        alert(`プロフィール作成エラー: ${error.message}`);
      } else {
        alert('プロフィール作成成功！');
      }
    } catch (err) {
      alert(`プロフィール作成例外: ${err}`);
    }
  };

  const testPostCreation = async () => {
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          title: 'テスト投稿',
          description: 'これはテスト投稿です',
          category: 'art',
          visibility: 'public',
          language: 'ja'
        })
        .select();

      if (error) {
        alert(`投稿作成エラー: ${error.message}`);
      } else {
        alert('投稿作成成功！');
      }
    } catch (err) {
      alert(`投稿作成例外: ${err}`);
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-400' : 'text-red-400';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? '✅' : '❌';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🗄️ Supabaseスキーマ・RLS・ストレージテスト</h1>
        
        {/* ユーザー情報 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 ユーザー情報</h2>
          {user ? (
            <div className="space-y-2">
              <div>ユーザーID: {user.id}</div>
              <div>メール: {user.email}</div>
              <div>作成日: {new Date(user.created_at).toLocaleString()}</div>
            </div>
          ) : (
            <div className="text-yellow-400">未ログイン</div>
          )}
        </div>

        {/* テスト実行ボタン */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 テスト実行</h2>
          <div className="space-x-4">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
            >
              {loading ? 'テスト実行中...' : '全テスト実行'}
            </button>
            <button
              onClick={testUserProfileCreation}
              disabled={!user}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
            >
              プロフィール作成テスト
            </button>
            <button
              onClick={testPostCreation}
              disabled={!user}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              投稿作成テスト
            </button>
          </div>
        </div>

        {/* テーブル確認結果 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 テーブル確認結果</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(testResults.tables).map(([table, status]) => (
              <div key={table} className={`p-3 rounded ${getStatusColor(status)}`}>
                <div className="flex items-center">
                  <span className="mr-2">{getStatusIcon(status)}</span>
                  <span className="font-mono text-sm">{table}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RLS確認結果 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">🔒 RLS確認結果</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(testResults.rls).map(([table, status]) => (
              <div key={table} className={`p-3 rounded ${getStatusColor(status)}`}>
                <div className="flex items-center">
                  <span className="mr-2">{getStatusIcon(status)}</span>
                  <span className="font-mono text-sm">{table}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ストレージ確認結果 */}
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">📁 ストレージ確認結果</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(testResults.storage).map(([bucket, status]) => (
              <div key={bucket} className={`p-3 rounded ${getStatusColor(status)}`}>
                <div className="flex items-center">
                  <span className="mr-2">{getStatusIcon(status)}</span>
                  <span className="font-mono text-sm">{bucket}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* エラー情報 */}
        {testResults.errors.length > 0 && (
          <div className="bg-red-900 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">❌ エラー情報</h2>
            <div className="space-y-2">
              {testResults.errors.map((error, index) => (
                <div key={index} className="text-red-300 text-sm">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ナビゲーション */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">🔗 ナビゲーション</h2>
          <div className="space-y-2">
            <a href="/test-auth" className="block text-blue-400 hover:text-blue-300">
              → 認証テストページ
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