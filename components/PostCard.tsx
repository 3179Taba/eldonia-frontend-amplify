'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import TranslatableText from '../app/components/TranslatableText'

interface PostCardProps {
  post: {
    id: string
    title: string
    title_ja?: string
    title_en?: string
    title_zh?: string
    title_ko?: string
    description: string
    description_ja?: string
    description_en?: string
    description_zh?: string
    description_ko?: string
    category: string
    file_type: string
    author: {
      id: string
      username: string
      profile?: {
        first_name: string
        last_name: string
        avatar_url?: string
      }
    }
    created_at: string
    files?: Array<{
      id: string
      file_url: string
      file_type: string
    }>
    tags?: string[]
  }
  showAuthor?: boolean
  compact?: boolean
}

export default function PostCard({ post, showAuthor = true, compact = false }: PostCardProps) {
  const getCategoryColor = (category: string) => {
    const colors = {
      art: 'bg-purple-100 text-purple-800',
      music: 'bg-blue-100 text-blue-800',
      video: 'bg-red-100 text-red-800',
      photo: 'bg-green-100 text-green-800',
      writing: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || colors.other
  }

  const getFileTypeIcon = (fileType: string) => {
    const icons = {
      image: '🖼️',
      video: '🎥',
      music: '🎵',
      text: '📝'
    }
    return icons[fileType as keyof typeof icons] || '📄'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPreviewImage = () => {
    if (post.files && post.files.length > 0) {
      const imageFile = post.files.find(file =>
        file.file_type.startsWith('image/')
      )
      return imageFile?.file_url
    }
    return null
  }

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${
      compact ? 'max-w-sm' : ''
    }`}>
      {/* プレビュー画像 */}
      {getPreviewImage() && (
        <div className="relative h-48 bg-gray-100">
          <Image
            src={getPreviewImage()!}
            alt={post.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2">
            <span className="text-2xl">{getFileTypeIcon(post.file_type)}</span>
          </div>
        </div>
      )}

      <div className="p-4">
        {/* カテゴリとタグ */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
          {post.tags && post.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* タイトル */}
        <Link href={`/post/${post.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            <TranslatableText
              translationKey={`post.title.${post.id}`}
              fallbackText={post.title_ja || post.title}
            />
          </h3>
        </Link>

        {/* 説明 */}
        {!compact && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            <TranslatableText
              translationKey={`post.description.${post.id}`}
              fallbackText={post.description_ja || post.description}
            />
          </p>
        )}

        {/* 作者情報 */}
        {showAuthor && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {post.author.profile?.avatar_url ? (
                <Image
                  src={post.author.profile.avatar_url}
                  alt={post.author?.username || 'Unknown'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {post.author?.username?.slice(0, 2).toUpperCase() || 'UN'}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600">
                {post.author.profile ?
                  `${post.author.profile.first_name} ${post.author.profile.last_name}` :
                  post.author?.username || 'Unknown'
                }
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {formatDate(post.created_at)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
