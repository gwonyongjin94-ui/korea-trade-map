import { describe, expect, it } from 'vitest'
import {
  atPrice,
  autarkyPrice,
  distribution,
  frontier,
  migrationAt,
  migrationEquilibrium,
  mplC,
  mplF,
  utilityAt,
  withTrade,
  type Economy,
} from './specificFactors'

const E: Economy = { K: 100, T: 100, L: 100, alpha: 0.4, beta: 0.4, gamma: 0.5 }

describe('labour market', () => {
  it('moves labour until the value of its marginal product is equal in both sectors', () => {
    const o = atPrice(E, 1.3)
    expect(o.LC + o.LF).toBeCloseTo(E.L, 9)
    expect(1.3 * mplC(E, o.LC)).toBeCloseTo(o.w, 9)
    expect(mplF(E, o.LF)).toBeCloseTo(o.w, 9)
  })

  it('pays out all output as wages, capital income and land rent', () => {
    const o = atPrice(E, 0.8)
    expect(o.w * E.L + o.capital + o.land).toBeCloseTo(o.gdp, 9)
  })

  it('splits labour evenly in a symmetric economy at p = 1', () => {
    expect(atPrice(E, 1).LC).toBeCloseTo(50, 6)
  })
})

describe('a rise in the relative price of cloth', () => {
  const before = atPrice(E, 1)
  const after = atPrice(E, 1.1)

  it('raises the wage by less than the price and shifts labour into cloth', () => {
    expect(after.w / before.w).toBeGreaterThan(1)
    expect(after.w / before.w).toBeLessThan(1.1)
    expect(after.LC).toBeGreaterThan(before.LC)
    expect(after.QC).toBeGreaterThan(before.QC)
    expect(after.QF).toBeLessThan(before.QF)
  })

  it('helps capital, hurts land, and leaves workers ambiguous', () => {
    const d = distribution(E, before, after)
    expect(d.capital.verdict).toBe('gain')
    expect(d.land.verdict).toBe('loss')
    expect(d.labor.verdict).toBe('ambiguous')
    expect(d.labor.inC).toBeLessThan(0)
    expect(d.labor.inF).toBeGreaterThan(0)
  })
})

describe('trade', () => {
  it('has no trade at the autarky price', () => {
    const pa = autarkyPrice(E)
    expect(pa).toBeCloseTo(1, 6)
    expect(withTrade(E, pa).exportsC).toBeCloseTo(0, 6)
  })

  it('exports the good whose relative price rose, within the budget constraint', () => {
    const t = withTrade(E, 1.4)
    expect(t.exportsC).toBeGreaterThan(0)
    expect(t.DF - t.QF).toBeCloseTo(1.4 * (t.QC - t.DC), 9)
  })

  it('gains from trade at any world price different from autarky', () => {
    const pa = autarkyPrice(E)
    const a = atPrice(E, pa)
    const ua = utilityAt(E, a.QC, a.QF)
    for (const pw of [0.5, 0.9, 1.2, 2]) expect(withTrade(E, pw).utility).toBeGreaterThan(ua)
  })

  it('makes the autarky price of cloth lower where capital is abundant', () => {
    expect(autarkyPrice({ ...E, K: 300 })).toBeLessThan(autarkyPrice(E))
  })

  it('traces a bowed-out frontier', () => {
    const f = frontier(E, 4)
    expect(f[0][0]).toBe(0)
    expect(f[4][1]).toBe(0)
    // The midpoint lies outside the straight line between the end points.
    const [x, y] = f[2]
    expect(x / f[4][0] + y / f[0][1]).toBeGreaterThan(1)
  })
})

describe('international labour mobility', () => {
  const home = { A: 1, T: 100, beta: 0.4 }
  const foreign = { A: 1.5, T: 100, beta: 0.4 }

  it('equalises real wages and raises world output', () => {
    const eq = migrationEquilibrium(home, foreign, 200)
    const m = migrationAt(home, foreign, 200, eq)
    expect(m.wHome).toBeCloseTo(m.wForeign, 6)
    expect(eq).toBeLessThan(100)
    expect(m.world).toBeGreaterThan(migrationAt(home, foreign, 200, 100).world)
  })
})
