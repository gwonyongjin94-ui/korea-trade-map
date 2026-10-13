import { describe, expect, it } from 'vitest'
import { arrowCurve, pointAt, subCurve, type Curve } from './arrows'

describe('arrow curves', () => {
  it('bends to the left of travel (north when heading east on screen)', () => {
    const c = arrowCurve([0, 100], [200, 100], { bend: 0.2, trimStart: 0, trimEnd: 0 })
    expect(pointAt(c, 0.5)[1]).toBeLessThan(100)
    // Opposite directions bend to opposite sides, so a pair of flows doesn't overlap.
    const back = arrowCurve([200, 100], [0, 100], { bend: 0.2, trimStart: 0, trimEnd: 0 })
    expect(pointAt(back, 0.5)[1]).toBeGreaterThan(100)
  })

  it('trims the ends without moving the rest of the curve', () => {
    const full = arrowCurve([0, 0], [100, 0], { bend: 0.3, trimStart: 0, trimEnd: 0 })
    const trimmed = arrowCurve([0, 0], [100, 0], { bend: 0.3, trimStart: 10, trimEnd: 10 })
    expect(trimmed.s[0]).toBeGreaterThan(0)
    expect(trimmed.e[0]).toBeLessThan(100)
    // The trimmed curve's midpoint lies on the original curve.
    const mid = pointAt(trimmed, 0.5)
    const onFull = pointAt(full, 0.5)
    expect(mid[0]).toBeCloseTo(onFull[0], 6)
    expect(mid[1]).toBeCloseTo(onFull[1], 6)
  })

  it('splits a curve into a matching piece', () => {
    const c: Curve = { s: [0, 0], c: [50, 80], e: [100, 0] }
    const piece = subCurve(c, 0.25, 0.75)
    for (const u of [0, 0.3, 0.5, 1]) {
      const p = pointAt(piece, u)
      const q = pointAt(c, 0.25 + 0.5 * u)
      expect(p[0]).toBeCloseTo(q[0], 9)
      expect(p[1]).toBeCloseTo(q[1], 9)
    }
  })
})
