"use client"

interface HookAlternativesProps {
  hooks: string[]
  onSelect: (hook: string) => void
}

export default function HookAlternatives({ hooks, onSelect }: HookAlternativesProps) {
  if (!hooks.length) return null

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500 uppercase tracking-wider">Hook A/B Alternatives</p>
      <div className="space-y-2">
        {hooks.map((hook, i) => (
          <button
            key={i}
            onClick={() => onSelect(hook)}
            className="w-full text-left bg-zinc-800/60 hover:bg-violet-900/30 border border-zinc-700 hover:border-violet-500 rounded-lg p-3 text-sm text-zinc-300 hover:text-white transition-all"
          >
            <span className="text-violet-400 text-xs font-semibold mr-2">
              {String.fromCharCode(65 + i)}
            </span>
            {hook}
          </button>
        ))}
      </div>
    </div>
  )
}
