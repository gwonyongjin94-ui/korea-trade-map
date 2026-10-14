/**
 * Real-data checks of the Ricardian and specific factors models: Korea against each partner that has
 * both World Bank productivity or land data and a farm/industry split of its trade with Korea.
 */
import { DATA, WORLD, type TradeData } from './data/trade'
import { tCritical } from './theory'

export const KOREA = '410'

/** Latest value at or before the year, else the earliest one after it. */
export function valueNear(series: Record<string, number> | undefined, year: number): { year: number; value: number } | null {
  if (!series) return null
  const years = Object.keys(series)
    .map(Number)
    .sort((a, b) => a - b)
  if (!years.length) return null
  const y = [...years].reverse().find((v) => v <= year) ?? years[0]
  return { year: y, value: series[y] }
}

export interface Productivity {
  /** Value added per worker, constant 2015 USD. */
  agri: number
  ind: number
  /** Years the two values come from. */
  agriYear: number
  indYear: number
}

export function productivity(iso: string, year: number, d: TradeData = DATA): Productivity | null {
  const a = valueNear(d.wb?.agriVa?.[iso], year)
  const i = valueNear(d.wb?.indVa?.[iso], year)
  return a && i ? { agri: a.value, ind: i.value, agriYear: a.year, indYear: i.year } : null
}

/** Workers needed for USD 1 million of value added: the Ricardian unit labour requirement. */
export const workersPerMillion = (vaPerWorker: number) => 1e6 / vaPerWorker

/** Opportunity cost of industrial goods in farm goods: a_I / a_A = farm productivity / industrial productivity. */
export const costOfIndustry = (p: Productivity) => p.agri / p.ind

export interface Shares {
  /** Farm goods' share of Korea's exports to the partner and of imports from it. */
  exportFarm: number
  importFarm: number
}

export function farmShares(iso: string, year: number, d: TradeData = DATA): Shares | null {
  const x = d.sectors?.X?.[year]?.[iso]
  const m = d.sectors?.M?.[year]?.[iso]
  if (!x || !m || x[0] + x[1] <= 0 || m[0] + m[1] <= 0) return null
  return { exportFarm: x[0] / (x[0] + x[1]), importFarm: m[0] / (m[0] + m[1]) }
}

export interface RicardoRow {
  iso: string
  korea: Productivity
  partner: Productivity
  /** Which good Korea has the comparative advantage in. */
  predicted: 'ind' | 'agri'
  shares: Shares
  /** What Korea's trade with the partner actually leans towards exporting. */
  actual: 'ind' | 'agri'
  match: boolean
}

/**
 * Korea has a comparative advantage in industrial goods against a partner when its opportunity cost of
 * industry (farm output given up per unit) is lower. The test is whether farm goods then make up a
 * larger share of what Korea imports from that partner than of what it exports there, which holds
 * whatever the bilateral balance.
 */
export function ricardoTest(year: number, d: TradeData = DATA): RicardoRow[] {
  const korea = productivity(KOREA, year, d)
  if (!korea) return []
  const isos = Object.keys(d.sectors?.X?.[year] ?? {}).filter((iso) => iso !== WORLD && iso !== KOREA)
  const rows: RicardoRow[] = []
  for (const iso of isos) {
    const partner = productivity(iso, year, d)
    const shares = farmShares(iso, year, d)
    if (!partner || !shares) continue
    const predicted = costOfIndustry(korea) < costOfIndustry(partner) ? 'ind' : 'agri'
    const actual = shares.importFarm > shares.exportFarm ? 'ind' : 'agri'
    rows.push({ iso, korea, partner, predicted, shares, actual, match: predicted === actual })
  }
  return rows
}

export interface LandPoint {
  iso: string
  /** Arable land, hectares per person. */
  arable: number
  /** Farm goods' share of what the partner sells to Korea. */
  farmShare: number
  /** Whether the partner sells Korea relatively more farm goods than it buys from Korea. */
  supplier: boolean
}

/**
 * Specific factors check: do countries rich in the factor specific to farming (land) sell Korea more
 * farm goods? Regresses ln(farm share of imports from the partner) on ln(arable land per person).
 */
export function landTest(year: number, d: TradeData = DATA) {
  const points: LandPoint[] = []
  for (const iso of Object.keys(d.sectors?.M?.[year] ?? {})) {
    if (iso === WORLD || iso === KOREA) continue
    const land = valueNear(d.wb?.arable?.[iso], year)
    const shares = farmShares(iso, year, d)
    if (!land || !shares || land.value <= 0 || shares.importFarm <= 0) continue
    points.push({ iso, arable: land.value, farmShare: shares.importFarm, supplier: shares.importFarm > shares.exportFarm })
  }
  // Simple regression of ln(farm share) on ln(land per person), with the slope's classical standard error.
  const n = points.length
  const xs = points.map((p) => Math.log(p.arable))
  const ys = points.map((p) => Math.log(p.farmShare))
  const mx = xs.reduce((s, v) => s + v, 0) / (n || 1)
  const my = ys.reduce((s, v) => s + v, 0) / (n || 1)
  let sxx = 0
  let sxy = 0
  let syy = 0
  for (let i = 0; i < n; i++) {
    sxx += (xs[i] - mx) ** 2
    sxy += (xs[i] - mx) * (ys[i] - my)
    syy += (ys[i] - my) ** 2
  }
  const slope = sxx ? sxy / sxx : 0
  const se = n > 2 && sxx ? Math.sqrt((syy - slope * sxy) / (n - 2) / sxx) : NaN
  const fit =
    n >= 3 && sxx && syy
      ? { slope, se, significant: Math.abs(slope / se) > tCritical(n - 2), intercept: my - slope * mx, r: sxy / Math.sqrt(sxx * syy), n }
      : null
  return { points, fit, korea: valueNear(d.wb?.arable?.[KOREA], year) }
}

