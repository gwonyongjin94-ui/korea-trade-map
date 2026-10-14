import { useEffect } from 'react'
import { useI18n } from '../i18n'
import { THEORY_TEXT } from '../theoryText'
import { RicardoRealCard } from './RicardoRealCard'

export const RICARDO_URL = 'https://gwonyongjin94-ui.github.io/ricardian-model/'

/**
 * The Ricardian model explorer, embedded rather than linked. Its learn-mode guide is pinned to the bottom
 * of its own viewport, so the frame gets a screen-high box and scrolls inside instead of growing to fit.
 */
export function RicardoTab({ year }: { year: number }) {
  const { lang } = useI18n()
  const r = THEORY_TEXT[lang].ricardo
  // On GitHub Pages both apps share an origin, so the explorer can start in the same language as this page.
  // This runs right after the frame is (re)inserted, well before the explorer's script reads the setting.
  useEffect(() => {
    try {
      localStorage.setItem('ricardian-lang', lang)
    } catch {
      // Storage unavailable: the explorer falls back to the browser language.
    }
  }, [lang])
  return (
    <div className="space-y-6">
      <RicardoRealCard year={year} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <h2 className="text-lg font-bold">{r.title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{r.body}</p>
        </div>
        <a
          href={RICARDO_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          {r.open} ↗
        </a>
      </div>
      <iframe
        // Reload with the new language when it changes.
        key={lang}
        src={import.meta.env.DEV ? '/ricardian-model/' : RICARDO_URL}
        title={r.title}
        className="block w-full rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
        style={{ height: 'calc(100dvh - 8rem)', minHeight: 640 }}
      />
    </div>
  )
}
