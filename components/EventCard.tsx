'use client'

import React from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'

interface EventCardProps {
  event: {
    id: string
    title: string
    description: string
    start_date: string
    end_date: string
    location?: string
    organizer: {
      id: string
      username: string
      profile?: {
        first_name: string
        last_name: string
        avatar_url?: string
      }
    }
    is_active: boolean
    created_at: string
  }
  showOrganizer?: boolean
}

export default function EventCard({ event, showOrganizer = true }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventStatus = () => {
    const now = new Date()
    const startDate = new Date(event.start_date)
    const endDate = new Date(event.end_date)

    if (now < startDate) {
      return { status: 'upcoming', text: '開催予定', color: 'bg-blue-100 text-blue-800' }
    } else if (now >= startDate && now <= endDate) {
      return { status: 'ongoing', text: '開催中', color: 'bg-green-100 text-green-800' }
    } else {
      return { status: 'ended', text: '終了', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const eventStatus = getEventStatus()

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        {/* イベントステータス */}
        <div className="flex items-center justify-between mb-4">
          <span className={`px-3 py-1 text-xs font-medium rounded-full ${eventStatus.color}`}>
            {eventStatus.text}
          </span>
          {!event.is_active && (
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              非アクティブ
            </span>
          )}
        </div>

        {/* タイトル */}
        <Link href={`/events/${event.id}`} className="block">
          <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
            {event.title}
          </h3>
        </Link>

        {/* 説明 */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {event.description}
        </p>

        {/* 日時情報 */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.start_date)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {formatTime(event.start_date)} - {formatTime(event.end_date)}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* 主催者情報 */}
        {showOrganizer && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {event.organizer.profile?.avatar_url ? (
                <img
                  src={event.organizer.profile.avatar_url}
                  alt={event.organizer.username}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {event.organizer.username.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {event.organizer.profile ? 
                    `${event.organizer.profile.first_name} ${event.organizer.profile.last_name}` :
                    event.organizer.username
                  }
                </p>
                <p className="text-xs text-gray-500">主催者</p>
              </div>
            </div>
            
            <Link 
              href={`/events/${event.id}`}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
            >
              詳細を見る
            </Link>
          </div>
        )}
      </div>
    </div>
  )
} 