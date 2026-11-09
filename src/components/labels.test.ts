import { describe, expect, it } from 'vitest'
import { around, placeLabels } from './labels'
import { tickLabel, ticksBetween } from './scale'

const bounds = { x: 0, y: 0, w: 400, h: 300 }

describe('placeLabels', () => {
  it('moves a second label off the first one', () => {
    const spec = (id: string) => ({ id, x: 100, y: 100, text: 'label', size: 11, spots: around(5, 11) })
    const out = placeLabels([spec('a'), spec('b')], bounds)
    const [a, b] = [out.a.box, out.b.box]
    const overlap = Math.min(a.x + a.w, b.x + b.w) > Math.max(a.x, b.x) && Math.min(a.y + a.h, b.y + b.h) > Math.max(a.y, b.y)
    expect(overlap).toBe(false)
  })

  it('keeps labels inside the plot', () => {
    const out = placeLabels([{ id: 'a', x: 395, y: 100, text: 'a long label', size: 11, spots: around(5, 11) }], bounds)
    expect(out.a.anchor).toBe('end')
    expect(out.a.box.x + out.a.box.w).toBeLessThanOrEqual(400)
  })

  it('drops an optional label with no free spot but keeps a required one', () => {
    const block = [{ x: 0, y: 0, w: 400, h: 300 }]
    const spec = { x: 100, y: 100, text: 'x', size: 11, spots: around(5, 11) }
    expect(placeLabels([{ ...spec, id: 'o', optional: true }], bounds, block).o).toBeUndefined()
    expect(placeLabels([{ ...spec, id: 'r' }], bounds, block).r).toBeDefined()
  })
})

describe('ticksBetween', () => {
  it('covers a narrow range away from zero with readable labels', () => {
    const { values, step } = ticksBetween(0.9575, 0.9765)
    expect(values[0]).toBeGreaterThanOrEqual(0.9575)
    expect(values.at(-1)).toBeLessThanOrEqual(0.9765)
    expect(new Set(values.map((v) => tickLabel(v, step))).size).toBe(values.length)
    expect(tickLabel(0.96, 0.005)).toBe('0.960')
    expect(tickLabel(1.5, 0.25)).toBe('1.50')
    expect(tickLabel(20, 10)).toBe('20')
  })
})

describe('placeLabels rounding', () => {
  it('keeps an optional label whose box fits exactly despite float noise', () => {
    const out = placeLabels([{ id: 'ex', x: 197.4, y: 84.69, text: 'label', size: 10, optional: true, spots: [{ dx: 0, dy: 13, anchor: 'middle' }] }], { x: 54, y: 18, w: 486, h: 262 })
    expect(out.ex).toBeDefined()
  })
})
