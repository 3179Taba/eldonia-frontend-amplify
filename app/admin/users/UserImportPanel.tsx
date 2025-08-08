"use client";
import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Supabaseクライアントの設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZ3F1bWRranJsem50am5sZHluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTcwMjMzNywiZXhwIjoyMDY3Mjc4MzM3fQ.Lq6VkoUOQ-N8lwLA6klvdDJA4_XawkFMSYgX-LT0k0U";

// サービスロールキーでSupabaseクライアントを作成
const supabase = createClient(supabaseUrl, supabaseServiceKey);

type DjangoUser = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  plan: string;
  language: string;
};

type ImportResult = {
  success: number;
  failed: number;
  errors: string[];
  details: {
    email: string;
    status: 'success' | 'failed';
    error?: string;
  }[];
};

export default function UserImportPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    setProgress(0);

    try {
      // Django APIからユーザー一覧を取得
      const res = await fetch("http://127.0.0.1:8000/api/admin/users/", {
        headers: {
          'Authorization': 'Bearer dummy_token_for_development',
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`ユーザー一覧の取得に失敗しました: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      const users: DjangoUser[] = data.users;

      if (!users || users.length === 0) {
        setResult({
          success: 0,
          failed: 0,
          errors: ['ユーザーが見つかりませんでした'],
          details: []
        });
        return;
      }

      let success = 0;
      let failed = 0;
      const errors: string[] = [];
      const details: ImportResult['details'] = [];

      // 各ユーザーをSupabase Authに登録
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        try {
          // 既存ユーザーをチェック
          const { data: existingUser } = await supabase.auth.admin.listUsers();
          const userExists = existingUser.users?.some(u => u.email === user.email);
          
          if (userExists) {
            details.push({
              email: user.email,
              status: 'failed',
              error: '既にSupabaseに存在します'
            });
            failed++;
            errors.push(`${user.email}: 既にSupabaseに存在します`);
          } else {
            // 新しいユーザーを作成
            const { error } = await supabase.auth.admin.createUser({
              email: user.email,
              password: Math.random().toString(36).slice(-8), // 仮パスワード
              email_confirm: true,
              user_metadata: {
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name,
                plan: user.plan,
                language: user.language,
                django_user_id: user.id
              }
            });
            
            if (error) {
              details.push({
                email: user.email,
                status: 'failed',
                error: error.message
              });
              failed++;
              errors.push(`${user.email}: ${error.message}`);
            } else {
              details.push({
                email: user.email,
                status: 'success'
              });
              success++;
            }
          }
        } catch (error: any) {
          details.push({
            email: user.email,
            status: 'failed',
            error: error.message
          });
          failed++;
          errors.push(`${user.email}: ${error.message}`);
        }
        
        // 進捗を更新
        setProgress(((i + 1) / users.length) * 100);
      }

      setResult({
        success,
        failed,
        errors,
        details
      });

    } catch (error: any) {
      setResult({
        success: 0,
        failed: 0,
        errors: [`エラー: ${error.message}`],
        details: []
      });
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ユーザー一括インポート
        </h2>
        <p className="text-gray-600">
          DjangoのユーザーをSupabase Authに一括登録します
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={handleImport}
          disabled={loading}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? "インポート中..." : "DjangoユーザーをSupabaseへインポート"}
        </button>
      </div>

      {loading && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            進捗: {Math.round(progress)}%
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${
            result.failed === 0 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <h3 className="font-semibold mb-2">インポート結果</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-600">成功:</span> {result.success}件
              </div>
              <div>
                <span className="font-medium text-red-600">失敗:</span> {result.failed}件
              </div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 mb-2">エラー詳細</h4>
              <div className="max-h-60 overflow-y-auto">
                {result.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 mb-1">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.details.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">詳細ログ</h4>
              <div className="max-h-60 overflow-y-auto">
                {result.details.map((detail, index) => (
                  <div key={index} className={`text-sm mb-1 ${
                    detail.status === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {detail.email}: {detail.status === 'success' ? '成功' : `失敗 - ${detail.error}`}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 