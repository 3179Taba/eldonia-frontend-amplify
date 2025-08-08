"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "../lib/i18n-provider";

export default function SupportPage() {
  const { t, locale } = useI18n();

  return (
    <main className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {t("support.title")}
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        {t("support.desc")}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/support/faq"
          className="block bg-white rounded-lg shadow-md p-6 hover:bg-blue-50 transition text-gray-800 hover:text-gray-900"
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-800">{t("support.faq")}</h2>
          <p className="text-sm text-gray-700">{t("support.faq_desc")}</p>
        </Link>
        <Link
          href="/support/contact"
          className="block bg-white rounded-lg shadow-md p-6 hover:bg-blue-50 transition text-gray-800"
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-800">{t("support.contact")}</h2>
          <p className="text-gray-600 text-sm">{t("support.contact_desc")}</p>
        </Link>
        <Link
          href="/support/tech"
          className="block bg-white rounded-lg shadow-md p-6 hover:bg-blue-50 transition text-gray-800"
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-800">{t("support.tech")}</h2>
          <p className="text-gray-600 text-sm">{t("support.tech_desc")}</p>
        </Link>
        <Link
          href="/support/terms"
          className="block bg-white rounded-lg shadow-md p-6 hover:bg-blue-50 transition text-gray-800"
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-800">{t("support.terms")}</h2>
          <p className="text-gray-600 text-sm">{t("support.terms_desc")}</p>
        </Link>
        <Link
          href="/support/feedback"
          className="block bg-white rounded-lg shadow-md p-6 hover:bg-blue-50 transition text-gray-800"
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-800">{t("support.feedback")}</h2>
          <p className="text-gray-600 text-sm">{t("support.feedback_desc")}</p>
        </Link>
      </div>
    </main>
  );
}
