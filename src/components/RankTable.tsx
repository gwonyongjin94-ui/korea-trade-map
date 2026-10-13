import { metric, type PartnerStat, type View } from '../data/trade'
import { money, percent } from '../format'
import { countryFlag, countryName, useI18n } from '../i18n'

interface Props {
  title: string
  rows: PartnerStat[]
  view: View
  /** Korea's total for the view, used for the share column. */
  base: number
  selected: string | null
  onPick: (iso: string) => void
}

export function RankTable({ title, rows, view, base, selected, onPick }: Props) {
  const { t, lang } = useI18n()
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs text-slate-400">{t.unitNote}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="text-xs text-slate-500 dark:text-slate-400">
            <tr className="border-b border-slate-200 dark:border-slate-800">
              <th className="py-2 pr-2 text-left font-medium">{t.colRank}</th>
              <th className="py-2 pr-2 text-left font-medium">{t.colCountry}</th>
              <th className={'py-2 pr-2 text-right font-medium ' + (view === 'export' ? 'text-a' : '')}>{t.colExport}</th>
              <th className={'py-2 pr-2 text-right font-medium ' + (view === 'import' ? 'text-b' : '')}>{t.colImport}</th>
              <th className={'py-2 pr-2 text-right font-medium ' + (view === 'balance' ? 'text-slate-900 dark:text-white' : '')}>
                {t.colBalance}
              </th>
              {view !== 'balance' && <th className="py-2 text-right font-medium">{t.colShare}</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const balance = r.x - r.m
              return (
                <tr
                  key={r.iso}
                  onClick={() => onPick(r.iso)}
                  className={
                    'cursor-pointer border-b border-slate-100 last:border-0 dark:border-slate-800/60 ' +
                    (r.iso === selected ? 'bg-a-soft/60 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40')
                  }
                >
                  <td className="py-2 pr-2 text-slate-400 tabular-nums">{i + 1}</td>
                  <td className="py-2 pr-2">
                    <span className="mr-1.5">{countryFlag(r.iso)}</span>
                    {countryName(r.iso, lang)}
                  </td>
                  <td className="py-2 pr-2 text-right tabular-nums">{money(r.x, lang, { short: true })}</td>
                  <td className="py-2 pr-2 text-right tabular-nums">{money(r.m, lang, { short: true })}</td>
                  <td className={'py-2 pr-2 text-right tabular-nums ' + (balance >= 0 ? 'text-a' : 'text-b')}>
                    {money(balance, lang, { short: true, signed: true })}
                  </td>
                  {view !== 'balance' && (
                    <td className="py-2 text-right text-slate-500 tabular-nums dark:text-slate-400">
                      {percent(base ? (metric(view, r) / base) * 100 : null)}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
