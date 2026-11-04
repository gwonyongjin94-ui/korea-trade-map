import { useMemo, useState } from 'react'
import { chapterName } from '../../data/products'
import { money, percent } from '../../format'
import { koreaIntensity, type Scope } from '../../hoExamples'
import { HO_TEXT } from '../../hoText'
import { useI18n } from '../../i18n'
import { LogScatter } from '../theory/LogScatter'
import { perWorker } from './units'

const short = (name: string) => name.replace(/\s*\(.*\)/, '')

/** Toggle between all goods and manufactures, shared by the two intensity cards. */
export function ScopeToggle({ scope, onScope }: { scope: Scope; onScope: (s: Scope) => void }) {
  const { lang } = useI18n()
  const labels = HO_TEXT[lang].intensity.scope
  return (
    <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs dark:bg-slate-800">
      {(['all', 'manufactures'] as const).map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onScope(k)}
          aria-pressed={scope === k}
          className={'rounded-md px-2.5 py-1.5 ' + (scope === k ? 'bg-white font-semibold shadow-sm dark:bg-slate-950' : 'text-slate-500 dark:text-slate-400')}
        >
          {labels[k]}
        </button>
      ))}
    </div>
  )
}

/** Leontief-style check: capital intensity of Korea's exports against its imports, and by chapter. */
export function IntensityCard({ year, scope, onScope }: { year: number; scope: Scope; onScope: (s: Scope) => void }) {
  const { lang } = useI18n()
  const c = HO_TEXT[lang].intensity
  const [selected, setSelected] = useState<string | null>(null)
  const r = useMemo(() => koreaIntensity(year, scope), [year, scope])
  if (r.exports === null || r.imports === null || !r.fit) return null
  const fit = r.fit
  const xs = r.points.map((p) => p.kappa)
  const lo = Math.min(...xs)
  const hi = Math.max(...xs)
  const predict = (x: number) => Math.exp(fit.intercept + fit.slope * Math.log(x))
  const name = (code: string) => chapterName(code, lang, '')

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="max-w-3xl text-lg font-bold">{c.title}</h3>
        <ScopeToggle scope={scope} onScope={onScope} />
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.body}</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label={c.exports} value={perWorker(r.exports, lang)} sub={c.perWorker} />
        <Stat label={c.imports} value={perWorker(r.imports, lang)} sub={c.perWorker} />
        <Stat label={c.ratio} value={(r.exports / r.imports).toFixed(3)} sub={String(year)} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2">
        <Stat label={c.stats.slope} value={fit.slope.toFixed(2)} sub={c.sig(fit.se.toFixed(2), fit.significant)} />
        <Stat label={c.stats.r} value={fit.r.toFixed(2)} />
        <Stat label={c.stats.n} value={String(fit.n)} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-a" />
          {c.net}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-b" />
          {c.netImport}
        </span>
      </div>
      <LogScatter
        points={r.points.map((p) => ({ iso: p.code, x: p.kappa, y: p.x / p.m, tone: p.x >= p.m ? 'a' : 'b', label: short(name(p.code)) }))}
        xLabel={c.x}
        yLabel={c.y}
        formatX={(v) => v.toFixed(0)}
        formatY={(v) => (v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v >= 0.1 ? v.toFixed(2) : v.toPrecision(1))}
        line={{ from: [lo, predict(lo)], to: [hi, predict(hi)], label: c.line }}
        selected={selected}
        onPick={(code) => setSelected(code === selected ? null : code)}
        tooltip={(code) => {
          const p = r.points.find((q) => q.code === code)!
          return { title: `HS ${code} ${name(code)}`, lines: c.tooltip(perWorker(p.kappa, lang), money(p.x, lang), money(p.m, lang)) }
        }}
      />
      <p className="mt-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
        💡{' '}
        {c.reading(
          year,
          perWorker(r.exports, lang),
          perWorker(r.imports, lang),
          percent((r.exports / r.imports - 1) * 100),
          fit.slope.toFixed(2),
          fit.significant,
          scope,
        )}
      </p>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{c.note}</p>
    </section>
  )
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50">
      <div className="truncate text-xs text-slate-500 dark:text-slate-400" title={label}>
        {label}
      </div>
      <div className="mt-0.5 truncate text-xl font-bold tabular-nums">{value}</div>
      {sub && <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">{sub}</div>}
    </div>
  )
}
