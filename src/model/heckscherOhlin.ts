/**
 * The Heckscher–Ohlin model (2 countries × 2 goods × 2 factors), as in Krugman–Obstfeld–Melitz ch. 5,
 * with Cobb–Douglas technology and preferences so every result can be computed exactly:
 *
 *   Q_C = K_C^sC · L_C^(1−sC)      cloth, labour-intensive when sC < sF
 *   Q_F = K_F^sF · L_F^(1−sF)      food
 *   U   = D_C^γ · D_F^(1−γ)        consumers spend a share γ of income on cloth
 *
 * Both factors move freely between the sectors, and both countries share the same technology and tastes;
 * they differ only in their endowments of capital K and labour L. Food is the numeraire (P_F = 1), so
 * p = P_C / P_F, and ω = w / r is the wage–rental ratio.
 */

export interface Tech {
  /** Capital's share of cloth and of food output. */
  sC: number
  sF: number
  /** Expenditure share of cloth, γ. */
  gamma: number
}

export interface Endowment {
  K: number
  L: number
}

/** Unit cost constant: c(w, r) = g(s) · r^s · w^(1−s). */
const g = (s: number) => s ** -s * (1 - s) ** (s - 1)

/** Relative price of cloth at which both goods just break even at wage–rental ratio ω. */
export const priceAt = (t: Tech, omega: number) => (g(t.sC) / g(t.sF)) * omega ** (t.sF - t.sC)

/** The wage–rental ratio that goods price implies while both goods are produced (one-to-one). */
export const omegaAt = (t: Tech, p: number) => ((p * g(t.sF)) / g(t.sC)) ** (1 / (t.sF - t.sC))

/** Capital per worker a sector with capital share s chooses at wage–rental ratio ω: K/L = s/(1−s) · ω. */
export const capitalPerWorker = (s: number, omega: number) => (s / (1 - s)) * omega

export interface Production {
  p: number
  QC: number
  QF: number
  KC: number
  LC: number
  KF: number
  LF: number
  /** Wage and rental in units of food. */
  w: number
  r: number
  omega: number
  /** Value of output in units of food. */
  gdp: number
  /** The good a country produces alone, when its endowment lies outside the diversification cone. */
  only: 'C' | 'F' | null
}

/** Output, factor allocation and factor prices of a competitive economy at relative price p. */
export function produce(t: Tech, e: Endowment, p: number): Production {
  const omega = omegaAt(t, p)
  const kC = capitalPerWorker(t.sC, omega)
  const kF = capitalPerWorker(t.sF, omega)
  const k = e.K / e.L
  if (k >= Math.min(kC, kF) && k <= Math.max(kC, kF)) {
    // Both goods: each sector uses its own K/L, and full employment pins down how labour splits.
    // Clamped at zero: at the edge of the cone rounding can leave a sector a tiny negative input, and a
    // negative number to a fractional power is NaN.
    const LC = Math.min(e.L, Math.max(0, (e.L * (kF - k)) / (kF - kC)))
    const LF = e.L - LC
    const KC = Math.min(e.K, kC * LC)
    const KF = e.K - KC
    const QC = KC ** t.sC * LC ** (1 - t.sC)
    const QF = KF ** t.sF * LF ** (1 - t.sF)
    const r = 1 / (g(t.sF) * omega ** (1 - t.sF))
    return { p, QC, QF, KC, LC, KF, LF, w: omega * r, r, omega, gdp: p * QC + QF, only: null }
  }
  // Outside the cone the country makes only the good whose factor intensity is nearer its own, and its
  // factor prices come from that good's marginal products instead of from the goods price alone.
  const capitalRich = k > Math.max(kC, kF)
  const only = capitalRich === t.sF > t.sC ? 'F' : 'C'
  if (only === 'F') {
    const QF = e.K ** t.sF * e.L ** (1 - t.sF)
    const r = (t.sF * QF) / e.K
    const w = ((1 - t.sF) * QF) / e.L
    return { p, QC: 0, QF, KC: 0, LC: 0, KF: e.K, LF: e.L, w, r, omega: w / r, gdp: QF, only }
  }
  const QC = e.K ** t.sC * e.L ** (1 - t.sC)
  const r = (p * t.sC * QC) / e.K
  const w = (p * (1 - t.sC) * QC) / e.L
  return { p, QC, QF: 0, KC: e.K, LC: e.L, KF: 0, LF: 0, w, r, omega: w / r, gdp: p * QC, only }
}

/**
 * Autarky: factor incomes pay for what consumers buy, so labour's and capital's shares of income fix
 * ω = [(1−sC)γ + (1−sF)(1−γ)] / [sC·γ + sF·(1−γ)] × K/L, and with it the relative price.
 */
export function autarkyPrice(t: Tech, e: Endowment): number {
  const labor = (1 - t.sC) * t.gamma + (1 - t.sF) * (1 - t.gamma)
  const capital = t.sC * t.gamma + t.sF * (1 - t.gamma)
  return priceAt(t, (labor / capital) * (e.K / e.L))
}

/** World price that clears the cloth market when the two countries trade freely. */
export function worldPrice(t: Tech, home: Endowment, foreign: Endowment): number {
  // Excess demand for cloth, γ·Q_F/p − (1−γ)·Q_C summed over both countries, falls as p rises,
  // and the world price lies between the two autarky prices.
  const pa = [autarkyPrice(t, home), autarkyPrice(t, foreign)]
  let lo = Math.log(Math.min(...pa))
  let hi = Math.log(Math.max(...pa))
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const p = Math.exp(mid)
    const a = produce(t, home, p)
    const b = produce(t, foreign, p)
    if ((t.gamma * (a.QF + b.QF)) / p > (1 - t.gamma) * (a.QC + b.QC)) lo = mid
    else hi = mid
  }
  return Math.exp((lo + hi) / 2)
}

export interface Outcome extends Production {
  DC: number
  DF: number
  /** Exports of cloth (negative: imports). Food trade is −p × this (budget constraint). */
  exportsC: number
  utility: number
}

export const utilityOf = (t: Tech, DC: number, DF: number) => DC ** t.gamma * DF ** (1 - t.gamma)

/** Production at price p and consumption on the budget line through it. */
export function outcome(t: Tech, e: Endowment, p: number): Outcome {
  const o = produce(t, e, p)
  const DC = (t.gamma * o.gdp) / p
  const DF = (1 - t.gamma) * o.gdp
  return { ...o, DC, DF, exportsC: o.QC - DC, utility: utilityOf(t, DC, DF) }
}

export interface Group {
  /** Real income change in units of cloth, food, and the consumption bundle (all in %). */
  inC: number
  inF: number
  inBundle: number
  verdict: 'gain' | 'loss' | 'ambiguous'
}

const pct = (after: number, before: number) => (after / before - 1) * 100

/** Consumer price index for Cobb–Douglas preferences, in units of food: P = p^γ. */
export const priceIndex = (t: Tech, p: number) => p ** t.gamma

/** How the move from autarky to trade changes the real wage and the real rental (Stolper–Samuelson). */
export function distribution(t: Tech, before: Production, after: Production): { labor: Group; capital: Group } {
  const group = (x0: number, x1: number): Group => {
    const inC = pct(x1 / after.p, x0 / before.p)
    const inF = pct(x1, x0)
    const inBundle = pct(x1 / priceIndex(t, after.p), x0 / priceIndex(t, before.p))
    const eps = 1e-9
    return { inC, inF, inBundle, verdict: inC > eps && inF > eps ? 'gain' : inC < -eps && inF < -eps ? 'loss' : 'ambiguous' }
  }
  return { labor: group(before.w, after.w), capital: group(before.r, after.r) }
}

/** The range of ω over which a country with this endowment produces both goods. */
export function coneOmegas(t: Tech, e: Endowment): [number, number] {
  const k = e.K / e.L
  const odds = (s: number) => s / (1 - s)
  const [a, b] = [k / odds(t.sC), k / odds(t.sF)]
  return [Math.min(a, b), Math.max(a, b)]
}

/** Points along the production possibility frontier, from food only to cloth only. */
export function frontier(t: Tech, e: Endowment, steps = 80): [number, number][] {
  const [lo, hi] = coneOmegas(t, e)
  const pts = Array.from({ length: steps + 1 }, (_, i) => {
    const omega = lo * (hi / lo) ** (i / steps)
    const o = produce(t, e, priceAt(t, omega))
    return [o.QC, o.QF] as [number, number]
  })
  return pts.sort((a, b) => a[0] - b[0])
}

/** Relative supply Q_C / Q_F of one country (or the world, given both) at price p. */
export function relativeSupply(t: Tech, es: Endowment[], p: number): number {
  let c = 0
  let f = 0
  for (const e of es) {
    const o = produce(t, e, p)
    c += o.QC
    f += o.QF
  }
  return f > 0 ? c / f : Infinity
}

/** Relative demand D_C / D_F at price p: γ / ((1−γ) · p). */
export const relativeDemand = (t: Tech, p: number) => t.gamma / ((1 - t.gamma) * p)
