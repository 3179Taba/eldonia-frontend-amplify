'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Globe, Twitter, Instagram, MessageCircle, Star, Eye, Heart } from 'lucide-react'

interface UserProfileCardProps {
  user: {
    id: string
    username: string
    profile: {
      first_name: string
      last_name: string
      email: string
      bio?: string
      avatar_url?: string
      website?: string
      twitter?: string
      instagram?: string
      discord?: string
      country?: string
      city?: string
      position?: string
      is_verified: boolean
      is_public: boolean
      total_posts: number
      total_followers: number
      total_following: number
      total_likes: number
      total_views: number
      plan: string
      is_premium: boolean
      language: string
      created_at: string
    }
  }
  showStats?: boolean
  compact?: boolean
}

export default function UserProfileCard({ user, showStats = true, compact = false }: UserProfileCardProps) {
  const getPositionColor = (position: string) => {
    const colors = {
      video_editor: 'bg-purple-100 text-purple-800',
      musician: 'bg-blue-100 text-blue-800',
      artist: 'bg-green-100 text-green-800',
      recruiter: 'bg-orange-100 text-orange-800',
      designer: 'bg-pink-100 text-pink-800',
      photographer: 'bg-indigo-100 text-indigo-800',
      writer: 'bg-yellow-100 text-yellow-800',
      developer: 'bg-gray-100 text-gray-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[position as keyof typeof colors] || colors.other
  }

  const getPlanColor = (plan: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      standard: 'bg-blue-100 text-blue-800',
      premium: 'bg-yellow-100 text-yellow-800',
      business: 'bg-purple-100 text-purple-800'
    }
    return colors[plan as keyof typeof colors] || colors.free
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
      compact ? 'max-w-sm' : ''
    }`}>
      {/* ヘッダー */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
        {user.profile.avatar_url && (
          <div className="absolute -bottom-8 left-6">
            <Image
              src={user.profile.avatar_url}
              alt={`${user.profile.first_name} ${user.profile.last_name}`}
              width={64}
              height={64}
              className="rounded-full border-4 border-white"
            />
          </div>
        )}
        
        {/* 認証バッジ */}
        {user.profile.is_verified && (
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      <div className="pt-8 pb-4 px-6">
        {/* ユーザー情報 */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">
              {user.profile.first_name} {user.profile.last_name}
            </h3>
            {user.profile.is_premium && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                Premium
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm">@{user.username}</p>
          
          {user.profile.position && (
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getPositionColor(user.profile.position)}`}>
              {user.profile.position}
            </span>
          )}
        </div>

        {/* 場所情報 */}
        {(user.profile.country || user.profile.city) && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span>
              {user.profile.city && user.profile.country ? 
                `${user.profile.city}, ${user.profile.country}` :
                user.profile.city || user.profile.country
              }
            </span>
          </div>
        )}

        {/* 自己紹介 */}
        {user.profile.bio && !compact && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {user.profile.bio}
          </p>
        )}

        {/* 統計情報 */}
        {showStats && (
          <div className="grid grid-cols-3 gap-4 mb-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">{user.profile.total_posts}</div>
              <div className="text-xs text-gray-500">投稿</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{user.profile.total_followers}</div>
              <div className="text-xs text-gray-500">フォロワー</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{user.profile.total_likes}</div>
              <div className="text-xs text-gray-500">いいね</div>
            </div>
          </div>
        )}

        {/* ソーシャルリンク */}
        {(user.profile.website || user.profile.twitter || user.profile.instagram || user.profile.discord) && !compact && (
          <div className="flex items-center space-x-3 mb-4">
            {user.profile.website && (
              <Link href={user.profile.website} target="_blank" className="text-gray-400 hover:text-gray-600">
                <Globe className="w-5 h-5" />
              </Link>
            )}
            {user.profile.twitter && (
              <Link href={`https://twitter.com/${user.profile.twitter}`} target="_blank" className="text-gray-400 hover:text-blue-500">
                <Twitter className="w-5 h-5" />
              </Link>
            )}
            {user.profile.instagram && (
              <Link href={`https://instagram.com/${user.profile.instagram}`} target="_blank" className="text-gray-400 hover:text-pink-500">
                <Instagram className="w-5 h-5" />
              </Link>
            )}
            {user.profile.discord && (
              <div className="text-gray-400">
                <MessageCircle className="w-5 h-5" />
              </div>
            )}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex space-x-2">
          <Link 
            href={`/user/${user.id}`}
            className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors text-center"
          >
            プロフィールを見る
          </Link>
          
          {user.profile.is_public && (
            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors">
              フォロー
            </button>
          )}
        </div>

        {/* 参加日 */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          参加日: {formatDate(user.profile.created_at)}
        </div>
      </div>
    </div>
  )
} 