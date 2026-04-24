"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import type { Lang, Translations } from "./i18n"
import { t } from "./i18n"

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  tr: Translations
}

const LangContext = createContext<LangContextType>({
  lang: "ru",
  setLang: () => {},
  tr: t.ru as Translations,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru")

  useEffect(() => {
    const saved = localStorage.getItem("tweetbrain_lang") as Lang | null
    if (saved === "en" || saved === "ru") setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem("tweetbrain_lang", l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang, tr: t[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
