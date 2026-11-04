import { useMemo, useState } from 'react'
import { DATA } from '../../data/trade'
import { LABOR_ABUNDANT, partnerTest, type Scope } from '../../hoExamples'
import { HO_TEXT } from '../../hoText'
import { countryName, useI18n } from '../../i18n'
import { THEORY_TEXT } from '../../theoryText'
import { LogScatter } from '../theory/LogScatter'
import { perWorker } from './units'
import { ScopeToggle, Stat } from './IntensityCard'

/** Partner-by-partner Heckscher–Ohlin sign test: capital per worker against the intensity of Korea's trade. */
export function PartnerCard({ scope, onScope }: { scope: Scope; onScope: (s: Scope) => void }) {
  const { lang } = useI18n()
  const c = HO_TEXT[lang].partners
  const [selected, setSelected] = useState<string | null>(null)
  const rows = useMemo(() => partnerTest(scope), [scope])
  const year = DATA.goods?.year ?? 0
  if (!rows.length) return null
  const name = (iso: string) => countryName(iso, lang)
  const labor = rows.filter((r) => r.k < LABOR_ABUNDANT * r.korea)
  const others = rows.filter((r) => r.k >= LABOR_ABUNDANT * r.korea)
  const hits = (list: typeof rows) => list.filter((r) => r.match).length
  // Name the biggest trading partners in each group.
  const trade = (iso: string) => (DATA.partners.TOTAL?.X?.[year]?.[iso] ?? 0) + (DATA.partners.TOTAL?.M?.[year]?.[iso] ?? 0)
  const top = (list: typeof rows) =>
    [...list]
      .sort((a, b) => trade(b.iso) - trade(a.iso))
      .slice(0, 3)
      .map((r) => name(r.iso))
      .join(', ') || '—'
  const xs = rows.map((r) => r.k / r.korea)
  const share = `${Math.round(LABOR_ABUNDANT * 100)}%`

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="text-lg font-bold">{c.title}</h3>
        <ScopeToggle scope={scope} onScope={onScope} />
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.body(year)}</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label={c.stats.all} value={`${hits(rows)}/${rows.length}`} />
        <Stat label={c.stats.labor(share)} value={`${hits(labor)}/${labor.length}`} />
        <Stat label={c.stats.others} value={`${hits(others)}/${others.length}`} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-a" />
          {c.match}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-b" />
          {c.miss}
        </span>
      </div>
      <LogScatter
        points={rows.map((r) => ({ iso: r.iso, x: r.k / r.korea, y: r.exports / r.imports, tone: r.match ? 'a' : 'b', label: name(r.iso) }))}
        xLabel={c.x}
        yLabel={c.y}
        formatX={(v) => (v >= 1 ? v.toFixed(1) : v.toFixed(2))}
        formatY={(v) => v.toFixed(2)}
        line={{ from: [Math.min(...xs) / 1.5, 1], to: [Math.max(...xs) * 1.5, 1], label: c.equal }}
        marks={[{ x: 1, label: c.same }]}
        padY={1.1}
        selected={selected}
        onPick={(iso) => setSelected(iso === selected ? null : iso)}
        tooltip={(iso) => {
          const r = rows.find((q) => q.iso === iso)!
          return { title: name(iso), lines: c.tooltip(perWorker(r.k, lang), perWorker(r.exports, lang), perWorker(r.imports, lang), r.match) }
        }}
      />
      <p className="mt-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
        💡 {c.reading(hits(rows), rows.length, hits(labor), labor.length, top(labor.filter((r) => r.match)), top(others.filter((r) => !r.match)))}
      </p>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">📚 {c.why}</p>
      <details className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        <summary className="cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400">⚠️ {THEORY_TEXT[lang].caution}</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
          {c.cautions.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </details>
    </section>
  )
}
