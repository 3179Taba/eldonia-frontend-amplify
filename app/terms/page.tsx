import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 text-gray-900 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">利用規約</h1>
      <section className="mb-4">
        <h2 className="font-bold mb-2">第1条（適用）</h2>
        <p>本規約は、Eldonia-Nex（以下「当サービス」）が提供するサービスの利用条件を定めるものです。利用者は本規約に同意の上、当サービスを利用するものとします。</p>
      </section>
      <section className="mb-4">
        <h2 className="font-bold mb-2">第2条（利用登録）</h2>
        <ol className="list-decimal pl-6">
          <li>利用希望者は、当サービス所定の方法により利用登録を申請し、当サービスがこれを承認することで利用登録が完了します。</li>
          <li>登録申請者が以下のいずれかに該当する場合、当サービスは利用登録を拒否することがあります。
            <ul className="list-disc pl-6">
              <li>虚偽の情報を届け出た場合</li>
              <li>過去に規約違反等で利用停止処分を受けたことがある場合</li>
              <li>その他、当サービスが利用登録を適当でないと判断した場合</li>
            </ul>
          </li>
        </ol>
      </section>
      <section className="mb-4">
        <h2 className="font-bold mb-2">第3条（ユーザーIDおよびパスワードの管理）</h2>
        <ol className="list-decimal pl-6">
          <li>ユーザーは、自己の責任において、ユーザーIDおよびパスワードを適切に管理するものとします。</li>
          <li>ユーザーIDおよびパスワードの第三者への譲渡・貸与・共有は禁止します。</li>
        </ol>
      </section>
      <section className="mb-4">
        <h2 className="font-bold mb-2">第4条（禁止事項）</h2>
        <ul className="list-disc pl-6">
          <li>法令または公序良俗に違反する行為</li>
          <li>犯罪行為に関連する行為</li>
          <li>当サービスの運営を妨害する行為</li>
          <li>他の利用者または第三者の権利を侵害する行為</li>
          <li>虚偽の情報の登録</li>
          <li>その他、当サービスが不適切と判断する行為</li>
        </ul>
      </section>
      <section className="mb-4">
        <h2 className="font-bold mb-2">第5条（サービスの提供の停止等）</h2>
        <ul className="list-disc pl-6">
          <li>システムの保守点検または更新を行う場合</li>
          <li>火災、停電、天災等の不可抗力によりサービスの提供が困難となった場合</li>
          <li>その他、当サービスがサービスの提供が困難と判断した場合</li>
        </ul>
      </section>
      <section className="mb-4">
        <h2 className="font-bold mb-2">第6条（著作権・知的財産権）</h2>
        <ol className="list-decimal pl-6">
          <li>利用者が当サービスを利用して投稿したコンテンツの著作権は、当該利用者または正当な権利者に帰属します。</li>
          <li>ただし、当サービスは、投稿コンテンツをサービスの運営・宣伝等の目的で無償で利用できるものとします。</li>
        </ol>
      </section>
      <section className="mb-4">
        <h2 className="font-bold mb-2">第7条（利用制限および登録抹消）</h2>
        <p>当サービスは、利用者が本規約に違反した場合、事前の通知なく利用制限または登録抹消等の措置を講じることができます。</p>
      </section>
      <section className="mb-4">
        <h2 className="font-bold mb-2">第8条（免責事項）</h2>
        <ol className="list-decimal pl-6">
          <li>当サービスは、サービスに事実上または法律上の瑕疵がないことを保証しません。</li>
          <li>利用者が当サービスを利用したことにより生じた損害について、一切の責任を負いません。</li>
        </ol>
      </section>
      <section className="mb-4">
        <h2 className="font-bold mb-2">第9条（規約の変更）</h2>
        <p>当サービスは、必要と判断した場合には、利用者に通知することなく本規約を変更できるものとします。</p>
      </section>
      <section className="mb-4">
        <h2 className="font-bold mb-2">第10条（準拠法・裁判管轄）</h2>
        <p>本規約の解釈にあたっては、日本法を準拠法とします。サービスに関して紛争が生じた場合、当サービスの運営者所在地を管轄する裁判所を専属的合意管轄とします。</p>
      </section>
      <div className="mt-8 text-right text-sm text-gray-500">2025年6月24日 制定</div>
      <div className="mt-8 text-center">
        <a href="/terms.pdf" target="_blank" className="text-blue-600 underline">PDF版をダウンロード</a>
      </div>
    </div>
  );
} 