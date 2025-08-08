"use client"

import { useState } from "react"

export default function GoogleTranslateTestPage() {
  const [text, setText] = useState("")
  const [fromLang, setFromLang] = useState("ja")
  const [toLang, setToLang] = useState("en")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTranslate = async () => {
    setLoading(true)
    setError("")
    setResult("")
    try {
      const res = await fetch("/api/translate/google/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from_lang: fromLang, to_lang: toLang })
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data.translated_text)
      } else {
        setError(data.error || "APIエラー")
      }
    } catch (e) {
      setError("通信エラー")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-lg max-w-lg w-full">
        <h1 className="text-2xl font-bold text-white mb-6">Google翻訳API テスト</h1>
        <div className="mb-4">
          <label className="block text-white mb-1">翻訳元テキスト</label>
          <textarea
            className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
            rows={3}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="翻訳したいテキストを入力"
          />
        </div>
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-white mb-1">元言語</label>
            <input
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
              value={fromLang}
              onChange={e => setFromLang(e.target.value)}
              placeholder="例: ja, en, auto"
            />
          </div>
          <div className="flex-1">
            <label className="block text-white mb-1">翻訳先言語</label>
            <input
              className="w-full p-2 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
              value={toLang}
              onChange={e => setToLang(e.target.value)}
              placeholder="例: en, zh, ko"
            />
          </div>
        </div>
        <button
          className="w-full py-2 px-4 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold transition mb-4 disabled:opacity-50"
          onClick={handleTranslate}
          disabled={loading || !text}
        >
          {loading ? "翻訳中..." : "翻訳"}
        </button>
        {result && (
          <div className="mt-4 p-4 bg-green-900/40 rounded text-green-200">
            <div className="font-bold mb-1">翻訳結果</div>
            <div>{result}</div>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-rose-900/40 rounded text-rose-200">
            <div className="font-bold mb-1">エラー</div>
            <div>{error}</div>
          </div>
        )}
      </div>
    </div>
  )
} 