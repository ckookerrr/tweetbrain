"use client"

import { useState } from "react"
import { Copy, Check, Bookmark, Clock } from "lucide-react"
import HookAlternatives from "./HookAlternatives"
import type { PostVariant, ThreadVariant, QueueEntry } from "@/lib/types"
import { saveToQueue } from "@/lib/storage"

type Variant = PostVariant | ThreadVariant

interface PostCardProps {
  type: "short" | "thread" | "provocative"
  variant: Variant
  photos: string[]
}

function isThread(v: Variant): v is ThreadVariant {
  return "tweets" in v
}

const TIME_EMOJIS: Record<string, string> = {
  morning: "🌅",
  lunch: "☀️",
  evening: "🌙",
}

export default function PostCard({ type, variant, photos }: PostCardProps) {
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [displayContent, setDisplayContent] = useState<string | null>(null)

  const mainText = isThread(variant)
    ? variant.tweets.join("\n\n")
    : variant.content

  const currentText = displayContent ?? mainText

  const copyText = async () => {
    await navigator.clipboard.writeText(currentText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const saveForLater = () => {
    const entry: QueueEntry = {
      id: `q_${Date.now()}`,
      savedAt: Date.now(),
      type,
      content: currentText,
      hashtags: variant.hashtags,
      photoIndices: variant.selected_photo_indices,
    }
    saveToQueue(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleHookSelect = (hook: string) => {
    if (isThread(variant)) {
      const tweets = [...variant.tweets]
      const first = tweets[0]
      const nSlash = first.match(/^\d+\/\d+\s/)?.[0] ?? ""
      tweets[0] = nSlash + hook
      setDisplayContent(tweets.join("\n\n"))
    } else {
      setDisplayContent(hook)
    }
  }

  return (
    <div className="space-y-4">
      {variant.selected_photo_indices.length > 0 && photos.length > 0 && (
        <div className="flex gap-2">
          {variant.selected_photo_indices
            .filter((i) => photos[i])
            .map((i) => (
              <div key={i} className="relative">
                <img
                  src={`data:image/jpeg;base64,${photos[i]}`}
                  alt={`Selected photo ${i}`}
                  className="w-24 h-24 object-cover rounded-lg ring-2 ring-violet-500"
                />
                <span className="absolute bottom-1 left-1 bg-violet-600 text-white text-xs px-1 rounded">
                  #{i}
                </span>
              </div>
            ))}
        </div>
      )}

      <div className="bg-zinc-800 rounded-xl p-4 space-y-3">
        {isThread(variant) ? (
          <div className="space-y-3">
            {(displayContent ? displayContent.split("\n\n") : variant.tweets).map(
              (tweet, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-white text-sm leading-relaxed pt-1">{tweet}</p>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-white leading-relaxed">{currentText}</p>
        )}

        {!isThread(variant) && (
          <p className="text-right text-xs text-zinc-500">
            {currentText.length}/280
            {currentText.length > 280 && (
              <span className="text-red-400 ml-1">Over limit!</span>
            )}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {variant.hashtags.map((tag) => (
          <span
            key={tag}
            className="bg-zinc-800 text-violet-400 text-xs px-2 py-1 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-400">
        <Clock className="w-3 h-3" />
        <span>
          {TIME_EMOJIS[variant.best_time] ?? "⏰"}{" "}
          <span className="capitalize">{variant.best_time}</span> —{" "}
          {variant.best_time_reason}
        </span>
      </div>

      <HookAlternatives hooks={variant.hook_alternatives} onSelect={handleHookSelect} />

      <div className="flex gap-2 pt-1">
        <button
          onClick={copyText}
          className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={saveForLater}
          className="flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg px-4 py-2.5 text-sm transition-colors"
        >
          {saved ? <Check className="w-4 h-4 text-green-400" /> : <Bookmark className="w-4 h-4" />}
          {saved ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  )
}
