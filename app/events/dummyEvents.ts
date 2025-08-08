export interface EventDummy {
  id: string
  title: string
  description: string
  titleKey: string
  descriptionKey: string
  date: Date
  time: string
  location: string
  locationKey: string
  category: 'art' | 'music' | 'gaming' | 'technology' | 'education' | 'social'
  creator: {
    id: string
    name: string
    avatar: string
    nameKey: string
  }
  image: string
  attendees: number
  maxAttendees: number
  price: number
  isFree: boolean
  isOnline: boolean
  isFeatured: boolean
  tags: string[]
  status: 'upcoming' | 'ongoing' | 'completed'
}

const eventImages = [
  '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_02ff9b2b-44c9-498c-ab8e-4fdf612b919b_0.png',
  '/img/srnote_Beautiful_gothic_bookcase_candlelight_medieval_desk_to_0cd8b99d-521c-400b-b6c5-79451622c0bf_0.png',
  '/img/srnote_Beautiful_Gothic_study_candlelight_medieval_desk_top_t_9dd5cde6-f814-47cf-b600-03eacd16416f_0.png',
  '/img/srnote_cute_cat_full_body_cyberpunk_elf_PhD_fantasy_boy_moon__ffea1def-f8ea-41ee-a4ef-558cae025c19_0.png',
  '/img/srnote_Path_lined_with_medieval_streetlights_--ar_169_--style_r_911b0898-4fa8-46b3-8fde-5fb64045e01f.png',
  '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_v_a43f734f-ee71-41df-8aef-0e51ad446ede.png',
]

export const dummyEvents: EventDummy[] = [
  {
    id: '1',
    title: 'ファンタジーアート展覧会',
    description: '最新のファンタジーアート作品を展示する特別展覧会。AI生成アートと伝統的なアートの融合をお楽しみください。',
    titleKey: 'fantasyArtExhibition',
    descriptionKey: 'fantasyArtExhibitionDescription',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    time: '10:00 - 18:00',
    location: '東京アートギャラリー',
    locationKey: 'tokyoArtGallery',
    category: 'art',
    creator: {
      id: 'creator1',
      name: 'ファンタジーアート',
      avatar: '/images/avatars/creator1.jpg',
      nameKey: 'fantasyArtCreator'
    },
    image: eventImages[1],
    attendees: 45,
    maxAttendees: 100,
    price: 1500,
    isFree: false,
    isOnline: false,
    isFeatured: true,
    tags: ['fantasy', 'art', 'ai', 'exhibition'],
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'コスミックデザインライブ配信',
    description: 'リアルタイムでコスミックデザインの制作過程をお見せします。質問も受け付けます！',
    titleKey: 'cosmicDesignLiveStreaming',
    descriptionKey: 'cosmicDesignLiveStreamingDescription',
    date: new Date(Date.now() + 1000 * 60 * 60 * 2),
    time: '20:00 - 22:00',
    location: 'オンライン',
    locationKey: 'online',
    category: 'technology',
    creator: {
      id: 'creator2',
      name: 'コスミックデザイン',
      avatar: '/images/avatars/creator2.jpg',
      nameKey: 'cosmicDesignCreator'
    },
    image: eventImages[0],
    attendees: 120,
    maxAttendees: 500,
    price: 0,
    isFree: true,
    isOnline: true,
    isFeatured: true,
    tags: ['live', 'design', 'cosmic', 'realtime'],
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'ネオンデザインワークショップ',
    description: 'ネオンデザインの技法を学ぶワークショップ。初心者でも参加できます。',
    titleKey: 'neonDesignWorkshop',
    descriptionKey: 'neonDesignWorkshopDescription',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    time: '14:00 - 17:00',
    location: 'デジタルアートスタジオ',
    locationKey: 'digitalArtStudio',
    category: 'education',
    creator: {
      id: 'creator3',
      name: 'ネオンデザイン',
      avatar: '/images/avatars/creator3.jpg',
      nameKey: 'neonDesignCreator'
    },
    image: eventImages[2],
    attendees: 15,
    maxAttendees: 20,
    price: 3000,
    isFree: false,
    isOnline: false,
    isFeatured: false,
    tags: ['workshop', 'neon', 'design', 'learning'],
    status: 'upcoming'
  },
  // ... (remaining items abbreviated for brevity)
] 