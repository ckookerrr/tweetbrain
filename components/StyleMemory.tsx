"use client"

import { useState, useEffect } from "react"
import { Brain, Save, Trash2 } from "lucide-react"
import { getUserStyle, saveUserStyle } from "@/lib/storage"

interface StyleMemoryProps {
  onStyleChange: (style: string) => void
}

export default function StyleMemory({ onStyleChange }: StyleMemoryProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const style = getUserStyle()
    setInput(style)
    if (style) onStyleChange(style)
  }, [onStyleChange])

  const handleSave = () => {
    saveUserStyle(input)
    onStyleChange(input)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleClear = () => {
    setInput("")
    saveUserStyle("")
    onStyleChange("")
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-400 transition-colors"
      >
        <Brain className="w-4 h-4" />
        My Style
        {getUserStyle() && (
          <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
        )}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-zinc-500">
            Paste 5–10 of your existing tweets. Claude will match your tone.
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your existing tweets here..."
            className="w-full h-32 bg-zinc-800 text-white rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm placeholder-zinc-600"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg px-3 py-1.5 text-sm transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saved ? "Saved!" : "Save Style"}
            </button>
            {input && (
              <button
                onClick={handleClear}
                className="flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg px-3 py-1.5 text-sm transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
