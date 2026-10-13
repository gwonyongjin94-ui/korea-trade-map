import type { Lang } from './i18n'

const MINUS = '−'

/**
 * A value in millions of US dollars, the way news in each language writes it:
 * ko '1,306억 달러' (1억 = 100 million), '3.9억 달러', '3,920만 달러'; en '$130.6B', '$392M'.
 * `short` drops the spaced unit for map labels ('1,306억$').
 */
export function money(millions: number, lang: Lang, { short = false, signed = false } = {}): string {
  if (!Number.isFinite(millions)) return '—'
  const abs = Math.abs(millions)
  if (abs === 0) return lang === 'ko' ? (short ? '0$' : '0 달러') : '$0'
  const sign = signed && millions > 0 ? '+' : millions < 0 ? MINUS : ''
  if (lang === 'ko') {
    const unit = short ? '$' : ' 달러'
    if (abs >= 100) {
      const eok = abs / 100
      return `${sign}${eok.toLocaleString('ko-KR', { maximumFractionDigits: eok >= 10 ? 0 : 1 })}억${unit}`
    }
    const man = Math.round(abs * 100)
    if (man < 1) return `${sign}1만${unit} 미만`
    return `${sign}${man.toLocaleString('ko-KR')}만${unit}`
  }
  if (abs >= 1000) return `${sign}$${(abs / 1000).toLocaleString('en-US', { maximumFractionDigits: abs >= 1_000_000 ? 0 : 1 })}B`
  if (abs >= 1) return `${sign}$${abs.toLocaleString('en-US', { maximumFractionDigits: abs >= 100 ? 0 : 1 })}M`
  return `${sign}$${Math.max(1, Math.round(abs * 1000))}K`
}

export function percent(n: number | null, { signed = false } = {}): string {
  if (n === null || !Number.isFinite(n)) return '—'
  const s = Math.abs(n).toFixed(1)
  if (!signed) return `${s}%`
  return `${n > 0.05 ? '+' : n < -0.05 ? MINUS : ''}${s}%`
}
