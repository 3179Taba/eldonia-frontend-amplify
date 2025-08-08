import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 環境変数の取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// デフォルト値の設定
const defaultUrl = 'https://dummy.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.dummy-key';

// 環境変数の確認とログ出力
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('dummy')) {
  console.warn('⚠️ Supabase環境変数が設定されていません。開発用のダミー値を使用しています。');
  console.warn('実際のSupabaseプロジェクトを作成して、.env.localファイルに以下の値を設定してください：');
  console.warn('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url');
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.warn('');
  console.warn('現在はダミー値を使用しているため、認証機能は動作しません。');
}

// シングルトンインスタンス
let supabaseInstance: SupabaseClient | null = null;

// Supabaseクライアントの作成（シングルトン）
export const supabase = (() => {
  if (!supabaseInstance) {
    console.log('Supabaseクライアントを作成中...', {
      url: supabaseUrl || defaultUrl,
      hasKey: !!(supabaseAnonKey || defaultKey),
      keyLength: (supabaseAnonKey || defaultKey)?.length || 0
    });
    
    supabaseInstance = createClient(
      supabaseUrl || defaultUrl,
      supabaseAnonKey || defaultKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        global: {
          headers: {
            'X-Client-Info': 'supabase-js/2.x'
          }
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    );
    
    console.log('Supabaseクライアント作成完了');
  }
  return supabaseInstance;
})();

// 設定状態の確認用関数
export const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseAnonKey && 
         !supabaseUrl.includes('dummy') && 
         !supabaseAnonKey.includes('dummy');
};

// 共通のSupabaseクライアントをエクスポート
export default supabase; 