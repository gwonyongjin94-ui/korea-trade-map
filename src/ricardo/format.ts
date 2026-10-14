import type { Lang } from '../i18n'

/** Round to a readable number of significant digits. */
export function fmt(n: number, lang: Lang, digits = 2): string {
  if (!Number.isFinite(n)) return '—'
  const abs = Math.abs(n)
  const locale = lang === 'ko' ? 'ko-KR' : 'en-US'
  if (abs < 1e-9) return '0'
  // Small values (e.g. a wage of 0.0097 per hour) keep three significant digits instead of rounding to 0.01.
  if (abs < 0.1) return n.toLocaleString(locale, { maximumSignificantDigits: 3 })
  const max = abs >= 100 ? 0 : abs >= 10 ? 1 : digits
  return n.toLocaleString(locale, { maximumFractionDigits: max })
}

export const signed = (n: number, lang: Lang) => (n > 1e-9 ? '+' : '') + fmt(n, lang)
