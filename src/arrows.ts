/** Geometry for the curved trade arrows: quadratic Bézier curves in map coordinates. */

export type Pt = [number, number]

export interface Curve {
  s: Pt
  c: Pt
  e: Pt
}

export function pointAt({ s, c, e }: Curve, t: number): Pt {
  const u = 1 - t
  return [u * u * s[0] + 2 * u * t * c[0] + t * t * e[0], u * u * s[1] + 2 * u * t * c[1] + t * t * e[1]]
}

/** Unit tangent (direction of travel) at t. */
export function tangentAt({ s, c, e }: Curve, t: number): Pt {
  const dx = 2 * (1 - t) * (c[0] - s[0]) + 2 * t * (e[0] - c[0])
  const dy = 2 * (1 - t) * (c[1] - s[1]) + 2 * t * (e[1] - c[1])
  const len = Math.hypot(dx, dy) || 1
  return [dx / len, dy / len]
}

/** The piece of a curve between t0 and t1, itself a quadratic curve. */
export function subCurve({ s, c, e }: Curve, t0: number, t1: number): Curve {
  const a = (1 - t0) * (1 - t1)
  const b = (1 - t0) * t1 + t0 * (1 - t1)
  const d = t0 * t1
  return {
    s: pointAt({ s, c, e }, t0),
    c: [a * s[0] + b * c[0] + d * e[0], a * s[1] + b * c[1] + d * e[1]],
    e: pointAt({ s, c, e }, t1),
  }
}

/**
 * A curve from one place to another, bent to the left of the direction of travel by `bend` × distance,
 * with `trimStart` / `trimEnd` (in map units) cut off so it stops short of the markers.
 */
export function arrowCurve(from: Pt, to: Pt, { bend, trimStart, trimEnd }: { bend: number; trimStart: number; trimEnd: number }): Curve {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.hypot(dx, dy) || 1
  const nx = dy / len
  const ny = -dx / len
  const full: Curve = { s: from, c: [(from[0] + to[0]) / 2 + nx * bend * len, (from[1] + to[1]) / 2 + ny * bend * len], e: to }
  const t0 = Math.min(0.4, trimStart / len)
  const t1 = Math.max(0.6, 1 - trimEnd / len)
  return subCurve(full, t0, t1)
}

export const curvePath = ({ s, c, e }: Curve) => `M${s[0]},${s[1]} Q${c[0]},${c[1]} ${e[0]},${e[1]}`

/** Rough arc length, good enough for timing and trimming. */
export function curveLength(curve: Curve): number {
  let total = 0
  let prev = curve.s
  for (let i = 1; i <= 12; i++) {
    const p = pointAt(curve, i / 12)
    total += Math.hypot(p[0] - prev[0], p[1] - prev[1])
    prev = p
  }
  return total
}

/** Triangle path for an arrowhead whose tip sits at the curve's end. */
export function headPath(curve: Curve, length: number, width: number): string {
  const [tx, ty] = tangentAt(curve, 1)
  const [x, y] = curve.e
  const bx = x - tx * length
  const by = y - ty * length
  const px = -ty * (width / 2)
  const py = tx * (width / 2)
  return `M${x},${y} L${bx + px},${by + py} L${bx - px},${by - py} Z`
}

export interface Box {
  x: number
  y: number
  w: number
  h: number
}

export const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
