import type { Lang } from '../i18n'
import { CHAPTERS, PRODUCTS } from './products'

/** A good the models can be run on: one of the filter's products or an HS chapter. */
export interface Good {
  id: string
  icon: string
  name: Record<Lang, string>
  hs: string
  /** The factor of production tied to this good's sector in the specific factors model. */
  factor: Record<Lang, string>
}

/** Default specific factor for a sector: land for farming, mines for minerals, plants for industry. */
function factorFor(code: number, name: Record<Lang, string>): Record<Lang, string> {
  if (code === 3) return { ko: '어선·어장', en: 'fishing fleets' }
  if (code <= 14) return { ko: '농지', en: 'farmland' }
  if (code <= 24) return { ko: '식품 공장', en: 'food plants' }
  if (code <= 27) return { ko: '광산·유전', en: 'mines and oil fields' }
  const short = (s: string) => s.replace(/\s*\(.*\)/, '')
  return { ko: `${short(name.ko)} 생산 설비`, en: `${short(name.en)} plants` }
}

const chapterOf = (hs: string) => Number(hs.replace('.', '').slice(0, 2))

export const GOODS: Good[] = [
  ...PRODUCTS.filter((p) => p.id !== 'TOTAL').map((p) => ({
    id: p.id,
    icon: p.icon,
    name: p.name,
    hs: p.hs,
    factor: factorFor(chapterOf(p.hs), p.name),
  })),
  // Object keys like "10" sort before "01" (integer-like keys come first), so order by code explicitly.
  ...Object.entries(CHAPTERS)
    .filter(([code]) => code !== '99')
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([code, c]) => ({
      id: code,
      icon: c.icon,
      name: { ko: c.ko, en: c.en },
      hs: code,
      factor: factorFor(Number(code), { ko: c.ko, en: c.en }),
    })),
]

export const goodById = (id: string) => GOODS.find((g) => g.id === id)

/** Whether the id is a product with its own partner table rather than an HS chapter. */
export const isProduct = (id: string) => PRODUCTS.some((p) => p.id === id)
