export interface Group {
  id: number
  name: string
  description: string
  category: string
  isPublic: boolean
  maxMembers: number
  tags: string[]
  image: string | null
  members: number
  lastActivity: string
  createdAt: string
  owner: {
    id: number
    name: string
    avatar: string
  }
}

// ローカルストレージのキー
const GROUPS_STORAGE_KEY = 'eldonia_community_groups'

// 初期サンプルグループデータ
const initialSampleGroups: Group[] = [
  {
    id: 1,
    name: 'ファンタジーイラスト制作部',
    category: 'art',
    description: 'ファンタジー世界のキャラクターや風景を描くイラストレーターのグループ',
    members: 156,
    maxMembers: 200,
    isPublic: true,
    tags: ['ファンタジー', 'イラスト', 'キャラクター'],
    lastActivity: '2時間前',
    image: '/img/srnote_Beautiful_gothic_bookcase_candlelight_medieval_desk_to_0cd8b99d-521c-400b-b6c5-79451622c0bf_0.png',
    createdAt: '2024年1月15日',
    owner: {
      id: 1,
      name: 'イラストマスター',
      avatar: '/img/srnote_cute_cat_full_body_cyberpunk_elf_PhD_fantasy_boy_moon__ffea1def-f8ea-41ee-a4ef-558cae025c19_0.png'
    }
  },
  {
    id: 2,
    name: '魔法の音楽制作チーム',
    category: 'music',
    description: 'ファンタジーRPGのBGMや効果音を制作する音楽家のグループ',
    members: 89,
    maxMembers: 150,
    isPublic: true,
    tags: ['音楽', 'BGM', '効果音'],
    lastActivity: '1時間前',
    image: '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_02ff9b2b-44c9-498c-ab8e-4fdf612b919b_0.png',
    createdAt: '2024年1月10日',
    owner: {
      id: 2,
      name: '音楽マスター',
      avatar: '/img/srnote_Beautiful_gothic_bookcase_candlelight_medieval_desk_to_0cd8b99d-521c-400b-b6c5-79451622c0bf_0.png'
    }
  },
  {
    id: 3,
    name: 'SF小説執筆部',
    category: 'writing',
    description: 'サイエンスフィクション小説を共同執筆する作家のグループ',
    members: 234,
    maxMembers: 300,
    isPublic: true,
    tags: ['小説', 'SF', '執筆'],
    lastActivity: '30分前',
    image: '/img/srnote_Beautiful_Gothic_study_candlelight_medieval_desk_top_t_9dd5cde6-f814-47cf-b600-03eacd16416f_0.png',
    createdAt: '2024年1月8日',
    owner: {
      id: 3,
      name: '小説マスター',
      avatar: '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_02ff9b2b-44c9-498c-ab8e-4fdf612b919b_0.png'
    }
  },
  {
    id: 4,
    name: 'ゲーム開発エンジニア',
    category: 'programming',
    description: 'Unity/Unreal Engineを使ったゲーム開発を行うプログラマーのグループ',
    members: 67,
    maxMembers: 100,
    isPublic: false,
    tags: ['ゲーム開発', 'Unity', 'プログラミング'],
    lastActivity: '3時間前',
    image: '/img/srnote_cute_cat_full_body_cyberpunk_elf_PhD_fantasy_boy_moon__ffea1def-f8ea-41ee-a4ef-558cae025c19_0.png',
    createdAt: '2024年1月5日',
    owner: {
      id: 4,
      name: 'プログラマー',
      avatar: '/img/srnote_Path_lined_with_medieval_streetlights_--ar_169_--style_r_911b0898-4fa8-46b3-8fde-5fb64045e01f.png'
    }
  },
  {
    id: 5,
    name: 'コスプレ写真撮影部',
    category: 'photography',
    description: 'ファンタジー・アニメキャラクターのコスプレ写真を撮影するグループ',
    members: 123,
    maxMembers: 180,
    isPublic: true,
    tags: ['写真', 'コスプレ', '撮影'],
    lastActivity: '5時間前',
    image: '/img/srnote_Path_lined_with_medieval_streetlights_--ar_169_--style_r_911b0898-4fa8-46b3-8fde-5fb64045e01f.png',
    createdAt: '2024年1月3日',
    owner: {
      id: 5,
      name: '写真マスター',
      avatar: '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_v_a43f734f-ee71-41df-8aef-0e51ad446ede.png'
    }
  },
  {
    id: 6,
    name: 'UI/UXデザイン研究会',
    category: 'design',
    description: 'ゲームやアプリのUI/UXデザインを研究・制作するデザイナーのグループ',
    members: 78,
    maxMembers: 120,
    isPublic: true,
    tags: ['デザイン', 'UI/UX', 'ゲーム'],
    lastActivity: '1日前',
    image: '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_v_a43f734f-ee71-41df-8aef-0e51ad446ede.png',
    createdAt: '2024年1月1日',
    owner: {
      id: 6,
      name: 'デザイナー',
      avatar: '/img/srnote_cute_cat_full_body_cyberpunk_elf_PhD_fantasy_boy_moon__ffea1def-f8ea-41ee-a4ef-558cae025c19_0.png'
    }
  },
  {
    id: 7,
    name: 'Gallery作品鑑賞会',
    category: 'gallery',
    description: 'Galleryに投稿された作品を鑑賞し、感想を共有するグループ',
    members: 345,
    maxMembers: 500,
    isPublic: true,
    tags: ['Gallery', '作品鑑賞', '感想共有'],
    lastActivity: '15分前',
    image: '/img/srnote_Beautiful_gothic_bookcase_candlelight_medieval_desk_to_0cd8b99d-521c-400b-b6c5-79451622c0bf_0.png',
    createdAt: '2024年1月12日',
    owner: {
      id: 7,
      name: 'Galleryマスター',
      avatar: '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_02ff9b2b-44c9-498c-ab8e-4fdf612b919b_0.png'
    }
  },
  {
    id: 8,
    name: 'Gallery作品制作支援',
    category: 'gallery',
    description: 'Galleryに投稿する作品の制作を支援し合うグループ',
    members: 189,
    maxMembers: 250,
    isPublic: true,
    tags: ['Gallery', '作品制作', '支援'],
    lastActivity: '45分前',
    image: '/img/srnote_Beautiful_and_impressive_night_views_star-filled_skies_02ff9b2b-44c9-498c-ab8e-4fdf612b919b_0.png',
    createdAt: '2024年1月14日',
    owner: {
      id: 8,
      name: '制作支援マスター',
      avatar: '/img/srnote_Beautiful_Gothic_study_candlelight_medieval_desk_top_t_9dd5cde6-f814-47cf-b600-03eacd16416f_0.png'
    }
  }
]

// グループデータを取得
export const getGroups = (): Group[] => {
  if (typeof window === 'undefined') {
    return initialSampleGroups
  }

  try {
    const stored = localStorage.getItem(GROUPS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    } else {
      // 初回アクセス時は初期データを保存
      localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(initialSampleGroups))
      return initialSampleGroups
    }
  } catch (error) {
    console.error('Failed to load groups from localStorage:', error)
    return initialSampleGroups
  }
}

// グループデータを保存
export const saveGroups = (groups: Group[]): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups))
  } catch (error) {
    console.error('Failed to save groups to localStorage:', error)
  }
}

// 新しいグループを作成
export const createGroup = (groupData: Omit<Group, 'id' | 'members' | 'lastActivity' | 'createdAt' | 'owner'>): Group => {
  const groups = getGroups()
  const newId = Math.max(...groups.map(g => g.id)) + 1
  const now = new Date()

  const newGroup: Group = {
    ...groupData,
    id: newId,
    members: 1, // 作成者は自動的にメンバーになる
    lastActivity: '今',
    createdAt: now.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    owner: {
      id: 1, // 仮のユーザーID
      name: 'あなた', // 仮のユーザー名
      avatar: '/img/srnote_cute_cat_full_body_cyberpunk_elf_PhD_fantasy_boy_moon__ffea1def-f8ea-41ee-a4ef-558cae025c19_0.png'
    }
  }

  groups.unshift(newGroup) // 新しいグループを先頭に追加
  saveGroups(groups)

  return newGroup
}

// 特定のグループを取得
export const getGroupById = (id: number): Group | undefined => {
  const groups = getGroups()
  return groups.find(group => group.id === id)
}

// グループを更新
export const updateGroup = (id: number, updates: Partial<Group>): Group | null => {
  const groups = getGroups()
  const index = groups.findIndex(group => group.id === id)

  if (index === -1) return null

  groups[index] = { ...groups[index], ...updates }
  saveGroups(groups)

  return groups[index]
}

// グループを削除
export const deleteGroup = (id: number): boolean => {
  const groups = getGroups()
  const filteredGroups = groups.filter(group => group.id !== id)

  if (filteredGroups.length === groups.length) {
    return false // グループが見つからなかった
  }

  saveGroups(filteredGroups)
  return true
}
