import type { Lang } from '../../i18n'

/**
 * Display formats for capital, the second factor and the ratio of the two in either unit system. The
 * second factor is labour (thousands of workers) or, in the leather case, arable land (thousands of hectares).
 */
export function units(real: boolean, lang: Lang, factor: 'labor' | 'land' = 'labor') {
  const ko = lang === 'ko'
  if (!real) return { K: (v: number) => v.toFixed(0), L: (v: number) => v.toFixed(0), k: (K: number, L: number) => (K / L).toFixed(2) }
  if (factor === 'land')
    return {
      K: (v: number) => (ko ? `${(v / 1000).toFixed(1)}조 달러` : `$${(v / 1000).toFixed(1)}T`),
      L: (v: number) => (ko ? (v >= 1e5 ? `${(v / 1e5).toFixed(2)}억 ha` : `${(v / 10).toFixed(1)}만 ha`) : `${(v / 1000).toFixed(1)}M ha`),
      k: (K: number, L: number) => perHectare(K / L, lang),
    }
  return {
    K: (v: number) => (ko ? `${(v / 1000).toFixed(1)}조 달러` : `$${(v / 1000).toFixed(1)}T`),
    L: (v: number) => (ko ? `${Math.round(v / 10).toLocaleString('ko-KR')}만 명` : `${(v / 1000).toFixed(1)}M`),
    k: (K: number, L: number) => perWorker((K / L) * 1000, lang),
  }
}

/** Capital per worker given in USD thousands: '52.5만 달러' or '$525k'. */
export const perWorker = (thousands: number, lang: Lang) => (lang === 'ko' ? `${(thousands / 10).toFixed(1)}만 달러` : `$${Math.round(thousands)}k`)

/** Capital per hectare of arable land given in USD millions: '1,025만 달러' or '$10.25M'. */
export const perHectare = (millions: number, lang: Lang) =>
  lang === 'ko' ? `${Math.round(millions * 100).toLocaleString('ko-KR')}만 달러` : `$${millions.toFixed(2)}M`
