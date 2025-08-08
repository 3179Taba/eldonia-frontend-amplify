'use client'

import { useEffect, useState, use as usePromise } from 'react'
import HeaderTemplate from '../../components/HeaderTemplate'
import FooterTemplate from '../../components/FooterTemplate'
import { Calendar, Clock, MapPin, Users, User, DollarSign } from 'lucide-react'
import Image from 'next/image'
import TranslatableText from '../../components/TranslatableText'
import { useTranslation, Language } from '../../lib/useTranslation'
import { dummyEvents } from '../dummyEvents'

interface Props {
  params: Promise<{ id: string }>
}

interface EventDetail {
  id: string
  title: string
  description: string
  titleKey: string
  descriptionKey: string
  date: string
  time: string
  location: string
  locationKey: string
  image: string
  attendees: number
  maxAttendees: number
  organizer_name: string
  organizer_key?: string
  isOnline: boolean
  price: number
  isFree: boolean
  address?: string
  postalCode?: string
  onlineUrl?: string
}

const imagePool = [
  '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_02ff9b2b-44c9-498c-ab8e-4fdf612b919b_0.png',
  '/img/srnote_Beautiful_gothic_bookcase_candlelight_medieval_desk_to_0cd8b99d-521c-400b-b6c5-79451622c0bf_0.png',
  '/img/srnote_Beautiful_Gothic_study_candlelight_medieval_desk_top_t_9dd5cde6-f814-47cf-b600-03eacd16416f_0.png',
  '/img/srnote_cute_cat_full_body_cyberpunk_elf_PhD_fantasy_boy_moon__ffea1def-f8ea-41ee-a4ef-558cae025c19_0.png',
  '/img/srnote_Path_lined_with_medieval_streetlights_--ar_169_--style_r_911b0898-4ca8-46b3-8fde-5fb64045e01f.png',
  '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_v_a43f734f-ee71-41df-8aef-0e51ad446ede.png'
]

export default function EventDetailPage({ params }: Props) {
  const { id } = usePromise(params)
  const { t, currentLanguage } = useTranslation()
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [isJoined, setIsJoined] = useState(false)
  const [loading, setLoading] = useState(true)
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  // fetch event detail
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`)
        if (!res.ok) {
          // 404 等の場合はイベントなし扱い
          const local = dummyEvents.find(d=>d.id===id)
          if(local){
            setEvent({
              id: local.id,
              title: local.title,
              description: local.description,
              titleKey: local.titleKey,
              descriptionKey: local.descriptionKey,
              date: local.date.toISOString(),
              time: local.time,
              location: local.location,
              locationKey: local.locationKey,
              image: local.image,
              attendees: local.attendees,
              maxAttendees: local.maxAttendees,
              organizer_name: local.creator.name,
              organizer_key: local.creator.nameKey,
              isOnline: local.isOnline,
              price: local.price,
              isFree: local.isFree,
              address: local.isOnline ? undefined : '東京都千代田区丸の内1-1',
              postalCode: local.isOnline ? undefined : '100-0001',
              onlineUrl: local.isOnline ? 'https://example.com/online-event' : undefined
            })
            // ダミーデータでは未参加とする
            setIsJoined(false)
            setImageSrc(local.image)
          } else {
            setEvent(null)
          }
          return
        }
        const data = await res.json()
        setEvent({
          id: data.id,
          title: data.title,
          description: data.description,
          titleKey: data.title_key || '',
          descriptionKey: data.description_key || '',
          date: data.start_date,
          time: `${data.start_time || ''}`,
          location: data.location,
          locationKey: data.location_key || '',
          image: data.image || '/img/default.png',
          attendees: data.attendees || 0,
          maxAttendees: data.max_attendees || 0,
          organizer_name: data.organizer?.username || '',
          organizer_key: data.organizer_key || '',
          isOnline: Boolean(data.is_online),
          price: data.price ?? 0,
          isFree: data.is_free ?? data.price === 0,
          address: data.address || (data.is_online ? undefined : '東京都千代田区丸の内1-1'),
          postalCode: data.postal_code || (data.is_online ? undefined : '100-0001'),
          onlineUrl: data.online_url || (data.is_online ? 'https://example.com/online-event' : undefined)
        })
        // 参加状態を API のレスポンスから判定 (例: user_joined フラグ)
        setIsJoined(Boolean(data.user_joined))
        setImageSrc(data.image || '/img/default.png')
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  const localeMap: Record<Language, string> = {
    ja: 'ja-JP',
    en: 'en-US',
    zh: 'zh-CN',
    ko: 'ko-KR'
  }

  const handleJoin = async () => {
    if (!event) return
    try {
      const res = await fetch(`/api/events/${event.id}/join/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) {
        // 開発環境でエンドポイント未実装の場合は疑似的に成功扱い
        if(res.status !== 404){
          throw new Error()
        }
      }
      alert(t('joinedSuccess'))
      setIsJoined(true)
      // ローカル画面上で参加者数をインクリメント
      setEvent(prev => prev ? { ...prev, attendees: prev.attendees + 1 } : prev)
    } catch {
      alert('Error')
    }
  }

  const handleCancel = async () => {
    if (!event) return
    try {
      const res = await fetch(`/api/events/${event.id}/cancel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) {
        // エンドポイント未実装時は404になるので疑似成功扱い
        if(res.status !== 404){
          throw new Error()
        }
      }
      alert(t('canceledSuccess'))
      setIsJoined(false)
      // ローカル画面上で参加者数をデクリメント
      setEvent(prev => prev ? { ...prev, attendees: Math.max(prev.attendees - 1, 0) } : prev)
    } catch {
      alert('Error')
    }
  }

  if (loading) {
    return <div className="text-center py-20 text-white">Loading...</div>
  }

  if (!event) {
    return <div className="text-center py-20 text-white">{t('notFound')}</div>
  }

  const formattedDate = new Date(event.date).toLocaleDateString(localeMap[currentLanguage] || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <HeaderTemplate />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <h1 className="text-4xl font-bold text-center mb-6">
          <TranslatableText translationKey={event.titleKey} fallbackText={event.title} />
        </h1>

        {/* タイトル下を中央寄せラッパー付き 2 カラムレイアウト */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1300px] mx-auto">

          {/* --- 左カラム：既存コンテンツ --- */}
          <div className="flex flex-col items-center w-full mx-auto lg:col-span-2">
            {/* イメージ & 説明 */}
            <div className="relative w-full h-64 mb-8">
              <Image src={imageSrc ?? event.image} alt={event.title} fill className="object-cover rounded-lg" onError={()=>{
                const random = imagePool[Math.floor(Math.random()*imagePool.length)]
                setImageSrc(random)
              }} />
            </div>
            <p className="mb-6 text-lg text-center">
              <TranslatableText translationKey={event.descriptionKey} fallbackText={event.description} />
            </p>

            {/* 詳細情報＋ボタン＋地図を 600px 幅で中央寄せ */}
            <div className="w-full flex flex-col items-center">
              {/* イベント基本情報 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 text-sm text-white/80 w-full">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{t('participants')}: {event.attendees}/{event.maxAttendees}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{t('organizer')}: {event.organizer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span><TranslatableText translationKey={event.locationKey} fallbackText={event.location} /></span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{currentLanguage === 'ja' ? '料金' : currentLanguage === 'en' ? 'Price' : currentLanguage === 'zh' ? '费用' : '요금'}: {event.isFree || event.price === 0 ? t('free') : `¥${event.price.toLocaleString()}`}</span>
                </div>
                <div className="flex items-center gap-2 col-span-1 sm:col-span-2">
                  <span className="pl-6">{event.isOnline ? event.onlineUrl : `${event.postalCode ?? ''} ${event.address ?? ''}`}</span>
                </div>
              </div>

              {/* 地図＋詳細サイドバーを横並びに */}
              <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
                {/* Google Maps */}
                {!event.isOnline && (
                  <div className="w-[600px] h-[600px] rounded-lg overflow-hidden shadow-lg flex-shrink-0">
                    <iframe
                      title="event-location-map"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed`}
                      width="600"
                      height="600"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}

                {/* 詳細サイドバー */}
                <div className="text-white/90 space-y-4 w-[600px] flex-shrink-0">
                  {/* Action buttons */}
                  <div className="flex gap-4 mb-6 justify-center lg:justify-start">
                    {!isJoined ? (
                      <button onClick={handleJoin} className="px-6 py-3 bg-magic-500 hover:bg-magic-600 rounded-lg font-medium">
                        {t('joinEvent')}
                      </button>
                    ) : (
                      <button onClick={handleCancel} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-medium">
                        {t('cancelParticipation')}
                      </button>
                    )}
                  </div>

                  <h2 className="text-2xl font-semibold mb-2">{t('eventDetails')}</h2>
                  <p>
                    これはダミーのイベント詳細です。ネオンデザインワークショップでは、ネオンチューブの基本的な構造から最新のデジタルネオンサインの作成方法までを学びます。初心者でも安心して参加できるよう、道具の使い方や安全な取り扱いについても丁寧に解説します。
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>ネオンの歴史と基礎知識</li>
                    <li>色彩理論とデザインのコツ</li>
                    <li>実際に光るネオンサインを制作</li>
                    <li>完成作品の鑑賞会 & フィードバック</li>
                  </ul>
                  <p>
                    必要な材料や工具はすべて会場でご用意しておりますので、手ぶらでご参加いただけます。ワークショップ終了後には、ご自身で制作したネオンサインをお持ち帰りいただけます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterTemplate />
    </div>
  )
} 