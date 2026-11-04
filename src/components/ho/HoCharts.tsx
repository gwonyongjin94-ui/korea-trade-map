import { useId } from 'react'
import { priceAt, produce, relativeDemand, relativeSupply, type Endowment, type Production, type Tech } from '../../model/heckscherOhlin'
import { linear, ticks } from '../scale'

const W = 600
const H = 330
const M = { top: 18, right: 18, bottom: 42, left: 18 }

const num = (v: number) => (v === 0 ? '0' : v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v >= 1 ? v.toFixed(2) : v.toPrecision(2))
const TONE = { a: { stroke: 'stroke-a', fill: 'fill-a' }, b: { stroke: 'stroke-b', fill: 'fill-b' } }

export interface CountryMarks {
  name: string
  tone: 'a' | 'b'
  e: Endowment
  autarky: Production
  trade: Production
}

interface FactorProps {
  t: Tech
  countries: CountryMarks[]
  labels: { price: string; lk: string; omega: string; ss: string; cc: string; ff: string; autarky: (n: string) => string; trade: (n: string) => string; endowment: (n: string) => string }
}

/**
 * The textbook's "from goods prices to input choices" diagram: a shared w/r axis in the middle, the
 * SS curve on the left (relative price of cloth rising to the left) and the CC and FF input choices
 * on the right, with each country's autarky and trade positions.
 */
export function FactorPriceChart({ t, countries, labels }: FactorProps) {
  const clip = useId()
  const T = M.top + 14
  const cx = M.left + (W - M.left - M.right) * 0.42
  const omegas = countries.flatMap((c) => [c.autarky.omega, c.trade.omega])
  const top = Math.max(...omegas) * 1.7
  const y = linear(0, top, H - M.bottom, T)
  const pMax = priceAt(t, top) * 1.08
  const xl = linear(0, pMax, cx, M.left + 6)
  const lks = countries.map((c) => c.e.L / c.e.K)
  const lkMax = Math.max(...lks) * 1.9
  const xr = linear(0, lkMax, cx, W - M.right)
  const sample = (f: (omega: number) => [number, number]) =>
    Array.from({ length: 121 }, (_, i) => {
      const omega = top * (0.01 + (0.99 * i) / 120)
      const [px, py] = f(omega)
      return `${i ? 'L' : 'M'}${px},${py}`
    }).join(' ')
  const ss = sample((o) => [xl(priceAt(t, o)), y(o)])
  const lk = (s: number, o: number) => (1 - s) / s / o
  const cc = sample((o) => [Math.min(W + 40, xr(lk(t.sC, o))), y(o)])
  const ff = sample((o) => [Math.min(W + 40, xr(lk(t.sF, o))), y(o)])

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full text-slate-500 dark:text-slate-400">
      <defs>
        <clipPath id={clip}>
          <rect x={M.left} y={T} width={W - M.left - M.right} height={H - T - M.bottom} />
        </clipPath>
      </defs>
      {ticks(top).map((v) => (
        <g key={v}>
          <line x1={M.left} x2={W - M.right} y1={y(v)} y2={y(v)} className="stroke-slate-200 dark:stroke-slate-800" />
          <text x={cx - 4} y={y(v) - 3} textAnchor="end" className="fill-current text-[10px]">
            {num(v)}
          </text>
        </g>
      ))}
      <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} className="stroke-slate-400 dark:stroke-slate-600" />
      <line x1={cx} x2={cx} y1={T} y2={H - M.bottom} className="stroke-slate-500 dark:stroke-slate-500" strokeWidth={1.5} />
      {ticks(pMax, 3).map((v) =>
        v === 0 ? null : (
          <text key={`p${v}`} x={xl(v)} y={H - M.bottom + 14} textAnchor="middle" className="fill-current text-[10px]">
            {num(v)}
          </text>
        ),
      )}
      {ticks(lkMax, 4).map((v) =>
        v === 0 ? null : (
          <text key={`l${v}`} x={xr(v)} y={H - M.bottom + 14} textAnchor="middle" className="fill-current text-[10px]">
            {num(v)}
          </text>
        ),
      )}
      <text x={M.left} y={H - 8} className="fill-current text-[11px]">
        {labels.price}
      </text>
      <text x={W - M.right} y={H - 8} textAnchor="end" className="fill-current text-[11px]">
        {labels.lk}
      </text>
      <text x={cx} y={M.top + 4} textAnchor="middle" className="fill-current text-[11px] font-semibold">
        ↑ {labels.omega}
      </text>

      <g clipPath={`url(#${clip})`}>
        {countries.map((c, i) => (
          <g key={c.name} strokeDasharray="4 4" strokeWidth={1.5} className={TONE[c.tone].stroke}>
            <line x1={xr(lks[i])} x2={xr(lks[i])} y1={T} y2={H - M.bottom} opacity={0.6} />
          </g>
        ))}
        <path d={ss} fill="none" strokeWidth={2.5} className="stroke-slate-700 dark:stroke-slate-200" />
        <path d={cc} fill="none" strokeWidth={2.5} className="stroke-emerald-600 dark:stroke-emerald-400" />
        <path d={ff} fill="none" strokeWidth={2.5} className="stroke-violet-600 dark:stroke-violet-400" />
        {countries.map((c, i) => {
          // With trade: the w/r line across both panels, and the input ratios it implies in each sector.
          // The first country's dots are larger so both show when factor prices are equalized.
          const o = c.trade.omega
          const onSS = c.trade.only === null
          const r = i === 0 ? 1.4 : 1
          return (
            <g key={`t${c.name}`}>
              <line x1={onSS ? xl(c.trade.p) : cx} x2={xr(lk(t.sC, o))} y1={y(o)} y2={y(o)} strokeDasharray="2 3" className="stroke-slate-400" />
              {onSS && <circle cx={xl(c.trade.p)} cy={y(o)} r={4.5 * r} className={TONE[c.tone].fill} />}
              {c.trade.only !== 'F' && <circle cx={xr(lk(t.sC, o))} cy={y(o)} r={3.2 * r} className={TONE[c.tone].fill} />}
              {c.trade.only !== 'C' && <circle cx={xr(lk(t.sF, o))} cy={y(o)} r={3.2 * r} className={TONE[c.tone].fill} />}
            </g>
          )
        })}
        {countries.map((c) => (
          <circle key={`a${c.name}`} cx={xl(c.autarky.p)} cy={y(c.autarky.omega)} r={5.5} strokeWidth={2} className={`fill-white dark:fill-slate-900 ${TONE[c.tone].stroke}`} />
        ))}
      </g>

      {/* A halo keeps the labels legible where they cross the curves. */}
      <g className="stroke-white text-[10px] dark:stroke-slate-900" strokeWidth={3} strokeLinejoin="round" style={{ paintOrder: 'stroke' }}>
        {countries.map((c, i) => (
          <text key={`l${c.name}`} x={xr(lks[i]) + 3} y={H - M.bottom - 6 - i * 12} className={`${TONE[c.tone].fill} font-semibold`}>
            {labels.endowment(c.name)}
          </text>
        ))}
        {countries.map((c, i) => {
          // Autarky labels sit left of the point unless that would run off the chart.
          const px = xl(c.autarky.p)
          const left = px - M.left > 100
          return (
            <text
              key={`al${c.name}`}
              x={left ? px - 8 : px + 8}
              y={y(c.autarky.omega) + (i ? 14 : -8)}
              textAnchor={left ? 'end' : 'start'}
              className={`${TONE[c.tone].fill} font-semibold`}
            >
              {labels.autarky(c.name)}
            </text>
          )
        })}
        <text x={xl(priceAt(t, top * 0.9)) + 6} y={y(top * 0.9)} className="fill-slate-700 text-[12px] font-bold dark:fill-slate-200">
          {labels.ss}
        </text>
        {/* The input-choice curves get a key in the empty top-right corner: near the top they can run close together. */}
        {(
          [
            [labels.cc, 'stroke-emerald-600 dark:stroke-emerald-400', 'fill-emerald-700 dark:fill-emerald-300'],
            [labels.ff, 'stroke-violet-600 dark:stroke-violet-400', 'fill-violet-700 dark:fill-violet-300'],
          ] as const
        ).map(([label, stroke, fill], i) => (
          <g key={label}>
            <line x1={W - M.right - 18} x2={W - M.right} y1={T + 8 + i * 15} y2={T + 8 + i * 15} strokeWidth={2.5} className={stroke} />
            <text x={W - M.right - 24} y={T + 12 + i * 15} textAnchor="end" className={`${fill} text-[11px] font-bold`}>
              {label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  )
}

interface RsRdProps {
  t: Tech
  a: { name: string; e: Endowment; pa: number }
  b: { name: string; e: Endowment; pa: number }
  pw: number
  labels: { x: string; y: string; rsA: string; rsB: string; rsWorld: string; rd: string }
}

/** Relative supply of each country and of the world against relative demand (the textbook's fig. 5-9). */
export function RsRdChart({ t, a, b, pw, labels }: RsRdProps) {
  const clip = useId()
  const ML = 52
  const pLo = Math.min(a.pa, b.pa, pw) / 1.5
  const pHi = Math.max(a.pa, b.pa, pw) * 1.5
  const y = linear(pLo, pHi, H - M.bottom, M.top)
  const xMax = relativeDemand(t, pw) * 2.6
  const x = linear(0, xMax, ML, W - M.right)
  const curve = (es: Endowment[]) =>
    Array.from({ length: 161 }, (_, i) => {
      const p = pLo * (pHi / pLo) ** (i / 160)
      return `${i ? 'L' : 'M'}${Math.min(W + 40, x(relativeSupply(t, es, p)))},${y(p)}`
    }).join(' ')
  const rd = Array.from({ length: 81 }, (_, i) => {
    const p = pLo * (pHi / pLo) ** (i / 80)
    return `${i ? 'L' : 'M'}${Math.min(W + 40, x(relativeDemand(t, p)))},${y(p)}`
  }).join(' ')
  const yTicks = ticks(pHi).filter((v) => v >= pLo)
  const xTicks = ticks(xMax)
  // The world point is labelled below-left and the autarky points above-right, so close points stay readable.
  const point = (p: number, label: string, cls: string, filled: boolean) => (
    <g>
      <circle cx={x(relativeDemand(t, p))} cy={y(p)} r={5.5} strokeWidth={2} className={filled ? 'fill-slate-900 dark:fill-white' : `fill-white dark:fill-slate-900 ${cls}`} />
      <text
        x={x(relativeDemand(t, p)) + (filled ? -9 : 8)}
        y={y(p) + (filled ? 15 : -6)}
        textAnchor={filled ? 'end' : 'start'}
        className="fill-slate-700 text-[13px] font-bold dark:fill-slate-200"
      >
        {label}
      </text>
    </g>
  )

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full text-slate-500 dark:text-slate-400">
      <defs>
        <clipPath id={clip}>
          <rect x={ML} y={M.top} width={W - ML - M.right} height={H - M.top - M.bottom} />
        </clipPath>
      </defs>
      {yTicks.map((v) => (
        <g key={`y${v}`}>
          <line x1={ML} x2={W - M.right} y1={y(v)} y2={y(v)} className="stroke-slate-200 dark:stroke-slate-800" />
          <text x={ML - 6} y={y(v)} dy="0.32em" textAnchor="end" className="fill-current text-[10px]">
            {num(v)}
          </text>
        </g>
      ))}
      {xTicks.map((v) => (
        <text key={`x${v}`} x={x(v)} y={H - M.bottom + 14} textAnchor="middle" className="fill-current text-[10px]">
          {num(v)}
        </text>
      ))}
      <line x1={ML} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} className="stroke-slate-400 dark:stroke-slate-600" />
      <line x1={ML} x2={ML} y1={M.top} y2={H - M.bottom} className="stroke-slate-400 dark:stroke-slate-600" />
      <text x={(ML + W - M.right) / 2} y={H - 8} textAnchor="middle" className="fill-current text-[11px]">
        {labels.x}
      </text>
      <text transform={`translate(13,${(M.top + H - M.bottom) / 2}) rotate(-90)`} textAnchor="middle" className="fill-current text-[11px]">
        {labels.y}
      </text>
      <g clipPath={`url(#${clip})`} fill="none">
        <path d={curve([a.e])} strokeWidth={2} strokeDasharray="6 4" className="stroke-a" />
        <path d={curve([b.e])} strokeWidth={2} strokeDasharray="6 4" className="stroke-b" />
        <path d={curve([a.e, b.e])} strokeWidth={2.5} className="stroke-slate-700 dark:stroke-slate-200" />
        <path d={rd} strokeWidth={2.5} className="stroke-indigo-500" />
      </g>
      {point(a.pa, '1', 'stroke-a', false)}
      {point(pw, '2', '', true)}
      {point(b.pa, '3', 'stroke-b', false)}
      <g className="text-[11px] font-semibold">
        <text x={W - M.right - 4} y={M.top + 12} textAnchor="end" className="fill-a">
          ┅ {labels.rsA}
        </text>
        <text x={W - M.right - 4} y={M.top + 26} textAnchor="end" className="fill-b">
          ┅ {labels.rsB}
        </text>
        <text x={W - M.right - 4} y={M.top + 40} textAnchor="end" className="fill-slate-700 dark:fill-slate-200">
          ━ {labels.rsWorld}
        </text>
        <text x={W - M.right - 4} y={M.top + 54} textAnchor="end" className="fill-indigo-500">
          ━ {labels.rd}
        </text>
      </g>
    </svg>
  )
}

interface BoxProps {
  t: Tech
  e: Endowment
  p: number
  /** Proportional increase in capital, e.g. 0.2 for +20%. */
  grow: number
  labels: { L: string; K: string; before: string; after: string; originC: string; originF: string }
}

/**
 * Allocation box: labour across, capital up. Cloth inputs are measured from the bottom-left origin and
 * food inputs from the top-right one; at fixed prices each sector keeps its K/L, so extra capital moves
 * the allocation along the cloth ray towards the cloth origin (Rybczynski).
 */
export function BoxChart({ t, e, p, grow, labels }: BoxProps) {
  const before = produce(t, e, p)
  const after = produce(t, { K: e.K * (1 + grow), L: e.L }, p)
  const ML = 40
  const MR = 40
  const kMax = e.K * (1 + grow)
  const x = linear(0, e.L, ML, W - MR)
  const y = linear(0, kMax * 1.04, H - M.bottom, M.top)
  const box = (K: number, dashed: boolean) => (
    <rect
      x={x(0)}
      y={y(K)}
      width={x(e.L) - x(0)}
      height={y(0) - y(K)}
      fill="none"
      strokeWidth={dashed ? 2 : 1.5}
      strokeDasharray={dashed ? '6 4' : undefined}
      className="stroke-slate-500 dark:stroke-slate-400"
    />
  )
  const alloc = (o: Production, K: number, solid: boolean) => (
    <g>
      <line x1={x(0)} y1={y(0)} x2={x(o.LC)} y2={y(o.KC)} strokeWidth={2.5} className="stroke-emerald-600 dark:stroke-emerald-400" opacity={solid ? 1 : 0.45} />
      <line x1={x(e.L)} y1={y(K)} x2={x(o.LC)} y2={y(o.KC)} strokeWidth={2.5} className="stroke-violet-600 dark:stroke-violet-400" opacity={solid ? 1 : 0.45} />
      <circle cx={x(o.LC)} cy={y(o.KC)} r={5.5} strokeWidth={2} className={solid ? 'fill-slate-900 dark:fill-white' : 'fill-white stroke-slate-700 dark:fill-slate-900 dark:stroke-slate-200'} />
    </g>
  )
  const moved = grow > 0

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full text-slate-500 dark:text-slate-400">
      {box(e.K, false)}
      {moved && box(kMax, true)}
      {alloc(before, e.K, !moved)}
      {moved && alloc(after, kMax, true)}
      <g className="text-[11px]">
        <text x={x(0)} y={y(0) + 16} className="fill-emerald-700 font-semibold dark:fill-emerald-300">
          ↗ {labels.originC}
        </text>
        <text x={x(e.L)} y={y(kMax) - 6} textAnchor="end" className="fill-violet-700 font-semibold dark:fill-violet-300">
          {labels.originF} ↙
        </text>
        <text x={(x(0) + x(e.L)) / 2} y={H - 8} textAnchor="middle" className="fill-current">
          {labels.L} →
        </text>
        <text transform={`translate(${x(0) - 10},${(y(0) + y(kMax)) / 2}) rotate(-90)`} textAnchor="middle" className="fill-current">
          {labels.K} →
        </text>
        <text x={x(before.LC) + 9} y={y(before.KC) + (moved ? 14 : -8)} className="fill-slate-700 font-semibold dark:fill-slate-200">
          {labels.before}
        </text>
        {moved && (
          <text x={x(after.LC) + 9} y={y(after.KC) - 8} className="fill-slate-700 font-semibold dark:fill-slate-200">
            {labels.after}
          </text>
        )}
      </g>
    </svg>
  )
}
