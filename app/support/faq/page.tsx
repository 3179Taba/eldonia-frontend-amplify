"use client";
import React, { useState, useRef, useEffect } from "react";
import { useI18n } from "../../lib/i18n-provider";
import { MessageCircle, Send, Mail, Phone, Clock, ArrowLeft, ChevronDown } from "lucide-react";
import Link from "next/link";

// カスタムアコーディオンコンポーネント
const AccordionItem = ({ 
  title, 
  children, 
  isOpen, 
  onToggle 
}: { 
  title: string; 
  children: React.ReactNode; 
  isOpen: boolean; 
  onToggle: () => void; 
}) => {
  return (
    <div className="border-b border-gray-700 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left text-gray-300 hover:text-white text-sm p-3 rounded-lg hover:bg-gray-700 transition-all duration-200"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown 
          className={`w-4 h-4 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      <div 
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mt-2 p-3 bg-gray-700 rounded-lg text-gray-300 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
};

const CHATBOT_RESPONSES = {
  ja: {
    welcome: "こんにちは！Eldonia-Nexヘルプセンターです。ファンタジーとSFのクリエイター向けプラットフォームについて、何かお手伝いできることはありますか？",
    account: "アカウント関連のご質問ですね。Eldonia-Nexでは無料でアカウント作成が可能です。基本機能は無料でご利用いただけます。詳細は support@eldonia-nex.com までお問い合わせください。",
    technical: "技術的な問題ですね。Eldonia-NexはNext.js、Django、PostgreSQLを使用した最新技術で構築されています。技術サポートチームが対応いたします。tech-support@eldonia-nex.com までご連絡ください。",
    billing: "料金に関するご質問ですね。Eldonia-Nexには無料プランとプレミアムプラン（月額$5）があります。プレミアムでは無制限投稿、広告なし、優先サポートが利用できます。billing@eldonia-nex.com までお問い合わせください。",
    gallery: "ギャラリー機能についてですね。Eldonia-Nexではデジタルアート、イラスト、3Dモデル、ストーリーなど様々なクリエイティブ作品を展示・共有できます。画像、動画、音楽など多様なメディアをサポートしています。",
    shop: "ショップ機能についてですね。クリエイターはオリジナル作品、グッズ、デジタルコンテンツを販売できます。クリエイターの収益化をサポートする機能です。",
    events: "イベント機能についてですね。特別なイベント、展示会、ワークショップを開催してファンタジーとSFの世界を体験できます。",
    community: "コミュニティ機能についてですね。クリエイター間の交流、コラボレーション、作品へのフィードバックを促進します。リアルタイム翻訳で世界中のクリエイターとつながれます。",
    works: "作品投稿機能についてですね。ストーリーテリングとストーリー共有が可能です。リアルタイムで作品を共有し、ライブストリーミングも行えます。",
    ai: "AI機能についてですね。Eldonia-NexではGemini APIを使用した翻訳、画像生成、テキスト生成機能を提供しています。AI技術を活用した作品推薦も行っています。",
    premium: "プレミアムプランについてですね。月額$5で無制限投稿、広告なし、優先サポート、エクスクルーシブコンテンツが利用できます。",
    money: "収益化機能についてですね。紹介システムでプレミアムメンバー獲得時に10%のインセンティブを提供しています。",
    live: "ライブ機能についてですね。リアルタイムで作品を共有し、ライブストリーミングが可能です。",
    translation: "翻訳機能についてですね。リアルタイム翻訳で世界中のクリエイターとコミュニケーションできます。",
    security: "セキュリティについてですね。Eldonia-Nexは高度なセキュリティ機能を提供し、ユーザーデータを保護しています。",
    privacy: "プライバシーについてですね。プライバシーポリシーに従ってユーザーデータを適切に管理しています。",
    terms: "利用規約についてですね。Eldonia-Nexの利用規約とコミュニティガイドラインをご確認ください。",
    postingRules: "投稿ルールについてですね。Eldonia-Nexでは以下のルールを遵守してください：1) オリジナル作品のみ投稿、2) 著作権侵害の禁止、3) 適切なコンテンツの投稿、4) 他者への配慮、5) スパム行為の禁止。詳細は利用規約をご確認ください。",
    about: "Eldonia-Nexについてですね。ファンタジーとSFのクリエイター向けプラットフォームで、クリエイターが自由に作品を共有し、世界中の人々とつながることができます。",
    fantasy: "ファンタジーコンテンツについてですね。Eldonia-NexはファンタジーとSFに特化したプラットフォームで、同じ趣味を持つクリエイターが集まります。",
    scifi: "SFコンテンツについてですね。サイエンスフィクション作品の共有と交流を促進する機能を提供しています。",
    creators: "クリエイターについてですね。Eldonia-Nexでは1,000人以上のクリエイターが登録し、5,000以上の作品が投稿されています。",
    posting: "投稿機能についてですね。画像、動画、音楽、ストーリーなど様々な形式で作品を投稿できます。",
    media: "メディア対応についてですね。画像、動画、音楽など多様なメディア形式をサポートしています。",
    collaboration: "コラボレーションについてですね。クリエイター間の協力や共同制作を促進する機能があります。",
    feedback: "フィードバックについてですね。作品への評価やコメント機能で、クリエイターの成長をサポートします。",
    general: "その他のご質問ですね。Eldonia-NexはファンタジーとSFに特化したクリエイター向けプラットフォームです。contact@eldonia-nex.com までお問い合わせください。",
    default: "申し訳ございませんが、その質問にはお答えできません。Eldonia-Nexの機能について詳しく知りたい場合は、直接メールでお問い合わせください。"
  },
  en: {
    welcome: "Hello! This is Eldonia-Nex Help Center. How can I help you with our fantasy and sci-fi creator platform?",
    account: "For account-related questions, Eldonia-Nex offers free account creation with basic features available at no cost. Please contact support@eldonia-nex.com for details.",
    technical: "For technical issues, Eldonia-Nex is built with Next.js, Django, and PostgreSQL using the latest technology. Our technical support team will assist you. Please contact tech-support@eldonia-nex.com",
    billing: "For billing questions, Eldonia-Nex offers a free plan and a premium plan ($5/month) with unlimited posts, ad-free experience, and priority support. Please contact billing@eldonia-nex.com",
    gallery: "About the gallery feature, Eldonia-Nex allows you to exhibit and share various creative works such as digital art, illustrations, 3D models, and stories. We support diverse media including images, videos, and music.",
    shop: "About the shop feature, creators can sell original works, goods, and digital content. This feature supports creator monetization.",
    events: "About the events feature, you can host special events, exhibitions, and workshops to experience fantasy and sci-fi worlds.",
    community: "About the community feature, it promotes interaction between creators, collaboration, and work feedback. Connect with creators worldwide through real-time translation.",
    works: "About the works posting feature, storytelling and story sharing are possible. Share works in real-time and conduct live streaming.",
    ai: "About AI features, Eldonia-Nex provides translation, image generation, and text generation using Gemini API. We also offer AI-powered content recommendations.",
    premium: "About the premium plan, for $5/month you get unlimited posts, ad-free experience, priority support, and exclusive content.",
    money: "About monetization features, we offer a referral system with 10% incentive for premium member acquisition.",
    live: "About live features, you can share works in real-time and conduct live streaming.",
    translation: "About translation features, real-time translation allows communication with creators worldwide.",
    security: "About security, Eldonia-Nex provides advanced security features to protect user data.",
    privacy: "About privacy, we manage user data appropriately according to our privacy policy.",
    terms: "About terms of service, please review Eldonia-Nex's terms of service and community guidelines.",
    postingRules: "About posting rules, please follow these rules on Eldonia-Nex: 1) Only post original works, 2) No copyright infringement, 3) Post appropriate content, 4) Consider others, 5) No spam behavior. Please review terms of service for details.",
    about: "About Eldonia-Nex, it's a platform for fantasy and sci-fi creators where creators can freely share their works and connect with people worldwide.",
    fantasy: "About fantasy content, Eldonia-Nex is a platform specialized in fantasy and sci-fi where creators with similar interests gather.",
    scifi: "About sci-fi content, we provide features to promote sharing and interaction of science fiction works.",
    creators: "About creators, over 1,000 creators are registered on Eldonia-Nex with over 5,000 works posted.",
    posting: "About posting features, you can post works in various formats including images, videos, music, and stories.",
    media: "About media support, we support diverse media formats including images, videos, and music.",
    collaboration: "About collaboration, we have features to promote cooperation and joint creation between creators.",
    feedback: "About feedback, evaluation and comment features support creator growth.",
    general: "For other questions, Eldonia-Nex is a specialized platform for fantasy and sci-fi creators. Please contact contact@eldonia-nex.com",
    default: "I'm sorry, I cannot answer that question. For detailed information about Eldonia-Nex features, please contact us directly via email."
  }
};

const QUICK_ACTIONS = [
  { text: "アカウントについて", action: "account" },
  { text: "技術的な問題", action: "technical" },
  { text: "料金について", action: "billing" },
  { text: "ギャラリー機能", action: "gallery" },
  { text: "ショップ機能", action: "shop" },
  { text: "イベント機能", action: "events" },
  { text: "コミュニティ機能", action: "community" },
  { text: "作品投稿", action: "works" },
  { text: "AI機能", action: "ai" },
  { text: "プレミアム", action: "premium" },
  { text: "収益化", action: "money" },
  { text: "ライブ機能", action: "live" },
  { text: "翻訳機能", action: "translation" },
  { text: "セキュリティ", action: "security" },
  { text: "プライバシー", action: "privacy" },
  { text: "利用規約", action: "terms" },
  { text: "投稿ルール", action: "postingRules" },
  { text: "その他の質問", action: "general" }
];

export default function FAQPage() {
  const { locale, t } = useI18n();
  const [messages, setMessages] = useState([
    { type: "bot", text: CHATBOT_RESPONSES[locale]?.welcome || CHATBOT_RESPONSES.ja.welcome }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleAccordionToggle = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // ユーザーメッセージを追加
    const userMessage = { type: "user", text };
    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // ボットの応答をシミュレート
    setTimeout(() => {
      let response = CHATBOT_RESPONSES[locale]?.default || CHATBOT_RESPONSES.ja.default;
      
      // キーワードに基づいて応答を決定
      const lowerText = text.toLowerCase();
      if (lowerText.includes("アカウント") || lowerText.includes("account") || lowerText.includes("登録") || lowerText.includes("register")) {
        response = CHATBOT_RESPONSES[locale]?.account || CHATBOT_RESPONSES.ja.account;
      } else if (lowerText.includes("技術") || lowerText.includes("technical") || lowerText.includes("エラー") || lowerText.includes("error") || lowerText.includes("バグ") || lowerText.includes("bug")) {
        response = CHATBOT_RESPONSES[locale]?.technical || CHATBOT_RESPONSES.ja.technical;
      } else if (lowerText.includes("料金") || lowerText.includes("billing") || lowerText.includes("支払い") || lowerText.includes("payment") || lowerText.includes("価格") || lowerText.includes("price")) {
        response = CHATBOT_RESPONSES[locale]?.billing || CHATBOT_RESPONSES.ja.billing;
      } else if (lowerText.includes("ギャラリー") || lowerText.includes("gallery") || lowerText.includes("展示") || lowerText.includes("exhibit")) {
        response = CHATBOT_RESPONSES[locale]?.gallery || CHATBOT_RESPONSES.ja.gallery;
      } else if (lowerText.includes("ショップ") || lowerText.includes("shop") || lowerText.includes("販売") || lowerText.includes("sell") || lowerText.includes("商品") || lowerText.includes("product")) {
        response = CHATBOT_RESPONSES[locale]?.shop || CHATBOT_RESPONSES.ja.shop;
      } else if (lowerText.includes("イベント") || lowerText.includes("events") || lowerText.includes("開催") || lowerText.includes("workshop")) {
        response = CHATBOT_RESPONSES[locale]?.events || CHATBOT_RESPONSES.ja.events;
      } else if (lowerText.includes("コミュニティ") || lowerText.includes("community") || lowerText.includes("交流") || lowerText.includes("interaction")) {
        response = CHATBOT_RESPONSES[locale]?.community || CHATBOT_RESPONSES.ja.community;
      } else if (lowerText.includes("作品投稿") || lowerText.includes("works") || lowerText.includes("投稿") || lowerText.includes("post") || lowerText.includes("ストーリー") || lowerText.includes("story")) {
        response = CHATBOT_RESPONSES[locale]?.works || CHATBOT_RESPONSES.ja.works;
      } else if (lowerText.includes("AI") || lowerText.includes("ai") || lowerText.includes("人工知能") || lowerText.includes("gemini")) {
        response = CHATBOT_RESPONSES[locale]?.ai || CHATBOT_RESPONSES.ja.ai;
      } else if (lowerText.includes("プレミアム") || lowerText.includes("premium") || lowerText.includes("有料") || lowerText.includes("paid")) {
        response = CHATBOT_RESPONSES[locale]?.premium || CHATBOT_RESPONSES.ja.premium;
      } else if (lowerText.includes("収益化") || lowerText.includes("money") || lowerText.includes("収益") || lowerText.includes("income") || lowerText.includes("紹介") || lowerText.includes("referral")) {
        response = CHATBOT_RESPONSES[locale]?.money || CHATBOT_RESPONSES.ja.money;
      } else if (lowerText.includes("ライブ") || lowerText.includes("live") || lowerText.includes("ストリーミング") || lowerText.includes("streaming")) {
        response = CHATBOT_RESPONSES[locale]?.live || CHATBOT_RESPONSES.ja.live;
      } else if (lowerText.includes("翻訳") || lowerText.includes("translation") || lowerText.includes("多言語") || lowerText.includes("multilingual")) {
        response = CHATBOT_RESPONSES[locale]?.translation || CHATBOT_RESPONSES.ja.translation;
      } else if (lowerText.includes("セキュリティ") || lowerText.includes("security") || lowerText.includes("保護") || lowerText.includes("protection")) {
        response = CHATBOT_RESPONSES[locale]?.security || CHATBOT_RESPONSES.ja.security;
      } else if (lowerText.includes("プライバシー") || lowerText.includes("privacy") || lowerText.includes("個人情報") || lowerText.includes("personal")) {
        response = CHATBOT_RESPONSES[locale]?.privacy || CHATBOT_RESPONSES.ja.privacy;
      } else if (lowerText.includes("利用規約") || lowerText.includes("terms") || lowerText.includes("ガイドライン") || lowerText.includes("guidelines")) {
        response = CHATBOT_RESPONSES[locale]?.terms || CHATBOT_RESPONSES.ja.terms;
      } else if (lowerText.includes("投稿ルール") || lowerText.includes("posting rules") || lowerText.includes("ルール") || lowerText.includes("rules") || lowerText.includes("ガイドライン") || lowerText.includes("guidelines")) {
        response = CHATBOT_RESPONSES[locale]?.postingRules || CHATBOT_RESPONSES.ja.postingRules;
      } else if (lowerText.includes("eldonia") || lowerText.includes("プラットフォーム") || lowerText.includes("platform")) {
        response = CHATBOT_RESPONSES[locale]?.about || CHATBOT_RESPONSES.ja.about;
      } else if (lowerText.includes("ファンタジー") || lowerText.includes("fantasy") || lowerText.includes("魔法") || lowerText.includes("magic")) {
        response = CHATBOT_RESPONSES[locale]?.fantasy || CHATBOT_RESPONSES.ja.fantasy;
      } else if (lowerText.includes("SF") || lowerText.includes("sci-fi") || lowerText.includes("サイエンスフィクション") || lowerText.includes("science fiction")) {
        response = CHATBOT_RESPONSES[locale]?.scifi || CHATBOT_RESPONSES.ja.scifi;
      } else if (lowerText.includes("クリエイター") || lowerText.includes("creator") || lowerText.includes("アーティスト") || lowerText.includes("artist")) {
        response = CHATBOT_RESPONSES[locale]?.creators || CHATBOT_RESPONSES.ja.creators;
      } else if (lowerText.includes("投稿") || lowerText.includes("posting") || lowerText.includes("アップロード") || lowerText.includes("upload")) {
        response = CHATBOT_RESPONSES[locale]?.posting || CHATBOT_RESPONSES.ja.posting;
      } else if (lowerText.includes("メディア") || lowerText.includes("media") || lowerText.includes("画像") || lowerText.includes("image") || lowerText.includes("動画") || lowerText.includes("video") || lowerText.includes("音楽") || lowerText.includes("music")) {
        response = CHATBOT_RESPONSES[locale]?.media || CHATBOT_RESPONSES.ja.media;
      } else if (lowerText.includes("コラボレーション") || lowerText.includes("collaboration") || lowerText.includes("協力") || lowerText.includes("cooperation")) {
        response = CHATBOT_RESPONSES[locale]?.collaboration || CHATBOT_RESPONSES.ja.collaboration;
      } else if (lowerText.includes("フィードバック") || lowerText.includes("feedback") || lowerText.includes("評価") || lowerText.includes("rating") || lowerText.includes("コメント") || lowerText.includes("comment")) {
        response = CHATBOT_RESPONSES[locale]?.feedback || CHATBOT_RESPONSES.ja.feedback;
      } else if (lowerText.includes("その他") || lowerText.includes("other") || lowerText.includes("その他") || lowerText.includes("else")) {
        response = CHATBOT_RESPONSES[locale]?.general || CHATBOT_RESPONSES.ja.general;
      }

      const botMessage = { type: "bot", text: response };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    const actionTexts = {
      account: "アカウントについて質問があります",
      technical: "技術的な問題があります",
      billing: "料金について質問があります",
      gallery: "ギャラリー機能について質問があります",
      shop: "ショップ機能について質問があります",
      events: "イベント機能について質問があります",
      community: "コミュニティ機能について質問があります",
      works: "作品投稿について質問があります",
      ai: "AI機能について質問があります",
      premium: "プレミアムプランについて質問があります",
      money: "収益化機能について質問があります",
      live: "ライブ機能について質問があります",
      translation: "翻訳機能について質問があります",
      security: "セキュリティについて質問があります",
      privacy: "プライバシーについて質問があります",
      terms: "利用規約について質問があります",
      postingRules: "投稿ルールについて質問があります",
      general: "その他の質問があります"
    };
    handleSendMessage(actionTexts[action as keyof typeof actionTexts] || actionTexts.general);
  };

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  // FAQデータ
  const faqData = [
    {
      title: "Eldonia-Nexとは何ですか？",
      content: "Eldonia-NexはファンタジーとSFのクリエイター向けプラットフォームです。",
      chatMessage: "Eldonia-Nexとは何ですか？"
    },
    {
      title: "アカウントの作成方法",
      content: "無料でアカウント作成が可能です。基本機能は無料でご利用いただけます。",
      chatMessage: "アカウントの作成方法を教えてください"
    },
    {
      title: "料金プランについて",
      content: "無料プランとプレミアムプラン（月額$5）があります。",
      chatMessage: "料金プランについて"
    },
    {
      title: "ギャラリー機能について",
      content: "デジタルアート、イラスト、3Dモデル、ストーリーなどを展示・共有できます。",
      chatMessage: "ギャラリー機能について"
    },
    {
      title: "AI機能について",
      content: "Gemini APIを使用した翻訳、画像生成、テキスト生成機能を提供しています。",
      chatMessage: "AI機能について"
    },
    {
      title: "コミュニティ機能について",
      content: "クリエイター間の交流、コラボレーション、作品へのフィードバックを促進します。",
      chatMessage: "コミュニティ機能について"
    },
    {
      title: "プレミアムプランについて",
      content: "月額$5で無制限投稿、広告なし、優先サポート、エクスクルーシブコンテンツが利用できます。",
      chatMessage: "プレミアムプランについて"
    },
    {
      title: "収益化機能について",
      content: "紹介システムでプレミアムメンバー獲得時に10%のインセンティブを提供しています。",
      chatMessage: "収益化機能について"
    },
    {
      title: "翻訳機能について",
      content: "リアルタイム翻訳で世界中のクリエイターとコミュニケーションできます。",
      chatMessage: "翻訳機能について"
    },
    {
      title: "セキュリティについて",
      content: "高度なセキュリティ機能を提供し、ユーザーデータを保護しています。",
      chatMessage: "セキュリティについて"
    },
    {
      title: "利用規約について",
      content: "Eldonia-Nexの利用規約とコミュニティガイドラインをご確認ください。",
      chatMessage: "利用規約について"
    },
    {
      title: "投稿ルールについて",
      content: "オリジナル作品のみ投稿、著作権侵害の禁止、適切なコンテンツの投稿など。",
      chatMessage: "投稿ルールについて"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* ヘッダー */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/support" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-6 w-6 text-magic-400" />
              <h1 className="text-xl font-bold text-white">ヘルプセンター</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* チャットボット */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg shadow-lg h-[600px] flex flex-col">
              {/* チャットヘッダー */}
              <div className="bg-gray-700 px-4 py-3 rounded-t-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-magic-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Eldonia-Nex アシスタント</h3>
                    <p className="text-gray-400 text-sm">オンライン</p>
                  </div>
                </div>
              </div>

              {/* メッセージエリア */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.type === "user"
                          ? "bg-magic-500 text-white"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      {message.type === "bot" && message.text.includes("@") && (
                        <button
                          onClick={() => {
                            const email = message.text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0];
                            if (email) handleEmailClick(email);
                          }}
                          className="text-magic-300 hover:text-magic-200 underline text-xs mt-1"
                        >
                          メールを送信
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* クイックアクション */}
              <div className="px-4 py-3 border-t border-gray-700">
                <div className="flex flex-wrap gap-2 mb-3">
                  {QUICK_ACTIONS.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.action)}
                      className="px-3 py-1 bg-gray-700 text-white text-xs rounded-full hover:bg-gray-600 transition-colors"
                    >
                      {action.text}
                    </button>
                  ))}
                </div>

                {/* 入力エリア */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputText)}
                    placeholder="メッセージを入力..."
                    className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-magic-500"
                  />
                  <button
                    onClick={() => handleSendMessage(inputText)}
                    className="bg-magic-500 text-white px-4 py-2 rounded-lg hover:bg-magic-600 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 直接連絡 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">直接お問い合わせ</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-magic-400" />
                  <button
                    onClick={() => handleEmailClick("support@eldonia-nex.com")}
                    className="text-magic-300 hover:text-magic-200 text-sm"
                  >
                    support@eldonia-nex.com
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-magic-400" />
                  <button
                    onClick={() => handleEmailClick("tech-support@eldonia-nex.com")}
                    className="text-magic-300 hover:text-magic-200 text-sm"
                  >
                    tech-support@eldonia-nex.com
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-magic-400" />
                  <button
                    onClick={() => handleEmailClick("billing@eldonia-nex.com")}
                    className="text-magic-300 hover:text-magic-200 text-sm"
                  >
                    billing@eldonia-nex.com
                  </button>
                </div>
              </div>
            </div>

            {/* 営業時間 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">営業時間</h3>
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="h-5 w-5 text-magic-400" />
                <span className="text-gray-300 text-sm">平日 9:00-18:00 (JST)</span>
              </div>
              <p className="text-gray-400 text-xs">
                土日祝日は休業となります。緊急時はメールでご連絡ください。
              </p>
            </div>

            {/* よくある質問 */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">よくある質問</h3>
              <div className="space-y-0">
                {faqData.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    title={faq.title}
                    isOpen={openAccordion === index}
                    onToggle={() => handleAccordionToggle(index)}
                  >
                    <p className="mb-2">{faq.content}</p>
                    <button
                      onClick={() => handleSendMessage(faq.chatMessage)}
                      className="text-magic-300 hover:text-magic-200 underline text-xs transition-colors duration-200"
                    >
                      チャットで詳しく聞く
                    </button>
                  </AccordionItem>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 