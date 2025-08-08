'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Upload, X, ImageIcon, Package, Mail, Truck, Calculator } from 'lucide-react'
import { useAuth } from '../../../../lib/auth-context'

interface ProductData {
  id: string
  category: string
  name: string
  description: string
  price: number
  stock: number
  mainImage: File | null
  subImages: File[]
  status: 'draft' | 'active' | 'inactive'
  is_featured: boolean
  // 拡張フィールド（データベースにないが、UIで使用）
  subCategory?: string
  productSize?: 'small' | 'medium' | 'large' | 'extra_large' | 'mail'
  productMaterial?: string
  productColor?: string
  shippingCarrier?: string
  shippingDays?: string
  shippingCostType?: 'free' | 'fixed' | 'calculated'
  shippingCost?: string
  shippingRegion?: 'local' | 'remote' | 'prefecture'
  shippingPrefecture?: string // 都道府県選択（単一選択）
  // 出品元地域
  originRegion?: 'local' | 'remote' | 'prefecture'
  originPrefecture?: string // 出品元都道府県選択（単一選択）
  salesNotificationEmail?: string
  emailNotification?: boolean
  smsNotification?: boolean
}

export default function ProductDetailsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const auth = useAuth()
  const user = auth?.user || null
  const token = auth?.token || null

  const generateProductId = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `PROD_${timestamp}_${random}`
  }

  const [productData, setProductData] = useState<ProductData>({
    id: generateProductId(),
    category: searchParams.get('category') || '',
    name: searchParams.get('name') || '',
    description: searchParams.get('description') || '',
    price: Number(searchParams.get('price')) || 0,
    stock: 1,
    mainImage: null,
    subImages: [],
    status: 'active',
    is_featured: false,
    subCategory: searchParams.get('subCategory') || ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorDisplay, setCalculatorDisplay] = useState('0')
  const [calculatorHistory, setCalculatorHistory] = useState<string[]>([])

  // artカテゴリーが選択されているがサブカテゴリーが選択されていない場合、artサブカテゴリー選択ページにリダイレクト
  useEffect(() => {
    console.log('ProductData state:', { category: productData.category, subCategory: productData.subCategory })
    if (productData.category === 'art' && !productData.subCategory) {
      console.log('Redirecting to art subcategory selection page')
      router.push('/settings/products/create/art?category=art')
    }
  }, [productData.category, productData.subCategory, router])

  // 都道府県データ
  const prefectures = {
    hokkaido: { name: '北海道', region: 'hokkaido' },
    aomori: { name: '青森県', region: 'tohoku' },
    iwate: { name: '岩手県', region: 'tohoku' },
    miyagi: { name: '宮城県', region: 'tohoku' },
    akita: { name: '秋田県', region: 'tohoku' },
    yamagata: { name: '山形県', region: 'tohoku' },
    fukushima: { name: '福島県', region: 'tohoku' },
    ibaraki: { name: '茨城県', region: 'kanto' },
    tochigi: { name: '栃木県', region: 'kanto' },
    gunma: { name: '群馬県', region: 'kanto' },
    saitama: { name: '埼玉県', region: 'kanto' },
    chiba: { name: '千葉県', region: 'kanto' },
    tokyo: { name: '東京都', region: 'kanto' },
    kanagawa: { name: '神奈川県', region: 'kanto' },
    niigata: { name: '新潟県', region: 'chubu' },
    toyama: { name: '富山県', region: 'chubu' },
    ishikawa: { name: '石川県', region: 'chubu' },
    fukui: { name: '福井県', region: 'chubu' },
    yamanashi: { name: '山梨県', region: 'chubu' },
    nagano: { name: '長野県', region: 'chubu' },
    gifu: { name: '岐阜県', region: 'chubu' },
    shizuoka: { name: '静岡県', region: 'chubu' },
    aichi: { name: '愛知県', region: 'chubu' },
    mie: { name: '三重県', region: 'kinki' },
    shiga: { name: '滋賀県', region: 'kinki' },
    kyoto: { name: '京都府', region: 'kinki' },
    osaka: { name: '大阪府', region: 'kinki' },
    hyogo: { name: '兵庫県', region: 'kinki' },
    nara: { name: '奈良県', region: 'kinki' },
    wakayama: { name: '和歌山県', region: 'kinki' },
    tottori: { name: '鳥取県', region: 'chugoku' },
    shimane: { name: '島根県', region: 'chugoku' },
    okayama: { name: '岡山県', region: 'chugoku' },
    hiroshima: { name: '広島県', region: 'chugoku' },
    yamaguchi: { name: '山口県', region: 'chugoku' },
    tokushima: { name: '徳島県', region: 'shikoku' },
    kagawa: { name: '香川県', region: 'shikoku' },
    ehime: { name: '愛媛県', region: 'shikoku' },
    kochi: { name: '高知県', region: 'shikoku' },
    fukuoka: { name: '福岡県', region: 'kyushu' },
    saga: { name: '佐賀県', region: 'kyushu' },
    nagasaki: { name: '長崎県', region: 'kyushu' },
    kumamoto: { name: '熊本県', region: 'kyushu' },
    oita: { name: '大分県', region: 'kyushu' },
    miyazaki: { name: '宮崎県', region: 'kyushu' },
    kagoshima: { name: '鹿児島県', region: 'kyushu' },
    okinawa: { name: '沖縄県', region: 'okinawa' }
  }

  // 地域別料金設定（都道府県別）
  const prefectureShippingRates = {
    hokkaido: { base: 1200, remote: 1800 },
    tohoku: { base: 1000, remote: 1500 },
    kanto: { base: 800, remote: 1200 },
    chubu: { base: 900, remote: 1400 },
    kinki: { base: 850, remote: 1300 },
    chugoku: { base: 950, remote: 1450 },
    shikoku: { base: 1000, remote: 1500 },
    kyushu: { base: 1100, remote: 1600 },
    okinawa: { base: 1500, remote: 2200 }
  }

  // 都道府県選択ハンドラー（単一選択）
  const handlePrefectureChange = (prefectureKey: string) => {
    setProductData(prev => ({
      ...prev,
      shippingPrefecture: prefectureKey
    }))
    // 都道府県が変更されたら自動計算
    if (productData.shippingCarrier && productData.productSize) {
      setTimeout(() => autoCalculateShipping(), 100)
    }
  }

  // 地域別選択ハンドラー（単一選択）
  const handleSelectRegion = (region: string) => {
    const regionPrefectures = Object.keys(prefectures).filter(key =>
      prefectures[key as keyof typeof prefectures].region === region
    )

    if (regionPrefectures.length > 0) {
      // 地域の最初の都道府県を選択
      setProductData(prev => ({
        ...prev,
        shippingPrefecture: regionPrefectures[0]
      }))
      // 都道府県が変更されたら自動計算
      if (productData.shippingCarrier && productData.productSize) {
        setTimeout(() => autoCalculateShipping(), 100)
      }
    }
  }

  // 出品元都道府県変更ハンドラー（単一選択）
  const handleOriginPrefectureChange = (prefectureKey: string) => {
    setProductData(prev => ({
      ...prev,
      originPrefecture: prefectureKey
    }))
  }

  // 出品元地域別選択ハンドラー（単一選択）
  const handleSelectOriginRegion = (region: string) => {
    const regionPrefectures = Object.keys(prefectures).filter(key =>
      prefectures[key as keyof typeof prefectures].region === region
    )

    if (regionPrefectures.length > 0) {
      // 地域の最初の都道府県を選択
      setProductData(prev => ({
        ...prev,
        originPrefecture: regionPrefectures[0]
      }))
    }
  }

  // 初期化時にURLパラメータからデータを復元
  useEffect(() => {
    const category = searchParams.get('category')
    const subCategory = searchParams.get('subCategory')
    const name = searchParams.get('name')
    const price = Number(searchParams.get('price')) || 0
    const description = searchParams.get('description')

    if (category || subCategory || name || price > 0 || description) {
      setProductData(prev => ({
        ...prev,
        category: category || prev.category,
        subCategory: subCategory || prev.subCategory,
        name: name || prev.name,
        price: price || prev.price,
        description: description || prev.description
      }))
    }
  }, [searchParams])

  // カテゴリー名を取得（データベースのCATEGORY_CHOICESに基づく）
  const getCategoryName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'art': 'アート・イラスト',
      'music': '音楽・音声',
      'video': '動画・映像',
      'text': 'テキスト・小説',
      'code': 'コード・プログラム',
      'goods': '物品',
      'other': 'その他'
    }
    return categoryMap[category] || category
  }

  // サブカテゴリー名を取得
  const getSubCategoryName = (subCategory: string) => {
    const subCategoryMap: { [key: string]: string } = {
      'illustration': 'イラスト',
      'digital_art': 'デジタルアート',
      'painting': '絵画',
      'photography': '写真',
      'sculpture': '彫刻',
      'design': 'デザイン',
      'comic': '漫画',
      'animation': 'アニメーション',
      'other_art': 'その他アート',
      'software': 'ソフトウェア',
      'ebook': '電子書籍',
      'music': '音楽',
      'video': '動画',
      'clothing': '衣類',
      'accessories': 'アクセサリー',
      'home': 'ホーム用品',
      'food': '食品',
      'consulting': 'コンサルティング',
      'tutoring': '指導・教育',
      'maintenance': 'メンテナンス',
      'event': 'イベント',
      'other': 'その他'
    }
    return subCategoryMap[subCategory] || subCategory
  }

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        console.log('一時保存:', productData)
        alert('一時保存しました')
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        if (!isSubmitting && productData.name.trim() && productData.price > 0) {
          handleSubmit()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [productData, isSubmitting, handleSubmit])

  // 画像バリデーション
  const validateImage = (file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      return '画像ファイル（JPEG、PNG、GIF、WebP）のみアップロード可能です'
    }

    if (file.size > maxSize) {
      return '画像サイズは10MB以下にしてください'
    }

    return null
  }

  // バリデーション（データベースの必須フィールドに基づく）
  const getValidationErrors = () => {
    const errors: string[] = []

    if (!productData.name.trim()) {
      errors.push('商品名は必須です')
    }
    if (productData.price <= 0) {
      errors.push('価格は0円より大きい値を入力してください')
    }
    if (productData.stock <= 0) {
      errors.push('在庫数は1個以上を入力してください')
    }
    if (!productData.description.trim()) {
      errors.push('商品説明は必須です')
    }
    if (!productData.mainImage) {
      errors.push('メイン画像は必須です')
    } else {
      const mainImageError = validateImage(productData.mainImage)
      if (mainImageError) {
        errors.push(`メイン画像: ${mainImageError}`)
      }
    }

    productData.subImages.forEach((file, index) => {
      const subImageError = validateImage(file)
      if (subImageError) {
        errors.push(`サブ画像${index + 1}: ${subImageError}`)
      }
    })

    if (!isDigitalProduct()) {
      if (!productData.shippingCarrier) {
        errors.push('配送業者を選択してください')
      }
      if (!productData.productSize) {
        errors.push('商品サイズを選択してください')
      }
      if (!productData.productMaterial?.trim()) {
        errors.push('商品素材を入力してください')
      }
    }

    return errors
  }

  // デジタル商品判定（データベースのカテゴリーに基づく）
  const isDigitalProduct = () => {
    return ['art', 'music', 'video', 'text', 'code'].includes(productData.category)
  }

  // 進行状況の計算
  const calculateProgress = () => {
    let completed = 0
    const total = isDigitalProduct() ? 5 : 8

    if (productData.category) completed++
    if (productData.name.trim()) completed++
    if (productData.price > 0) completed++
    if (productData.stock > 0) completed++
    if (productData.mainImage) completed++
    if (productData.description.trim()) completed++

    if (!isDigitalProduct()) {
      if (productData.shippingCarrier) completed++
      if (productData.productSize) completed++
      if (productData.productMaterial?.trim()) completed++
    }

    return Math.round((completed / total) * 100)
  }

  // 手数料計算（固定10%）
  const calculateCommission = (price: number) => Math.round(price * 0.1)
  const calculateProfit = (price: number) => price - calculateCommission(price)

  // 手数料率を自動設定（物品5％・デジタル10％）
  const setCommissionRateByCategory = () => {
    // 手数料率は固定10%に設定
    console.log('Commission rate is fixed at 10%')
  }

  // 電卓の価格を反映
  const applyCalculatorToPrice = () => {
    const calculatedValue = parseFloat(calculatorDisplay)
    if (!isNaN(calculatedValue) && calculatedValue >= 0) {
      handleInputChange('price', calculatedValue)
      setShowCalculator(false)
    }
  }

  // 電卓の送料を反映
  const applyCalculatorToShipping = () => {
    const calculatedValue = parseFloat(calculatorDisplay)
    if (!isNaN(calculatedValue) && calculatedValue >= 0) {
      handleInputChange('shippingCost', calculatedValue.toString())
      setShowCalculator(false)
    }
  }

  // 配送業者別料金計算システム
  const shippingRates = {
    yamato: {
      name: 'ヤマト運輸',
      rates: {
        small: { base: 800, remote: 1200 },
        medium: { base: 1000, remote: 1500 },
        large: { base: 1200, remote: 1800 },
        extra_large: { base: 1500, remote: 2200 },
        mail: { base: 300, remote: 500 }
      }
    },
    sagawa: {
      name: '佐川急便',
      rates: {
        small: { base: 750, remote: 1100 },
        medium: { base: 950, remote: 1400 },
        large: { base: 1150, remote: 1700 },
        extra_large: { base: 1450, remote: 2100 },
        mail: { base: 280, remote: 480 }
      }
    },
    japanpost: {
      name: '日本郵便',
      rates: {
        small: { base: 600, remote: 900 },
        medium: { base: 800, remote: 1200 },
        large: { base: 1000, remote: 1500 },
        extra_large: { base: 1300, remote: 1900 },
        mail: { base: 250, remote: 450 }
      }
    },
    fedex: {
      name: 'FedEx',
      rates: {
        small: { base: 1500, remote: 2000 },
        medium: { base: 1800, remote: 2400 },
        large: { base: 2200, remote: 2800 },
        extra_large: { base: 2800, remote: 3500 },
        mail: { base: 800, remote: 1200 }
      }
    },
    dhl: {
      name: 'DHL',
      rates: {
        small: { base: 1600, remote: 2100 },
        medium: { base: 1900, remote: 2500 },
        large: { base: 2300, remote: 2900 },
        extra_large: { base: 2900, remote: 3600 },
        mail: { base: 900, remote: 1300 }
      }
    }
  }

  // 配送料を自動計算
  const calculateShippingCost = () => {
    if (!productData.shippingCarrier || !productData.productSize) {
      return 0
    }

    const carrier = shippingRates[productData.shippingCarrier as keyof typeof shippingRates]
    if (!carrier) return 0

    const size = productData.productSize as keyof typeof carrier.rates
    if (!carrier.rates[size]) return 0

    // 都道府県別の料金計算（単一選択）
    if (productData.shippingRegion === 'prefecture' && productData.shippingPrefecture) {
      const prefecture = prefectures[productData.shippingPrefecture as keyof typeof prefectures]
      if (prefecture) {
        const regionRates = prefectureShippingRates[prefecture.region as keyof typeof prefectureShippingRates]
        if (regionRates) {
          // 地域別の料金を直接使用（業者の料金は含まれている）
          return regionRates.base
        }
      }
    }

    // 従来の地域区分による計算
    const isRemote = productData.shippingRegion === 'remote'
    return isRemote ? carrier.rates[size].remote : carrier.rates[size].base
  }

  // 配送料を自動設定
  const autoCalculateShipping = () => {
    const calculatedCost = calculateShippingCost()
    if (calculatedCost > 0) {
      handleInputChange('shippingCost', calculatedCost.toString())
    }
  }

  // 電卓をクリア
  const clearCalculator = () => {
    setCalculatorDisplay('0')
    setCalculatorHistory([])
  }

  // 電卓を閉じる
  const closeCalculator = () => {
    setShowCalculator(false)
    setCalculatorDisplay('0')
    setCalculatorHistory([])
  }

  // キーボードイベントハンドラー
  useEffect(() => {
    const handleCalculatorKeyDown = (e: KeyboardEvent) => {
      if (!showCalculator) return

      // ESCキーで電卓を閉じる
      if (e.key === 'Escape') {
        e.preventDefault()
        closeCalculator()
        return
      }

      // Enterキーで計算実行
      if (e.key === 'Enter') {
        e.preventDefault()
        try {
          const result = eval(calculatorDisplay)
          const historyEntry = `${calculatorDisplay} = ${result}`
          setCalculatorHistory(prev => [...prev, historyEntry])
          setCalculatorDisplay(result.toString())
        } catch (error) {
          setCalculatorDisplay('Error')
        }
        return
      }

      // 数字キー
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault()
        if (calculatorDisplay === '0') {
          setCalculatorDisplay(e.key)
        } else {
          setCalculatorDisplay(calculatorDisplay + e.key)
        }
        return
      }

      // 演算子キー
      if (['+', '-', '*', '/', '.'].includes(e.key)) {
        e.preventDefault()
        setCalculatorDisplay(calculatorDisplay + e.key)
        return
      }

      // バックスペースキー
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (calculatorDisplay.length > 1) {
          setCalculatorDisplay(calculatorDisplay.slice(0, -1))
        } else {
          setCalculatorDisplay('0')
        }
        return
      }

      // Cキーでクリア
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault()
        clearCalculator()
        return
      }
    }

    if (showCalculator) {
      document.addEventListener('keydown', handleCalculatorKeyDown)
      return () => document.removeEventListener('keydown', handleCalculatorKeyDown)
    }
  }, [showCalculator, calculatorDisplay])

  // フォーム送信
  const handleSubmit = async () => {
    const errors = getValidationErrors()
    if (errors.length > 0) {
      alert(`エラーがあります:\n${errors.join('\n')}`)
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()

      // 基本データを追加（imagesフィールドは除外）
      Object.entries(productData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'mainImage' && key !== 'subImages' && key !== 'images') {
          if (Array.isArray(value)) {
            value.forEach(item => formDataToSend.append(key, item))
          } else {
            // statusフィールドの修正（publishedをactiveに変更）
            if (key === 'status' && value === 'published') {
              formDataToSend.append(key, 'active')
            } else {
              formDataToSend.append(key, String(value))
            }
          }
        }
      })

      // 画像を追加
      if (productData.mainImage) {
        formDataToSend.append('mainImage', productData.mainImage)
      }

      productData.subImages.forEach((image, index) => {
        formDataToSend.append('subImages', image)
      })

      const response = await fetch('/api/backend/products/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      })

      if (response.ok) {
        const result = await response.json()
        alert('商品を投稿しました')
        router.push('/settings/products')
      } else {
        const errorData = await response.json()
        console.error('商品投稿エラー詳細:', errorData)
        alert(`商品の投稿に失敗しました: ${errorData.error || JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error('商品投稿エラー:', error)
      alert('商品の投稿中にエラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 入力ハンドラー
  const handleInputChange = (field: keyof ProductData, value: any) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // メイン画像ハンドラー
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const error = validateImage(file)
      if (error) {
        alert(error)
        return
      }
      handleInputChange('mainImage', file)
    }
  }

  // サブ画像ハンドラー
  const handleSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const errors: string[] = []

      files.forEach((file, index) => {
        const error = validateImage(file)
        if (error) {
          errors.push(`サブ画像${index + 1}: ${error}`)
        }
      })

      if (errors.length > 0) {
        alert(`エラーがあります:\n${errors.join('\n')}`)
        return
      }

      handleInputChange('subImages', files)
    }
  }

  // サブ画像削除
  const removeSubImage = (index: number) => {
    setProductData(prev => ({
      ...prev,
      subImages: prev.subImages.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>
          <h1 className="text-3xl font-bold">商品投稿</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="電卓"
            >
              <Calculator className="w-5 h-5" />
            </button>
            <div className="text-sm text-white/70">
              進行状況: {calculateProgress()}%
            </div>
          </div>
        </div>

        {/* 電卓 */}
        {showCalculator && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-lg rounded-xl p-6 z-50">
            <div className="bg-black/50 rounded-lg p-4 w-80">
              {/* 計算履歴 */}
              {calculatorHistory.length > 0 && (
                <div className="mb-2 p-2 bg-white/10 rounded text-xs text-white/70 max-h-16 overflow-y-auto">
                  {calculatorHistory.slice(-3).map((history, index) => (
                    <div key={index} className="text-right">{history}</div>
                  ))}
                </div>
              )}

              {/* ディスプレイ */}
              <div className="text-right text-2xl font-mono mb-4 text-white bg-white/10 p-3 rounded">
                {calculatorDisplay}
              </div>

              {/* 機能ボタン */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                <button
                  onClick={clearCalculator}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded text-white text-sm"
                  title="クリア (C)"
                >
                  C
                </button>
                <button
                  onClick={() => setCommissionRateByCategory()}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm col-span-2"
                >
                  {isDigitalProduct() ? 'デジタル10%' : '物品5%'}
                </button>
                <button
                  onClick={closeCalculator}
                  className="p-2 bg-gray-500 hover:bg-gray-600 rounded text-white text-sm"
                  title="閉じる (ESC)"
                >
                  ×
                </button>
              </div>

              {/* 数字・演算子ボタン */}
              <div className="grid grid-cols-4 gap-2 mb-2">
                {['7', '8', '9', '+', '4', '5', '6', '-', '1', '2', '3', '*', '0', '.', '=', '/'].map((btn) => (
                  <button
                    key={btn}
                    onClick={() => {
                      if (btn === '=') {
                        try {
                          const result = eval(calculatorDisplay)
                          const historyEntry = `${calculatorDisplay} = ${result}`
                          setCalculatorHistory(prev => [...prev, historyEntry])
                          setCalculatorDisplay(result.toString())
                        } catch (error) {
                          setCalculatorDisplay('Error')
                        }
                      } else {
                        if (calculatorDisplay === '0' && btn !== '.') {
                          setCalculatorDisplay(btn)
                        } else {
                          setCalculatorDisplay(calculatorDisplay + btn)
                        }
                      }
                    }}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded text-white"
                  >
                    {btn}
                  </button>
                ))}
              </div>

              {/* 反映ボタン */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={applyCalculatorToPrice}
                  className="p-2 bg-green-500 hover:bg-green-600 rounded text-white text-sm"
                  title="価格に反映 (Enter)"
                >
                  価格に反映
                </button>
                <button
                  onClick={applyCalculatorToShipping}
                  className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded text-white text-sm"
                  title="送料に反映"
                >
                  送料に反映
                </button>
              </div>

              {/* キーボードショートカットヘルプ */}
              <div className="mt-2 text-xs text-white/50 text-center">
                ESC: 閉じる | Enter: 計算 | C: クリア | Backspace: 削除
              </div>
            </div>
          </div>
        )}

        {/* フォーム */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="max-w-7xl mx-auto">
          {/* 上段：基本情報・画像・通知設定の横並び */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* 左：基本情報 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" />
                基本情報
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    カテゴリ *
                  </label>
                  <select
                    value={productData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                  >
                    <option value="">カテゴリを選択</option>
                    <option value="art">アート・イラスト</option>
                    <option value="music">音楽・音声</option>
                    <option value="video">動画・映像</option>
                    <option value="text">テキスト・小説</option>
                    <option value="code">コード・プログラム</option>
                    <option value="goods">物品</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    サブカテゴリ
                  </label>
                  <select
                    value={productData.subCategory}
                    onChange={(e) => handleInputChange('subCategory', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                  >
                    <option value="">サブカテゴリを選択</option>
                    {productData.category === 'art' && (
                      <>
                        <option value="illustration">イラスト</option>
                        <option value="digital_art">デジタルアート</option>
                        <option value="painting">絵画</option>
                        <option value="photography">写真</option>
                        <option value="sculpture">彫刻</option>
                        <option value="design">デザイン</option>
                        <option value="comic">漫画</option>
                        <option value="animation">アニメーション</option>
                        <option value="other_art">その他アート</option>
                      </>
                    )}
                    {productData.category === 'music' && (
                      <>
                        <option value="original">オリジナル</option>
                        <option value="cover">カバー</option>
                        <option value="remix">リミックス</option>
                        <option value="soundtrack">サウンドトラック</option>
                      </>
                    )}
                    {productData.category === 'video' && (
                      <>
                        <option value="short">ショート動画</option>
                        <option value="long">ロング動画</option>
                        <option value="tutorial">チュートリアル</option>
                        <option value="entertainment">エンターテイメント</option>
                      </>
                    )}
                    {productData.category === 'text' && (
                      <>
                        <option value="novel">小説</option>
                        <option value="essay">エッセイ</option>
                        <option value="poem">詩</option>
                        <option value="script">脚本</option>
                      </>
                    )}
                    {productData.category === 'code' && (
                      <>
                        <option value="web">Webアプリ</option>
                        <option value="mobile">モバイルアプリ</option>
                        <option value="desktop">デスクトップアプリ</option>
                        <option value="library">ライブラリ</option>
                      </>
                    )}
                    {productData.category === 'goods' && (
                      <>
                        <option value="clothing">衣類</option>
                        <option value="accessories">アクセサリー</option>
                        <option value="home">ホーム用品</option>
                        <option value="food">食品</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    商品名 *
                  </label>
                  <input
                    type="text"
                    value={productData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                    placeholder="商品名を入力"
                  />
                </div>





                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    商品説明
                  </label>
                  <textarea
                    value={productData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                    placeholder="商品の詳細説明を入力"
                  />
                </div>


              </div>
            </div>

            {/* 中：画像アップロード */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                商品画像
              </h2>

              {/* メイン画像 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  メイン画像 *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-magic-500 file:text-white hover:file:bg-magic-600"
                />
                {productData.mainImage && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(productData.mainImage)}
                      alt="メイン画像"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* サブ画像 */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  サブ画像 (複数選択可)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSubImagesChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-magic-500 file:text-white hover:file:bg-magic-600"
                />
                {productData.subImages.length > 0 && (
                  <div className="mt-2">
                    <p className="text-white/70 text-sm mb-2">選択された画像: {productData.subImages.length}個</p>
                    <div className="grid grid-cols-4 gap-2">
                      {productData.subImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`サブ画像${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSubImage(index)}
                            className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 右：商品設定 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" />
                商品設定
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    商品ステータス
                  </label>
                  <select
                    value={productData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                  >
                    <option value="draft">下書き</option>
                    <option value="active">販売中</option>
                    <option value="inactive">非公開</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    在庫数 *
                  </label>
                  <input
                    type="number"
                    value={productData.stock}
                    onChange={(e) => handleInputChange('stock', Number(e.target.value))}
                    required
                    min="1"
                    step="1"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                    placeholder="在庫数を入力"
                  />
                </div>



                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    商品素材
                  </label>
                  <input
                    type="text"
                    value={productData.productMaterial || ''}
                    onChange={(e) => handleInputChange('productMaterial', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                    placeholder="素材を入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    商品色
                  </label>
                  <input
                    type="text"
                    value={productData.productColor || ''}
                    onChange={(e) => handleInputChange('productColor', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                    placeholder="色を入力"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={productData.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      className="w-4 h-4 text-magic-500 bg-white/10 border-white/20 rounded focus:ring-magic-500"
                    />
                    <span className="text-sm text-white">おすすめ商品</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 中段：料金設定 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              料金設定
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  価格 *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={productData.price}
                    onChange={(e) => handleInputChange('price', Number(e.target.value))}
                    required
                    min="0"
                    step="1"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                    placeholder="価格を入力"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCalculator(true)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-white/70 hover:text-white"
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  手数料率 (%)
                </label>
                <input
                  type="number"
                  value="10"
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white/50 cursor-not-allowed"
                  placeholder="固定10%"
                />
              </div>

              {!isDigitalProduct() && (
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    配送料
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={productData.shippingCost || ''}
                      onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                      min="0"
                      step="1"
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-magic-500"
                      placeholder="配送料を入力"
                    />
                    <button
                      type="button"
                      onClick={autoCalculateShipping}
                      className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm"
                      title="業者・サイズから自動計算"
                    >
                      自動計算
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <h3 className="text-sm font-medium text-white mb-2">計算結果</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/70">
                <div>手数料: ¥{calculateCommission(productData.price)}</div>
                <div>利益: ¥{calculateProfit(productData.price)}</div>
                {!isDigitalProduct() && (
                  <div>総額: ¥{productData.price + (Number(productData.shippingCost) || 0)}</div>
                )}
              </div>

              {/* 配送料計算情報 */}
              {!isDigitalProduct() && productData.shippingCarrier && productData.productSize && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <h4 className="text-sm font-medium text-white mb-2">配送料計算</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-white/70">
                    <div>業者: {shippingRates[productData.shippingCarrier as keyof typeof shippingRates]?.name}</div>
                    <div>サイズ: {productData.productSize}</div>
                    <div>地域: {
                      productData.shippingRegion === 'prefecture'
                        ? productData.shippingPrefecture
                          ? `都道府県別 (${prefectures[productData.shippingPrefecture as keyof typeof prefectures]?.name || ''})`
                          : '都道府県別 (未選択)'
                        : productData.shippingRegion === 'remote'
                          ? '離島・遠隔地'
                          : '本州・四国・九州'
                    }</div>
                    <div>基本料金: ¥{calculateShippingCost()}</div>
                    <div>設定料金: ¥{productData.shippingCost || 0}</div>

                    {/* 都道府県別の詳細情報 */}
                    {productData.shippingRegion === 'prefecture' && productData.shippingPrefecture && (
                      <div className="col-span-2 mt-2 p-2 bg-white/5 rounded">
                        <div className="text-xs text-white/70 mb-1">選択された都道府県:</div>
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            const prefecture = prefectures[productData.shippingPrefecture as keyof typeof prefectures]
                            return prefecture ? (
                              <span className="px-1 py-0.5 text-xs bg-magic-500/20 text-magic-200 rounded">
                                {prefecture.name}
                              </span>
                            ) : null
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 下段：配送設定（物品商品のみ） */}
          {!isDigitalProduct() && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                配送設定
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    配送業者 *
                  </label>
                  <select
                    value={productData.shippingCarrier || ''}
                    onChange={(e) => {
                      handleInputChange('shippingCarrier', e.target.value)
                      // 業者が変更されたら自動計算
                      if (e.target.value && productData.productSize) {
                        setTimeout(() => autoCalculateShipping(), 100)
                      }
                    }}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                  >
                    <option value="">配送業者を選択</option>
                    <option value="yamato">ヤマト運輸</option>
                    <option value="sagawa">佐川急便</option>
                    <option value="japanpost">日本郵便</option>
                    <option value="fedex">FedEx</option>
                    <option value="dhl">DHL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    商品サイズ
                  </label>
                  <select
                    value={productData.productSize || ''}
                    onChange={(e) => {
                      handleInputChange('productSize', e.target.value)
                      // サイズが変更されたら自動計算
                      if (e.target.value && productData.shippingCarrier) {
                        setTimeout(() => autoCalculateShipping(), 100)
                      }
                    }}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                  >
                    <option value="">サイズを選択</option>
                    <option value="mail">メール便</option>
                    <option value="small">小</option>
                    <option value="medium">中</option>
                    <option value="large">大</option>
                    <option value="extra_large">特大</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    配送日数
                  </label>
                  <select
                    value={productData.shippingDays || ''}
                    onChange={(e) => handleInputChange('shippingDays', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                  >
                    <option value="">配送日数を選択</option>
                    <option value="1-2">1-2日</option>
                    <option value="2-3">2-3日</option>
                    <option value="3-5">3-5日</option>
                    <option value="5-7">5-7日</option>
                    <option value="7-14">7-14日</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    配送料タイプ
                  </label>
                  <select
                    value={productData.shippingCostType || ''}
                    onChange={(e) => handleInputChange('shippingCostType', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                  >
                    <option value="">配送料タイプを選択</option>
                    <option value="free">送料無料</option>
                    <option value="fixed">固定料金</option>
                    <option value="calculated">計算式</option>
                  </select>
                </div>
              </div>

              {/* 出品者 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-white mb-3">
                  出品者
                </label>
                <select
                  value={productData.originRegion || ''}
                  onChange={(e) => handleInputChange('originRegion', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                >
                  <option value="">出品者を選択</option>
                  <option value="local">本州・四国・九州</option>
                  <option value="remote">離島・遠隔地</option>
                  <option value="prefecture">都道府県別</option>
                </select>

                {/* 都道府県別選択（都道府県別が選択された場合のみ表示） */}
                {productData.originRegion === 'prefecture' && (
                  <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white mb-3">出品者都道府県選択</h4>

                      {/* 地域別選択 */}
                      <div className="mb-4 p-3 bg-white/5 rounded">
                        <h5 className="text-xs font-medium text-white/70 mb-2">地域別選択</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries({
                            hokkaido: '北海道',
                            tohoku: '東北',
                            kanto: '関東',
                            chubu: '中部',
                            kinki: '近畿',
                            chugoku: '中国',
                            shikoku: '四国',
                            kyushu: '九州',
                            okinawa: '沖縄'
                          }).map(([region, name]) => (
                            <button
                              key={region}
                              type="button"
                              onClick={() => handleSelectOriginRegion(region)}
                              className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 都道府県一覧（ラジオボタン） */}
                      <div className="max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(prefectures).map(([key, prefecture]) => (
                            <label key={key} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded">
                              <input
                                type="radio"
                                name="originPrefecture"
                                value={key}
                                checked={productData.originPrefecture === key}
                                onChange={() => handleOriginPrefectureChange(key)}
                                className="w-3 h-3 text-magic-500 bg-white/10 border-white/20 focus:ring-magic-500"
                              />
                              <span className="text-xs text-white">{prefecture.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* 選択された都道府県の表示 */}
                      {productData.originPrefecture && (
                        <div className="mt-4 p-3 bg-magic-500/20 border border-magic-500/30 rounded">
                          <h5 className="text-xs font-medium text-magic-300 mb-2">
                            選択された出品者都道府県
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              const prefecture = prefectures[productData.originPrefecture as keyof typeof prefectures]
                              return prefecture ? (
                                <span className="px-2 py-1 text-xs bg-magic-500/30 text-magic-200 rounded">
                                  {prefecture.name}
                                </span>
                              ) : null
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 地域選択 */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-white mb-3">
                  配送地域
                </label>
                <select
                  value={productData.shippingRegion || ''}
                  onChange={(e) => {
                    handleInputChange('shippingRegion', e.target.value)
                    // 地域が変更されたら自動計算
                    if (e.target.value && productData.shippingCarrier && productData.productSize) {
                      setTimeout(() => autoCalculateShipping(), 100)
                    }
                  }}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-magic-500"
                >
                  <option value="">配送地域を選択</option>
                  <option value="local">本州・四国・九州</option>
                  <option value="remote">離島・遠隔地</option>
                  <option value="prefecture">都道府県別</option>
                </select>

                {/* 都道府県選択（都道府県別が選択された場合のみ表示） */}
                {productData.shippingRegion === 'prefecture' && (
                  <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white mb-3">都道府県選択</h4>

                      {/* 地域別選択 */}
                      <div className="mb-4 p-3 bg-white/5 rounded">
                        <h5 className="text-xs font-medium text-white/70 mb-2">地域別選択</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {Object.entries({
                            hokkaido: '北海道',
                            tohoku: '東北',
                            kanto: '関東',
                            chubu: '中部',
                            kinki: '近畿',
                            chugoku: '中国',
                            shikoku: '四国',
                            kyushu: '九州',
                            okinawa: '沖縄'
                          }).map(([region, name]) => (
                            <button
                              key={region}
                              type="button"
                              onClick={() => handleSelectRegion(region)}
                              className="px-2 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded transition-colors"
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 都道府県一覧（ラジオボタン） */}
                      <div className="max-h-60 overflow-y-auto">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(prefectures).map(([key, prefecture]) => (
                            <label key={key} className="flex items-center gap-2 p-2 hover:bg-white/5 rounded">
                              <input
                                type="radio"
                                name="shippingPrefecture"
                                value={key}
                                checked={productData.shippingPrefecture === key}
                                onChange={() => handlePrefectureChange(key)}
                                className="w-3 h-3 text-magic-500 bg-white/10 border-white/20 focus:ring-magic-500"
                              />
                              <span className="text-xs text-white">{prefecture.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* 選択された都道府県の表示 */}
                      {productData.shippingPrefecture && (
                        <div className="mt-4 p-3 bg-magic-500/20 border border-magic-500/30 rounded">
                          <h5 className="text-xs font-medium text-magic-300 mb-2">
                            選択された都道府県
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {(() => {
                              const prefecture = prefectures[productData.shippingPrefecture as keyof typeof prefectures]
                              return prefecture ? (
                                <span className="px-2 py-1 text-xs bg-magic-500/30 text-magic-200 rounded">
                                  {prefecture.name}
                                </span>
                              ) : null
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 送信ボタン */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-magic-500 hover:bg-magic-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  投稿中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  商品を投稿
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
