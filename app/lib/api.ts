

// APIクライアント設定
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// 共通のAPIクライアント
class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // 認証トークンを取得
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      console.log('Retrieved token from localStorage:', token ? `${token.substring(0, 50)}...` : 'null')
      console.log('Token type:', typeof token)
      console.log('Token length:', token ? token.length : 0)
      return token
    }
    return null
  }

  // 認証状態を確認
  public isAuthenticated(): boolean {
    return !!this.getAuthToken()
  }

  // 認証ヘッダーを取得
  private getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      const authHeader = `Bearer ${token}`
      headers['Authorization'] = authHeader
      console.log('Generated Authorization header:', authHeader.substring(0, 50) + '...')
    } else {
      console.log('No token available for Authorization header')
    }

    // CSRFトークンを取得して追加
    if (typeof window !== 'undefined') {
      const csrfToken = this.getCSRFToken()
      if (csrfToken) {
        headers['X-CSRFToken'] = csrfToken
        console.log('CSRF token added to headers')
      }
    }

    return headers
  }

  private getCSRFToken(): string | null {
    if (typeof window !== 'undefined') {
      // CookieからCSRFトークンを取得
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'csrftoken') {
          return value
        }
      }
    }
    return null
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`

      // 認証ヘッダーを追加
      const authHeaders = this.getAuthHeaders()

      const config: RequestInit = {
        headers: {
          ...authHeaders,
          ...options.headers,
        },
        ...options,
      }

      console.log(`Making ${config.method || 'GET'} request to: ${url}`)
      console.log('Request headers:', config.headers)

      const response = await fetch(url, config)
      const data = await response.json()

      console.log('API Response Data:', data)

      if (!response.ok) {
        // 認証エラーの場合
        if (response.status === 401) {
          // JWTトークンが無効な場合、ローカルストレージをクリア
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            console.log('JWTトークンが無効なため、ローカルストレージをクリアしました')
          }
          throw new Error('認証情報が無効です。再度ログインしてください。')
        }

        // JWTトークンエラーの場合（詳細なエラーレスポンス）
        if (data.code === 'token_not_valid' || data.detail?.includes('token')) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            console.log('JWTトークンエラーのため、ローカルストレージをクリアしました')
          }
          throw new Error('認証トークンが無効です。再度ログインしてください。')
        }

        // ログインエラーの場合は特別な処理
        if (endpoint === '/auth/login/' && response.status === 401) {
          throw new Error('認証に失敗しました')
        }

        // 登録エラーの場合は特別な処理
        if (endpoint === '/auth/register/' && response.status === 500) {
          throw new Error('登録処理中にエラーが発生しました')
        }

        // Djangoのエラーレスポンス形式に対応
        if (data.errors) {
          // フィールド別エラーの場合
          const errorMessage = Object.values(data.errors).flat().join(', ')
          throw new Error(errorMessage)
        } else if (data.error) {
          // 一般的なエラーの場合
          throw new Error(data.error)
        } else if (data.detail) {
          // DRFのデフォルトエラー
          throw new Error(data.detail)
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // ユーザー登録
  async register(userData: RegisterData) {
    return this.request<{
      success: boolean
      message: string
      user?: any
      profile?: any
      error?: string
    }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  // ユーザーログイン
  async login(credentials: {
    username: string
    password: string
  }) {
    return this.request<{
      message: string
      user: any
      profile: any
      token: string
      refresh: string
    }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  // 現在のユーザー情報を取得
  async getCurrentUser() {
    return this.request<any>('/users/me/')
  }

  // プロフィール更新
  async updateProfile(profileData: Partial<{
    first_name: string
    last_name: string
    phone: string
    address: string
    birth_date: string
    bio: string
    website: string
    twitter: string
    instagram: string
    discord: string
    is_public: boolean
    email_notifications: boolean
  }>) {
    return this.request<{
      message: string
      profile: any
    }>('/users/update_profile/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    })
  }

  // 言語設定更新
  async updateLanguage(language: string) {
    return this.request<{
      message: string
      profile: any
    }>('/users/update_language/', {
      method: 'PATCH',
      body: JSON.stringify({ language }),
    })
  }

  // チャットメッセージを取得
  async getChatMessages(room: string = 'general', limit: number = 50) {
    return this.request<{
      messages: ChatMessage[]
      room_name: string
      total_count: number
    }>(`/chat/messages/?room=${room}&limit=${limit}`)
  }

  // チャットルーム一覧を取得
  async getChatRooms() {
    return this.request<{
      rooms: ChatRoom[]
      total_count: number
    }>('/chat/rooms/')
  }

  // チャットルームを作成
  async createChatRoom(roomData: {
    name: string
    description?: string
    is_public?: boolean
    max_participants?: number
  }) {
    return this.request<ChatRoom>('/chat/rooms/create/', {
      method: 'POST',
      body: JSON.stringify(roomData),
    })
  }

  // チャットルームに参加
  async joinChatRoom(roomId: number) {
    return this.request<{
      message: string
      room_name: string
      participant_count: number
    }>('/chat/rooms/join/', {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId }),
    })
  }

  // チャットルームから退出
  async leaveChatRoom(roomId: number) {
    return this.request<{
      message: string
      room_name: string
      participant_count: number
    }>('/chat/rooms/leave/', {
      method: 'POST',
      body: JSON.stringify({ room_id: roomId }),
    })
  }

  // 翻訳を取得
  async getTranslation(text: string, targetLanguage: string, style: string = 'formal') {
    return this.request('/ai/translate/', {
      method: 'POST',
      body: JSON.stringify({
        text,
        target_language: targetLanguage,
        style
      })
    })
  }

  // プレミアムページの翻訳を取得
  async getPremiumPageTranslation(countryCode: string, language: string, style: string = 'formal') {
    return this.request<{
      success: boolean
      translations: Record<string, string>
      message?: string
      error?: string
    }>('/ai/premium-translation/', {
      method: 'POST',
      body: JSON.stringify({
        country_code: countryCode,
        language,
        style
      })
    })
  }

  // 翻訳関連のAPI
  async translateSite(translations: Record<string, string>, targetLanguage: string): Promise<any> {
    return this.request('/ai/site-translation/', {
      method: 'POST',
      body: JSON.stringify({
        translations,
        target_language: targetLanguage
      })
    })
  }

  async translateSingleText(text: string, targetLanguage: string): Promise<any> {
    return this.request('/ai/single-translation/', {
      method: 'POST',
      body: JSON.stringify({
        text,
        target_language: targetLanguage
      })
    })
  }

  // コメント関連のAPI
  async getComments(postId: number) {
    return this.request<{
      success: boolean
      comments: Comment[]
      total_count: number
    }>(`/posts/${postId}/comments/`)
  }

  async createComment(postId: number, content: string, parentId?: number) {
    return this.request<{
      success: boolean
      comment: Comment
      message?: string
      error?: string
    }>(`/posts/${postId}/comments/`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        parent_id: parentId
      })
    })
  }

  async toggleCommentLike(commentId: number) {
    return this.request<{
      success: boolean
      is_liked: boolean
      likes_count: number
      message?: string
      error?: string
    }>(`/comments/${commentId}/like/`, {
      method: 'POST'
    })
  }

  async deleteComment(commentId: number) {
    return this.request<{
      success: boolean
      message?: string
      error?: string
    }>(`/comments/${commentId}/`, {
      method: 'DELETE'
    })
  }

  async updateComment(commentId: number, content: string) {
    return this.request<{
      success: boolean
      comment: Comment
      message?: string
      error?: string
    }>(`/comments/${commentId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ content })
    })
  }

  // 投稿関連のAPI
  async createPost(postData: {
    title: string
    description: string
    category: string
    tags?: string[]
    is_public?: boolean
    price?: number
    currency?: string
    status?: 'draft' | 'published'
    language?: string
    file_type?: string
    content?: string
    files?: any[]
    hasAudio?: boolean
    isSilentVideo?: boolean
    shipping_info?: {
      weight: number
      dimensions: string
      shipping_method: string
      shipping_cost: number
    }
  }) {
    return this.request<{
      success: boolean
      post: any
      message?: string
      error?: string
    }>('/gallery/create/', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  }

  async createPostWithFiles(postData: {
    title: string
    description: string
    category: string
    tags?: string[]
    is_public?: boolean
    price?: number
    currency?: string
    status?: 'draft' | 'published'
    language?: string
    file_type?: string
    content?: string
    files?: any[]
    hasAudio?: boolean
    isSilentVideo?: boolean
    shipping_info?: {
      weight: number
      dimensions: string
      shipping_method: string
      shipping_cost: number
    }
  }) {
    return this.request('/gallery/create/', {
      method: 'POST',
      body: JSON.stringify(postData)
    })
  }

  async getMyPosts() {
    return this.request<any[]>('/gallery/my/', {
      method: 'GET'
    })
  }

  async getPost(postId: number) {
    return this.request<any>(`/gallery/${postId}/`, {
      method: 'GET'
    })
  }

  async updatePost(postId: number, postData: {
    title?: string
    description?: string
    category?: string
    tags?: string[]
    visibility?: 'public' | 'private' | 'draft'
    language?: string
  }) {
    return this.request<{
      success: boolean
      message?: string
      error?: string
    }>(`/gallery/${postId}/update/`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    })
  }

  async deletePost(postId: number) {
    return this.request<{
      success: boolean
      message?: string
      error?: string
    }>(`/gallery/${postId}/delete/`, {
      method: 'DELETE'
    })
  }

  // いいね・フォロー関連のAPI
  async toggleLike(postId: number) {
    return this.request<{
      success: boolean
      is_liked: boolean
      likes_count: number
      message?: string
      error?: string
    }>(`/posts/${postId}/like/`, {
      method: 'POST'
    })
  }

  async toggleSubscribe(postId: number) {
    return this.request<{
      success: boolean
      is_subscribed: boolean
      subscribers_count: number
      message?: string
      error?: string
    }>(`/posts/${postId}/subscribe/`, {
      method: 'POST'
    })
  }

  // 商品購入関連のAPI
  async purchaseProduct(purchaseData: {
    product_id: number
    product_name?: string
    product_price?: number
    seller_email?: string
    seller_name?: string
    quantity: number
    shipping_address: {
      name: string
      address: string
      city: string
      state: string
      postal_code: string
      country: string
      phone: string
    }
    payment_method: string
  }) {
    return this.request<{
      success: boolean
      order: any
      message?: string
      error?: string
    }>('/products/purchase/', {
      method: 'POST',
      body: JSON.stringify(purchaseData)
    })
  }

  // 配送通知関連のAPI
  async sendShippingNotification(shippingData: {
    order_id: number
    tracking_number: string
    shipping_method: string
    estimated_delivery: string
    notes?: string
  }) {
    return this.request<{
      success: boolean
      message?: string
      error?: string
    }>('/orders/shipping-notification/', {
      method: 'POST',
      body: JSON.stringify(shippingData)
    })
  }

  // 統合されたユーザー管理API
  async getUserProfile(userId?: number): Promise<{ success: boolean; data?: IntegratedUserProfile; error?: string }> {
    const endpoint = userId ? `/user/profile/?user_id=${userId}` : '/user/profile/'
    return this.request(endpoint)
  }

  async updateUserProfile(profileData: Partial<{
    bio: string
    avatar_url: string
    cover_image_url: string
    website: string
    hobbies: string
    location: string
    twitter: string
    instagram: string
    discord: string
  }>): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request('/user/profile/', {
      method: 'POST',
      body: JSON.stringify(profileData)
    })
  }

  async getUserInterests(userId?: number): Promise<{ success: boolean; data?: UserInterest[]; error?: string }> {
    const endpoint = userId ? `/user/interests/?user_id=${userId}` : '/user/interests/'
    return this.request(endpoint)
  }

  async updateUserInterest(interestData: {
    category: string
    level?: 'low' | 'medium' | 'high'
    weight?: number
    tags?: string[]
  }): Promise<{ success: boolean; message?: string; data?: UserInterest; error?: string }> {
    return this.request('/user/interests/', {
      method: 'POST',
      body: JSON.stringify(interestData)
    })
  }

  async getUserInteractions(userId?: number, type?: string): Promise<{ success: boolean; data?: UserInteraction[]; error?: string }> {
    let endpoint = userId ? `/user/interactions/?user_id=${userId}` : '/user/interactions/'
    if (type) {
      endpoint += userId ? `&type=${type}` : `?type=${type}`
    }
    return this.request(endpoint)
  }

  async recordUserInteraction(interactionData: {
    interaction_type: 'view' | 'like' | 'comment' | 'share' | 'follow' | 'purchase' | 'bookmark'
    content_type: 'post' | 'user' | 'event' | 'product' | 'comment'
    content_id: number
  }): Promise<{ success: boolean; message?: string; data?: UserInteraction; error?: string }> {
    return this.request('/user/interactions/', {
      method: 'POST',
      body: JSON.stringify(interactionData)
    })
  }

  async getUserSettings(settingType?: 'notification' | 'language' | 'visibility' | 'all'): Promise<{ success: boolean; data?: UserSettings; error?: string }> {
    const endpoint = settingType ? `/user/settings/?type=${settingType}` : '/user/settings/'
    return this.request(endpoint)
  }

  async updateUserSettings(settingData: {
    type: 'notification' | 'language' | 'visibility'
    settings: Record<string, any>
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    return this.request('/user/settings/', {
      method: 'POST',
      body: JSON.stringify(settingData)
    })
  }
}



// APIクライアントのインスタンスを作成
export const apiClient = new ApiClient(API_BASE_URL)

// 型定義
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  avatar?: string
  profile: UserProfile
}

export interface UserProfile {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone?: string
  address?: string
  birth_date?: string
  age?: number
  bio?: string
  avatar?: string
  website?: string
  twitter?: string
  instagram?: string
  discord?: string
  is_verified: boolean
  is_public: boolean
  total_artworks: number
  total_followers: number
  total_following: number
  language: string
  created_at: string
  updated_at: string
  last_login?: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  confirm_password: string
  first_name: string
  last_name: string
  phone?: string
  postal_code?: string
  address?: string
  birth_year?: number
  birth_month?: number
  birth_day?: number
  auto_login?: boolean
  plan?: 'Free' | 'Super' | 'Business'
  company_name?: string
  country?: string
  profile?: string
  hobbies?: string
  business_content?: string
  achievements?: string
}

export interface LoginData {
  username: string
  password: string
}

export interface ChatMessage {
  id: string
  content: string
  translated_content?: string
  sender: string
  sender_full_name?: string
  original_language: string
  target_language: string
  is_translated: boolean
  created_at: string
}

export interface ChatRoom {
  id: number
  name: string
  description: string
  participant_count: number
  max_participants: number
  created_by: string
  created_at: string
}

export interface Comment {
  id: number
  content: string
  author: User
  post_id: number
  parent_id?: number
  replies?: Comment[]
  likes_count: number
  is_liked: boolean
  is_edited: boolean
  created_at: string
  updated_at: string
}

// 統合されたユーザー管理の型定義
export interface UserStatistics {
  followers_count: number
  following_count: number
  posts_count: number
  total_artworks: number
  views_count: number
  likes_received: number
  total_likes: number
  total_views: number
  updated_at: string
}

export interface UserInterest {
  id: number
  category: string
  category_display: string
  level: 'low' | 'medium' | 'high'
  level_display: string
  weight: number
  tags: string[]
  created_at: string
}

export interface UserInteraction {
  id: number
  interaction_type: 'view' | 'like' | 'comment' | 'share' | 'follow' | 'purchase' | 'bookmark'
  content_type: 'post' | 'user' | 'event' | 'product' | 'comment'
  content_id: number
  created_at: string
}

export interface UserNotificationSettings {
  email_notifications: boolean
  email_follow: boolean
  email_like: boolean
  email_comment: boolean
  email_mention: boolean
  email_system: boolean
  push_notifications: boolean
  push_follow: boolean
  push_like: boolean
  push_comment: boolean
  push_mention: boolean
  push_system: boolean
}

export interface UserLanguageSettings {
  ui_language: 'ja' | 'en' | 'zh' | 'ko'
  content_languages: string[]
  auto_translate: boolean
  translate_to: 'ja' | 'en' | 'zh' | 'ko'
}

export interface UserVisibilitySettings {
  profile_visibility: 'public' | 'private' | 'friends' | 'followers'
  post_visibility: 'public' | 'private' | 'friends' | 'followers'
  stats_visibility: 'public' | 'private' | 'friends' | 'followers'
  show_email: boolean
  show_phone: boolean
  show_address: boolean
  show_birth_date: boolean
}

export interface UserSettings {
  notification: UserNotificationSettings
  language: UserLanguageSettings
  visibility: UserVisibilitySettings
}

// 統合されたユーザープロフィール型
export interface IntegratedUserProfile {
  user_id: number
  username: string
  first_name: string
  last_name: string
  email: string
  bio?: string
  avatar_url?: string
  cover_image_url?: string
  website?: string
  hobbies?: string
  location?: string
  twitter?: string
  instagram?: string
  discord?: string
  position?: string
  plan: string
  is_verified: boolean
  created_at: string
  // 統計情報
  followers_count: number
  following_count: number
  posts_count: number
  views_count: number
  likes_received: number
}
