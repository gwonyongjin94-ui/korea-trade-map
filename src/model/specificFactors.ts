/**
 * The specific factors model (Samuelson–Jones), as in Krugman–Obstfeld–Melitz ch. 4, with Cobb–Douglas
 * technology and preferences so every result can be computed exactly:
 *
 *   Q_C = K^α · L_C^(1−α)        cloth: capital K is specific, labour L_C is mobile
 *   Q_F = T^β · L_F^(1−β)        food: land T is specific, labour L_F = L − L_C
 *   U   = D_C^γ · D_F^(1−γ)      consumers spend a share γ of income on cloth
 *
 * Food is the numeraire (P_F = 1), so p = P_C / P_F. Labour moves until P_C·MPL_C = P_F·MPL_F = w.
 */

export interface Economy {
  K: number
  T: number
  L: number
  /** Capital's share of cloth output, α. */
  alpha: number
  /** Land's share of food output, β. */
  beta: number
  /** Expenditure share of cloth, γ. */
  gamma: number
}

export interface Outcome {
  /** Relative price of cloth, P_C / P_F. */
  p: number
  LC: number
  LF: number
  QC: number
  QF: number
  /** Wage in units of food (P_F = 1). */
  w: number
  /** Income of capital owners and landowners, in units of food. */
  capital: number
  land: number
  /** Value of output in units of food. */
  gdp: number
}

export const qC = (e: Economy, LC: number) => e.K ** e.alpha * LC ** (1 - e.alpha)
export const qF = (e: Economy, LF: number) => e.T ** e.beta * LF ** (1 - e.beta)
export const mplC = (e: Economy, LC: number) => (1 - e.alpha) * e.K ** e.alpha * LC ** -e.alpha
export const mplF = (e: Economy, LF: number) => (1 - e.beta) * e.T ** e.beta * LF ** -e.beta

/** Labour allocation, outputs and factor incomes at relative price p. */
export function atPrice(e: Economy, p: number): Outcome {
  // p·MPL_C(L_C) − MPL_F(L − L_C) falls from +∞ to −∞ as L_C goes from 0 to L, so bisection finds the one root.
  let lo = 0
  let hi = e.L
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (p * mplC(e, mid) > mplF(e, e.L - mid)) lo = mid
    else hi = mid
  }
  const LC = (lo + hi) / 2
  const LF = e.L - LC
  const QC = qC(e, LC)
  const QF = qF(e, LF)
  const w = p * mplC(e, LC)
  return { p, LC, LF, QC, QF, w, capital: e.alpha * p * QC, land: e.beta * QF, gdp: p * QC + QF }
}

/** The relative price at which the economy consumes exactly what it produces. */
export function autarkyPrice(e: Economy): number {
  // Relative supply Q_C/Q_F rises with p; relative demand γ/((1−γ)p) falls. Bisection on log p.
  let lo = Math.log(1e-6)
  let hi = Math.log(1e6)
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    const o = atPrice(e, Math.exp(mid))
    if (o.QC / o.QF < e.gamma / ((1 - e.gamma) * Math.exp(mid))) lo = mid
    else hi = mid
  }
  return Math.exp((lo + hi) / 2)
}

/** Consumer price index for Cobb–Douglas preferences, in units of food: P = p^γ. */
export const priceIndex = (e: Economy, p: number) => p ** e.gamma

export interface Trade extends Outcome {
  DC: number
  DF: number
  /** Exports of cloth (negative: imports). Food imports equal p × cloth exports (budget constraint). */
  exportsC: number
  utility: number
}

/** Production at the world price, consumption on the budget line through it. */
export function withTrade(e: Economy, pWorld: number): Trade {
  const o = atPrice(e, pWorld)
  const DC = (e.gamma * o.gdp) / pWorld
  const DF = (1 - e.gamma) * o.gdp
  return { ...o, DC, DF, exportsC: o.QC - DC, utility: DC ** e.gamma * DF ** (1 - e.gamma) }
}

export const utilityAt = (e: Economy, DC: number, DF: number) => DC ** e.gamma * DF ** (1 - e.gamma)

export interface Group {
  /** Real income change in units of cloth, food, and the consumption bundle (all in %). */
  inC: number
  inF: number
  inBundle: number
  verdict: 'gain' | 'loss' | 'ambiguous'
}

const pct = (after: number, before: number) => (after / before - 1) * 100

/**
 * How a move from price p0 to p1 changes each group's real income. A group gains or loses unambiguously
 * when its income buys more (or less) of both goods; otherwise the result depends on what it consumes.
 */
export function distribution(e: Economy, before: Outcome, after: Outcome): { labor: Group; capital: Group; land: Group } {
  const group = (x0: number, x1: number): Group => {
    const inC = pct(x1 / after.p, x0 / before.p)
    const inF = pct(x1, x0)
    const inBundle = pct(x1 / priceIndex(e, after.p), x0 / priceIndex(e, before.p))
    const eps = 1e-9
    const verdict = inC > eps && inF > eps ? 'gain' : inC < -eps && inF < -eps ? 'loss' : 'ambiguous'
    return { inC, inF, inBundle, verdict }
  }
  return { labor: group(before.w, after.w), capital: group(before.capital, after.capital), land: group(before.land, after.land) }
}

/** Points along the production possibility frontier, from all labour in food to all labour in cloth. */
export function frontier(e: Economy, steps = 80): [number, number][] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const LC = (e.L * i) / steps
    return [qC(e, LC), qF(e, e.L - LC)]
  })
}

/* International labour mobility: one good, labour and land in two countries (KOM fig. 4-14). */

export interface Country {
  /** Productivity A in Q = A · T^β · L^(1−β). */
  A: number
  T: number
  beta: number
}

const mpl = (c: Country, L: number) => (1 - c.beta) * c.A * c.T ** c.beta * L ** -c.beta
const output = (c: Country, L: number) => c.A * c.T ** c.beta * L ** (1 - c.beta)

export interface Migration {
  /** Home employment and real wages. */
  L: number
  wHome: number
  wForeign: number
  outputHome: number
  outputForeign: number
  world: number
}

export function migrationAt(home: Country, foreign: Country, world: number, homeL: number): Migration {
  const outputHome = output(home, homeL)
  const outputForeign = output(foreign, world - homeL)
  return { L: homeL, wHome: mpl(home, homeL), wForeign: mpl(foreign, world - homeL), outputHome, outputForeign, world: outputHome + outputForeign }
}

/** Home employment once workers have moved until real wages are equal. */
export function migrationEquilibrium(home: Country, foreign: Country, world: number): number {
  let lo = 0
  let hi = world
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2
    if (mpl(home, mid) > mpl(foreign, world - mid)) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

export const homeMpl = mpl
