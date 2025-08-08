'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface UserProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  birth_date?: string
  bio?: string
  avatar?: string
  website?: string
  twitter?: string
  instagram?: string
  discord?: string
  is_verified: boolean
  is_public: boolean
  email_notifications: boolean
  total_artworks: number
  total_followers: number
  total_following: number
  country?: string
  city?: string
  postal_code?: string
  position?: string
  is_premium: boolean
  premium_start_date?: string
  premium_end_date?: string
  language: string
  total_posts: number
  total_likes: number
  total_views: number
  created_at: string
  updated_at: string
  last_login?: string
  is_staff?: boolean
}

interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  profile: UserProfile
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (userData: User, token: string) => void
  logout: () => void
  refreshAuth: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ローカルストレージから認証情報を復元
    const savedUser = localStorage.getItem('user')
    const savedToken = localStorage.getItem('token')

    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setToken(savedToken)
        console.log('Restored auth from localStorage:', userData.username)
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }

    setLoading(false)
  }, [])

  const login = (userData: User, authToken: string) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', authToken)
    console.log('User logged in:', userData.username)
  }

  const logout = async () => {
    try {
      // バックエンドにログアウトリクエストを送信
      if (token) {
        await fetch('http://localhost:8000/api/auth/logout/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // ローカル状態をクリア
      setUser(null)
      setToken(null)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      console.log('User logged out')
    }
  }

  const refreshAuth = async () => {
    if (!token) return

    try {
      const response = await fetch('http://localhost:8000/api/users/me/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        console.log('Refreshed user data:', userData)
        setUser(userData)
        localStorage.setItem('user', JSON.stringify(userData))
      } else {
        console.log('Auth refresh failed, logging out')
        // トークンが無効な場合はログアウト
        logout()
      }
    } catch (error) {
      console.error('Auth refresh error:', error)
      logout()
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    login,
    logout,
    refreshAuth,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
