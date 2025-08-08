import { supabase } from './supabaseClient'

export interface Plan {
  id: string
  name: string
  price_monthly: number
  price_yearly: number
  stripe_price_id: string | null
  created_at: string
}

export interface CreatePlanData {
  name: string
  price_monthly: number
  stripe_price_id?: string
}

export interface UpdatePlanData {
  name?: string
  price_monthly?: number
  stripe_price_id?: string
}

/**
 * プラン一覧を取得する
 */
export const getPlans = async (): Promise<Plan[]> => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('price_monthly', { ascending: true })

    if (error) {
      console.error('プラン取得エラー:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('プラン取得エラー:', error)
    return []
  }
}

/**
 * プランを作成する
 */
export const createPlan = async (planData: CreatePlanData): Promise<Plan | null> => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .insert([planData])
      .select()
      .single()

    if (error) {
      console.error('プラン作成エラー:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('プラン作成エラー:', error)
    return null
  }
}

/**
 * プランを更新する
 */
export const updatePlan = async (planId: string, planData: UpdatePlanData): Promise<Plan | null> => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .update(planData)
      .eq('id', planId)
      .select()
      .single()

    if (error) {
      console.error('プラン更新エラー:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('プラン更新エラー:', error)
    return null
  }
}

/**
 * プランを削除する
 */
export const deletePlan = async (planId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId)

    if (error) {
      console.error('プラン削除エラー:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('プラン削除エラー:', error)
    return false
  }
}

/**
 * プランをIDで取得する
 */
export const getPlanById = async (planId: string): Promise<Plan | null> => {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (error) {
      console.error('プラン取得エラー:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('プラン取得エラー:', error)
    return null
  }
}

/**
 * デフォルトプランを作成する（開発用）
 */
export const createDefaultPlans = async (): Promise<Plan[]> => {
  const defaultPlans = [
    {
      name: '無料プラン',
      price_monthly: 0,
      stripe_price_id: null
    },
    {
      name: 'ベーシックプラン',
      price_monthly: 980,
      stripe_price_id: null
    },
    {
      name: 'プレミアムプラン',
      price_monthly: 1980,
      stripe_price_id: null
    },
    {
      name: 'プロプラン',
      price_monthly: 3980,
      stripe_price_id: null
    }
  ]

  try {
    // 既存のプランをチェック
    const existingPlans = await getPlans()
    if (existingPlans.length > 0) {
      console.log('プランは既に存在します')
      return existingPlans
    }

    // デフォルトプランを作成
    console.log('デフォルトプランを作成中...')
    const createdPlans: Plan[] = []

    for (const planData of defaultPlans) {
      const createdPlan = await createPlan(planData)
      if (createdPlan) {
        createdPlans.push(createdPlan)
      }
    }

    return createdPlans
  } catch (error) {
    console.error('デフォルトプラン作成エラー:', error)
    return []
  }
} 