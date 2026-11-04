import type { Lang } from '../../i18n'

/** Display formats for capital, labour and capital per worker in either unit system. */
export function units(real: boolean, lang: Lang) {
  const ko = lang === 'ko'
  if (!real) return { K: (v: number) => v.toFixed(0), L: (v: number) => v.toFixed(0), k: (K: number, L: number) => (K / L).toFixed(2) }
  return {
    K: (v: number) => (ko ? `${(v / 1000).toFixed(1)}조 달러` : `$${(v / 1000).toFixed(1)}T`),
    L: (v: number) => (ko ? `${Math.round(v / 10).toLocaleString('ko-KR')}만 명` : `${(v / 1000).toFixed(1)}M`),
    k: (K: number, L: number) => perWorker((K / L) * 1000, lang),
  }
}

/** Capital per worker given in USD thousands: '52.5만 달러' or '$525k'. */
export const perWorker = (thousands: number, lang: Lang) => (lang === 'ko' ? `${(thousands / 10).toFixed(1)}만 달러` : `$${Math.round(thousands)}k`)
