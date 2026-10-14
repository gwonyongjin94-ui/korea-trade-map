import { describe, expect, it } from 'vitest'
import type { TradeData } from './data/trade'
import { costOfIndustry, landTest, ricardoTest, valueNear, workersPerMillion } from './realExamples'

const D: TradeData = {
  meta: { source: 'test', unit: 'USD million', fetched: '-', years: [2024, 2025] },
  partners: {},
  chapters: { X: {}, M: {} },
  sectors: {
    // [farm, other]
    X: { 2025: { '000': [10, 990], '704': [5, 95], '036': [1, 99], '392': [8, 92] } },
    M: { 2025: { '000': [40, 960], '704': [10, 90], '036': [30, 70], '392': [2, 98] } },
  },
  wb: {
    agriVa: { '410': { 2025: 20000 }, '704': { 2025: 4000 }, '036': { 2025: 120000 }, '392': { 2024: 20000 } },
    indVa: { '410': { 2025: 100000 }, '704': { 2025: 8000 }, '036': { 2025: 130000 }, '392': { 2024: 80000 } },
    arable: { '410': { 2024: 0.025 }, '704': { 2024: 0.07 }, '036': { 2024: 1.15 }, '392': { 2024: 0.03 } },
  },
}

describe('Ricardian test', () => {
  it('finds comparative advantage from relative productivity', () => {
    const rows = ricardoTest(2025, D)
    const vn = rows.find((r) => r.iso === '704')!
    // Korea gives up 0.2 units of farm output per unit of industry, Vietnam 0.5: Korea's advantage is industry.
    expect(costOfIndustry(vn.korea)).toBeCloseTo(0.2)
    expect(costOfIndustry(vn.partner)).toBeCloseTo(0.5)
    expect(vn.predicted).toBe('ind')
    // Farm goods are 10% of imports from Vietnam but 5% of exports to it.
    expect(vn.actual).toBe('ind')
    expect(vn.match).toBe(true)
  })

  it('flags a mismatch and uses the nearest year of data', () => {
    const jp = ricardoTest(2025, D).find((r) => r.iso === '392')!
    expect(jp.partner.agriYear).toBe(2024)
    // Japan's cost of industry is 0.25 > Korea's 0.2, so Korea should export industry, but trade leans the other way.
    expect(jp.predicted).toBe('ind')
    expect(jp.actual).toBe('agri')
    expect(jp.match).toBe(false)
  })

  it('converts productivity into workers per million dollars', () => {
    expect(workersPerMillion(20000)).toBe(50)
    expect(valueNear({ 2015: 1, 2020: 2 }, 2018)).toEqual({ year: 2015, value: 1 })
    expect(valueNear({ 2020: 2 }, 2015)).toEqual({ year: 2020, value: 2 })
  })
})

describe('land test', () => {
  it('relates land per person to the farm share of imports', () => {
    const { points, fit, korea } = landTest(2025, D)
    expect(points).toHaveLength(3)
    expect(points.find((p) => p.iso === '036')!.supplier).toBe(true)
    expect(fit!.slope).toBeGreaterThan(0)
    expect(korea!.value).toBe(0.025)
  })
})
