import { describe, expect, it } from 'vitest'
import { autarkyPrice, distribution, frontier, outcome, priceAt, omegaAt, produce, relativeDemand, relativeSupply, utilityOf, worldPrice, type Tech } from './heckscherOhlin'

const t: Tech = { sC: 0.3, sF: 0.6, gamma: 0.5 }
const home = { K: 100, L: 150 } // labour-abundant
const foreign = { K: 150, L: 100 } // capital-abundant

describe('prices and production', () => {
  it('maps goods prices to factor prices one-to-one, cloth price rising with w/r', () => {
    expect(omegaAt(t, priceAt(t, 0.7))).toBeCloseTo(0.7, 10)
    expect(priceAt(t, 2)).toBeGreaterThan(priceAt(t, 1))
  })

  it('employs both factors fully and leaves no profit in either good', () => {
    const o = produce(t, home, autarkyPrice(t, home) * 1.05)
    expect(o.only).toBeNull()
    expect(o.KC + o.KF).toBeCloseTo(home.K, 9)
    expect(o.LC + o.LF).toBeCloseTo(home.L, 9)
    expect(o.p * o.QC).toBeCloseTo(o.w * o.LC + o.r * o.KC, 9)
    expect(o.QF).toBeCloseTo(o.w * o.LF + o.r * o.KF, 9)
  })

  it('clears both goods markets in autarky', () => {
    const p = autarkyPrice(t, home)
    expect(relativeSupply(t, [home], p)).toBeCloseTo(relativeDemand(t, p), 9)
  })

  it('traces the frontier from food only to cloth only', () => {
    const pts = frontier(t, home)
    expect(pts[0][0]).toBeCloseTo(0, 6)
    expect(pts[0][1]).toBeCloseTo(home.K ** t.sF * home.L ** (1 - t.sF), 6)
    expect(pts[pts.length - 1][0]).toBeCloseTo(home.K ** t.sC * home.L ** (1 - t.sC), 6)
    expect(pts[pts.length - 1][1]).toBeCloseTo(0, 6)
  })
})

describe('Stolper–Samuelson and Rybczynski', () => {
  it('a higher cloth price raises the wage more than proportionally and lowers the rental', () => {
    const p = autarkyPrice(t, home)
    const a = produce(t, home, p)
    const b = produce(t, home, p * 1.05)
    const d = distribution(t, a, b)
    expect(d.labor.inC).toBeGreaterThan(0)
    // Magnification: the wage rises by more than the 5% price rise.
    expect(d.labor.inF).toBeGreaterThan(5)
    expect(d.labor.verdict).toBe('gain')
    expect(d.capital.verdict).toBe('loss')
  })

  it('more capital at the same prices raises food output more than proportionally and lowers cloth', () => {
    const p = autarkyPrice(t, home)
    const a = produce(t, home, p)
    const b = produce(t, { ...home, K: home.K * 1.1 }, p)
    expect(b.QF / a.QF).toBeGreaterThan(1.1)
    expect(b.QC).toBeLessThan(a.QC)
    expect(b.w).toBeCloseTo(a.w, 9)
  })
})

describe('trade', () => {
  const p = worldPrice(t, home, foreign)
  const h = outcome(t, home, p)
  const f = outcome(t, foreign, p)

  it('lies between the autarky prices and clears the world market', () => {
    expect(autarkyPrice(t, home)).toBeLessThan(p)
    expect(p).toBeLessThan(autarkyPrice(t, foreign))
    expect(h.exportsC + f.exportsC).toBeCloseTo(0, 6)
  })

  it('has each country export the good that uses its abundant factor intensively', () => {
    expect(h.exportsC).toBeGreaterThan(0)
    expect(f.exportsC).toBeLessThan(0)
  })

  it('equalises factor prices when both countries still make both goods', () => {
    expect(h.only).toBeNull()
    expect(f.only).toBeNull()
    expect(h.w).toBeCloseTo(f.w, 9)
    expect(h.r).toBeCloseTo(f.r, 9)
  })

  it('makes both countries better off', () => {
    for (const [e, o] of [
      [home, h],
      [foreign, f],
    ] as const) {
      const a = produce(t, e, autarkyPrice(t, e))
      expect(o.utility).toBeGreaterThan(utilityOf(t, a.QC, a.QF))
    }
  })

  it('stops equalising factor prices once endowments are too different to share a cone', () => {
    const poor = { K: 10, L: 200 }
    const rich = { K: 400, L: 50 }
    const pw = worldPrice(t, poor, rich)
    const a = outcome(t, poor, pw)
    const b = outcome(t, rich, pw)
    expect(a.only === 'C' || b.only === 'F').toBe(true)
    expect(b.w).toBeGreaterThan(a.w * 1.01)
    expect(a.exportsC + b.exportsC).toBeCloseTo(0, 6)
  })
})
