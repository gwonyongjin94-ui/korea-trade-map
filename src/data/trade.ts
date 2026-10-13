import raw from './trade.json'

/** Comtrade flow codes: X = Korea's exports, M = Korea's imports. */
export type Flow = 'X' | 'M'
export type View = 'export' | 'import' | 'balance' | 'total'

/** Values are in millions of US dollars, keyed by ISO numeric country id. "000" is the world total. */
type ByIso = Record<string, number>

export interface TradeData {
  meta: { source: string; unit: string; fetched: string; years: number[] }
  /** product → flow → year → partner → value */
  partners: Record<string, Partial<Record<Flow, Record<string, ByIso>>>>
  /** flow → year → partner → [[HS chapter, value], …] largest first, "other" last */
  chapters: Record<Flow, Record<string, Record<string, [string, number][]>>>
}

export const DATA = raw as unknown as TradeData
export const YEARS = DATA.meta.years
export const WORLD = '000'

export interface Pair {
  x: number
  m: number
}

export interface PartnerStat extends Pair {
  iso: string
}

export function value(product: string, flow: Flow, year: number, iso: string, d = DATA): number {
  return d.partners[product]?.[flow]?.[year]?.[iso] ?? 0
}

export function pairOf(product: string, year: number, iso: string, d = DATA): Pair {
  return { x: value(product, 'X', year, iso, d), m: value(product, 'M', year, iso, d) }
}

/** The number a view is about: exports, imports, exports minus imports, or the sum. */
export function metric(view: View, p: Pair): number {
  switch (view) {
    case 'export':
      return p.x
    case 'import':
      return p.m
    case 'balance':
      return p.x - p.m
    case 'total':
      return p.x + p.m
  }
}

/** Size used to rank partners and scale arrows; for the balance this is the gap in either direction. */
export const magnitude = (view: View, p: Pair) => Math.abs(metric(view, p))

/** Every partner with any trade in the product that year (the world total excluded). */
export function partnerStats(product: string, year: number, d = DATA): PartnerStat[] {
  const x = d.partners[product]?.X?.[year] ?? {}
  const m = d.partners[product]?.M?.[year] ?? {}
  const ids = new Set([...Object.keys(x), ...Object.keys(m)])
  ids.delete(WORLD)
  return [...ids].map((iso) => ({ iso, x: x[iso] ?? 0, m: m[iso] ?? 0 }))
}

/** Partners ranked by the view's magnitude, largest first. */
export function ranked(view: View, product: string, year: number, d = DATA): PartnerStat[] {
  return partnerStats(product, year, d)
    .filter((s) => magnitude(view, s) > 0)
    .sort((a, b) => magnitude(view, b) - magnitude(view, a))
}

/** 1-based rank of a partner in the view, or null when it has no trade. */
export function rankOf(view: View, product: string, year: number, iso: string, d = DATA): number | null {
  const i = ranked(view, product, year, d).findIndex((s) => s.iso === iso)
  return i < 0 ? null : i + 1
}

/** Exports and imports for every year, for one partner or the world. */
export function series(product: string, iso: string, d = DATA): ({ year: number } & Pair)[] {
  return d.meta.years.map((year) => ({ year, ...pairOf(product, year, iso, d) }))
}

export function chapterList(flow: Flow, year: number, iso: string, d = DATA): [string, number][] | undefined {
  return d.chapters[flow]?.[year]?.[iso]
}

/** Largest chapter for a partner, used as the icon travelling along its arrow. */
export function topChapter(flow: Flow, year: number, iso: string, d = DATA): string | undefined {
  return chapterList(flow, year, iso, d)?.find(([code]) => code !== 'other')?.[0]
}

/** Percent change, or null when there is nothing to compare with. */
export function change(current: number, previous: number): number | null {
  if (!previous) return null
  return ((current - previous) / Math.abs(previous)) * 100
}
