import React from 'react';

export default function PremiumTermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-gray-900 bg-white rounded-lg shadow">
      <h1 className="text-3xl font-bold mb-6">プレミアムプラン利用規約</h1>
      
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4">第1条（プレミアムプランの概要）</h2>
        <p className="mb-4">
          プレミアムプランは、月額500円（税込）で提供される有料サービスです。
          本プランに加入することで、以下の特典をご利用いただけます。
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>無制限の投稿（通常は月10件まで）</li>
          <li>広告の非表示</li>
          <li>優先的なサポート</li>
          <li>高画質でのファイルアップロード</li>
          <li>詳細な分析データの閲覧</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4">第2条（料金と支払い）</h2>
        <div className="mb-4">
          <h3 className="font-bold mb-2">料金体系</h3>
          <ul className="list-disc pl-6">
            <li>月額プラン：500円（税込）/月</li>
            <li>年額プラン：5,000円（税込）/年（2ヶ月分お得）</li>
          </ul>
        </div>
        <div className="mb-4">
          <h3 className="font-bold mb-2">支払い方法</h3>
          <ul className="list-disc pl-6">
            <li>クレジットカード（Visa、Mastercard、American Express）</li>
            <li>デビットカード</li>
            <li>その他、当社が指定する決済方法</li>
          </ul>
        </div>
        <div className="mb-4">
          <h3 className="font-bold mb-2">自動更新</h3>
          <p>
            プレミアムプランは自動更新制となっております。
            解約をご希望の場合は、契約期間終了の7日前までに解約手続きを行ってください。
          </p>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4">第3条（利用制限と禁止事項）</h2>
        <p className="mb-4">
          プレミアムプラン利用者も含め、以下の行為は禁止されています：
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>著作権侵害コンテンツの投稿</li>
          <li>他者への誹謗中傷</li>
          <li>スパム行為</li>
          <li>システムへの攻撃</li>
          <li>その他、法令に違反する行為</li>
        </ul>
        <p>
          違反が発見された場合、警告・利用停止・解約等の措置を講じることがあります。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4">第4条（解約と返金）</h2>
        <div className="mb-4">
          <h3 className="font-bold mb-2">解約について</h3>
          <ul className="list-disc pl-6">
            <li>いつでも解約可能です</li>
            <li>解約後も契約期間終了まではサービスをご利用いただけます</li>
            <li>解約手続きはアカウント設定画面から行えます</li>
          </ul>
        </div>
        <div className="mb-4">
          <h3 className="font-bold mb-2">返金について</h3>
          <ul className="list-disc pl-6">
            <li>契約期間開始後7日以内の解約：全額返金</li>
            <li>それ以降の解約：返金なし（契約期間終了までサービス利用可能）</li>
            <li>システム障害による長時間のサービス停止：日割り計算での返金</li>
          </ul>
        </div>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4">第5条（サービス変更と終了）</h2>
        <p className="mb-4">
          当社は、以下の場合にサービス内容の変更または終了を行う場合があります：
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>システム保守・更新のため</li>
          <li>法令変更への対応のため</li>
          <li>事業継続が困難となった場合</li>
        </ul>
        <p>
          サービス終了の場合は、事前に30日以上前に通知いたします。
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4">第6条（免責事項）</h2>
        <p className="mb-4">
          当社は、以下の場合について責任を負いません：
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>利用者の過失によるデータ損失</li>
          <li>第三者による不正アクセス</li>
          <li>不可抗力によるサービス停止</li>
          <li>利用者間のトラブル</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-bold mb-4">第7条（準拠法と管轄）</h2>
        <p>
          本規約の解釈にあたっては、日本法を準拠法とします。
          紛争が生じた場合、当社の本店所在地を管轄する裁判所を第一審の専属的合意管轄とします。
        </p>
      </section>

      <div className="mt-8 text-right text-sm text-gray-500">
        2025年6月24日 制定・施行
      </div>
      
      <div className="mt-8 text-center">
        <a href="/premium-terms.pdf" target="_blank" className="text-blue-600 underline">
          PDF版をダウンロード
        </a>
      </div>
    </div>
  );
} 