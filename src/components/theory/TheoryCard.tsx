import type { ReactNode } from 'react'
import { useI18n } from '../../i18n'
import { THEORY_TEXT } from '../../theoryText'

interface Props {
  title: string
  question: string
  formula: string
  /** Extra line under the formula, e.g. what the index's range means. */
  note?: string
  reading: string[]
  cautions: string[]
  children: ReactNode
}

/** Frame shared by the theory sections: question, formula, chart, how to read it, caveats. */
export function TheoryCard({ title, question, formula, note, reading, cautions, children }: Props) {
  const { lang } = useI18n()
  const tt = THEORY_TEXT[lang]
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mt-1 text-slate-600 dark:text-slate-300">{question}</p>
      <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
        <div className="text-xs text-slate-500 dark:text-slate-400">{tt.formula}</div>
        <div className="mt-0.5 overflow-x-auto font-mono text-sm whitespace-nowrap">{formula}</div>
        {note && <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{note}</p>}
      </div>
      <div className="mt-4">{children}</div>
      {reading.length > 0 && (
        <div className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
          <div className="mb-1 text-xs font-semibold">💡 {tt.howToRead}</div>
          {reading.map((r) => (
            <p key={r} className="mt-1">
              {r}
            </p>
          ))}
        </div>
      )}
      <details className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        <summary className="cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400">⚠️ {tt.caution}</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
          {cautions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </details>
    </section>
  )
}
