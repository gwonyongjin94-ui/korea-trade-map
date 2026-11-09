import { useState } from 'react'
import { around, dot, HALO, placeLabels, textWidth } from '../labels'

export interface ScatterPoint {
  iso: string
  x: number
  y: number
  tone: 'a' | 'b'
  /** Short label drawn next to the dot when there is room. */
  label?: string
}

interface Props {
  points: ScatterPoint[]
  xLabel: string
  yLabel: string
  formatX: (v: number) => string
  formatY: (v: number) => string
  /** A line in data space, drawn as straight on the log–log axes. */
  line?: { from: [number, number]; to: [number, number]; label: string }
  /** Vertical reference lines, e.g. where Korea itself sits on the x axis. */
  marks?: { x: number; label: string }[]
  selected: string | null
  onPick: (iso: string) => void
  tooltip: (iso: string) => { title: string; lines: string[] }
  /** Factor of headroom around the data on the y axis; tighten it when values span a narrow range. */
  padY?: number
}

const W = 640
const H = 380
const M = { top: 16, right: 20, bottom: 46, left: 70 }

/** Powers of ten (and 3× steps when the range is narrow) spanning [lo, hi]. */
function logTicks(lo: number, hi: number): number[] {
  const out: number[] = []
  const steps = Math.log10(hi / lo) < 2.5 ? [1, 3] : [1]
  for (let e = Math.floor(Math.log10(lo)); e <= Math.ceil(Math.log10(hi)); e++) {
    for (const s of steps) {
      const v = s * 10 ** e
      if (v >= lo && v <= hi) out.push(v)
    }
  }
  return out
}

export function LogScatter({ points, xLabel, yLabel, formatX, formatY, line, marks = [], selected, onPick, tooltip, padY = 1.6 }: Props) {
  const [hover, setHover] = useState<{ iso: string; x: number; y: number } | null>(null)
  const xs = points.map((p) => p.x).concat(line ? [line.from[0], line.to[0]] : [], marks.map((m) => m.x))
  const ys = points.map((p) => p.y).concat(line ? [line.from[1], line.to[1]] : [])
  const pad = (lo: number, hi: number, f = 1.6): [number, number] => [lo / f, hi * f]
  const [x0, x1] = pad(Math.min(...xs), Math.max(...xs))
  const [y0, y1] = pad(Math.min(...ys), Math.max(...ys), padY)
  const sx = (v: number) => M.left + ((Math.log(v) - Math.log(x0)) / (Math.log(x1) - Math.log(x0))) * (W - M.left - M.right)
  const sy = (v: number) => H - M.bottom - ((Math.log(v) - Math.log(y0)) / (Math.log(y1) - Math.log(y0))) * (H - M.top - M.bottom)

  // Label the selected dot first, then the rest from the top down. Each label tries the sides of its
  // dot in turn and is skipped when it would cover another label, a dot or the key.
  const radius = (iso: string) => (iso === selected ? 7 : 4.5)
  const keyW = line ? textWidth(line.label, 11) + 30 : 0
  const plot = { x: M.left + 2, y: M.top, w: W - M.left - M.right - 2, h: H - M.top - M.bottom }
  const dots = points.map((p) => dot(sx(p.x), sy(p.y), radius(p.iso) + 1))
  const key = line ? [{ x: W - M.right - keyW, y: M.top, w: keyW, h: 18 }] : []
  // Reference lines are labelled at the top, beside the line, on whichever side the key leaves free.
  const markTags = placeLabels(
    marks.map((m) => ({
      id: m.label,
      x: sx(m.x),
      y: M.top,
      text: m.label,
      size: 11,
      bold: true,
      spots: [10, 24, 38].flatMap((dy) => [
        { dx: 4, dy, anchor: 'start' as const },
        { dx: -4, dy, anchor: 'end' as const },
      ]),
    })),
    plot,
    [...key, ...dots],
  )
  const avoid = [...dots, ...key, ...Object.values(markTags).map((t) => t.box)]
  const placed = placeLabels(
    [...points]
      .filter((p) => p.label)
      .sort((a, b) => Number(b.iso === selected) - Number(a.iso === selected) || b.y - a.y)
      .map((p) => ({
        id: p.iso,
        x: sx(p.x),
        y: sy(p.y),
        text: p.label!,
        size: 11,
        bold: p.iso === selected,
        optional: p.iso !== selected,
        spots: around(radius(p.iso), 11),
      })),
    plot,
    avoid,
  )
  const labels = points.filter((p) => placed[p.iso]).map((p) => ({ ...p, ...placed[p.iso] }))

  const xAnchor = (v: number) => {
    const half = textWidth(formatX(v), 11) / 2
    return sx(v) + half > W - 2 ? 'end' : sx(v) - half < 2 ? 'start' : 'middle'
  }

  const tip = hover ? tooltip(hover.iso) : null

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full text-slate-500 dark:text-slate-400" onMouseLeave={() => setHover(null)}>
        {logTicks(x0, x1).map((v) => (
          <g key={`x${v}`}>
            <line x1={sx(v)} x2={sx(v)} y1={M.top} y2={H - M.bottom} className="stroke-slate-200 dark:stroke-slate-800" />
            {/* Edge ticks are anchored inward so long labels like "10,000억$" stay inside. */}
            <text x={sx(v)} y={H - M.bottom + 16} textAnchor={xAnchor(v)} className="fill-current text-[11px]">
              {formatX(v)}
            </text>
          </g>
        ))}
        {logTicks(y0, y1).map((v) => (
          <g key={`y${v}`}>
            <line x1={M.left} x2={W - M.right} y1={sy(v)} y2={sy(v)} className="stroke-slate-200 dark:stroke-slate-800" />
            <text x={M.left - 8} y={sy(v)} dy="0.32em" textAnchor="end" className="fill-current text-[11px]">
              {formatY(v)}
            </text>
          </g>
        ))}
        <text x={(M.left + W - M.right) / 2} y={H - 8} textAnchor="middle" className="fill-current text-[12px]">
          {xLabel} (log)
        </text>
        <text transform={`translate(16,${(M.top + H - M.bottom) / 2}) rotate(-90)`} textAnchor="middle" className="fill-current text-[12px]">
          {yLabel} (log)
        </text>

        {line && (
          <line
            x1={sx(line.from[0])}
            y1={sy(line.from[1])}
            x2={sx(line.to[0])}
            y2={sy(line.to[1])}
            strokeWidth={2}
            strokeDasharray="6 4"
            className="stroke-slate-500 dark:stroke-slate-400"
          />
        )}

        {marks.map((m) => (
          <g key={m.label}>
            <line x1={sx(m.x)} x2={sx(m.x)} y1={M.top} y2={H - M.bottom} strokeWidth={1.5} strokeDasharray="2 3" className="stroke-slate-900 dark:stroke-white" />
            {markTags[m.label] && (
              <text x={markTags[m.label].x} y={markTags[m.label].y} textAnchor={markTags[m.label].anchor} className={`fill-slate-700 text-[11px] font-semibold dark:fill-slate-200 ${HALO}`}>
                {m.label}
              </text>
            )}
          </g>
        ))}

        {points.map((p) => (
          <circle
            key={p.iso}
            cx={sx(p.x)}
            cy={sy(p.y)}
            r={p.iso === selected ? 7 : 4.5}
            fillOpacity={selected && p.iso !== selected ? 0.35 : 0.8}
            strokeWidth={p.iso === selected ? 2 : 1}
            className={'cursor-pointer stroke-white dark:stroke-slate-900 ' + (p.tone === 'a' ? 'fill-a' : 'fill-b')}
            onClick={() => onPick(p.iso)}
            onMouseMove={(e) => {
              const box = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
              setHover({ iso: p.iso, x: e.clientX - box.left, y: e.clientY - box.top })
            }}
          />
        ))}
        {labels.map((l) => (
          <text
            key={l.iso}
            x={l.x}
            y={l.y}
            textAnchor={l.anchor}
            className={`pointer-events-none text-[11px] ${HALO} ` + (l.iso === selected ? 'fill-slate-900 font-bold dark:fill-white' : 'fill-slate-600 dark:fill-slate-300')}
          >
            {l.label}
          </text>
        ))}
        {line && (
          <g className="pointer-events-none">
            <line x1={W - M.right - 24} x2={W - M.right - 4} y1={M.top + 9} y2={M.top + 9} strokeWidth={2} strokeDasharray="5 3" className="stroke-slate-500" />
            <text x={W - M.right - 30} y={M.top + 9} dy="0.32em" textAnchor="end" className={`fill-slate-500 text-[11px] dark:fill-slate-400 ${HALO}`}>
              {line.label}
            </text>
          </g>
        )}
      </svg>
      {tip && hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-slate-900/90 px-2.5 py-1.5 text-xs whitespace-nowrap text-white shadow"
          style={{ left: hover.x, top: hover.y - 10 }}
        >
          <div className="font-semibold">{tip.title}</div>
          {tip.lines.map((l) => (
            <div key={l} className="text-slate-300">
              {l}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
