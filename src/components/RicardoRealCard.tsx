import { useId, useMemo, useState } from 'react'
import { percent } from '../format'
import { countryFlag, countryName, useI18n } from '../i18n'
import { costOfIndustry, KOREA, ricardoTest, workersPerMillion, type Productivity } from '../realExamples'
import { THEORY_TEXT } from '../theoryText'
import { RicardoGoodsView } from './RicardoGoodsView'

/** Gulf oil and gas exporters, whose measured "industry" productivity is mostly extraction. */
const OIL = new Set(['682', '784', '368', '414', '634', '512', '048'])
const DEFAULT_PARTNER = '704'

const usd = (v: number, lang: string) => `$${Math.round(v).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US')}`
const one = (v: number) => (v >= 100 ? v.toFixed(0) : v.toFixed(1))

/** Korea against one partner with World Bank productivity, and the prediction checked against trade. */
export function RicardoRealCard({ year }: { year: number }) {
  const { lang } = useI18n()
  const r = THEORY_TEXT[lang].ricardo.real
  const rows = useMemo(() => ricardoTest(year), [year])
  const [pick, setPick] = useState(DEFAULT_PARTNER)
  const [mode, setMode] = useState<'productivity' | 'goods'>('productivity')
  const selectId = useId()
  const name = (iso: string) => countryName(iso, lang)
  const row = rows.find((x) => x.iso === pick) ?? rows[0]
  if (!row) return null

  const korea = name(KOREA)
  const partner = name(row.iso)
  const goodName = (g: 'agri' | 'ind') => r.goods[g].replace(/^\S+\s/, '')
  const kAdvBoth = row.korea.agri > row.partner.agri && row.korea.ind > row.partner.ind
  const pAdvBoth = row.korea.agri < row.partner.agri && row.korea.ind < row.partner.ind
  const absolute = kAdvBoth
    ? r.absolute(korea)
    : pAdvBoth
      ? r.absolute(partner)
      : r.absoluteSplit(row.korea.agri > row.partner.agri ? korea : partner, row.korea.ind > row.partner.ind ? korea : partner)
  const hits = rows.filter((x) => x.match).length
  const misses = rows.filter((x) => !x.match)
  const yearsOf = (p: Productivity) => [...new Set([p.agriYear, p.indYear])].join('·')

  const columns = (p: Productivity) => ({
    va: [usd(p.agri, lang), usd(p.ind, lang)],
    workers: [one(workersPerMillion(p.agri)), one(workersPerMillion(p.ind))],
    cost: costOfIndustry(p).toFixed(2),
  })
  const k = columns(row.korea)
  const p = columns(row.partner)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-bold">{r.title}</h2>
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs dark:bg-slate-800">
          {(['productivity', 'goods'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setMode(k)}
              aria-pressed={mode === k}
              className={'rounded-md px-2.5 py-1.5 ' + (mode === k ? 'bg-white font-semibold shadow-sm dark:bg-slate-950' : 'text-slate-500 dark:text-slate-400')}
            >
              {r.modes[k]}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{mode === 'goods' ? r.goodsMode.body : r.body}</p>
      {mode === 'goods' ? (
        <div className="mt-4">
          <RicardoGoodsView />
        </div>
      ) : (
        <>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label htmlFor={selectId} className="text-sm font-semibold">
          {r.partner}
        </label>
        <select
          id={selectId}
          value={row.iso}
          onChange={(e) => setPick(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {[...rows]
            .sort((a, b) => name(a.iso).localeCompare(name(b.iso), lang))
            .map((x) => (
              <option key={x.iso} value={x.iso}>
                {countryFlag(x.iso)} {name(x.iso)}
              </option>
            ))}
        </select>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="text-xs text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2 pr-2 text-left font-medium" />
              <th className="py-2 pr-2 text-right font-medium" colSpan={2}>
                {r.cols.va}
              </th>
              <th className="py-2 text-right font-medium" colSpan={2}>
                {r.cols.workers}
              </th>
            </tr>
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-1.5 pr-2 text-left font-medium" />
              <th className="py-1.5 pr-2 text-right font-medium">{r.goods.agri}</th>
              <th className="py-1.5 pr-2 text-right font-medium">{r.goods.ind}</th>
              <th className="py-1.5 pr-2 text-right font-medium">{r.goods.agri}</th>
              <th className="py-1.5 text-right font-medium">{r.goods.ind}</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                [KOREA, k, row.korea],
                [row.iso, p, row.partner],
              ] as const
            ).map(([iso, c, prod]) => (
              <tr key={iso} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                <td className="py-2 pr-2">
                  {countryFlag(iso)} {name(iso)} <span className="text-[11px] text-slate-400">({yearsOf(prod)})</span>
                </td>
                <td className="py-2 pr-2 text-right tabular-nums">{c.va[0]}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{c.va[1]}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{c.workers[0]}</td>
                <td className="py-2 text-right tabular-nums">{c.workers[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(
          [
            [KOREA, k.cost],
            [row.iso, p.cost],
          ] as const
        ).map(([iso, cost]) => (
          <div key={iso} className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/50">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {countryFlag(iso)} {name(iso)} · {r.cols.cost}
            </div>
            <div className="mt-0.5 text-xl font-bold tabular-nums">
              {cost} <span className="text-sm font-normal text-slate-500">{r.costUnit}</span>
            </div>
          </div>
        ))}
      </div>

      <ul className="mt-4 space-y-1.5 text-sm">
        <li>⚖️ {absolute}</li>
        <li>🎯 {r.comparative(korea, goodName(row.predicted))}</li>
        <li>📦 {r.predicted(korea, r.traded[row.predicted], r.traded[row.predicted === 'ind' ? 'agri' : 'ind'])}</li>
        <li>
          🔎 {r.actual(percent(row.shares.exportFarm * 100), percent(row.shares.importFarm * 100))}{' '}
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
      <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        🧪 {r.explorer(korea, partner, k.workers[1], k.workers[0], p.workers[1], p.workers[0])}
      </p>

      <h3 className="mt-6 mb-2 font-semibold">{r.allTitle}</h3>
      <p className="mb-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
        💡 {r.all(hits, rows.length)} {misses.length > 0 && r.misses(misses.map((x) => name(x.iso)).join(', '))}{' '}
        {misses.some((x) => OIL.has(x.iso)) && r.oil}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="text-xs text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2 pr-2 text-left font-medium">{r.colsAll.country}</th>
              <th className="py-2 pr-2 text-right font-medium">{r.colsAll.cost}</th>
              <th className="py-2 pr-2 text-left font-medium">{r.colsAll.predicted}</th>
              <th className="py-2 pr-2 text-right font-medium">{r.colsAll.actual}</th>
              <th className="py-2 text-center font-medium">{r.colsAll.result}</th>
            </tr>
          </thead>
          <tbody>
            {[...rows]
              .sort((a, b) => costOfIndustry(a.partner) - costOfIndustry(b.partner))
              .map((x) => (
                <tr
                  key={x.iso}
                  onClick={() => setPick(x.iso)}
                  className={
                    'cursor-pointer border-b border-slate-100 last:border-0 dark:border-slate-800/60 ' +
                    (x.iso === row.iso ? 'bg-a-soft/60 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40')
                  }
                >
                  <td className="py-1.5 pr-2">
                    {countryFlag(x.iso)} {name(x.iso)}
                  </td>
                  <td className="py-1.5 pr-2 text-right tabular-nums">{costOfIndustry(x.partner).toFixed(2)}</td>
                  <td className="py-1.5 pr-2">{r.goods[x.predicted]}</td>
                  <td className="py-1.5 pr-2 text-right text-xs text-slate-500 tabular-nums dark:text-slate-400">
                    {percent(x.shares.exportFarm * 100)} / {percent(x.shares.importFarm * 100)}
                  </td>
                  <td className={'py-1.5 text-center font-semibold ' + (x.match ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
                    {x.match ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        {r.colsAll.actual}: {lang === 'ko' ? '농산물 비중 (수출 / 수입)' : 'farm share (exports / imports)'} · {name(KOREA)} {r.cols.cost} {costOfIndustry(row.korea).toFixed(2)}
      </p>
      <details className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        <summary className="cursor-pointer text-xs font-semibold text-slate-500 dark:text-slate-400">⚠️ {THEORY_TEXT[lang].caution}</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
          {r.cautions.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </details>
        </>
      )}
    </section>
  )
}
