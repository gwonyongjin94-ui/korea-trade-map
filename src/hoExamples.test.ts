import { describe, expect, it } from 'vitest'
import type { TradeData } from './data/trade'
import { basketIntensity, capitalPerWorker, koreaIntensity, partnerTest, revealedIntensity, sharesFromIntensity } from './hoExamples'

// Korea and Japan are capital-rich, Vietnam and Bangladesh labour-rich, Germany richest of all. Chapter 85
// is what capital-rich countries export, 61 what labour-rich ones export.
const D: TradeData = {
  meta: { source: 'test', unit: 'USD million', fetched: '-', years: [2023] },
  partners: {},
  chapters: { X: {}, M: {} },
  iit: { partners: {}, chapters: { 2023: [['85', 80, 20], ['61', 5, 40], ['27', 0, 30]] } },
  goods: {
    year: 2023,
    totals: { '410': 100, '704': 100, '392': 100, '276': 100, '050': 100 },
    exports: {
      '410': { '85': 80, '61': 20 },
      '704': { '85': 20, '61': 80 },
      '392': { '85': 90, '61': 10 },
      '276': { '85': 60, '61': 40 },
      '050': { '85': 5, '61': 95 },
    },
    bilateral: {
      X: { '704': { '85': 30, '61': 1 }, '392': { '85': 5, '61': 5 } },
      M: { '704': { '85': 5, '61': 20 }, '392': { '85': 20, '61': 1 } },
    },
  },
  pwt: {
    capital: { '410': { 2023: 500 }, '704': { 2023: 100 }, '392': { 2023: 450 }, '276': { 2023: 600 }, '050': { 2023: 50 } },
    workers: { '410': { 2023: 1 }, '704': { 2023: 1 }, '392': { 2023: 1 }, '276': { 2023: 1 }, '050': { 2023: 1 } },
  },
}

describe('revealed capital intensity', () => {
  it('reads capital per worker from the Penn World Table', () => {
    expect(capitalPerWorker('410', 2023, D)?.value).toBe(500)
    expect(capitalPerWorker('156', 2023, D)).toBeNull()
  })

  it('averages exporters’ capital per worker, weighted by the good’s share of their exports, without Korea', () => {
    const k = revealedIntensity(['410'], D)
    // 85: (0.2·100 + 0.9·450 + 0.6·600 + 0.05·50) / (0.2 + 0.9 + 0.6 + 0.05)
    expect(k['85']).toBeCloseTo(787.5 / 1.75, 9)
    // 61: (0.8·100 + 0.1·450 + 0.4·600 + 0.95·50) / 2.25
    expect(k['61']).toBeCloseTo(412.5 / 2.25, 9)
    expect(k['85']).toBeGreaterThan(k['61'])
  })

  it('weights a basket by trade and skips chapters outside the scope', () => {
    const k = { '85': 400, '61': 200, '27': 300 }
    expect(basketIntensity({ '85': 1, '61': 1 }, k, 'all')).toBe(300)
    expect(basketIntensity({ '85': 1, '27': 3 }, k, 'manufactures')).toBe(400)
    expect(basketIntensity({}, k, 'all')).toBeNull()
  })
})

describe('Heckscher–Ohlin tests', () => {
  it('compares the capital intensity of Korea’s exports and imports', () => {
    const r = koreaIntensity(2023, 'all', D)
    expect(r.exports!).toBeGreaterThan(r.imports!)
    // Chapter 27 has no exporter in the goods table, so it has no intensity and drops out.
    expect(r.points.map((p) => p.code).sort()).toEqual(['61', '85'])
  })

  it('checks each partner against its capital per worker, leaving the partner out of the intensities', () => {
    const rows = partnerTest('all', D)
    const vn = rows.find((r) => r.iso === '704')!
    // Labour-rich Vietnam: Korea sells it 85 and buys 61, as predicted.
    expect(vn.exports).toBeGreaterThan(vn.imports)
    expect(vn.match).toBe(true)
    // Japan has less capital per worker than Korea but sells Korea the capital-intensive good: a miss.
    const jp = rows.find((r) => r.iso === '392')!
    expect(jp.exports).toBeLessThan(jp.imports)
    expect(jp.match).toBe(false)
  })

  it('turns revealed intensities into capital shares centred on one third', () => {
    const { sC, sF } = sharesFromIntensity(200, 800)
    expect(sF / (1 - sF) / (sC / (1 - sC))).toBeCloseTo(4, 9)
    expect(Math.sqrt((sC / (1 - sC)) * (sF / (1 - sF)))).toBeCloseTo(0.5, 9)
  })
})
