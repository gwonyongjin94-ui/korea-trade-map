import { useMemo, useState } from 'react'
import { DATA, WORLD, YEARS } from '../../data/trade'
import { money, percent } from '../../format'
import { countryName, useI18n } from '../../i18n'
import { KOREA, landTest, valueNear } from '../../realExamples'
import { SF_TEXT } from '../../sfText'
import { THEORY_TEXT } from '../../theoryText'
import { LogScatter } from '../theory/LogScatter'
import { TrendChart } from '../TrendChart'

/** Real-data check of the specific factors model: land-rich partners and Korea's farm trade over time. */
export function LandCard({ year, onYear }: { year: number; onYear: (y: number) => void }) {
  const { lang } = useI18n()
  const l = SF_TEXT[lang].land
  const [selected, setSelected] = useState<string | null>(null)
  const { points, fit, korea } = useMemo(() => landTest(year), [year])
  const name = (iso: string) => countryName(iso, lang)

  const farm = YEARS.map((y) => {
    const x = DATA.sectors?.X?.[y]?.[WORLD]
    const m = DATA.sectors?.M?.[y]?.[WORLD]
    return { year: y, x: x?.[0] ?? 0, m: m?.[0] ?? 0 }
  })
  const first = farm[0]
  const last = farm[farm.length - 1]
  const emp = (y: number) => valueNear(DATA.wb?.agriEmp?.[KOREA], y)

  if (!fit || !korea) return null
  const xs = points.map((p) => p.arable)
  const lo = Math.min(...xs, korea.value)
  const hi = Math.max(...xs)
  const predict = (x: number) => Math.exp(fit.intercept + fit.slope * Math.log(x)) * 100
  const top = [...points]
    .filter((p) => p.supplier)
    .sort((a, b) => b.arable - a.arable)
    .slice(0, 4)
    .map((p) => name(p.iso))
    .join(', ')
  const ha = (v: number) => (v >= 0.1 ? v.toFixed(2) : v.toFixed(3))
  const e0 = emp(first.year)
  const e1 = emp(last.year)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold">{l.title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{l.body}</p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label={l.stats.slope} value={fit.slope.toFixed(2)} sub={l.sig(fit.se.toFixed(2), fit.significant)} />
        <Stat label={l.stats.r} value={fit.r.toFixed(2)} />
        <Stat label={l.stats.n} value={String(fit.n)} sub={String(year)} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-b" />
          {l.supplier}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-a" />
          {l.buyer}
        </span>
      </div>
      <LogScatter
        points={points.map((p) => ({ iso: p.iso, x: p.arable, y: p.farmShare * 100, tone: p.supplier ? 'b' : 'a', label: name(p.iso) }))}
        xLabel={l.x}
        yLabel={l.y}
        formatX={(v) => (v >= 1 ? v.toFixed(0) : v >= 0.1 ? v.toFixed(1) : v >= 0.01 ? v.toFixed(2) : v.toFixed(3))}
        formatY={(v) => `${v >= 1 ? v.toFixed(0) : v.toFixed(1)}%`}
        line={{ from: [lo, predict(lo)], to: [hi, predict(hi)], label: l.line }}
        marks={[{ x: korea.value, label: l.korea(ha(korea.value)) }]}
        selected={selected}
        onPick={(iso) => setSelected(iso === selected ? null : iso)}
        tooltip={(iso) => {
          const p = points.find((q) => q.iso === iso)!
          return { title: name(iso), lines: l.tooltip(ha(p.arable), percent(p.farmShare * 100)) }
        }}
      />
      <p className="mt-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
        💡 {l.reading(fit.slope.toFixed(2), fit.r.toFixed(2), top, ha(korea.value))}
      </p>

      <div className="mt-6">
        <TrendChart title={`🌾 ${l.trendTitle}`} data={farm} year={year} onYear={onYear} />
        {e0 && e1 && (
          <p className="mt-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
            💡{' '}
            {l.trendReading(
              first.year,
              money(first.m, lang),
              last.year,
              money(last.m, lang),
              percent((last.m / first.m - 1) * 100, { signed: true }),
              percent(e0.value),
              percent(e1.value),
            )}
          </p>
        )}
      </div>

      <details className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        <summary className="cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400">⚠️ {THEORY_TEXT[lang].caution}</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
          {l.cautions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </details>
    </section>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50">
      <div className="truncate text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-0.5 text-xl font-bold tabular-nums">{value}</div>
      {sub && <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">{sub}</div>}
    </div>
  )
}
