"use client"

interface HookAlternativesProps {
  hooks: string[]
  onSelect: (hook: string) => void
}

export default function HookAlternatives({ hooks, onSelect }: HookAlternativesProps) {
  if (!hooks.length) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest px-1" style={{ color: "#71767b" }}>
        Hook A/B
      </p>
      <div className="space-y-2">
        {hooks.map((hook, i) => (
          <button
            key={i}
            onClick={() => onSelect(hook)}
            className="w-full text-left rounded-2xl p-3 text-sm transition-all border"
            style={{ background: "#16181c", borderColor: "#2f3336", color: "#e7e9ea" }}
          >
            <span className="font-bold text-xs mr-2" style={{ color: "#1d9bf0" }}>
              {String.fromCharCode(65 + i)}
            </span>
            {hook}
          </button>
        ))}
      </div>
    </div>
  )
}
