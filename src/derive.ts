/** Turns the trade data for one view, product and year into what the map draws. */
import type { MapArrow, MapFill } from './components/TradeMap'
import { chapterIcon, productById } from './data/products'
import { DATA, magnitude, metric, partnerStats, topChapter, type Flow, type PartnerStat, type TradeData, type View } from './data/trade'

export interface Scales {
  x: number
  m: number
  balance: number
  total: number
}

/** Largest single-partner values over every year, so arrows and colours stay comparable during playback. */
export function scales(product: string, d: TradeData = DATA): Scales {
  const s: Scales = { x: 0, m: 0, balance: 0, total: 0 }
  for (const year of d.meta.years) {
    for (const p of partnerStats(product, year, d)) {
      s.x = Math.max(s.x, p.x)
      s.m = Math.max(s.m, p.m)
      s.balance = Math.max(s.balance, Math.abs(p.x - p.m))
      s.total = Math.max(s.total, p.x + p.m)
    }
  }
  return s
}

/** Width scale for arrows. A selected pair shows both flows, so it uses the larger of the two. */
export function arrowScale(view: View, s: Scales, paired: boolean): number {
  if (paired || view === 'total') return Math.max(s.x, s.m)
  return view === 'export' ? s.x : view === 'import' ? s.m : s.balance
}

/** Log intensity in [0, 1] covering three orders of magnitude below the maximum. */
export function intensity(v: number, max: number): number {
  if (!(v > 0) || !(max > 0)) return 0
  return Math.min(1, Math.max(0, 1 + Math.log10(v / max) / 3))
}

export function fills(view: View, stats: PartnerStat[], s: Scales): Record<string, MapFill> {
  const out: Record<string, MapFill> = {}
  for (const p of stats) {
    const v = magnitude(view, p)
    if (!(v > 0)) continue
    const max = view === 'export' ? s.x : view === 'import' ? s.m : view === 'balance' ? s.balance : s.total
    const tone = view === 'export' ? 'a' : view === 'import' ? 'b' : view === 'balance' ? (p.x >= p.m ? 'a' : 'b') : 'n'
    out[p.iso] = { tone, t: intensity(v, max) }
  }
  return out
}

interface ArrowInput {
  view: View
  product: string
  year: number
  top: PartnerStat[]
  selected: PartnerStat | null
  format: (v: number, signed?: boolean) => string
  d?: TradeData
}

export function arrows({ view, product, year, top, selected, format, d = DATA }: ArrowInput): MapArrow[] {
  const icon = (flow: Flow, iso: string) =>
    product === 'TOTAL' ? chapterIcon(topChapter(flow, year, iso, d) ?? '') : productById(product).icon
  const flowArrow = (p: PartnerStat, flow: Flow): MapArrow => {
    const v = flow === 'X' ? p.x : p.m
    return { iso: p.iso, flow, value: v, label: format(v), icon: icon(flow, p.iso), tone: flow === 'X' ? 'a' : 'b' }
  }
  const both = (p: PartnerStat) => (['X', 'M'] as const).filter((f) => (f === 'X' ? p.x : p.m) > 0).map((f) => flowArrow(p, f))

  const out = top
    .filter((p) => p.iso !== selected?.iso)
    .flatMap((p): MapArrow[] => {
      switch (view) {
        case 'export':
          return [flowArrow(p, 'X')]
        case 'import':
          return [flowArrow(p, 'M')]
        case 'total':
          return both(p)
        case 'balance': {
          const b = metric('balance', p)
          const flow: Flow = b >= 0 ? 'X' : 'M'
          return [{ iso: p.iso, flow, value: Math.abs(b), label: format(b, true), icon: icon(flow, p.iso), tone: b >= 0 ? 'a' : 'b' }]
        }
      }
    })
  if (selected) out.push(...both(selected))
  return out
}
