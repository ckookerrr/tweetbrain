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
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid #2f3336",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="max-w-[600px] mx-auto flex">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors"
              style={{ color: active ? "#1d9bf0" : "#71767b" }}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
