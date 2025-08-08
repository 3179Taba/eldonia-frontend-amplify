export type UserLevel = 'general' | 'super' | 'business';

export interface UserLevelInfo {
  level: UserLevel;
  name: string;
  description: string;
  canPost: boolean;
  canAccessAdmin: boolean;
}

export const USER_LEVELS: Record<UserLevel, UserLevelInfo> = {
  general: {
    level: 'general',
    name: '一般ユーザー',
    description: '基本的な機能を利用できます',
    canPost: true,
    canAccessAdmin: false
  },
  super: {
    level: 'super',
    name: 'スーパーユーザー',
    description: '管理者権限を持つユーザー',
    canPost: true,
    canAccessAdmin: true
  },
  business: {
    level: 'business',
    name: 'ビジネスユーザー',
    description: 'ビジネス向けの高度な機能を利用できます',
    canPost: true,
    canAccessAdmin: false
  }
};

export function getUserLevel(user: any): UserLevel {
  if (!user) return 'general';
  
  // is_staffがtrueの場合はスーパーユーザー
  if (user.profile?.is_staff || user.is_staff) {
    return 'super';
  }
  
  // is_premiumがtrueの場合はビジネスユーザー
  if (user.profile?.is_premium) {
    return 'business';
  }
  
  return 'general';
}

export function getUserLevelInfo(user: any): UserLevelInfo {
  const level = getUserLevel(user);
  return USER_LEVELS[level];
}

export function canUserPost(user: any): boolean {
  const levelInfo = getUserLevelInfo(user);
  return levelInfo.canPost;
}

export function canUserAccessAdmin(user: any): boolean {
  const levelInfo = getUserLevelInfo(user);
  return levelInfo.canAccessAdmin;
} 