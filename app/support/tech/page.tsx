"use client";
import React from "react";
import { useI18n } from "../../lib/i18n-provider";

export default function TechSupportPage() {
  const { t, locale } = useI18n();
  return (
    <main className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">{t("support.tech")}</h1>
      <div className="bg-white rounded-lg shadow p-6 text-gray-800">
        <p className="mb-4 text-gray-700">{t("support.tech_intro")}</p>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>{t("support.tech_email")}</li>
            <li>{t("support.tech_form")}</li>
        </ul>
      </div>
    </main>
  );
}
