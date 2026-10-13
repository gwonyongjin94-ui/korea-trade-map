import { describe, expect, it } from 'vitest'
import type { TradeData } from './data/trade'
import { distanceKm, gl, gravity, ols2, rcaOf, rcaYear, tCritical } from './theory'

describe('ols2', () => {
  it('recovers exact coefficients from noiseless data', () => {
    const x1 = [1, 2, 3, 4, 5, 6]
    const x2 = [2, 1, 4, 3, 6, 5]
    const y = x1.map((v, i) => 1 + 2 * v - 3 * x2[i])
    const fit = ols2(y, x1, x2)!
    expect(fit.a).toBeCloseTo(1, 9)
    expect(fit.b1).toBeCloseTo(2, 9)
    expect(fit.b2).toBeCloseTo(-3, 9)
    expect(fit.r2).toBeCloseTo(1, 9)
  })

  it('matches a hand-checked regression with noise', () => {
    // y = 0.5 + 1·x1 − 1·x2 plus small residuals that sum to zero
    const x1 = [1, 2, 3, 4, 5]
    const x2 = [1, 3, 2, 5, 4]
    const e = [0.1, -0.2, 0.1, 0.1, -0.1]
    const y = x1.map((v, i) => 0.5 + v - x2[i] + e[i])
    const fit = ols2(y, x1, x2)!
    expect(fit.b1).toBeGreaterThan(0.8)
    expect(fit.b1).toBeLessThan(1.2)
    expect(fit.b2).toBeGreaterThan(-1.2)
    expect(fit.b2).toBeLessThan(-0.8)
    expect(fit.r2).toBeGreaterThan(0.9)
    expect(fit.se1).toBeGreaterThan(0)
    expect(fit.n).toBe(5)
  })

  it('refuses degenerate input', () => {
    expect(ols2([1, 2, 3], [1, 2, 3], [3, 2, 1])).toBeNull()
    // x2 is a multiple of x1: no unique solution.
    expect(ols2([1, 2, 3, 4], [1, 2, 3, 4], [2, 4, 6, 8])).toBeNull()
  })
})

describe('t critical values', () => {
  it('matches the t table at 5% two-sided', () => {
    expect(tCritical(3)).toBeCloseTo(3.182, 3)
    expect(tCritical(10)).toBeCloseTo(2.228, 2)
    expect(tCritical(30)).toBeCloseTo(2.042, 3)
    expect(tCritical(145)).toBeCloseTo(1.976, 3)
  })
})

describe('Grubel–Lloyd', () => {
  it('is 1 for balanced and 0 for one-way trade', () => {
    expect(gl(50, 50)).toBe(1)
    expect(gl(100, 0)).toBe(0)
    expect(gl(30, 10)).toBeCloseTo(0.5)
    expect(gl(0, 0)).toBeNull()
  })
})

describe('distance', () => {
  it('measures Seoul to Tokyo at roughly 1,150 km', () => {
    const km = distanceKm([126.96, 37.53], [139.77, 35.67])
    expect(km).toBeGreaterThan(1100)
    expect(km).toBeLessThan(1200)
  })
})

const D: TradeData = {
  meta: { source: 'test', unit: 'USD million', fetched: '-', years: [2015, 2024, 2025] },
  partners: {
    TOTAL: {
      X: { 2025: { '000': 0, '840': 1000, '392': 400, '156': 1200, '704': 600, '276': 100, '076': 30 } },
      M: { 2025: { '000': 0, '840': 600, '392': 500, '156': 1300, '704': 300, '276': 150, '076': 40 } },
    },
  },
  chapters: { X: {}, M: {} },
  gdp: { 2025: { '840': 30000, '392': 4000, '156': 19000, '704': 500, '276': 4500, '076': 2200, '410': 1900 } },
  capitals: {
    '410': [126.96, 37.53],
    '840': [-77.03, 38.89],
    '392': [139.77, 35.67],
    '156': [116.29, 40.05],
    '704': [105.83, 21.0],
    '276': [13.4, 52.52],
    '076': [-47.93, -15.78],
  },
  rca: { reporters: 50, years: [2015, 2024], byYear: { 2024: { '89': [8.1, 0.25] }, 2015: { '89': [6, 0.2] } }, share: { 2024: 0.03 } },
}

describe('gravity', () => {
  it('fits trade on GDP and distance and reports each partner against the fit', () => {
    const res = gravity({ view: 'total', product: 'TOTAL', year: 2025 }, () => null, D)!
    expect(res.points).toHaveLength(6)
    expect(res.fit.n).toBe(6)
    // Bigger economies trade more, farther ones less.
    expect(res.fit.b1).toBeGreaterThan(0)
    expect(res.fit.b2).toBeLessThan(0)
    const vn = res.points.find((p) => p.iso === '704')!
    expect(vn.trade).toBe(900)
    expect(vn.ratio).toBeCloseTo(vn.trade / vn.predicted)
  })

  it('uses exports alone in the export view and needs GDP for the year', () => {
    const res = gravity({ view: 'export', product: 'TOTAL', year: 2025 }, () => null, D)!
    expect(res.points.find((p) => p.iso === '840')!.trade).toBe(1000)
    expect(gravity({ view: 'export', product: 'TOTAL', year: 2024 }, () => null, D)).toBeNull()
  })
})

describe('RCA lookup', () => {
  it('falls back to the latest year with data', () => {
    expect(rcaYear(2025, D)).toBe(2024)
    expect(rcaYear(2020, D)).toBe(2015)
    expect(rcaYear(2010, D)).toBe(2015)
    expect(rcaOf('89', 2024, D)).toEqual({ rca: 8.1, share: 0.25 })
    expect(rcaOf('85', 2024, D)).toBeNull()
  })
})
