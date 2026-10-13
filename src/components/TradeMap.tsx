import { useMemo, useState } from 'react'
import { arrowCurve, curveLength, curvePath, headPath, overlaps, pointAt, tangentAt, type Box, type Curve } from '../arrows'
import type { Flow } from '../data/trade'
import { anchor, COUNTRY_FEATURES, fitView, FULL_VIEW, hasShape, KOREA, path, SMALL_PLACES, WIDTH } from '../geo'
import { useAnimatedView, useReducedMotion } from '../hooks'
import { useI18n } from '../i18n'

/** a: exports or surplus (blue), b: imports or deficit (orange), n: neutral totals. */
export type Tone = 'a' | 'b' | 'n'

export interface MapArrow {
  iso: string
  /** X: Korea → partner, M: partner → Korea */
  flow: Flow
  /** Size in USD millions, used for the width. */
  value: number
  label: string
  icon: string
  tone: Tone
}

/** Choropleth shading: tone and intensity in [0, 1]. */
export interface MapFill {
  tone: Tone
  t: number
}

interface Props {
  arrows: MapArrow[]
  fills: Record<string, MapFill>
  /** Value that maps to the thickest arrow; fixed across years so the play-through shows growth. */
  scaleMax: number
  selected: string | null
  legend: LegendSpec
  onPick: (iso: string | null) => void
  describe: (iso: string) => { title: string; lines: string[] }
}

const TONE_FILL: Record<Tone, string> = { a: 'fill-a', b: 'fill-b', n: 'fill-slate-600 dark:fill-slate-300' }
const TONE_STROKE: Record<Tone, string> = { a: 'stroke-a', b: 'stroke-b', n: 'stroke-slate-600 dark:stroke-slate-300' }
const TONE_BG: Record<Tone, string> = { a: 'bg-a', b: 'bg-b', n: 'bg-slate-600 dark:bg-slate-300' }

export function TradeMap({ arrows, fills, scaleMax, selected, legend, onPick, describe }: Props) {
  const { t } = useI18n()
  const reduced = useReducedMotion()
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null)
  const [zoomed, setZoomed] = useState(true)
  const [region, setRegion] = useState<'world' | 'asia'>('world')

  const paths = useMemo(() => COUNTRY_FEATURES.map((f) => ({ id: f.id, d: path(f) ?? '' })), [])
  const korea = useMemo(() => anchor(KOREA)!, [])

  const target = useMemo(
    () => (selected && zoomed ? fitView([KOREA, selected]) : region === 'asia' ? ASIA_VIEW : FULL_VIEW),
    [selected, zoomed, region],
  )
  const view = useAnimatedView(target)
  // Overlay sizes are divided by the zoom factor so they look the same at every zoom level.
  const k = WIDTH / view[2]

  const dots = Object.keys(SMALL_PLACES).filter((id) => !hasShape(id) && (fills[id] || arrows.some((a) => a.iso === id)))

  const track = (id: string) => (e: React.MouseEvent<SVGElement>) => {
    const box = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
    setHover({ id, x: e.clientX - box.left, y: e.clientY - box.top })
  }

  const countryClass = (id: string) => {
    if (id === KOREA) return 'fill-slate-800 dark:fill-slate-200'
    const f = fills[id]
    const base = 'cursor-pointer transition-[fill-opacity] duration-300 hover:brightness-110 '
    return base + (f ? TONE_FILL[f.tone] : 'fill-slate-300 dark:fill-slate-700')
  }
  const opacity = (id: string) => {
    const f = fills[id]
    return f && id !== KOREA ? 0.16 + 0.74 * f.t : 1
  }

  const hovered = hover ? describe(hover.id) : null

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-sky-50/60 dark:border-slate-800 dark:bg-slate-900">
      <svg
        viewBox={view.join(' ')}
        className="block h-auto w-full"
        role="img"
        aria-label={t.mapHint}
        onMouseLeave={() => setHover(null)}
      >
        <rect x={-WIDTH} y={-WIDTH} width={WIDTH * 3} height={WIDTH * 3} fill="transparent" onClick={() => onPick(null)} />
        <g>
          {paths.map((p) => (
            <path
              key={p.id}
              d={p.d}
              vectorEffect="non-scaling-stroke"
              fillOpacity={opacity(p.id)}
              onClick={() => p.id !== KOREA && onPick(p.id === selected ? null : p.id)}
              onMouseMove={track(p.id)}
              className={
                countryClass(p.id) +
                (p.id === selected ? ' stroke-slate-900 stroke-[1.5] dark:stroke-white' : ' stroke-white stroke-[0.6] dark:stroke-slate-900')
              }
            />
          ))}
        </g>

        <Arrows arrows={arrows} korea={korea} k={k} scaleMax={scaleMax} reduced={reduced} selected={selected} />

        {dots.map((id) => {
          const p = anchor(id)
          if (!p) return null
          const f = fills[id]
          return (
            <circle
              key={id}
              cx={p[0]}
              cy={p[1]}
              r={(id === selected ? 5 : 3.6) / k}
              fillOpacity={f ? 0.35 + 0.65 * f.t : 1}
              strokeWidth={1 / k}
              onClick={() => onPick(id === selected ? null : id)}
              onMouseMove={track(id)}
              className={'cursor-pointer stroke-white dark:stroke-slate-900 ' + (f ? TONE_FILL[f.tone] : 'fill-slate-400')}
            />
          )
        })}

        <g transform={`translate(${korea[0]},${korea[1]}) scale(${1 / k})`} pointerEvents="none">
          <circle r={12} className="fill-slate-900 dark:fill-white" stroke="white" strokeWidth={2} />
          <text textAnchor="middle" dy="0.35em" className="fill-white text-[10px] font-bold dark:fill-slate-900">
            KR
          </text>
        </g>
      </svg>

      <div className="absolute top-2 right-2 flex gap-1.5">
        {selected ? (
          <>
            <button type="button" onClick={() => setZoomed((z) => !z)} className={BUTTON}>
              {zoomed ? t.zoomOut : t.zoomIn}
            </button>
            <button type="button" onClick={() => onPick(null)} className={BUTTON}>
              ✕ {t.clear}
            </button>
          </>
        ) : (
          <div className="flex rounded-lg border border-slate-200 bg-white/90 p-0.5 text-xs shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
            {(['world', 'asia'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegion(r)}
                aria-pressed={region === r}
                className={
                  'rounded-md px-2.5 py-1 font-medium ' +
                  (region === r ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300')
                }
              >
                {r === 'world' ? t.worldView : t.asiaView}
              </button>
            ))}
          </div>
        )}
      </div>

      <Legend legend={legend} />

      {hovered && hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-slate-900/90 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow"
          style={{ left: hover.x, top: hover.y - 10 }}
        >
          <div className="font-semibold">{hovered.title}</div>
          {hovered.lines.map((line) => (
            <div key={line} className="text-slate-300">
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** East and Southeast Asia, where most of Korea's top partners crowd together at world scale. */
const ASIA_VIEW = fitView(['156', '392', '704', '158', '360', '608', '764', '458', '702'])

const BUTTON =
  'rounded-lg border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur hover:bg-white dark:border-slate-700 dark:bg-slate-900/90 dark:hover:bg-slate-800'

export interface LegendSpec {
  arrows: { tone: Tone; label: string }[]
  fill: { tones: Tone[]; label: string }
}

function Legend({ legend }: { legend: LegendSpec }) {
  const { t } = useI18n()
  return (
    <div className="flex flex-col gap-1 border-t border-slate-200 bg-white/70 px-3 py-2 text-[11px] text-slate-600 sm:pointer-events-none sm:absolute sm:bottom-2 sm:left-2 sm:rounded-lg sm:border-0 sm:bg-white/85 sm:px-2.5 sm:py-1.5 sm:shadow-sm sm:backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 sm:dark:bg-slate-900/85">
      {legend.arrows.map(({ tone, label }) => (
        <div key={tone} className="flex items-center gap-2">
          <svg width="26" height="8" aria-hidden>
            <line x1="1" y1="4" x2="19" y2="4" strokeWidth="3" strokeDasharray="5 3" className={TONE_STROKE[tone]} />
            <path d="M18,0 L25,4 L18,8 Z" className={TONE_FILL[tone]} />
          </svg>
          <span>{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <span className="flex flex-col gap-px">
          {legend.fill.tones.map((tone) => (
            <span key={tone} className="flex">
              {[0.16, 0.4, 0.65, 0.9].map((o) => (
                <span key={o} className={'h-1.5 w-2.5 ' + TONE_BG[tone]} style={{ opacity: o }} />
              ))}
            </span>
          ))}
        </span>
        <span>
          {legend.fill.label} · {t.less} → {t.more}
        </span>
      </div>
    </div>
  )
}

/** Approximate rendered width in ems: Hangul is about a full em, digits and Latin about half. */
function textWidth(text: string): number {
  let w = 0
  for (const ch of text) w += /[\u3131-\uD7A3]/.test(ch) ? 1 : 0.6
  return w + 0.4
}

interface ArrowsProps {
  arrows: MapArrow[]
  korea: [number, number]
  k: number
  scaleMax: number
  reduced: boolean
  selected: string | null
}

/** Curved arrows between Korea and each partner, with the main product's icon travelling along them. */
function Arrows({ arrows, korea, k, scaleMax, reduced, selected }: ArrowsProps) {
  const drawn = arrows
    .map((a, i) => {
      const p = anchor(a.iso)
      if (!p) return null
      const width = (1.4 + 6.6 * Math.sqrt(Math.min(1, a.value / (scaleMax || 1)))) / k
      const [from, to] = a.flow === 'X' ? [korea, p] : [p, korea]
      const curve = arrowCurve(from, to, {
        bend: 0.2,
        trimStart: (a.flow === 'X' ? 14 : 6) / k,
        trimEnd: (a.flow === 'X' ? 5 : 15) / k,
      })
      const head = Math.max(7 / k, width * 2.2)
      // The line stops inside the arrowhead so its square end doesn't poke out of the tip.
      const len = curveLength(curve)
      const line: Curve = { ...curve, e: pointAt(curve, Math.max(0.5, 1 - (head * 0.7) / len)) }
      return { ...a, i, curve, line, width, head, len }
    })
    .filter((a) => a !== null)

  // Labels go at each curve's midpoint, largest flows first, skipping any that would collide.
  const placed: Box[] = [{ x: korea[0] - 14 / k, y: korea[1] - 14 / k, w: 28 / k, h: 28 / k }]
  const labels = drawn
    // With a pair selected, the faded context arrows go unlabelled.
    .filter((a) => !selected || a.iso === selected)
    .sort((a, b) => Number(b.iso === selected) - Number(a.iso === selected) || b.value - a.value)
    .map((a) => {
      const [mx, my] = pointAt(a.curve, 0.5)
      const [tx, ty] = tangentAt(a.curve, 0.5)
      // Put the label on the outer side of the bend.
      const off = a.width / 2 + 9 / k
      const x = mx + ty * off
      const y = my - tx * off
      const font = 11.5 / k
      const w = textWidth(a.label) * font
      const box = { x: x - w / 2, y: y - font * 0.7, w, h: font * 1.4 }
      if (placed.some((b) => overlaps(b, box))) return null
      placed.push(box)
      return { key: `${a.iso}-${a.flow}`, x, y, font, label: a.label, tone: a.tone }
    })
    .filter((l) => l !== null)

  return (
    <g pointerEvents="none">
      {drawn.map((a) => {
        const id = `flow-${a.iso}-${a.flow}`
        const dash = Math.max(6 / k, a.width * 2)
        const gap = Math.max(4 / k, a.width * 1.3)
        // Icons travel at roughly constant speed; staggered starts keep them from moving in lockstep.
        const dur = Math.min(4.5, Math.max(1.6, a.len / 90))
        const still = pointAt(a.curve, 0.3)
        return (
          <g key={id} opacity={selected && a.iso !== selected ? 0.25 : 1}>
            <path
              id={id}
              d={curvePath(a.line)}
              fill="none"
              strokeWidth={a.width}
              strokeLinecap="butt"
              strokeDasharray={`${dash} ${gap}`}
              strokeOpacity={0.85}
              className={TONE_STROKE[a.tone]}
            >
              {!reduced && <animate attributeName="stroke-dashoffset" from={dash + gap} to="0" dur="0.9s" repeatCount="indefinite" />}
            </path>
            <path d={headPath(a.curve, a.head, a.head * 0.9)} className={TONE_FILL[a.tone]} />
            {reduced ? (
              <text x={still[0]} y={still[1]} fontSize={16 / k} textAnchor="middle" dy="0.35em">
                {a.icon}
              </text>
            ) : (
              <text fontSize={16 / k} textAnchor="middle" dy="0.35em">
                {a.icon}
                <animateMotion dur={`${dur}s`} begin={`${-((a.i * 0.53) % dur)}s`} repeatCount="indefinite" rotate="0">
                  <mpath href={`#${id}`} />
                </animateMotion>
              </text>
            )}
          </g>
        )
      })}
      {labels.map((l) => (
        <text
          key={l.key}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          dy="0.35em"
          fontSize={l.font}
          className={'stroke-white font-semibold dark:stroke-slate-900 ' + TONE_FILL[l.tone]}
          strokeWidth={3.5 / k}
          paintOrder="stroke"
        >
          {l.label}
        </text>
      ))}
    </g>
  )
}
