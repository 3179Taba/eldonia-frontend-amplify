"use client";
import React, { useState } from "react";
import { useI18n } from "../../lib/i18n-provider";

export default function FeedbackPage() {
  const { t, locale } = useI18n();
  const [form, setForm] = useState({ feedback: "" });
  const [sent, setSent] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, feedback: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">{t("feedback")}</h1>
      {sent ? (
        <div className="bg-green-100 text-green-800 p-4 rounded">ご意見ありがとうございました！</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">ご意見・ご要望</label>
            <textarea name="feedback" value={form.feedback} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={5} required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">送信</button>
        </form>
      )}
    </main>
  );
} 