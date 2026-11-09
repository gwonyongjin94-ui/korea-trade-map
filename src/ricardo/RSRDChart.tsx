import { fmt } from './format'
import { useRicardoText } from './text'
import { relativeDemand, type ModelResult, type PriceMode } from '../model/ricardian'
import { Frame, LegendItem } from './chart'
import { dot, HALO, placeLabels, type Spot } from '../components/labels'
import { linear, MARGIN } from '../components/scale'

const W = 360
const H = 280

interface Props {
  result: ModelResult
  beta: number
  priceMode: PriceMode
  goods: { X: string; Y: string }
  /** Country names for the autarky price labels; the slot letters are used without them. */
  names?: { A: string; B: string }
}

export function RSRDChart({ result, beta, priceMode, goods, names }: Props) {
  const { lang, t } = useRicardoText()
  const { priceBand, rsFlat, price, countries } = result
  const [lo, hi] = priceBand
  const noTrade = result.tradeCase === 'no-trade'

  const rdAtPrice = relativeDemand(beta, price)
  const yMax = hi * 1.6
  const xMax = Math.max(noTrade ? rdAtPrice : rsFlat, rdAtPrice) * 2
  const x = linear(0, xMax, MARGIN.left, W - MARGIN.right)
  const y = linear(0, yMax, H - MARGIN.bottom, MARGIN.top)

  const rs = noTrade
    ? [
        [0, 0],
        [0, lo],
        [xMax, lo],
      ]
    : [
        [0, 0],
        [0, lo],
        [rsFlat, lo],
        [rsFlat, hi],
        [xMax, hi],
      ]
  const rsPath = rs.map(([q, p], i) => `${i ? 'L' : 'M'}${x(q)},${y(p)}`).join(' ')

  // RD: Q = beta / ((1 - beta) p), sampled on a log grid of prices.
  const pMin = relativeDemand(beta, 1) / xMax
  const rdPath = Array.from({ length: 80 }, (_, i) => {
    const p = pMin * Math.pow(yMax / pMin, i / 79)
    return `${i ? 'L' : 'M'}${x(relativeDemand(beta, p))},${y(p)}`
  }).join(' ')

  // Where the country supplies at the chosen price (only differs from RD in manual mode).
  const rsAtPrice = noTrade ? rdAtPrice : price <= lo + 1e-9 ? Math.min(rsFlat, rdAtPrice) : price >= hi - 1e-9 ? Math.max(rsFlat, rdAtPrice) : rsFlat
  const imbalance = priceMode === 'manual' && Math.abs(rsAtPrice - rdAtPrice) > 1e-6

  // Autarky prices are labelled along their RS steps, the trade price beside its point. With the
  // price close to one autarky price the labels compete for the same strip, so each takes a free spot.
  const plot = { x: MARGIN.left, y: MARGIN.top, w: W - MARGIN.left - MARGIN.right, h: H - MARGIN.top - MARGIN.bottom }
  const autarkyText = (slot: 'A' | 'B') => `${names?.[slot] ?? slot} ${t.autarky} ${fmt(countries[slot].autarkyPrice, lang)}`
  const stepSpots = (above: boolean): Spot[] => {
    const right = W - MARGIN.right - 4
    const mid = x(xMax * 0.55)
    const up = { dy: -5 }
    const down = { dy: 13 }
    const [first, second] = above ? [up, down] : [down, up]
    return [
      { dx: right, ...first, anchor: 'end' },
      { dx: right, ...second, anchor: 'end' },
      { dx: mid, ...first, anchor: 'middle' },
      { dx: mid, ...second, anchor: 'middle' },
    ]
  }
  const slots = (['A', 'B'] as const).slice().sort((a, b) => countries[b].autarkyPrice - countries[a].autarkyPrice)
  const tags = placeLabels(
    [
      // The higher autarky price goes above its line and the lower one below, when there is room.
      ...slots.map((slot, i) => ({ id: slot, x: 0, y: y(countries[slot].autarkyPrice), text: autarkyText(slot), size: 11, bold: true, spots: stepSpots(i === 0 || noTrade) })),
      {
        id: 'p',
        x: x(rdAtPrice),
        y: y(price),
        text: `p = ${fmt(price, lang)}`,
        size: 12,
        bold: true,
        spots: [
          { dx: 10, dy: -8, anchor: 'start' as const },
          { dx: 10, dy: 15, anchor: 'start' as const },
          { dx: -10, dy: -8, anchor: 'end' as const },
          { dx: -10, dy: 15, anchor: 'end' as const },
          { dx: 0, dy: -12, anchor: 'middle' as const },
        ],
      },
    ],
    plot,
    [dot(x(rdAtPrice), y(price), 8), ...(imbalance ? [dot(x(rsAtPrice), y(price), 7)] : [])],
  )

  return (
    <figure className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <figcaption className="mb-2 text-sm font-semibold">{t.rsrdTitle}</figcaption>
      <Frame
        width={W}
        height={H}
        xMax={xMax}
        yMax={yMax}
        xLabel={t.rsrdX(goods.X, goods.Y)}
        yLabel={t.rsrdY(goods.X, goods.Y)}
        format={(v) => fmt(v, lang)}
      >
        <path d={rsPath} fill="none" strokeWidth={3} strokeLinejoin="round" className="stroke-slate-800 dark:stroke-slate-100" />
        <path d={rdPath} fill="none" strokeWidth={2.5} className="stroke-emerald-500" />
        <line x1={MARGIN.left} x2={W - MARGIN.right} y1={y(price)} y2={y(price)} strokeDasharray="4 4" className="stroke-slate-400" />
        {imbalance && (
          <line x1={x(rsAtPrice)} x2={x(rdAtPrice)} y1={y(price)} y2={y(price)} strokeWidth={5} className="stroke-red-500/60" />
        )}
        <circle cx={x(rdAtPrice)} cy={y(price)} r={7} className="fill-emerald-500" stroke="white" strokeWidth={2} />
        {imbalance && <circle cx={x(rsAtPrice)} cy={y(price)} r={6} className="fill-slate-800 dark:fill-slate-100" stroke="white" strokeWidth={2} />}
        <g className={`font-semibold ${HALO}`}>
          {(['A', 'B'] as const).map((slot) =>
            tags[slot] ? (
              <text key={slot} x={tags[slot].x} y={tags[slot].y} textAnchor={tags[slot].anchor} className={`text-[11px] ${slot === 'A' ? 'fill-a' : 'fill-b'}`}>
                {autarkyText(slot)}
              </text>
            ) : null,
          )}
          {tags.p && (
            <text x={tags.p.x} y={tags.p.y} textAnchor={tags.p.anchor} className="fill-emerald-600 text-[12px] dark:fill-emerald-400">
              p = {fmt(price, lang)}
            </text>
          )}
        </g>
      </Frame>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
        <LegendItem swatch={<line x1={-6} x2={6} strokeWidth={3} className="stroke-slate-800 dark:stroke-slate-100" />} label="RS" />
        <LegendItem swatch={<line x1={-6} x2={6} strokeWidth={2.5} className="stroke-emerald-500" />} label="RD" />
        <LegendItem swatch={<circle r={5} className="fill-emerald-500" />} label={t.equilibriumPoint} />
      </div>
    </figure>
  )
}
