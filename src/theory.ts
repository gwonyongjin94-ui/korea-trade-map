/** Calculations behind the theory tab: gravity regression, Grubel–Lloyd index and RCA lookups. */
import { geoDistance } from 'd3-geo'
import { DATA, pairOf, partnerStats, type TradeData, type View } from './data/trade'

export interface Fit {
  a: number
  /** Elasticity of trade with respect to the partner's GDP. */
  b1: number
  /** Elasticity of trade with respect to distance. */
  b2: number
  se1: number
  se2: number
  r2: number
  n: number
}

/** Ordinary least squares of y on two regressors with an intercept, with classical standard errors. */
export function ols2(y: number[], x1: number[], x2: number[]): Fit | null {
  const n = y.length
  if (n < 4 || x1.length !== n || x2.length !== n) return null
  const mean = (v: number[]) => v.reduce((s, x) => s + x, 0) / n
  const [my, m1, m2] = [mean(y), mean(x1), mean(x2)]
  let s11 = 0
  let s22 = 0
  let s12 = 0
  let s1y = 0
  let s2y = 0
  let syy = 0
  for (let i = 0; i < n; i++) {
    const d1 = x1[i] - m1
    const d2 = x2[i] - m2
    const dy = y[i] - my
    s11 += d1 * d1
    s22 += d2 * d2
    s12 += d1 * d2
    s1y += d1 * dy
    s2y += d2 * dy
    syy += dy * dy
  }
  const det = s11 * s22 - s12 * s12
  if (Math.abs(det) < 1e-12 || syy === 0) return null
  const b1 = (s22 * s1y - s12 * s2y) / det
  const b2 = (s11 * s2y - s12 * s1y) / det
  const a = my - b1 * m1 - b2 * m2
  let ssr = 0
  for (let i = 0; i < n; i++) ssr += (y[i] - (a + b1 * x1[i] + b2 * x2[i])) ** 2
  const sigma2 = ssr / (n - 3)
  return { a, b1, b2, se1: Math.sqrt((sigma2 * s22) / det), se2: Math.sqrt((sigma2 * s11) / det), r2: 1 - ssr / syy, n }
}

export const EARTH_RADIUS_KM = 6371

/** Great-circle distance in km between two [longitude, latitude] points. */
export const distanceKm = (a: [number, number], b: [number, number]) => geoDistance(a, b) * EARTH_RADIUS_KM

/** Trade measured for the gravity model: the balance view falls back to total trade. */
export const gravityFlow = (view: View): 'export' | 'import' | 'total' => (view === 'balance' ? 'total' : view)

export interface GravityPoint {
  iso: string
  /** USD millions */
  trade: number
  /** USD billions */
  gdp: number
  km: number
  /** Trade the fitted model predicts, USD millions. */
  predicted: number
  /** actual ÷ predicted */
  ratio: number
}

/** Partners smaller than this (USD billions) are left out: flag registries and micro-states dominate otherwise. */
export const MIN_GDP = 10

/**
 * Cross-section gravity regression for one year: ln T_j = a + b1·ln GDP_j + b2·ln distance_j.
 * Korea's own GDP is the same for every partner, so it sits in the intercept.
 */
export function gravity(
  { view, product, year }: { view: View; product: string; year: number },
  coordsOf: (iso: string) => [number, number] | null,
  d: TradeData = DATA,
): { points: GravityPoint[]; fit: Fit } | null {
  const origin = d.capitals?.['410']
  const gdp = d.gdp?.[year]
  if (!origin || !gdp) return null
  const flow = gravityFlow(view)
  const rows = partnerStats(product, year, d)
    .map((p) => {
      const trade = flow === 'export' ? p.x : flow === 'import' ? p.m : p.x + p.m
      const where = d.capitals?.[p.iso] ?? coordsOf(p.iso)
      return { iso: p.iso, trade, gdp: gdp[p.iso], km: where ? distanceKm(origin, where) : NaN }
    })
    .filter((r) => r.trade > 0 && r.gdp >= MIN_GDP && r.km > 50)
  const fit = ols2(
    rows.map((r) => Math.log(r.trade)),
    rows.map((r) => Math.log(r.gdp)),
    rows.map((r) => Math.log(r.km)),
  )
  if (!fit) return null
  const points = rows.map((r) => {
    const predicted = Math.exp(fit.a + fit.b1 * Math.log(r.gdp) + fit.b2 * Math.log(r.km))
    return { ...r, predicted, ratio: r.trade / predicted }
  })
  return { points, fit }
}

/** Grubel–Lloyd index for one product line: 1 when exports equal imports, 0 when trade only goes one way. */
export function gl(x: number, m: number): number | null {
  return x + m > 0 ? 1 - Math.abs(x - m) / (x + m) : null
}

/** Partner GL for a single product, from the partner table rather than the chapter breakdown. */
export function productGl(product: string, year: number, iso: string, d: TradeData = DATA): number | null {
  const p = pairOf(product, year, iso, d)
  return gl(p.x, p.m)
}

/** The RCA year to show for a selected year: the latest available one not after it, else the earliest. */
export function rcaYear(year: number, d: TradeData = DATA): number | null {
  const years = d.rca?.years ?? []
  if (!years.length) return null
  return [...years].reverse().find((y) => y <= year) ?? years[0]
}

export function rcaOf(code: string, year: number, d: TradeData = DATA): { rca: number; share: number } | null {
  const v = d.rca?.byYear[year]?.[code]
  return v ? { rca: v[0], share: v[1] } : null
}
