import { useId } from 'react'
import { coneOmegas, priceAt, produce, relativeDemand, relativeSupply, type Endowment, type Production, type Tech } from '../../model/heckscherOhlin'
import { LegendItem } from '../../ricardo/chart'
import { around, dot, HALO, labelBox, placeLabels, textWidth, type LabelSpec, type Spot } from '../labels'
import { linear, tickLabel, ticks, ticksBetween } from '../scale'

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
  // The left panel shows only the stretch of SS the countries use. When the two sectors' factor
  // intensities are close, goods prices barely move with w/r, and a price axis from zero would press
  // the whole curve against the edge. So the centre line stands for the lowest price shown, not zero.
  const oLow = Math.min(top * 0.03, Math.min(...omegas) * 0.5)
  const prices = countries.flatMap((c) => [c.autarky.p, c.trade.p])
  const p0 = Math.min(priceAt(t, oLow), ...prices)
  const p1 = Math.max(priceAt(t, top), ...prices)
  const pEnd = p1 + (p1 - p0) * 0.06
  const xl = linear(p0, pEnd, cx, M.left + 6)
  const pTicks = ticksBetween(p0, pEnd, 4)
  const lks = countries.map((c) => c.e.L / c.e.K)
  const lkMax = Math.max(...lks) * 1.9
  const xr = linear(0, lkMax, cx, W - M.right)
  const sample = (from: number, f: (omega: number) => [number, number]) =>
    Array.from({ length: 121 }, (_, i) => {
      const omega = from + ((top - from) * i) / 120
      const [px, py] = f(omega)
      return `${i ? 'L' : 'M'}${px},${py}`
    }).join(' ')
  const ss = sample(oLow, (o) => [xl(priceAt(t, o)), y(o)])
  const lk = (s: number, o: number) => (1 - s) / s / o
  const cc = sample(top * 0.01, (o) => [Math.min(W + 40, xr(lk(t.sC, o))), y(o)])
  const ff = sample(top * 0.01, (o) => [Math.min(W + 40, xr(lk(t.sF, o))), y(o)])

  // Markers the labels must not cover: autarky circles, trade dots, the key and the w/r axis title.
  const keys = [
    [labels.cc, 'stroke-emerald-600 dark:stroke-emerald-400', 'fill-emerald-700 dark:fill-emerald-300'],
    [labels.ff, 'stroke-violet-600 dark:stroke-violet-400', 'fill-violet-700 dark:fill-violet-300'],
  ] as const
  const keyW = Math.max(...keys.map(([l]) => textWidth(l, 11, true))) + 28
  const marks = [
    ...countries.flatMap((c, i) => {
      const o = c.trade.omega
      const r = i === 0 ? 1.4 : 1
      return [
        dot(xl(c.autarky.p), y(c.autarky.omega), 6.5),
        ...(c.trade.only === null ? [dot(xl(c.trade.p), y(o), 4.5 * r)] : []),
        ...(c.trade.only !== 'F' ? [dot(xr(lk(t.sC, o)), y(o), 3.2 * r)] : []),
        ...(c.trade.only !== 'C' ? [dot(xr(lk(t.sF, o)), y(o), 3.2 * r)] : []),
      ]
    }),
    { x: W - M.right - keyW, y: T, w: keyW, h: 34 },
  ]
  const left = { x: M.left, y: T, w: cx - M.left - 2, h: H - M.bottom - T }
  const right = { x: cx + 2, y: T, w: W - M.right - cx - 2, h: H - M.bottom - T }
  const spots = around(6, 10)
  const onSS = placeLabels(
    [
      ...countries.map(
        (c, i): LabelSpec => ({
          id: `a${i}`,
          x: xl(c.autarky.p),
          y: y(c.autarky.omega),
          text: labels.autarky(c.name),
          size: 10,
          bold: true,
          // Left of the point first: the w/r line runs off to the right.
          spots: [spots[1], spots[i ? 5 : 4], spots[i ? 4 : 5], spots[0], spots[i ? 3 : 2], spots[i ? 2 : 3], spots[6], spots[7]],
        }),
      ),
      { id: 'ss', x: xl(priceAt(t, top * 0.9)), y: y(top * 0.9), text: labels.ss, size: 12, bold: true, spots: [spots[0], spots[1], spots[3], spots[5]] },
    ],
    left,
    marks,
  )
  const lkSpots: Spot[] = [-6, -18, -30, -42].flatMap((dy) => [
    { dx: 3, dy, anchor: 'start' as const },
    { dx: -3, dy, anchor: 'end' as const },
  ])
  const onLK = placeLabels(
    countries.map((c, i) => ({ id: `l${i}`, x: xr(lks[i]), y: H - M.bottom, text: labels.endowment(c.name), size: 10, bold: true, spots: lkSpots })),
    right,
    [...marks, ...Object.values(onSS).map((p) => p.box)],
  )

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
      {pTicks.values.map((v) =>
        // Skip ticks crowding the centre line, where the right panel's labels start.
        cx - xl(v) < 22 ? null : (
          <text key={`p${v}`} x={xl(v)} y={H - M.bottom + 14} textAnchor="middle" className="fill-current text-[10px]">
            {tickLabel(v, pTicks.step)}
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
          const onCurve = c.trade.only === null
          const r = i === 0 ? 1.4 : 1
          return (
            <g key={`t${c.name}`}>
              <line x1={onCurve ? xl(c.trade.p) : cx} x2={xr(lk(t.sC, o))} y1={y(o)} y2={y(o)} strokeDasharray="2 3" className="stroke-slate-400" />
              {onCurve && <circle cx={xl(c.trade.p)} cy={y(o)} r={4.5 * r} className={TONE[c.tone].fill} />}
              {c.trade.only !== 'F' && <circle cx={xr(lk(t.sC, o))} cy={y(o)} r={3.2 * r} className={TONE[c.tone].fill} />}
              {c.trade.only !== 'C' && <circle cx={xr(lk(t.sF, o))} cy={y(o)} r={3.2 * r} className={TONE[c.tone].fill} />}
            </g>
          )
        })}
        {countries.map((c) => (
          <circle key={`a${c.name}`} cx={xl(c.autarky.p)} cy={y(c.autarky.omega)} r={5.5} strokeWidth={2} className={`fill-white dark:fill-slate-900 ${TONE[c.tone].stroke}`} />
        ))}
      </g>

      <g className={`text-[10px] font-semibold ${HALO}`}>
        {countries.map((c, i) =>
          (['a', 'l'] as const).map((kind) => {
            const p = (kind === 'a' ? onSS : onLK)[`${kind}${i}`]
            return p ? (
              <text key={kind + c.name} x={p.x} y={p.y} textAnchor={p.anchor} className={TONE[c.tone].fill}>
                {kind === 'a' ? labels.autarky(c.name) : labels.endowment(c.name)}
              </text>
            ) : null
          }),
        )}
        {onSS.ss && (
          <text x={onSS.ss.x} y={onSS.ss.y} textAnchor={onSS.ss.anchor} className="fill-slate-700 text-[12px] font-bold dark:fill-slate-200">
            {labels.ss}
          </text>
        )}
      </g>
      {/* The input-choice curves get a key in the empty top-right corner: near the top they can run close together. */}
      {keys.map(([label, stroke, fill], i) => (
        <g key={label}>
          <line x1={W - M.right - 18} x2={W - M.right} y1={T + 8 + i * 15} y2={T + 8 + i * 15} strokeWidth={2.5} className={stroke} />
          <text x={W - M.right - 24} y={T + 12 + i * 15} textAnchor="end" className={`${fill} text-[11px] font-bold`}>
            {label}
          </text>
        </g>
      ))}
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
  const ML = 60
  // The price window where the countries' supplies respond: from where the lower one starts making
  // cloth to where the higher one stops making food. With similar countries and factor intensities
  // that window is narrow, and a wider axis would flatten every curve onto one line.
  const marked = [a.pa, b.pa, pw]
  const cone = [a.e, b.e].flatMap((e) => coneOmegas(t, e).map((o) => priceAt(t, o)))
  const lo0 = Math.min(Math.max(Math.min(...cone), Math.min(...marked) / 1.5), Math.min(...marked))
  const hi0 = Math.max(Math.min(Math.max(...cone), Math.max(...marked) * 1.5), Math.max(...marked))
  const pad = Math.log(hi0 / lo0) * 0.12 || 0.01
  const pLo = lo0 / Math.exp(pad)
  const pHi = hi0 * Math.exp(pad)
  const y = linear(pLo, pHi, H - M.bottom, M.top)
  const xMax = relativeDemand(t, pw) * 2.6
  const x = linear(0, xMax, ML, W - M.right)
  const curve = (es: Endowment[]) =>
    Array.from({ length: 241 }, (_, i) => {
      const p = pLo * (pHi / pLo) ** (i / 240)
      return `${i ? 'L' : 'M'}${Math.min(W + 40, x(relativeSupply(t, es, p)))},${y(p)}`
    }).join(' ')
  const rd = Array.from({ length: 81 }, (_, i) => {
    const p = pLo * (pHi / pLo) ** (i / 80)
    return `${i ? 'L' : 'M'}${Math.min(W + 40, x(relativeDemand(t, p)))},${y(p)}`
  }).join(' ')
  const yTicks = ticksBetween(pLo, pHi, 4)
  const xTicks = ticks(xMax)
  const points = [
    { id: '1', p: a.pa, cls: 'stroke-a', filled: false },
    { id: '2', p: pw, cls: '', filled: true },
    { id: '3', p: b.pa, cls: 'stroke-b', filled: false },
  ]
  // The world price usually sits next to one autarky price (the larger country's), so each number
  // finds its own free side of the points.
  const placed = placeLabels(
    [1, 0, 2].map((i) => ({ id: points[i].id, x: x(relativeDemand(t, points[i].p)), y: y(points[i].p), text: points[i].id, size: 13, bold: true, spots: around(6, 13) })),
    { x: ML, y: M.top, w: W - ML - M.right, h: H - M.top - M.bottom },
    points.map((pt) => dot(x(relativeDemand(t, pt.p)), y(pt.p), 6.5)),
  )

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full text-slate-500 dark:text-slate-400">
        <defs>
          <clipPath id={clip}>
            <rect x={ML} y={M.top} width={W - ML - M.right} height={H - M.top - M.bottom} />
          </clipPath>
        </defs>
        {yTicks.values.map((v) => (
          <g key={`y${v}`}>
            <line x1={ML} x2={W - M.right} y1={y(v)} y2={y(v)} className="stroke-slate-200 dark:stroke-slate-800" />
            <text x={ML - 6} y={y(v)} dy="0.32em" textAnchor="end" className="fill-current text-[10px]">
              {tickLabel(v, yTicks.step)}
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
        {points.map((pt) => (
          <circle
            key={pt.id}
            cx={x(relativeDemand(t, pt.p))}
            cy={y(pt.p)}
            r={5.5}
            strokeWidth={2}
            className={pt.filled ? 'fill-slate-900 dark:fill-white' : `fill-white dark:fill-slate-900 ${pt.cls}`}
          />
        ))}
        <g className={`fill-slate-700 text-[13px] font-bold dark:fill-slate-200 ${HALO}`}>
          {points.map((pt) => {
            const l = placed[pt.id]
            return l ? (
              <text key={pt.id} x={l.x} y={l.y} textAnchor={l.anchor}>
                {pt.id}
              </text>
            ) : null
          })}
        </g>
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
        <LegendItem swatch={<line x1={-7} x2={7} strokeWidth={2} strokeDasharray="4 2" className="stroke-a" />} label={labels.rsA} />
        <LegendItem swatch={<line x1={-7} x2={7} strokeWidth={2} strokeDasharray="4 2" className="stroke-b" />} label={labels.rsB} />
        <LegendItem swatch={<line x1={-7} x2={7} strokeWidth={2.5} className="stroke-slate-700 dark:stroke-slate-200" />} label={labels.rsWorld} />
        <LegendItem swatch={<line x1={-7} x2={7} strokeWidth={2.5} className="stroke-indigo-500" />} label={labels.rd} />
      </div>
    </div>
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
  // The two allocations sit close together for small increases: give each label its own side.
  const pts = { before: [x(before.LC), y(before.KC)], after: [x(after.LC), y(after.KC)] } as const
  const origins = [labelBox(x(0), y(0) + 16, textWidth(`↗ ${labels.originC}`, 11, true), 11, 'start'), labelBox(x(e.L), y(kMax) - 6, textWidth(`${labels.originF} ↙`, 11, true), 11, 'end')]
  const tags = placeLabels(
    (moved ? ['after' as const, 'before' as const] : ['before' as const]).map((k) => ({ id: k, x: pts[k][0], y: pts[k][1], text: labels[k], size: 11, bold: true, spots: around(6, 11) })),
    { x: 0, y: 0, w: W, h: H - 22 },
    [...Object.values(pts).map(([px, py]) => dot(px, py, 6.5)), ...origins],
  )

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
      </g>
      <g className={`fill-slate-700 text-[11px] font-semibold dark:fill-slate-200 ${HALO}`}>
        {(['after', 'before'] as const).map((k) => {
          const l = tags[k]
          return l ? (
            <text key={k} x={l.x} y={l.y} textAnchor={l.anchor}>
              {labels[k]}
            </text>
          ) : null
        })}
      </g>
    </svg>
  )
}
