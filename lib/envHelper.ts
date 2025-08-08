/**
 * 環境変数の設定状況を確認する
 */
export const checkEnvironmentVariables = () => {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  const missingVars = Object.entries(envVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key)

  const status = {
    allConfigured: missingVars.length === 0,
    missingVars,
    envVars: {
      ...envVars,
      SUPABASE_SERVICE_ROLE_KEY: envVars.SUPABASE_SERVICE_ROLE_KEY 
        ? '***' + envVars.SUPABASE_SERVICE_ROLE_KEY.slice(-4) 
        : undefined
    }
  }

  return status
}

/**
 * 環境変数の設定状況をコンソールに出力
 */
export const logEnvironmentStatus = () => {
  const status = checkEnvironmentVariables()
  
  console.log('🔧 環境変数設定状況:')
  console.log('')
  
  if (status.allConfigured) {
    console.log('✅ すべての環境変数が設定されています')
  } else {
    console.log('❌ 以下の環境変数が設定されていません:')
    status.missingVars.forEach(varName => {
      console.log(`   - ${varName}`)
    })
  }
  
  console.log('')
  console.log('📝 設定されている環境変数:')
  Object.entries(status.envVars).forEach(([key, value]) => {
    const status = value ? '✅' : '❌'
    console.log(`   ${status} ${key}: ${value || '未設定'}`)
  })
  
  console.log('')
  
  if (!status.allConfigured) {
    console.log('💡 設定方法:')
    console.log('   1. .env.localファイルを作成')
    console.log('   2. 以下の環境変数を設定:')
    console.log('      NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
    console.log('      NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
    console.log('      SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key')
    console.log('   3. サーバーを再起動')
  }
}

/**
 * 環境変数が設定されているかチェック
 */
export const isEnvironmentConfigured = () => {
  return checkEnvironmentVariables().allConfigured
} 