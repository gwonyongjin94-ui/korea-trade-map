import type { Box } from '../arrows'

/**
 * Chart label placement: each label tries a list of spots around its point and takes the first one
 * that stays inside the plot without covering a label placed before it or a marker to avoid.
 */

export type Anchor = 'start' | 'middle' | 'end'

/** A candidate position: the text's baseline origin relative to the point, and its text-anchor. */
export interface Spot {
  dx: number
  dy: number
  anchor: Anchor
}

export interface LabelSpec {
  id: string
  x: number
  y: number
  text: string
  /** Font size in user units (the chart's text-[Npx] class). */
  size: number
  bold?: boolean
  spots: Spot[]
  /** Optional labels are dropped when every spot is taken; required ones take the least crowded spot. */
  optional?: boolean
}

export interface Placed {
  x: number
  y: number
  anchor: Anchor
  box: Box
}

/** A white (dark: slate) outline drawn under the text, so labels stay legible where they cross lines. */
export const HALO = 'stroke-white [stroke-width:3px] [stroke-linejoin:round] [paint-order:stroke] dark:stroke-slate-900'

let measure: { ctx: CanvasRenderingContext2D; family: string } | null | undefined

/** Rendered width of a label, measured with the page font when there is one and estimated otherwise. */
export function textWidth(text: string, size: number, bold = false): number {
  if (measure === undefined) {
    measure = null
    if (typeof document !== 'undefined' && typeof navigator !== 'undefined' && !/jsdom/i.test(navigator.userAgent)) {
      const ctx = document.createElement('canvas').getContext('2d')
      if (ctx) measure = { ctx, family: getComputedStyle(document.body).fontFamily || 'sans-serif' }
    }
  }
  if (measure) {
    measure.ctx.font = `${bold ? 700 : 400} ${size}px ${measure.family}`
    return measure.ctx.measureText(text).width
  }
  const em = [...text].reduce((w, ch) => w + (/\p{Extended_Pictographic}/u.test(ch) ? 1.25 : /[ㄱ-힣①-⑳]/.test(ch) ? 0.95 : /\s/.test(ch) ? 0.3 : 0.6), 0)
  return em * size * (bold ? 1.05 : 1)
}

/** The box a label covers when its baseline origin is (x, y). */
export function labelBox(x: number, y: number, width: number, size: number, anchor: Anchor): Box {
  const left = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2
  return { x: left - 1.5, y: y - size * 0.92, w: width + 3, h: size * 1.18 }
}

const area = (a: Box, b: Box) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y))

/** Box of a round marker, for the avoid list. */
export const dot = (x: number, y: number, r: number): Box => ({ x: x - r, y: y - r, w: 2 * r, h: 2 * r })

/**
 * Spots around a marker of radius r: right, left, then the four diagonals, then above and below.
 * dy places the baseline so the text's middle lines up with the point.
 */
export function around(r: number, size: number): Spot[] {
  const g = r + 3
  const d = r * 0.7 + 2
  const mid = size * 0.34
  return [
    { dx: g, dy: mid, anchor: 'start' },
    { dx: -g, dy: mid, anchor: 'end' },
    { dx: d, dy: -d, anchor: 'start' },
    { dx: d, dy: d + size * 0.85, anchor: 'start' },
    { dx: -d, dy: -d, anchor: 'end' },
    { dx: -d, dy: d + size * 0.85, anchor: 'end' },
    { dx: 0, dy: -g - 1, anchor: 'middle' },
    { dx: 0, dy: g + size * 0.9, anchor: 'middle' },
  ]
}

/** Places the labels in order; earlier labels get the better spots. */
export function placeLabels(specs: LabelSpec[], bounds: Box, avoid: Box[] = []): Record<string, Placed> {
  const taken: Box[] = [...avoid]
  const out: Record<string, Placed> = {}
  // Areas below EPS are rounding noise (w·h and the clipped area differ in the last bits).
  const EPS = 0.01
  const outside = (b: Box) => Math.max(0, b.w * b.h - area(b, bounds) - EPS)
  for (const s of specs) {
    const w = textWidth(s.text, s.size, s.bold)
    let best: { cost: number; p: Placed } | null = null
    for (const spot of s.spots) {
      const x = s.x + spot.dx
      const y = s.y + spot.dy
      const box = labelBox(x, y, w, s.size, spot.anchor)
      // Leaving the plot is worse than any overlap; ties keep the earlier spot.
      const cost = outside(box) * 1000 + taken.reduce((c, b) => c + area(box, b), 0)
      if (!best || cost < best.cost - EPS) best = { cost, p: { x, y, anchor: spot.anchor, box } }
      if (cost < EPS) break
    }
    if (!best || (s.optional && best.cost >= EPS)) continue
    out[s.id] = best.p
    taken.push(best.p.box)
  }
  return out
}
