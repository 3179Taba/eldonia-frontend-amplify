'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/app/lib/auth-context';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';
  const plan = searchParams.get('plan');
  const { refreshAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Handling auth callback...');
        
        // URLパラメータから認証情報を確認
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const errorParam = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        if (errorParam) {
          console.error('Auth error from URL:', errorParam, errorDescription);
          setError(`認証エラー: ${errorDescription || errorParam}`);
          setLoading(false);
          return;
        }
        
        // トークンがURLパラメータにある場合はセッションを設定
        if (accessToken && refreshToken) {
          console.log('Setting session from URL parameters...');
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            console.error('Session setting error:', sessionError);
            setError('セッションの設定に失敗しました: ' + sessionError.message);
            setLoading(false);
            return;
          }
          
          if (sessionData.session) {
            console.log('Session set successfully:', sessionData.session.user.email);
            await refreshAuth();
            
            // プラン情報がある場合はユーザープロフィールに保存
            if (plan) {
              try {
                const { error: profileError } = await supabase
                  .from('profiles')
                  .upsert({
                    user_id: sessionData.session.user.id,
                    plan: plan,
                    updated_at: new Date().toISOString()
                  });
                
                if (profileError) {
                  console.warn('Failed to update profile with plan:', profileError);
                }
              } catch (profileErr) {
                console.warn('Profile update error:', profileErr);
              }
            }
            
            // リダイレクト先を決定
            let finalRedirectPath = redirectPath;
            if (plan && redirectPath === '/') {
              finalRedirectPath = '/';
            }
            
            console.log('Redirecting to:', finalRedirectPath);
            router.replace(finalRedirectPath);
            return;
          }
        }
        
        // 通常のセッション確認
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('認証に失敗しました: ' + error.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          console.log('Authentication successful:', data.session.user.email);
          
          // 認証コンテキストを更新
          await refreshAuth();
          
          // プラン情報がある場合はユーザープロフィールに保存
          if (plan) {
            try {
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                  user_id: data.session.user.id,
                  plan: plan,
                  updated_at: new Date().toISOString()
                });
              
              if (profileError) {
                console.warn('Failed to update profile with plan:', profileError);
              }
            } catch (profileErr) {
              console.warn('Profile update error:', profileErr);
            }
          }
          
          // リダイレクト先を決定
          let finalRedirectPath = redirectPath;
          if (plan && redirectPath === '/') {
            finalRedirectPath = '/';
          }
          
          console.log('Redirecting to:', finalRedirectPath);
          router.replace(finalRedirectPath);
        } else {
          // セッションが存在しない場合、少し待ってから再試行
          console.log('No session found, waiting and retrying...');
          setTimeout(async () => {
            const { data: retryData, error: retryError } = await supabase.auth.getSession();
            
            if (retryError) {
              console.error('Retry auth error:', retryError);
              setError('認証に失敗しました');
              setLoading(false);
              return;
            }
            
            if (retryData.session) {
              console.log('Authentication successful on retry:', retryData.session.user.email);
              await refreshAuth();
              
              // プラン情報がある場合はユーザープロフィールに保存
              if (plan) {
                try {
                  const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                      user_id: retryData.session.user.id,
                      plan: plan,
                      updated_at: new Date().toISOString()
                    });
                  
                  if (profileError) {
                    console.warn('Failed to update profile with plan:', profileError);
                  }
                } catch (profileErr) {
                  console.warn('Profile update error:', profileErr);
                }
              }
              
              // リダイレクト先を決定
              let finalRedirectPath = redirectPath;
              if (plan && redirectPath === '/') {
                finalRedirectPath = '/';
              }
              
              console.log('Redirecting to:', finalRedirectPath);
              router.replace(finalRedirectPath);
            } else {
              console.log('Still no session after retry');
              setError('認証セッションが見つかりません');
              setLoading(false);
            }
          }, 1000); // 1秒待機
        }
        
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        setError('予期しないエラーが発生しました');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, redirectPath, plan, refreshAuth]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">認証中...</p>
          <p className="text-gray-400 text-sm mt-2">しばらくお待ちください</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">認証エラー</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              ログインページに戻る
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 