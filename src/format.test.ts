import { describe, expect, it } from 'vitest'
import { money, percent } from './format'

describe('money', () => {
  it('writes Korean amounts in 억 and 만 달러', () => {
    expect(money(130_600, 'ko')).toBe('1,306억 달러')
    expect(money(392.6, 'ko')).toBe('3.9억 달러')
    expect(money(39.2, 'ko')).toBe('3,920만 달러')
    expect(money(130_600, 'ko', { short: true })).toBe('1,306억$')
  })

  it('writes English amounts in billions and millions', () => {
    expect(money(130_600, 'en')).toBe('$130.6B')
    expect(money(392.6, 'en')).toBe('$393M')
    expect(money(0.25, 'en')).toBe('$250K')
  })

  it('signs balances', () => {
    expect(money(45_300, 'ko', { signed: true })).toBe('+453억 달러')
    expect(money(-30_000, 'en', { signed: true })).toBe('−$30B')
    expect(money(-500, 'ko')).toBe('−5억 달러')
  })
})

describe('percent', () => {
  it('formats shares and signed changes', () => {
    expect(percent(18.42)).toBe('18.4%')
    expect(percent(8.2, { signed: true })).toBe('+8.2%')
    expect(percent(-3.04, { signed: true })).toBe('−3.0%')
    expect(percent(null)).toBe('—')
  })
})
