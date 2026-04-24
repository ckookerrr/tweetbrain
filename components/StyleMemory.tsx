"use client"

import { useState, useEffect } from "react"
import { Brain, Save, Trash2 } from "lucide-react"
import { getUserStyle, saveUserStyle } from "@/lib/storage"
import { useLang } from "@/lib/lang-context"

interface StyleMemoryProps {
  onStyleChange: (style: string) => void
}

export default function StyleMemory({ onStyleChange }: StyleMemoryProps) {
  const { tr } = useLang()
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

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: getUserStyle() ? "#1d9bf0" : "#71767b" }}
      >
        <Brain className="w-4 h-4" />
        {tr.myStyle}
      </button>

      {open && (
        <div className="absolute right-4 mt-2 w-72 rounded-2xl border p-4 space-y-3 z-50" style={{ background: "#16181c", borderColor: "#2f3336" }}>
          <p className="text-xs" style={{ color: "#71767b" }}>{tr.styleHint}</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tr.stylePlaceholder}
            rows={5}
            className="w-full rounded-xl p-3 resize-none focus:outline-none text-sm border"
            style={{ background: "#000", color: "#e7e9ea", borderColor: "#2f3336" }}
            onFocus={(e) => (e.target.style.borderColor = "#1d9bf0")}
            onBlur={(e) => (e.target.style.borderColor = "#2f3336")}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold"
              style={{ background: "#1d9bf0", color: "#fff" }}
            >
              <Save className="w-3.5 h-3.5" />
              {saved ? tr.saved : tr.saveStyle}
            </button>
            {input && (
              <button
                onClick={() => { setInput(""); saveUserStyle(""); onStyleChange("") }}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm border"
                style={{ borderColor: "#2f3336", color: "#71767b" }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
