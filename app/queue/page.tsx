"use client"

import { useState, useEffect } from "react"
import { Copy, Trash2, GripVertical, List, Check } from "lucide-react"
import { getQueue, updateQueue, removeFromQueue } from "@/lib/storage"
import type { QueueEntry } from "@/lib/types"
import { useLang } from "@/lib/lang-context"

const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  short:      { bg: "rgba(29,155,240,0.1)",  color: "#1d9bf0" },
  thread:     { bg: "rgba(0,186,124,0.1)",   color: "#00ba7c" },
  provocative:{ bg: "rgba(249,145,0,0.1)",   color: "#f99100" },
}

export default function QueuePage() {
  const { tr } = useLang()
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const TYPE_LABEL: Record<string, string> = {
    short: tr.tabShort, thread: tr.tabThread, provocative: tr.tabBold,
  }

  useEffect(() => { setQueue(getQueue()) }, [])

  const copyItem = async (entry: QueueEntry) => {
    await navigator.clipboard.writeText(entry.content + "\n\n" + entry.hashtags.map(h => `#${h}`).join(" "))
    setCopied(entry.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const removeItem = (id: string) => { removeFromQueue(id); setQueue(getQueue()) }

  const handleDragStart = (i: number) => setDragging(i)
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault()
    if (dragging === null || dragging === i) return
    const updated = [...queue]
    const [item] = updated.splice(dragging, 1)
    updated.splice(i, 0, item)
    setDragging(i)
    setQueue(updated)
    updateQueue(updated)
  }
  const handleDragEnd = () => setDragging(null)

  return (
    <div>
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", borderColor: "#2f3336" }}>
        <h1 className="font-bold text-lg" style={{ color: "#e7e9ea" }}>{tr.queue}</h1>
        {queue.length > 0 && <span className="text-sm" style={{ color: "#71767b" }}>{queue.length} {tr.queued}</span>}
      </header>

      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3" style={{ color: "#71767b" }}>
          <List className="w-12 h-12 opacity-30" />
          <p className="text-sm">{tr.noQueue}</p>
        </div>
      ) : (
        <div>
          {queue.map((entry, i) => (
            <div
              key={entry.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className="border-b cursor-grab active:cursor-grabbing transition-opacity"
              style={{ borderColor: "#2f3336", opacity: dragging === i ? 0.5 : 1 }}
            >
              <div className="flex gap-3 px-4 py-4">
                <GripVertical className="w-4 h-4 mt-1 shrink-0" style={{ color: "#71767b" }} />
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: "#1d9bf0", color: "#fff" }}>
                  TB
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: TYPE_STYLE[entry.type]?.bg, color: TYPE_STYLE[entry.type]?.color }}>
                      {TYPE_LABEL[entry.type]}
                    </span>
                    <span className="text-xs" style={{ color: "#71767b" }}>
                      {new Date(entry.savedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "#e7e9ea" }}>{entry.content}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {entry.hashtags.map((h) => (
                      <span key={h} className="text-xs" style={{ color: "#1d9bf0" }}>#{h}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 px-4 pb-3 ml-[3.25rem]">
                <button
                  onClick={() => copyItem(entry)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-bold transition-all"
                  style={{ background: "#1d9bf0", color: "#fff" }}
                >
                  {copied === entry.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === entry.id ? tr.copied : tr.copy}
                </button>
                <button
                  onClick={() => removeItem(entry.id)}
                  className="flex items-center justify-center rounded-full px-3 py-2 border transition-all"
                  style={{ borderColor: "#2f3336", color: "#71767b" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
