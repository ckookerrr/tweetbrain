"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Mic, FileText, List } from "lucide-react"
import { useLang } from "@/lib/lang-context"

export default function Nav() {
  const pathname = usePathname()
  const { tr } = useLang()

  const links = [
    { href: "/", label: tr.navRecord, icon: Mic },
    { href: "/drafts", label: tr.navDrafts, icon: FileText },
    { href: "/queue", label: tr.navQueue, icon: List },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur border-t border-zinc-800 z-50">
      <div className="max-w-lg mx-auto flex" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
                active ? "text-violet-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
