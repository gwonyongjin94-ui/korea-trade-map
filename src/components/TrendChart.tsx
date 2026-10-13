import type { Pair } from '../data/trade'
import { money } from '../format'
import { useI18n } from '../i18n'
import { linear, ticks } from './scale'

interface Props {
  title: string
  data: ({ year: number } & Pair)[]
  year: number
  onYear: (y: number) => void
}

const W = 560
const H = 250
const M = { top: 18, right: 18, bottom: 30, left: 62 }

/** Exports and imports over the years, with the selected year marked. */
export function TrendChart({ title, data, year, onYear }: Props) {
  const { t, lang } = useI18n()
  const max = Math.max(1, ...data.flatMap((d) => [d.x, d.m]))
  const yTicks = ticks(max)
  const yMax = yTicks[yTicks.length - 1] < max ? max : yTicks[yTicks.length - 1]
  const x = linear(data[0].year, data[data.length - 1].year, M.left, W - M.right)
  const y = linear(0, yMax, H - M.bottom, M.top)
  const line = (key: 'x' | 'm') => data.map((d, i) => `${i ? 'L' : 'M'}${x(d.year)},${y(d[key])}`).join(' ')
  const current = data.find((d) => d.year === year)
  const step = (W - M.left - M.right) / Math.max(1, data.length - 1)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-a" />
            {t.views.export}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-b" />
            {t.views.import}
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible text-slate-500 dark:text-slate-400">
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={M.left} x2={W - M.right} y1={y(v)} y2={y(v)} className="stroke-slate-200 dark:stroke-slate-800" />
            <text x={M.left - 8} y={y(v)} dy="0.32em" textAnchor="end" className="fill-current text-[11px]">
              {money(v, lang, { short: true })}
            </text>
          </g>
        ))}
        {data.map((d, i) => (
          <text
            key={d.year}
            x={x(d.year)}
            y={H - M.bottom + 18}
            textAnchor="middle"
            className={'fill-current text-[11px] ' + (d.year === year ? 'font-bold text-slate-900 dark:text-white' : i % 2 ? 'max-sm:hidden' : '')}
          >
            {d.year}
          </text>
        ))}
        <line x1={x(year)} x2={x(year)} y1={M.top} y2={H - M.bottom} className="stroke-slate-300 dark:stroke-slate-600" strokeDasharray="3 3" />
        <path d={line('x')} fill="none" strokeWidth={2.5} className="stroke-a" />
        <path d={line('m')} fill="none" strokeWidth={2.5} className="stroke-b" />
        {data.map((d) => (
          <g key={d.year}>
            <circle cx={x(d.year)} cy={y(d.x)} r={d.year === year ? 5 : 3} className="fill-a stroke-white dark:stroke-slate-900" strokeWidth={1.5} />
            <circle cx={x(d.year)} cy={y(d.m)} r={d.year === year ? 5 : 3} className="fill-b stroke-white dark:stroke-slate-900" strokeWidth={1.5} />
            {/* Wide invisible hit area so a year can be picked by clicking anywhere in its column. */}
            <rect
              x={x(d.year) - step / 2}
              y={M.top}
              width={step}
              height={H - M.top - M.bottom}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onYear(d.year)}
            >
              <title>{`${d.year}: ${t.views.export} ${money(d.x, lang)}, ${t.views.import} ${money(d.m, lang)}`}</title>
            </rect>
          </g>
        ))}
        {current &&
          (['x', 'm'] as const).map((key) => {
            // The higher of the two points gets its label above, the lower one below.
            const above = key === 'x' ? current.x >= current.m : current.m > current.x
            const anchor = year === data[data.length - 1].year ? 'end' : year === data[0].year ? 'start' : 'middle'
            return (
              <text
                key={key}
                x={x(year)}
                y={y(current[key]) + (above ? -10 : 18)}
                textAnchor={anchor}
                className={'pointer-events-none stroke-white text-[12px] font-semibold dark:stroke-slate-900 ' + (key === 'x' ? 'fill-a' : 'fill-b')}
                strokeWidth={3}
                paintOrder="stroke"
              >
                {money(current[key], lang, { short: true })}
              </text>
            )
          })}
      </svg>
    </div>
  )
}
