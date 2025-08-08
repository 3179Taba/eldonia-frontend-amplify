'use client'

import { DollarSign, Users, Zap, Rocket, Coins, Globe, BookOpen, Briefcase } from 'lucide-react'
import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import { useI18n } from '../lib/i18n-provider'
import { earningSiteAppeal, affiliateBannerTerms } from '../i18n/translations-new'
import Image from 'next/image'

const lang = typeof window !== 'undefined' ? (navigator.language?.slice(0,2) || 'ja') : 'ja';

function DictionaryTerm({ term, description, icon }: { term: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg mb-2 border border-emerald-400/20">
      <span className="text-xl">{icon}</span>
      <span className="font-bold text-white">{term}</span>
      <span className="text-white/70 text-sm">{description}</span>
    </div>
  )
}

export default function AffiliateBanner() {
  const { elementRef, animationClass } = useIntersectionObserver({ 
    triggerOnce: false,
    threshold: 0.1,
    animationType: 'scale'
  })
  const { t, locale } = useI18n()
  const appeal = earningSiteAppeal[locale] || earningSiteAppeal['ja']
  const terms = affiliateBannerTerms[locale] || affiliateBannerTerms['ja']

  // 用語解説例
  const dictionary = [
    { term: terms.affiliateTerm, description: terms.affiliateTermDesc, icon: <Image src="/img/緑の辞書.png" alt="dictionary-green" width={32} height={32} className="rounded shadow" /> },
    { term: terms.globalSupportTerm, description: terms.globalSupportTermDesc, icon: <Image src="/img/青い辞書.png" alt="dictionary-blue" width={32} height={32} className="rounded shadow" /> },
    { term: terms.communityTerm, description: terms.communityTermDesc, icon: <Image src="/img/赤い辞書.png" alt="dictionary-red" width={32} height={32} className="rounded shadow" /> },
    { term: terms.businessProjectTerm, description: terms.businessProjectTermDesc, icon: <Briefcase className="w-5 h-5 text-purple-400" /> },
  ]

  // サブポイント用画像と内容（日本語・英語例）
  const subPoints = [
    {
      img: '/img/creater1.png',
      ja: '世界中のクリエイターやファンとつながり、あなたの作品やサービスを4か国語で発信できます。今後さらに多くの言語・国に拡大予定。国境を越えて自分の才能をアピールし、グローバルな評価やチャンスを手に入れましょう。多様な文化や価値観に触れながら、あなたの世界を広げてください。',
      en: 'Connect with creators and fans worldwide, and share your works and services in four languages. More languages and countries will be supported soon. Showcase your talent beyond borders, gain global recognition and opportunities. Expand your world while experiencing diverse cultures and values.',
      zh: '与全球的创作者和粉丝建立联系，用四种语言展示你的作品和服务。未来将支持更多语言和国家。突破国界，展示你的才华，获得全球认可和机会。在多元文化和价值观中拓展你的世界。',
      ko: '전 세계 크리에이터와 팬들과 연결하고, 네 개 언어로 작품과 서비스를 소개하세요. 앞으로 더 많은 언어와 국가가 지원될 예정입니다. 국경을 넘어 재능을 알리고, 글로벌한 평가와 기회를 얻으세요. 다양한 문화와 가치를 경험하며 당신의 세계를 넓히세요.'
    },
    {
      img: '/img/creater2.png',
      ja: 'あなたのイラスト・音楽・動画・デザイン・文章など、あらゆるクリエイティブ作品を直接販売できます。デジタル商品やサービスの販売、コミッション受注、サブスクリプションなど多彩な収益化手段を用意。あなたの情熱がそのまま収入につながる、新しい働き方を実現しましょう。',
      en: 'Sell your illustrations, music, videos, designs, writings, and all kinds of creative works directly. We offer various monetization options such as digital product sales, commissions, and subscriptions. Turn your passion into income and discover a new way of working as a creator.',
      zh: '你可以直接出售你的插画、音乐、视频、设计、文章等各种创意作品。我们提供数字商品销售、定制服务、订阅等多种变现方式。让你的热情直接转化为收入，开启创作者的新型工作方式。',
      ko: '일러스트, 음악, 영상, 디자인, 글 등 모든 창작물을 직접 판매할 수 있습니다. 디지털 상품 판매, 커미션, 구독 등 다양한 수익화 수단을 제공합니다. 당신의 열정이 곧 수입이 되는 새로운 크리에이터 라이프를 시작하세요.'
    },
    {
      img: '/img/creater3.png',
      ja: 'コミュニティで出会った仲間とチームを組み、企業や団体からのプロジェクト案件に挑戦できます。イラストレーター・デザイナー・翻訳者など多様なスキルを持つメンバーと協力し、グローバルなプロモーションやWeb制作、動画制作などに参加。実績も報酬も世界規模で広がります。',
      en: 'Team up with friends you meet in the community and take on projects from companies and organizations. Collaborate with members with various skills such as illustrators, designers, and translators, and participate in global promotions, web production, and video creation. Both your achievements and rewards will expand worldwide.',
      zh: '在社区中结识志同道合的伙伴，组建团队，共同挑战企业或机构的项目。与插画师、设计师、翻译等多元技能成员协作，参与全球推广、网站建设、视频制作等。你的成果与报酬都将走向世界。',
      ko: '커뮤니티에서 만난 동료들과 팀을 이루어 기업이나 단체의 프로젝트에 도전하세요. 일러스트레이터, 디자이너, 번역가 등 다양한 스킬의 멤버와 협력해 글로벌 프로모션, 웹 제작, 영상 제작 등에 참여할 수 있습니다. 실적과 보상 모두 세계로 확장됩니다.'
    },
    {
      img: '/img/creater4.png',
      ja: 'サイトのアフィリエイトプログラムや紹介制度を活用して、友人やフォロワーを招待するだけで報酬を獲得できます。SNSやブログ、動画などであなたの体験を発信し、コミュニティを広げながら安定した副収入も実現。クリエイター活動を応援する新しい収益モデルです。',
      en: 'Take advantage of our affiliate and referral programs to earn rewards simply by inviting friends and followers. Share your experiences on social media, blogs, or videos, expand the community, and enjoy a stable side income. This is a new revenue model that supports your creative activities.',
      zh: '通过参与本站的联盟和推荐计划，只需邀请朋友或粉丝即可获得奖励。通过社交媒体、博客、视频等分享你的体验，扩大社区影响力，同时实现稳定的副收入。这是支持创作者的新型收益模式。',
      ko: '사이트의 제휴 및 추천 프로그램을 활용해 친구나 팔로워를 초대하기만 해도 보상을 받을 수 있습니다. SNS, 블로그, 영상 등으로 경험을 공유하며 커뮤니티를 넓히고, 안정적인 부수입도 얻으세요. 크리에이터를 응원하는 새로운 수익 모델입니다.'
    }
  ];

  return (
    <div 
      ref={elementRef}
      className={`w-4/5 mx-auto mb-12 ${animationClass}`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-teal-500/20 border border-emerald-400/30 backdrop-blur-sm">
        {/* 背景装飾 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-400/10 via-green-400/10 to-teal-400/10"></div>
          <div className="absolute top-4 right-4 w-16 h-16 bg-emerald-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-green-400/20 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-teal-400/15 rounded-full blur-2xl animate-float"></div>
        </div>

        {/* メインコンテンツ */}
        <div className="relative z-10 p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Rocket className="w-8 h-8 text-yellow-400 mr-3 animate-pulse" />
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-white drop-shadow-lg">
              {appeal.mainCatch}
            </h2>
            <Rocket className="w-8 h-8 text-yellow-400 ml-3 animate-pulse" />
          </div>
          {/* サブポイント：ジグザグレイアウト（画像大きめ・内容充実） */}
          <div className="flex flex-col gap-8 mb-8">
            {subPoints.map((item, i) => {
              const isEven = i % 2 === 0;
              const text = item[locale] || item['ja'];
              return (
                <div key={i} className={`flex flex-col md:flex-row items-center justify-center ${isEven ? '' : 'md:flex-row-reverse'} gap-4 md:gap-12 bg-gray-900/80 px-4 py-8 rounded-2xl border border-emerald-400/30 shadow-lg`}>
                  <div className="flex-shrink-0 mb-4 md:mb-0">
                    <Image src={item.img} alt={`point-img-${i}`} width={360} height={360} className="rounded-2xl shadow-xl object-cover w-[240px] h-[240px] md:w-[360px] md:h-[360px]" />
                  </div>
                  <div className="text-white text-base font-exo2 leading-relaxed text-center md:text-left md:max-w-[360px] text-lg md:text-xl">
                    {text}
                  </div>
                </div>
              );
            })}
          </div>
          {/* 活用例・用語解説・ボタン等はここに続く ... */}
        </div>
      </div>
    </div>
  )
}
