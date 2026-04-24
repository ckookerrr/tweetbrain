"use client"

import { useState, useEffect } from "react"
import { Copy, Trash2, GripVertical, List, Check } from "lucide-react"
import { getQueue, updateQueue, removeFromQueue } from "@/lib/storage"
import type { QueueEntry } from "@/lib/types"

const TYPE_LABEL: Record<string, string> = {
  short: "Short",
  thread: "Thread",
  provocative: "Bold",
}

const TYPE_COLOR: Record<string, string> = {
  short: "bg-blue-900/40 text-blue-300",
  thread: "bg-green-900/40 text-green-300",
  provocative: "bg-orange-900/40 text-orange-300",
}

export default function QueuePage() {
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [dragging, setDragging] = useState<number | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    setQueue(getQueue())
  }, [])

  const copyItem = async (entry: QueueEntry) => {
    const text = entry.content + "\n\n" + entry.hashtags.map((h) => `#${h}`).join(" ")
    await navigator.clipboard.writeText(text)
    setCopied(entry.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const removeItem = (id: string) => {
    removeFromQueue(id)
    setQueue(getQueue())
  }

  const handleDragStart = (index: number) => setDragging(index)

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragging === null || dragging === index) return
    const updated = [...queue]
    const [item] = updated.splice(dragging, 1)
    updated.splice(index, 0, item)
    setDragging(index)
    setQueue(updated)
    updateQueue(updated)
  }

  const handleDragEnd = () => setDragging(null)

  if (queue.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold">Queue</h1>
        <div className="flex flex-col items-center justify-center h-48 text-zinc-500 space-y-2">
          <List className="w-10 h-10 opacity-30" />
          <p className="text-sm">No posts queued. Save some posts for later!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Queue</h1>
        <span className="text-sm text-zinc-500">{queue.length} queued</span>
      </div>

      <div className="space-y-2">
        {queue.map((entry, i) => (
          <div
            key={entry.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            className={`bg-zinc-900 border rounded-xl p-4 space-y-3 transition-all cursor-grab active:cursor-grabbing ${
              dragging === i ? "border-violet-500 opacity-60" : "border-zinc-800"
            }`}
          >
            <div className="flex items-start gap-2">
              <GripVertical className="w-4 h-4 text-zinc-600 mt-1 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLOR[entry.type] ?? ""}`}
                  >
                    {TYPE_LABEL[entry.type]}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {new Date(entry.savedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-white text-sm leading-relaxed line-clamp-3">
                  {entry.content}
                </p>
                <div className="flex flex-wrap gap-1">
                  {entry.hashtags.map((h) => (
                    <span key={h} className="text-xs text-violet-400">
                      #{h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 ml-6">
              <button
                onClick={() => copyItem(entry)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-sm text-white rounded-lg py-2 transition-colors"
              >
                {copied === entry.id ? (
                  <Check className="w-3.5 h-3.5 text-green-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied === entry.id ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => removeItem(entry.id)}
                className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-red-900/40 text-zinc-400 hover:text-red-400 rounded-lg px-3 py-2 transition-colors"
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
