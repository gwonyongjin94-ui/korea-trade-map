import { describe, expect, it } from 'vitest'
import { arrows, fills, intensity, scales } from '../derive'
import { change, rankOf, ranked, series, topChapter, type TradeData } from './trade'

const D: TradeData = {
  meta: { source: 'test', unit: 'USD million', fetched: '2026-10-12', years: [2024, 2025] },
  partners: {
    TOTAL: {
      X: { 2024: { '000': 600, '156': 300, '840': 200, '392': 50 }, 2025: { '000': 700, '156': 280, '840': 300, '392': 60 } },
      M: { 2024: { '000': 550, '156': 250, '840': 100, '392': 80 }, 2025: { '000': 600, '156': 320, '840': 120, '392': 70 } },
    },
  },
  chapters: {
    X: { 2025: { '840': [['87', 120], ['85', 100], ['other', 80]] } },
    M: { 2025: { '840': [['27', 50], ['other', 70]] } },
  },
}

describe('ranking', () => {
  it('ranks by exports, imports, and the size of the balance', () => {
    expect(ranked('export', 'TOTAL', 2025, D).map((p) => p.iso)).toEqual(['840', '156', '392'])
    expect(ranked('import', 'TOTAL', 2025, D).map((p) => p.iso)).toEqual(['156', '840', '392'])
    // Balances: USA +180, China −40, Japan −10.
    expect(ranked('balance', 'TOTAL', 2025, D).map((p) => p.iso)).toEqual(['840', '156', '392'])
    expect(rankOf('total', 'TOTAL', 2025, '392', D)).toBe(3)
    expect(rankOf('export', 'TOTAL', 2025, '999', D)).toBeNull()
  })

  it('never ranks the world total as a partner', () => {
    expect(ranked('total', 'TOTAL', 2024, D).some((p) => p.iso === '000')).toBe(false)
  })

  it('builds a yearly series and percent changes', () => {
    expect(series('TOTAL', '840', D)).toEqual([
      { year: 2024, x: 200, m: 100 },
      { year: 2025, x: 300, m: 120 },
    ])
    expect(change(300, 200)).toBe(50)
    expect(change(5, 0)).toBeNull()
  })

  it('finds the largest chapter, ignoring "other"', () => {
    expect(topChapter('X', 2025, '840', D)).toBe('87')
    expect(topChapter('M', 2025, '840', D)).toBe('27')
    expect(topChapter('M', 2025, '156', D)).toBeUndefined()
  })
})

describe('map derivation', () => {
  it('uses the largest value over all years as the scale', () => {
    expect(scales('TOTAL', D)).toEqual({ x: 300, m: 320, balance: 180, total: 600 })
  })

  it('maps three orders of magnitude to colour intensity', () => {
    expect(intensity(1000, 1000)).toBe(1)
    expect(intensity(1, 1000)).toBe(0)
    expect(intensity(10, 1000)).toBeCloseTo(1 / 3)
    expect(intensity(0, 1000)).toBe(0)
  })

  it('colours balance views by the sign of the balance', () => {
    const f = fills('balance', ranked('balance', 'TOTAL', 2025, D), scales('TOTAL', D))
    expect(f['840'].tone).toBe('a')
    expect(f['156'].tone).toBe('b')
  })

  it('points balance arrows in the direction of the net flow', () => {
    const top = ranked('balance', 'TOTAL', 2025, D)
    const a = arrows({ view: 'balance', product: 'TOTAL', year: 2025, top, selected: null, format: String, d: D })
    expect(a.find((x) => x.iso === '840')).toMatchObject({ flow: 'X', value: 180, tone: 'a', icon: '🚗' })
    expect(a.find((x) => x.iso === '156')).toMatchObject({ flow: 'M', value: 40, tone: 'b' })
  })

  it('shows both flows for the selected partner and no duplicate', () => {
    const top = ranked('export', 'TOTAL', 2025, D)
    const usa = top.find((p) => p.iso === '840')!
    const a = arrows({ view: 'export', product: 'TOTAL', year: 2025, top, selected: usa, format: String, d: D })
    expect(a.filter((x) => x.iso === '840').map((x) => x.flow)).toEqual(['X', 'M'])
    expect(a.filter((x) => x.iso !== '840')).toHaveLength(2)
  })
})
