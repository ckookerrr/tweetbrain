"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, AlertCircle } from "lucide-react"
import VoiceRecorder from "@/components/VoiceRecorder"
import PhotoUpload from "@/components/PhotoUpload"
import StyleMemory from "@/components/StyleMemory"
import type { GeneratedPosts } from "@/lib/types"
import { saveDraft } from "@/lib/storage"
import { useLang } from "@/lib/lang-context"

export default function Home() {
  const router = useRouter()
  const { lang, setLang, tr } = useLang()
  const [transcript, setTranscript] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [userStyle, setUserStyle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      setError(tr.errorNoTranscript)
      return
    }

    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, images: photos, userStyle, lang }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || tr.errorGeneral)

      const posts = data as GeneratedPosts
      const draft = saveDraft(transcript, photos.length, posts)

      try {
        sessionStorage.setItem("tweetbrain_current", JSON.stringify({ posts, photos: [], draftId: draft.id }))
      } catch {
        sessionStorage.setItem("tweetbrain_current", JSON.stringify({ posts, photos: [], draftId: draft.id }))
      }
      router.push("/results")
    } catch (e) {
      setError(e instanceof Error ? e.message : tr.errorGeneral)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">TweetBrain</h1>
          <p className="text-sm text-zinc-400">{tr.appSubtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Lang switcher */}
          <div className="flex bg-zinc-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLang("ru")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                lang === "ru" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                lang === "en" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              EN
            </button>
          </div>
          <StyleMemory onStyleChange={setUserStyle} />
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          {tr.sectionVoice}
        </h2>
        <VoiceRecorder transcript={transcript} onTranscriptChange={setTranscript} />
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
          {tr.sectionPhotos}
        </h2>
        <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
      </section>

      {error && (
        <div className="flex items-start gap-2 bg-red-950/50 border border-red-800 rounded-xl p-3 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-4 text-base transition-colors shadow-lg shadow-violet-500/20"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {tr.generating}
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            {tr.generateBtn}
          </>
        )}
      </button>
    </div>
  )
}
