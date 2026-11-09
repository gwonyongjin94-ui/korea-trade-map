import type { ReactNode } from 'react'
import { fmt } from './format'
import { useRicardoText } from './text'
import type { CountryKey, GoodKey, ModelResult } from '../model/ricardian'
import { placeLabels, type Spot } from '../components/labels'

interface Props {
  names: { A: string; B: string; X: string; Y: string }
  icons: { X: string; Y: string }
  result: ModelResult
}

const GOODS: GoodKey[] = ['X', 'Y']
const nearly = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b))

export function WagePanel({ names, icons, result }: Props) {
  const { t, lang } = useRicardoText()
  const w = t.wages
  const f = (v: number) => fmt(v, lang)
  const { countries, relativeWage, absoluteAdvantage: aa, comparativeAdvantage: ca, tradeCase } = result
  const { A, B } = countries

  // A country less productive in both goods that still exports something: the "pauper labour" case.
  const rich = aa.X !== 'tie' && aa.X === aa.Y ? aa.X : null
  const poor = rich && tradeCase !== 'no-trade' ? (rich === 'A' ? 'B' : 'A') : null
  const poorGood = poor ? (ca.X === poor ? 'X' : 'Y') : null
  // Only claim the low-wage country is cheaper when it strictly is (at a band edge the costs tie).
  const pauper: { poor: CountryKey; rich: CountryKey; good: GoodKey } | null =
    poor && rich && poorGood && countries[poor].unitCost[poorGood] < countries[rich].unitCost[poorGood] - 1e-12
      ? { poor, rich, good: poorGood }
      : null

  const edge = tradeCase === 'A-large' ? names.A : tradeCase === 'B-large' ? names.B : null

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 dark:text-slate-400">{w.intro}</p>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Card title={w.relTitle}>
          <WageLine names={names} icons={icons} result={result} />
          <p>
            {w.relBody(names, f(relativeWage.value), f(relativeWage.productivityRatio.X), f(relativeWage.productivityRatio.Y))}
          </p>
          {edge && <p className="text-amber-700 dark:text-amber-400">{w.relEdge(edge)}</p>}
        </Card>

        <Card title={w.costTitle}>
          <table className="w-full text-sm tabular-nums">
            <thead className="text-xs text-slate-500 dark:text-slate-400">
              <tr>
                <th className="py-1 text-left font-normal">{w.costUnit(names.Y)}</th>
                <th className="py-1 text-right font-medium text-a">{names.A}</th>
                <th className="py-1 text-right font-medium text-b">{names.B}</th>
              </tr>
            </thead>
            <tbody>
              {GOODS.map((g) => {
                const a = A.unitCost[g]
                const b = B.unitCost[g]
                const cheaper = nearly(a, b) ? null : a < b ? 'A' : 'B'
                return (
                  <tr key={g} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="py-2">
                      {icons[g]} {names[g]}
                    </td>
                    {(['A', 'B'] as const).map((k) => (
                      <td key={k} className="py-2 text-right">
                        <span className="text-xs text-slate-400">
                          {f(countries[k].wage)} × {f(k === 'A' ? a / A.wage : b / B.wage)} ={' '}
                        </span>
                        <span className={cheaper === k ? 'font-semibold text-emerald-600 dark:text-emerald-400' : ''}>
                          {f(k === 'A' ? a : b)}
                        </span>
                        {cheaper === k && (
                          <span className="ml-1 rounded bg-emerald-100 px-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            {w.cheaper}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p>{w.costBody}</p>
          {pauper && (
            <p className="rounded-lg bg-emerald-50 p-2 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
              💡 {w.pauper(names[pauper.poor], names[pauper.rich], names[pauper.good])}
            </p>
          )}
        </Card>

        <Card title={w.realTitle}>
          <table className="w-full text-sm tabular-nums">
            <thead className="text-xs text-slate-500 dark:text-slate-400">
              <tr>
                <th />
                <th className="py-1 text-right font-normal">{w.before}</th>
                <th className="py-1 text-right font-normal">{w.after}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(['A', 'B'] as const).flatMap((k) =>
                GOODS.map((g) => {
                  const before = countries[k].realWage.autarky[g]
                  const after = countries[k].realWage.trade[g]
                  const change = (after / before - 1) * 100
                  return (
                    <tr key={k + g} className={g === 'X' ? 'border-t border-slate-100 dark:border-slate-800' : ''}>
                      <td className="py-1">
                        {g === 'X' && <span className={`mr-1 font-medium ${k === 'A' ? 'text-a' : 'text-b'}`}>{names[k]}</span>}
                        <span className="text-slate-500 dark:text-slate-400">{icons[g]}</span>
                      </td>
                      <td className="py-1 text-right text-slate-500 dark:text-slate-400">{f(before)}</td>
                      <td className="py-1 text-right">{f(after)}</td>
                      <td
                        className={
                          'py-1 pl-2 text-right text-xs ' +
                          (change > 0.005 ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-slate-400')
                        }
                      >
                        {change > 0.005 ? `+${f(change)}%` : '±0%'}
                      </td>
                    </tr>
                  )
                }),
              )}
            </tbody>
          </table>
          <p>
            {tradeCase === 'no-trade'
              ? w.realNone
              : tradeCase === 'complete'
                ? w.realBody
                : w.realLarge(names[tradeCase === 'A-large' ? 'A' : 'B'], names[tradeCase === 'A-large' ? 'B' : 'A'])}
          </p>
        </Card>
      </div>
    </div>
  )
}

/** Log-scale number line: the relative wage sits between the two productivity ratios. */
function WageLine({ names, icons, result }: Props) {
  const { t, lang } = useRicardoText()
  const { value, productivityRatio: r } = result.relativeWage
  const W = 360
  const H = 118
  const lo = Math.min(r.X, r.Y, value)
  const hi = Math.max(r.X, r.Y, value)
  const d0 = Math.log(lo / 1.8)
  const d1 = Math.log(hi * 1.8)
  const x = (v: number) => 16 + ((Math.log(v) - d0) / (d1 - d0)) * (W - 32)
  const axisY = 64
  const [bLo, bHi] = result.relativeWage.bounds
  // The lower ratio's label goes left of its tick and the higher one right, then they move up a row
  // or swap sides if that would run off the panel.
  const ticks = [
    { g: 'X' as const, v: r.X, low: r.X <= r.Y },
    { g: 'Y' as const, v: r.Y, low: r.Y < r.X },
  ]
  const ratioText = (g: GoodKey) => `${icons[g]} ${t.wages.ratio(names[g], fmt(r[g], lang))}`
  const valueText = `w${names.A}/w${names.B} = ${fmt(value, lang)}`
  const side = (low: boolean, dy: number): Spot[] => {
    const left: Spot = { dx: -4, dy, anchor: 'end' }
    const right: Spot = { dx: 4, dy, anchor: 'start' }
    return low ? [left, right] : [right, left]
  }
  const tags = placeLabels(
    [
      ...ticks.map(({ g, v, low }) => ({ id: g, x: x(v), y: axisY - 26, text: ratioText(g), size: 11, spots: [...side(low, 0), ...side(low, -14)] })),
      {
        id: 'w',
        x: x(value),
        y: axisY + 36,
        text: valueText,
        size: 12,
        bold: true,
        spots: [
          { dx: 0, dy: 0, anchor: 'middle' as const },
          { dx: -10, dy: 0, anchor: 'start' as const },
          { dx: 10, dy: 0, anchor: 'end' as const },
        ],
      },
    ],
    { x: 0, y: 0, w: W, h: H },
  )

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" role="img" aria-label={t.wages.relTitle}>
      <line x1={16} x2={W - 16} y1={axisY} y2={axisY} className="stroke-slate-300 dark:stroke-slate-600" strokeWidth={2} />
      <rect
        x={x(bLo)}
        y={axisY - 8}
        width={Math.max(2, x(bHi) - x(bLo))}
        height={16}
        rx={4}
        className="fill-emerald-100 dark:fill-emerald-950"
      />
      {lo / 1.8 < 1 && hi * 1.8 > 1 && (
        <g>
          <line x1={x(1)} x2={x(1)} y1={axisY - 5} y2={axisY + 5} className="stroke-slate-400" />
          <text x={x(1)} y={axisY + 20} textAnchor="middle" className="fill-slate-400 text-[10px]">
            1
          </text>
        </g>
      )}
      {ticks.map(({ g, v }) => (
        <g key={g}>
          <line x1={x(v)} x2={x(v)} y1={axisY - 22 - (tags[g] && tags[g].y < axisY - 30 ? 14 : 0)} y2={axisY + 8} className="stroke-slate-500" strokeDasharray="3 2" />
          {tags[g] && (
            <text x={tags[g].x} y={tags[g].y} textAnchor={tags[g].anchor} className="fill-slate-600 text-[11px] dark:fill-slate-300">
              {ratioText(g)}
            </text>
          )}
        </g>
      ))}
      <circle cx={x(value)} cy={axisY} r={7} className="fill-emerald-500" stroke="white" strokeWidth={2} />
      {tags.w && (
        <text x={tags.w.x} y={tags.w.y} textAnchor={tags.w.anchor} className="fill-emerald-700 text-[12px] font-semibold dark:fill-emerald-400">
          {valueText}
        </text>
      )}
    </svg>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-relaxed dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </article>
  )
}
