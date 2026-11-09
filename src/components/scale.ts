export const linear = (d0: number, d1: number, r0: number, r1: number) => (v: number) =>
  r0 + ((v - d0) / (d1 - d0 || 1)) * (r1 - r0)

/** A handful of round tick values covering [0, max]. */
export function ticks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0]
  const raw = max / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const out: number[] = []
  for (let v = 0; v <= max + 1e-9; v += step) out.push(+v.toPrecision(10))
  return out
}

export const MARGIN = { top: 16, right: 16, bottom: 44, left: 52 }

/** Round tick values inside [lo, hi], for axes that do not start at zero. */
export function ticksBetween(lo: number, hi: number, count = 4): { values: number[]; step: number } {
  if (!(hi > lo)) return { values: [lo], step: 0 }
  const raw = (hi - lo) / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const values: number[] = []
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9 * step; v += step) values.push(+v.toPrecision(10))
  return { values, step }
}

/** A tick label with just enough decimals to tell neighbouring ticks `step` apart. */
export function tickLabel(v: number, step: number): string {
  const decimals = step > 0 ? Math.max(0, Math.ceil(-Math.log10(step) - 1e-9) + (+(step / 10 ** Math.floor(Math.log10(step))).toFixed(1) === 2.5 ? 1 : 0)) : 2
  return v.toFixed(Math.min(decimals, 6))
}
