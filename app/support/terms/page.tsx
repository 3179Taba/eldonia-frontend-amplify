"use client";
import React from "react";
import { useI18n } from "../../lib/i18n-provider";

export default function TermsPage() {
  const { t, locale } = useI18n();
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">{t("support.terms")}</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-4 text-gray-800">
                  <p className="text-gray-700">{t("support.terms_intro")}</p>
        <ul className="list-disc pl-6">
                      <li><a href="/terms" className="text-blue-600 underline">{t("support.terms_link")}</a></li>
            <li><a href="/premium-terms" className="text-blue-600 underline">{t("support.privacy_link")}</a></li>
        </ul>
      </div>
    </main>
  );
}
