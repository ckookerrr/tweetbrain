"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, ChevronRight, FileText } from "lucide-react"
import { getDrafts, deleteDraft } from "@/lib/storage"
import type { DraftEntry } from "@/lib/types"

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function DraftsPage() {
  const router = useRouter()
  const [drafts, setDrafts] = useState<DraftEntry[]>([])

  useEffect(() => {
    setDrafts(getDrafts())
  }, [])

  const handleDelete = (id: string) => {
    deleteDraft(id)
    setDrafts(getDrafts())
  }

  const handleOpen = (draft: DraftEntry) => {
    sessionStorage.setItem(
      "tweetbrain_current",
      JSON.stringify({ posts: draft.posts, photos: [], draftId: draft.id })
    )
    router.push("/results")
  }

  if (drafts.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Drafts</h1>
        <div className="flex flex-col items-center justify-center h-48 text-zinc-500 space-y-2">
          <FileText className="w-10 h-10 opacity-30" />
          <p className="text-sm">No drafts yet. Generate some posts first!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Drafts</h1>
        <span className="text-sm text-zinc-500">{drafts.length} saved</span>
      </div>

      <div className="space-y-2">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => handleOpen(draft)}
              className="w-full flex items-center gap-3 p-4 hover:bg-zinc-800/50 transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {draft.posts.short.content.slice(0, 80)}…
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  {formatDate(draft.timestamp)} · {draft.photoCount} photo
                  {draft.photoCount !== 1 ? "s" : ""}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
            </button>
            <div className="border-t border-zinc-800 px-4 py-2 flex justify-between">
              <div className="flex flex-wrap gap-1">
                {draft.posts.short.hashtags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs text-violet-400">
                    #{tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleDelete(draft.id)}
                className="text-zinc-600 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
