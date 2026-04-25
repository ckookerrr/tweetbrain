"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, ChevronRight, FileText } from "lucide-react"
import { getDrafts, deleteDraft } from "@/lib/storage"
import type { DraftEntry } from "@/lib/types"
import { useLang } from "@/lib/lang-context"

function formatDate(ts: number, lang: string) {
  return new Date(ts).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

export default function DraftsPage() {
  const router = useRouter()
  const { tr, lang } = useLang()
  const [drafts, setDrafts] = useState<DraftEntry[]>([])

  useEffect(() => { setDrafts(getDrafts()) }, [])

  const handleDelete = (id: string) => { deleteDraft(id); setDrafts(getDrafts()) }
  const handleOpen = (draft: DraftEntry) => {
    sessionStorage.setItem("tweetbrain_current", JSON.stringify({ posts: draft.posts, photos: [], draftId: draft.id }))
    router.push("/results")
  }

  return (
    <div>
      <header className="sticky top-0 z-40 px-4 py-3 border-b" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", borderColor: "#2f3336" }}>
        <h1 className="font-bold text-lg" style={{ color: "#e7e9ea" }}>{tr.drafts}</h1>
      </header>

      {drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: "#71767b" }}>
          <FileText className="w-12 h-12 opacity-30" />
          <p className="text-sm">{tr.noDrafts}</p>
        </div>
      ) : (
        <div>
          {drafts.map((draft) => (
            <div key={draft.id} className="border-b" style={{ borderColor: "#2f3336" }}>
              <button onClick={() => handleOpen(draft)} className="w-full flex items-center gap-3 px-4 py-4 text-left transition-colors" style={{ color: "#e7e9ea" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "#1d9bf0", color: "#fff" }}>
                  TB
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#e7e9ea" }}>
                    {(draft.posts.post?.sizes?.m ?? draft.posts.dump ?? "").slice(0, 80)}…
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs" style={{ color: "#71767b" }}>
                      {formatDate(draft.timestamp, lang)}
                    </p>
                    <div className="flex gap-1">
                      {(draft.posts.post?.hashtags ?? []).slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs" style={{ color: "#1d9bf0" }}>#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#71767b" }} />
              </button>
              <div className="flex justify-end px-4 pb-2">
                <button onClick={() => handleDelete(draft.id)} className="p-1.5 rounded-full transition-colors" style={{ color: "#71767b" }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
