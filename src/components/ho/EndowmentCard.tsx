import { useMemo } from 'react'
import { DATA, WORLD } from '../../data/trade'
import { percent } from '../../format'
import { capitalPerWorker } from '../../hoExamples'
import { HO_TEXT } from '../../hoText'
import { countryFlag, countryName, useI18n } from '../../i18n'
import { KOREA } from '../../realExamples'
import { THEORY_TEXT } from '../../theoryText'
import { perWorker } from './units'

/** Within this factor of Korea's capital per worker, a partner counts as similarly endowed. */
const SIMILAR = 1.2

/** Capital per worker of Korea and its main partners, and how Korea's capital and labour have grown. */
export function EndowmentCard({ year }: { year: number }) {
  const { lang } = useI18n()
  const d = HO_TEXT[lang].endow
  const name = (iso: string) => countryName(iso, lang)
  const rows = useMemo(() => {
    const isos = new Set([KOREA, ...Object.keys(DATA.goods?.bilateral.X ?? {})])
    isos.delete(WORLD)
    return [...isos]
      .map((iso) => ({ iso, k: capitalPerWorker(iso, year) }))
      .filter((r): r is { iso: string; k: NonNullable<typeof r.k> } => r.k !== null)
      .sort((a, b) => b.k.value - a.k.value)
  }, [year])
  const korea = rows.find((r) => r.iso === KOREA)
  if (!korea) return null

  const kk = korea.k.value
  const years = Object.keys(DATA.pwt?.capital[KOREA] ?? {}).map(Number)
  const y0 = Math.min(...years)
  const y1 = korea.k.year
  const max = rows[0].k.value
  const others = rows.filter((r) => r.iso !== KOREA)
  const below = [...others].reverse().slice(0, 3).map((r) => name(r.iso)).join(', ')
  // Korea's biggest trading partners among the similarly endowed.
  const trade = (iso: string) => (DATA.partners.TOTAL?.X?.[y1]?.[iso] ?? 0) + (DATA.partners.TOTAL?.M?.[y1]?.[iso] ?? 0)
  const similar = others
    .filter((r) => r.k.value < kk * SIMILAR && r.k.value > kk / SIMILAR)
    .sort((a, b) => trade(b.iso) - trade(a.iso))
    .slice(0, 5)
    .map((r) => name(r.iso))
    .join(', ')
  const above = others.filter((r) => r.k.value >= kk * SIMILAR).slice(0, 4).map((r) => name(r.iso)).join(', ')
  const k0 = capitalPerWorker(KOREA, y0)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold">{d.title}</h3>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-200">
          {d.rank(rows.indexOf(korea) + 1, rows.length)} · {y1}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{d.body}</p>

      <ol className="mt-4 gap-x-8 text-sm sm:columns-2">
        {rows.map((r) => (
          <li key={r.iso} className={'mb-1.5 break-inside-avoid rounded-lg px-2 py-1 ' + (r.iso === KOREA ? 'bg-indigo-50 font-semibold dark:bg-indigo-950/50' : '')}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 truncate">
                {countryFlag(r.iso)} {name(r.iso)}
              </span>
              <span className="shrink-0 text-xs text-slate-500 tabular-nums dark:text-slate-400">{perWorker(r.k.value, lang)}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={'h-full rounded-full ' + (r.iso === KOREA ? 'bg-indigo-500' : r.k.value > kk ? 'bg-b' : 'bg-a')} style={{ width: `${(r.k.value / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>

      {k0 && (
        <p className="mt-3 text-xs text-slate-500 tabular-nums dark:text-slate-400">
          {d.growth(
            y0,
            y1,
            percent((korea.k.K / k0.K - 1) * 100, { signed: true }),
            percent((korea.k.L / k0.L - 1) * 100, { signed: true }),
          )}
        </p>
      )}
      <p className="mt-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
        💡 {d.reading(perWorker(kk, lang), below, similar, above)}
      </p>
      <details className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        <summary className="cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400">⚠️ {THEORY_TEXT[lang].caution}</summary>
        <p className="mt-2 text-xs">{d.caution}</p>
      </details>
    </section>
  )
}
