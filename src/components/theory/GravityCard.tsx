import { useMemo, useState } from 'react'
import type { View } from '../../data/trade'
import { money } from '../../format'
import { lonLat } from '../../geo'
import { countryName, useI18n } from '../../i18n'
import { gravity, MIN_GDP, tCritical } from '../../theory'
import { THEORY_TEXT } from '../../theoryText'
import { LogScatter, type ScatterPoint } from './LogScatter'
import { TheoryCard } from './TheoryCard'

interface Props {
  view: View
  product: string
  year: number
  selected: string | null
  onPick: (iso: string) => void
}

type Mode = 'fit' | 'gdp' | 'dist'

const LABELED = 14
const LISTED = 5

export function GravityCard({ view, product, year, selected, onPick }: Props) {
  const { lang } = useI18n()
  const tt = THEORY_TEXT[lang]
  const g = tt.gravity
  const [mode, setMode] = useState<Mode>('fit')
  const result = useMemo(() => gravity({ view, product, year }, lonLat), [view, product, year])

  const fmtMoney = (v: number) => money(v, lang, { short: true })
  const fmtGdp = (billions: number) => money(billions * 1000, lang, { short: true })
  const fmtKm = (km: number) => `${Math.round(km).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US')}km`
  const name = (iso: string) => countryName(iso, lang)

  if (!result) {
    return (
      <TheoryCard title={g.title} question={g.question} formula={g.formula} reading={[]} cautions={g.cautions('—')}>
        <p className="py-10 text-center text-sm text-slate-400">{tt.noData}</p>
      </TheoryCard>
    )
  }

  const { points, fit } = result
  const biggest = new Set([...points].sort((a, b) => b.trade - a.trade).slice(0, LABELED).map((p) => p.iso))
  const meanLn = (f: (p: (typeof points)[number]) => number) => points.reduce((s, p) => s + Math.log(f(p)), 0) / points.length
  const predict = (gdp: number, km: number) => Math.exp(fit.a + fit.b1 * Math.log(gdp) + fit.b2 * Math.log(km))

  const scatter: ScatterPoint[] = points.map((p) => ({
    iso: p.iso,
    x: mode === 'fit' ? p.predicted : mode === 'gdp' ? p.gdp : p.km,
    y: p.trade,
    tone: p.ratio >= 1 ? 'a' : 'b',
    label: biggest.has(p.iso) || p.iso === selected ? name(p.iso) : undefined,
  }))

  const range = (f: (p: (typeof points)[number]) => number): [number, number] => [Math.min(...points.map(f)), Math.max(...points.map(f))]
  const line = (() => {
    if (mode === 'fit') {
      const [lo, hi] = range((p) => Math.min(p.trade, p.predicted))
      const [, top] = range((p) => Math.max(p.trade, p.predicted))
      return { from: [lo, lo] as [number, number], to: [Math.max(hi, top), Math.max(hi, top)] as [number, number], label: g.lines.fit }
    }
    if (mode === 'gdp') {
      const km = Math.exp(meanLn((p) => p.km))
      const [lo, hi] = range((p) => p.gdp)
      return { from: [lo, predict(lo, km)] as [number, number], to: [hi, predict(hi, km)] as [number, number], label: g.lines.gdp }
    }
    const gdp = Math.exp(meanLn((p) => p.gdp))
    const [lo, hi] = range((p) => p.km)
    return { from: [lo, predict(gdp, lo)] as [number, number], to: [hi, predict(gdp, hi)] as [number, number], label: g.lines.dist }
  })()

  const sorted = [...points].sort((a, b) => b.ratio - a.ratio)
  const over = sorted.slice(0, LISTED)
  const under = sorted.slice(-LISTED).reverse()
  const sig = (b: number, se: number) => Math.abs(b / se) > tCritical(fit.n - 3)

  return (
    <TheoryCard
      title={g.title}
      question={g.question}
      formula={g.formula}
      reading={[g.reading(fit.b1, fit.b2, `${Math.round(fit.r2 * 100)}%`), g.benchmark]}
      cautions={[...g.cautions(over.slice(0, 3).map((p) => name(p.iso)).join(', ')), g.sample(fmtGdp(MIN_GDP))]}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={g.stats.b1} value={fit.b1.toFixed(2)} sub={g.se(fit.se1.toFixed(2), sig(fit.b1, fit.se1))} />
        <Stat label={g.stats.b2} value={fit.b2.toFixed(2)} sub={g.se(fit.se2.toFixed(2), sig(fit.b2, fit.se2))} />
        <Stat label={g.stats.r2} value={fit.r2.toFixed(2)} />
        <Stat label={g.stats.n} value={g.countries(fit.n)} sub={String(year)} />
      </div>

      <div className="mt-4 flex justify-end">
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs dark:bg-slate-800">
          {(['fit', 'gdp', 'dist'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={'rounded-md px-2.5 py-1 ' + (mode === m ? 'bg-white font-semibold shadow-sm dark:bg-slate-950' : 'text-slate-500 dark:text-slate-400')}
            >
              {g.modes[m]}
            </button>
          ))}
        </div>
      </div>

      <LogScatter
        points={scatter}
        xLabel={mode === 'fit' ? g.axes.predicted : mode === 'gdp' ? g.axes.gdp : g.axes.dist}
        yLabel={g.axes.actual}
        formatX={mode === 'fit' ? fmtMoney : mode === 'gdp' ? fmtGdp : fmtKm}
        formatY={fmtMoney}
        line={line}
        selected={selected}
        onPick={onPick}
        tooltip={(iso) => {
          const p = points.find((q) => q.iso === iso)!
          return {
            title: `${name(iso)} · ${g.ratio(ratioText(p.ratio))}`,
            lines: g.tooltip(money(p.trade, lang), money(p.predicted, lang), fmtGdp(p.gdp), fmtKm(p.km)),
          }
        }}
      />

      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(
          [
            ['a', g.over, over],
            ['b', g.under, under],
          ] as const
        ).map(([tone, title, list]) => (
          <div key={tone}>
            <div className={'mb-1.5 text-xs font-semibold ' + (tone === 'a' ? 'text-a' : 'text-b')}>{title}</div>
            <ol className="space-y-1 text-sm">
              {list.map((p) => (
                <li key={p.iso}>
                  <button
                    type="button"
                    onClick={() => onPick(p.iso)}
                    className={
                      'flex w-full items-baseline justify-between gap-2 rounded-md px-2 py-1 text-left ' +
                      (p.iso === selected ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50')
                    }
                  >
                    <span className="truncate">{name(p.iso)}</span>
                    <span className="shrink-0 text-xs text-slate-500 tabular-nums dark:text-slate-400">
                      {fmtMoney(p.trade)} · {g.ratio(ratioText(p.ratio))}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </TheoryCard>
  )
}

/** Ratios spread over orders of magnitude: keep two significant digits rather than rounding small ones to 0.0. */
function ratioText(r: number): string {
  if (r >= 10) return r.toFixed(0)
  if (r >= 1) return r.toFixed(1)
  if (r >= 0.01) return r.toFixed(2)
  return '<0.01'
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50">
      <div className="truncate text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-0.5 text-xl font-bold tabular-nums">{value}</div>
      {sub && <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">{sub}</div>}
    </div>
  )
}
