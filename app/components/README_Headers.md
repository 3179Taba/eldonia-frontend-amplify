# ヘッダーコンポーネント使用ガイド

## 概要
統一されたスタイルのヘッダーを簡単に実装できるコンポーネントを提供しています。

## コンポーネント一覧

### 1. GalleryHeader
ギャラリーページ専用のヘッダーコンポーネント

```tsx
import GalleryHeader from '../components/GalleryHeader'

<GalleryHeader 
  title="CREATIVE GALLERY"
  subtitle="DIGITAL ARTWORK"
  showIcon={true}
/>
```

**Props:**
- `title`: メインタイトル（デフォルト: "CREATIVE GALLERY"）
- `subtitle`: サブタイトル（デフォルト: "DIGITAL ARTWORK"）
- `showIcon`: アイコン表示の有無（デフォルト: true）
- `className`: 追加のCSSクラス

### 2. PageHeader
汎用的なページヘッダーコンポーネント

```tsx
import PageHeader from '../components/PageHeader'
import { Music, Video, Book } from 'lucide-react'

// 基本的な使用
<PageHeader 
  title="MUSIC COLLECTION"
  subtitle="DISCOVER NEW SOUNDS"
/>

// カスタムアイコン付き
<PageHeader 
  title="VIDEO GALLERY"
  subtitle="AMAZING VISUALS"
  icon={Video}
  iconGradient="bg-gradient-to-br from-blue-500 to-purple-600"
/>

// 絵文字アイコン
<PageHeader 
  title="NOVEL LIBRARY"
  subtitle="FANTASY STORIES"
  iconEmoji="📚"
  showIcon={true}
/>
```

**Props:**
- `title`: メインタイトル（必須）
- `subtitle`: サブタイトル（オプション）
- `icon`: Lucideアイコンコンポーネント
- `iconEmoji`: 絵文字アイコン（iconと併用不可）
- `showIcon`: アイコン表示の有無（デフォルト: true）
- `className`: 追加のCSSクラス
- `titleClassName`: タイトルのCSSクラス
- `subtitleClassName`: サブタイトルのCSSクラス
- `backgroundGradient`: 背景グラデーション
- `iconGradient`: アイコンのグラデーション

## スタイルの特徴

### フォント
- **メインタイトル**: Bebas Neue（太字、グラデーションテキスト）
- **サブタイトル**: Cormorant Garamond（イタリック、ゴールド）

### カラーパレット
- **背景**: ダークグレー（半透明、ブラー効果）
- **タイトル**: アンバー→イエロー→オレンジのグラデーション
- **サブタイトル**: アンバー
- **アイコン**: 紫→シアンのグラデーション

### レイアウト
- レスポンシブデザイン
- アイコンとテキストの横並び
- 装飾的な区切り線
- スパークルアイコン付き

## 使用例

### コミュニティページ
```tsx
<PageHeader 
  title="COMMUNITY"
  subtitle="CONNECT & SHARE"
  icon={Users}
  iconGradient="bg-gradient-to-br from-green-500 to-blue-600"
/>
```

### イベントページ
```tsx
<PageHeader 
  title="EVENTS"
  subtitle="JOIN THE EXCITEMENT"
  icon={Calendar}
  iconEmoji="🎉"
/>
```

### 設定ページ
```tsx
<PageHeader 
  title="SETTINGS"
  subtitle="CUSTOMIZE YOUR EXPERIENCE"
  icon={Settings}
  iconGradient="bg-gradient-to-br from-gray-500 to-gray-700"
/>
```

## カスタマイズ

### カスタムスタイル
```tsx
<PageHeader 
  title="CUSTOM PAGE"
  subtitle="UNIQUE STYLE"
  titleClassName="text-6xl font-bold text-blue-400"
  subtitleClassName="text-blue-300 font-mono"
  backgroundGradient="bg-gradient-to-r from-blue-900/80 to-purple-900/80"
/>
```

### アイコンなし
```tsx
<PageHeader 
  title="MINIMAL HEADER"
  subtitle="CLEAN DESIGN"
  showIcon={false}
/>
```

## 注意事項
- フォントは`layout.tsx`で読み込まれている必要があります
- 多言語対応は`TranslatableText`コンポーネントを使用
- レスポンシブデザインはTailwind CSSクラスで実装 