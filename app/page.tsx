"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, AlertCircle } from "lucide-react"
import VoiceRecorder from "@/components/VoiceRecorder"
import PhotoUpload from "@/components/PhotoUpload"
import StyleMemory from "@/components/StyleMemory"
import TwitterConnect from "@/components/TwitterConnect"
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
    if (!transcript.trim()) { setError(tr.errorNoTranscript); return }
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
      } catch { /* ignore */ }
      router.push("/results")
    } catch (e) {
      setError(e instanceof Error ? e.message : tr.errorGeneral)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", borderColor: "#2f3336" }}>
        <div className="flex items-center gap-3">
          {/* X / Twitter logo style */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#1d9bf0" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight" style={{ color: "#e7e9ea" }}>TweetBrain</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Lang switcher */}
          <div className="flex rounded-full p-0.5 text-xs font-bold border" style={{ borderColor: "#2f3336" }}>
            <button
              onClick={() => setLang("ru")}
              className="px-3 py-1 rounded-full transition-all"
              style={lang === "ru" ? { background: "#1d9bf0", color: "#fff" } : { color: "#71767b" }}
            >RU</button>
            <button
              onClick={() => setLang("en")}
              className="px-3 py-1 rounded-full transition-all"
              style={lang === "en" ? { background: "#1d9bf0", color: "#fff" } : { color: "#71767b" }}
            >EN</button>
          </div>
          <TwitterConnect onStyleLoaded={setUserStyle} />
          <StyleMemory onStyleChange={setUserStyle} />
        </div>
      </header>

      {/* Compose area */}
      <div className="border-b px-4 pt-4 pb-2" style={{ borderColor: "#2f3336" }}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-sm" style={{ background: "#1d9bf0", color: "#fff" }}>
            TB
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm mb-3" style={{ color: "#71767b" }}>{tr.sectionVoice}</p>
            <VoiceRecorder transcript={transcript} onTranscriptChange={setTranscript} />
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="border-b px-4 py-4" style={{ borderColor: "#2f3336" }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#71767b" }}>
          {tr.sectionPhotos}
        </p>
        <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-2xl p-3 text-sm" style={{ background: "rgba(244,33,46,0.1)", border: "1px solid rgba(244,33,46,0.3)", color: "#f4212e" }}>
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Generate button */}
      <div className="px-4 py-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 font-bold rounded-full py-3 text-sm transition-all"
          style={{
            background: loading ? "#0f4d78" : "#1d9bf0",
            color: "#fff",
            opacity: loading ? 0.8 : 1,
          }}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {tr.generating}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {tr.generateBtn}
            </>
          )}
        </button>
      </div>
    </div>
  )
}
