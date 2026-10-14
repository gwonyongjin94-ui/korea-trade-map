import { useId, useMemo } from 'react'
import { DATA } from '../data/trade'
import { goodById } from '../data/goods'
import { money } from '../format'
import { countryFlag, countryName, useI18n } from '../i18n'
import { KOREA, goodRca, ricardoGoods } from '../realExamples'
import { THEORY_TEXT } from '../theoryText'
import { GoodSelect } from './GoodSelect'

interface Props {
  x: string
  y: string
  onGoods: (x: string, y: string) => void
  partner: string
  onPartner: (iso: string) => void
}

/** Ricardian comparison of any two goods for Korea and a partner, via revealed comparative advantage. */
export function RicardoGoodsView({ x, y, onGoods, partner: pick, onPartner }: Props) {
  const { lang } = useI18n()
  const t = THEORY_TEXT[lang]
  const r = t.ricardo.real
  const g = r.goodsMode
  const setX = (v: string) => onGoods(v, y)
  const setY = (v: string) => onGoods(x, v)
  const setPick = onPartner
  const partnerId = useId()
  const rows = useMemo(() => ricardoGoods(x, y), [x, y])
  const row = rows.find((v) => v.iso === pick) ?? rows[0]
  const name = (iso: string) => countryName(iso, lang)
  const gx = goodById(x)
  const gy = goodById(y)
  const label = (good: typeof gx) => (good ? `${good.icon} ${good.name[lang]}` : '')
  const short = (good: typeof gx) => (good ? good.name[lang].replace(/\s*\(.*\)/, '') : '')
  const fmt = (v: number) => (v >= 10 ? v.toFixed(1) : v.toFixed(2))
  const reporters = Object.keys(DATA.goods?.totals ?? {}).length
  const kx = goodRca(KOREA, x)
  const ky = goodRca(KOREA, y)

  const selectors = (
    <div className="flex flex-wrap items-end gap-2">
      <GoodSelect label={g.x} value={x} onChange={setX} groups={g.groups} disabled={[y]} />
      <button
        type="button"
        onClick={() => onGoods(y, x)}
        title={g.swap}
        aria-label={g.swap}
        className="rounded-full border border-slate-200 bg-white px-2.5 py-2 text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:hover:text-white"
      >
        ⇄
      </button>
      <GoodSelect label={g.y} value={y} onChange={setY} groups={g.groups} disabled={[x]} />
    </div>
  )

  if (!row) {
    return (
      <div className="space-y-4">
        {selectors}
        <p className="rounded-xl border-2 border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-800">{g.none}</p>
      </div>
    )
  }

  const korea = name(KOREA)
  const hits = rows.filter((v) => v.match).length
  const good = row.predicted === 'x' ? short(gx) : short(gy)
  const other = row.predicted === 'x' ? short(gy) : short(gx)
  const m = (v: number) => money(v, lang, { short: true })

  return (
    <div className="space-y-4">
      {selectors}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor={partnerId} className="text-sm font-semibold">
            {r.partner}
          </label>
          <select
            id={partnerId}
            value={row.iso}
            onChange={(e) => setPick(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {[...rows]
              .sort((a, b) => name(a.iso).localeCompare(name(b.iso), lang))
              .map((v) => (
                <option key={v.iso} value={v.iso}>
                  {countryFlag(v.iso)} {name(v.iso)}
                </option>
              ))}
          </select>
        </div>
        {DATA.goods && <span className="text-xs text-slate-400">{g.basis(DATA.goods.year, reporters)}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="text-xs text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2 pr-2 text-left font-medium" />
              <th className="py-2 pr-2 text-right font-medium">X · {g.rca(label(gx))}</th>
              <th className="py-2 pr-2 text-right font-medium">Y · {g.rca(label(gy))}</th>
              <th className="py-2 text-right font-medium">{g.ratio}</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                [KOREA, row.kx, row.ky],
                [row.iso, row.px, row.py],
              ] as const
            ).map(([iso, a, b]) => (
              <tr key={iso} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-2 pr-2">
                  {countryFlag(iso)} {name(iso)}
                </td>
                <td className="py-2 pr-2 text-right tabular-nums">{fmt(a)}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{fmt(b)}</td>
                <td className="py-2 text-right font-semibold tabular-nums">{fmt(a / b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-1.5 text-sm">
        <li>🎯 {g.comparative(korea, good)}</li>
        <li>📦 {g.predicted(korea, good, other)}</li>
        <li>
          🔎 {g.actual(m(row.ex), m(row.ey), m(row.mx), m(row.my))}{' '}
          <span
            className={
              'ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ' +
              (row.match ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300')
            }
          >
            {row.match ? `✓ ${r.match}` : `✗ ${r.mismatch}`}
          </span>
        </li>
      </ul>
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">↓ {r.toModel}</p>

      <div>
        <h3 className="mb-2 font-semibold">{r.allTitle}</h3>
        <p className="mb-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
          💡 {r.all(hits, rows.length)}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-xs text-slate-500 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 pr-2 text-left font-medium">{g.colsAll.country}</th>
                <th className="py-2 pr-2 text-right font-medium">{g.colsAll.ratio}</th>
                <th className="py-2 pr-2 text-left font-medium">{g.colsAll.predicted}</th>
                <th className="py-2 pr-2 text-right font-medium">{g.colsAll.actual}</th>
                <th className="py-2 text-center font-medium">{g.colsAll.result}</th>
              </tr>
            </thead>
            <tbody>
              {[...rows]
                .sort((a, b) => b.px / b.py - a.px / a.py)
                .map((v) => (
                  <tr
                    key={v.iso}
                    onClick={() => setPick(v.iso)}
                    className={
                      'cursor-pointer border-b border-slate-100 last:border-0 dark:border-slate-800/60 ' +
                      (v.iso === row.iso ? 'bg-a-soft/60 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40')
                    }
                  >
                    <td className="py-1.5 pr-2">
                      {countryFlag(v.iso)} {name(v.iso)}
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular-nums">{fmt(v.px / v.py)}</td>
                    <td className="py-1.5 pr-2">{v.predicted === 'x' ? label(gx) : label(gy)}</td>
                    <td className="py-1.5 pr-2 text-right text-xs text-slate-500 tabular-nums dark:text-slate-400">
                      {ratioText(v.ex, v.ey)} / {ratioText(v.mx, v.my)}
                    </td>
                    <td className={'py-1.5 text-center font-semibold ' + (v.match ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                      {v.match ? '✓' : '✗'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          {name(KOREA)} {g.ratio} {kx && ky ? fmt(kx / ky) : '—'}
        </p>
      </div>

      <details className="text-sm text-slate-600 dark:text-slate-300">
        <summary className="cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400">⚠️ {t.caution}</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
          {g.cautions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </details>
    </div>
  )
}

/** X ÷ Y of two trade values, with ∞ when Y is zero. */
function ratioText(a: number, b: number): string {
  if (b === 0) return a > 0 ? '∞' : '—'
  const v = a / b
  return v >= 100 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toFixed(2)
}
