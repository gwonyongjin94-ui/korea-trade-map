/**
 * Real-data checks of the Heckscher–Ohlin model: countries' capital per worker (Penn World Table) and
 * the capital intensity of the goods they trade, measured the "revealed" way: a good's capital intensity
 * is the average capital per worker of the countries that export it, weighted by how much of each
 * country's exports the good makes up (the same weights as Balassa RCA, as in UNCTAD's revealed factor
 * intensity indices). Korea itself is left out of those weights so it can't confirm its own result.
 */
import { DATA, WORLD, type Flow, type TradeData } from './data/trade'
import { KOREA, valueNear } from './realExamples'
import { tCritical } from './theory'

/** Capital per worker in thousands of USD (2021 PPPs) in the year, or the nearest earlier one. */
export function capitalPerWorker(iso: string, year: number, d: TradeData = DATA): { year: number; value: number; K: number; L: number } | null {
  const K = valueNear(d.pwt?.capital[iso], year)
  const L = d.pwt?.workers[iso]?.[K?.year ?? -1]
  return K && L ? { year: K.year, value: K.value / L, K: K.value, L } : null
}

/** Which HS chapters a test covers: all of them, or manufactures only (HS 28–96 without 71: no farm goods, minerals, fuels, gold or art). */
export type Scope = 'all' | 'manufactures'

export const inScope = (code: string, scope: Scope) => {
  const n = Number(code)
  if (code.length !== 2 || code === '99') return false
  return scope === 'all' || (n >= 28 && n <= 96 && n !== 71)
}

/**
 * Revealed capital intensity of every chapter and product, thousand USD per worker: Σ s_ic·k_i / Σ s_ic
 * over reporters i with PWT data, where s_ic is good c's share of country i's exports.
 */
export function revealedIntensity(exclude: string[] = [KOREA], d: TradeData = DATA): Record<string, number> {
  const g = d.goods
  if (!g) return {}
  const num: Record<string, number> = {}
  const den: Record<string, number> = {}
  for (const [iso, exports] of Object.entries(g.exports)) {
    const k = capitalPerWorker(iso, g.year, d)
    const total = g.totals[iso]
    if (exclude.includes(iso) || !k || !total) continue
    for (const [code, v] of Object.entries(exports)) {
      const s = v / total
      num[code] = (num[code] ?? 0) + s * k.value
      den[code] = (den[code] ?? 0) + s
    }
  }
  return Object.fromEntries(Object.keys(num).filter((c) => den[c] > 0).map((c) => [c, num[c] / den[c]]))
}

/** Trade-weighted capital intensity of a basket of chapters ({code: value}). */
export function basketIntensity(basket: Record<string, number>, kappa: Record<string, number>, scope: Scope): number | null {
  let v = 0
  let w = 0
  for (const [code, value] of Object.entries(basket)) {
    if (!inScope(code, scope) || kappa[code] === undefined || value <= 0) continue
    v += value * kappa[code]
    w += value
  }
  return w > 0 ? v / w : null
}

/** Korea–world exports and imports by chapter in a year, USD millions. */
function koreaWorld(year: number, d: TradeData): Record<Flow, Record<string, number>> {
  const rows = d.iit?.chapters[year] ?? []
  return {
    X: Object.fromEntries(rows.map(([c, x]) => [c, x])),
    M: Object.fromEntries(rows.map(([c, , m]) => [c, m])),
  }
}

export interface ChapterPoint {
  code: string
  kappa: number
  x: number
  m: number
}

/** Least-squares fit of ln y on ln x with the slope's classical standard error. */
function logFit(xs: number[], ys: number[]) {
  const n = xs.length
  const lx = xs.map(Math.log)
  const ly = ys.map(Math.log)
  const mx = lx.reduce((s, v) => s + v, 0) / (n || 1)
  const my = ly.reduce((s, v) => s + v, 0) / (n || 1)
  let sxx = 0
  let sxy = 0
  let syy = 0
  for (let i = 0; i < n; i++) {
    sxx += (lx[i] - mx) ** 2
    sxy += (lx[i] - mx) * (ly[i] - my)
    syy += (ly[i] - my) ** 2
  }
  if (n < 3 || !sxx || !syy) return null
  const slope = sxy / sxx
  const se = Math.sqrt((syy - slope * sxy) / (n - 2) / sxx)
  return { slope, se, significant: Math.abs(slope / se) > tCritical(n - 2), intercept: my - slope * mx, r: sxy / Math.sqrt(sxx * syy), n }
}

/**
 * Korea against the world: the capital intensity of what Korea exports and of what it imports (a
 * Leontief-style test), and by chapter, whether more capital-intensive chapters have a higher ratio of
 * exports to imports. Capital intensities are fixed at the goods year; trade is the chosen year's.
 */
export function koreaIntensity(year: number, scope: Scope, d: TradeData = DATA) {
  const kappa = revealedIntensity([KOREA], d)
  const { X, M } = koreaWorld(year, d)
  const points: ChapterPoint[] = Object.keys(kappa)
    .filter((c) => inScope(c, scope) && (X[c] ?? 0) > 0 && (M[c] ?? 0) > 0)
    .map((code) => ({ code, kappa: kappa[code], x: X[code], m: M[code] }))
  return {
    exports: basketIntensity(X, kappa, scope),
    imports: basketIntensity(M, kappa, scope),
    points,
    fit: logFit(
      points.map((p) => p.kappa),
      points.map((p) => p.x / p.m),
    ),
  }
}

export interface PartnerRow {
  iso: string
  /** Capital per worker of the partner and of Korea, thousand USD. */
  k: number
  korea: number
  /** Capital intensity of Korea's exports to and imports from the partner. */
  exports: number
  imports: number
  /** Heckscher–Ohlin: Korea's exports are the more capital-intensive when Korea has more capital per worker. */
  match: boolean
}

/** Partners whose capital per worker is below this share of Korea's count as clearly labour-abundant. */
export const LABOR_ABUNDANT = 0.6

/**
 * Korea against each partner with a chapter breakdown in the goods year. Capital intensities leave out
 * both Korea and the partner, so neither side's own exports shape the measure it is tested on.
 */
export function partnerTest(scope: Scope, d: TradeData = DATA): PartnerRow[] {
  const g = d.goods
  if (!g) return []
  const korea = capitalPerWorker(KOREA, g.year, d)
  if (!korea) return []
  const rows: PartnerRow[] = []
  for (const iso of Object.keys(g.bilateral.X)) {
    if (iso === WORLD || iso === KOREA) continue
    const k = capitalPerWorker(iso, g.year, d)
    if (!k) continue
    const kappa = revealedIntensity([KOREA, iso], d)
    const exports = basketIntensity(g.bilateral.X[iso] ?? {}, kappa, scope)
    const imports = basketIntensity(g.bilateral.M[iso] ?? {}, kappa, scope)
    if (exports === null || imports === null || k.value === korea.value) continue
    rows.push({ iso, k: k.value, korea: korea.value, exports, imports, match: korea.value > k.value === exports > imports })
  }
  return rows
}

/** Capital's share of output, on average across the two goods, when shares come from revealed intensities. */
export const AVERAGE_CAPITAL_SHARE = 1 / 3

/**
 * Cobb–Douglas capital shares for two goods whose capital per worker is in the ratio of their revealed
 * intensities: s/(1−s) ∝ κ (cost minimisation gives K/L = s/(1−s) · w/r), centred on an average share of 1/3.
 */
export function sharesFromIntensity(kappaC: number, kappaF: number): { sC: number; sF: number } {
  const odds = AVERAGE_CAPITAL_SHARE / (1 - AVERAGE_CAPITAL_SHARE)
  const mid = Math.sqrt(kappaC * kappaF)
  const share = (kappa: number) => {
    const o = (odds * kappa) / mid
    return o / (1 + o)
  }
  return { sC: share(kappaC), sF: share(kappaF) }
}
