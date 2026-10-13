import countries from 'i18n-iso-countries'
import en from 'i18n-iso-countries/langs/en.json'
import ko from 'i18n-iso-countries/langs/ko.json'
import { createContext, useContext } from 'react'
import type { View } from './data/trade'

countries.registerLocale(en)
countries.registerLocale(ko)

export type Lang = 'ko' | 'en'

/** Short, commonly used names where the library's choice reads badly in a sentence. */
const NAME_OVERRIDES: Record<Lang, Record<string, string>> = {
  ko: { '620': '포르투갈', '643': '러시아', '410': '한국', '180': '콩고민주공화국', '344': '홍콩', '158': '대만', '446': '마카오', '840': '미국' },
  en: { '826': 'United Kingdom', '410': 'South Korea', '180': 'DR Congo', '178': 'Congo', '344': 'Hong Kong', '158': 'Taiwan', '840': 'United States' },
}

/** Country name for an ISO numeric id, falling back to the given name. */
export function countryName(id: string, lang: Lang, fallback = id): string {
  const alias = countries.getName(id, lang, { select: 'alias' })
  return NAME_OVERRIDES[lang][id] ?? (alias && !alias.includes(',') ? alias : countries.getName(id, lang)) ?? fallback
}

/** Flag emoji from an ISO numeric code. */
export function countryFlag(id: string): string {
  const alpha2 = countries.numericToAlpha2(id)
  if (!alpha2) return '🏳️'
  return String.fromCodePoint(...[...alpha2.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)))
}

/** Attach the right Korean particle, e.g. josa('한국', '은/는') → '한국은'. */
export function josa(word: string, pair: '이/가' | '은/는' | '을/를' | '과/와' | '으로/로'): string {
  const [withFinal, withoutFinal] = pair.split('/')
  const w = word.trim()
  const code = w.charCodeAt(w.length - 1)
  const isHangul = code >= 0xac00 && code <= 0xd7a3
  const final = isHangul ? (code - 0xac00) % 28 : /[013678lmnLMN]$/.test(w) ? 1 : 0
  // '으로/로': a final ㄹ (index 8) takes '로' like an open syllable.
  if (pair === '으로/로') return w + (final !== 0 && final !== 8 ? withFinal : withoutFinal)
  return w + (final !== 0 ? withFinal : withoutFinal)
}

const ko_ = {
  title: '한국 무역 지도',
  subtitle: '한국은 누구와, 무엇을, 얼마나 거래할까',
  views: { export: '수출', import: '수입', balance: '무역수지', total: '교역총액' } satisfies Record<View, string>,
  view: '보기',
  product: '품목',
  year: '연도',
  play: '▶ 재생',
  pause: '❚❚ 정지',
  count: '표시 국가 수',
  countValue: (n: number) => `상위 ${n}개국`,
  zoomOut: '🌍 전체 지도',
  worldView: '🌍 세계',
  asiaView: '🌏 아시아',
  zoomIn: '🔍 두 나라 확대',
  clear: '선택 해제',
  mapHint: '나라를 클릭하면 한국과의 교역을 자세히 봅니다',
  exportArrow: '수출 (한국 → 상대국)',
  importArrow: '수입 (상대국 → 한국)',
  surplusArrow: '흑자 (수출 > 수입)',
  deficitArrow: '적자 (수입 > 수출)',
  less: '적음',
  more: '많음',
  noData: '자료 없음',
  totalExports: '총수출',
  totalImports: '총수입',
  balance: '무역수지',
  topPartner: (v: string) => (v === '무역수지' ? '무역수지 규모 1위' : `${v} 1위 상대국`),
  pairExport: (c: string) => `한국 → ${c} 수출`,
  pairImport: (c: string) => `${c} → 한국 수입`,
  share: (v: string) => `한국 ${v}에서 비중`,
  rank: (n: number) => `${n}위`,
  yoy: '전년 대비',
  surplus: '흑자',
  deficit: '적자',
  trend: (scope: string) => `${scope} 교역 추이`,
  korea: '한국 전체',
  pairScope: (c: string) => `한국–${c}`,
  shareOfTrade: '한국 교역총액에서 비중',
  prevYear: (y: number, v: string) => `${y}년 ${v}`,
  topChapters: (scope: string) => `${scope} 주요 품목`,
  exportsOf: '수출 품목',
  importsOf: '수입 품목',
  chaptersOnlyTotal: "품목 구성은 '전체 품목'을 골랐을 때 보여줍니다.",
  showAllProducts: '전체 품목 보기',
  chaptersMissing: '이 나라는 품목 구성 자료가 없습니다 (상위 교역국만 수집).',
  other: '기타',
  ranking: (v: string, p: string) => `${p} ${v} 상대국 순위`,
  colRank: '순위',
  colCountry: '국가',
  colExport: '수출',
  colImport: '수입',
  colBalance: '수지',
  colShare: '비중',
  unitNote: '단위: 달러, 통관 기준',
  summary: {
    export: (y: number, c: string, v: string, s: string, c2: string, v2: string) =>
      `${y}년 한국의 최대 수출국은 ${c}(${v}, ${s})이고, ${josa(c2, '이/가')}(${v2}) 뒤를 잇습니다.`,
    import: (y: number, c: string, v: string, s: string, c2: string, v2: string) =>
      `${y}년 한국이 가장 많이 수입한 나라는 ${c}(${v}, ${s})이고, ${josa(c2, '이/가')}(${v2}) 뒤를 잇습니다.`,
    balance: (y: number, c: string, v: string, c2: string, v2: string) =>
      `${y}년 한국의 최대 흑자국은 ${c}(${v}), 최대 적자국은 ${c2}(${v2})입니다.`,
    total: (y: number, c: string, v: string, s: string, c2: string, v2: string) =>
      `${y}년 한국과 교역이 가장 많은 나라는 ${c}(${v}, ${s})이고, ${josa(c2, '이/가')}(${v2}) 뒤를 잇습니다.`,
    product: (p: string) => `[${p}] `,
  },
  pair: (y: number, c: string, x: string, m: string, b: string, surplus: boolean) =>
    // Amounts end in '달러', so the object particle is always '를'.
    `${y}년 한국은 ${c}에 ${x}를 수출하고 ${m}를 수입해 ${b}의 ${surplus ? '흑자' : '적자'}를 냈습니다.`,
  source: (date: string) => `자료: UN Comtrade (한국 보고 기준, HS 분류, 연간). ${date} 수집.`,
  caveats: [
    '수출은 최종 목적국, 수입은 원산지 기준입니다. 홍콩은 중국으로 다시 나가는 중계무역 비중이 큽니다.',
    'Comtrade는 대만을 "Other Asia, nes"로 표기합니다. 이 지도에서는 대만으로 표시합니다.',
    '한국 세관을 거치지 않는 해외생산·현지판매(예: 베트남 공장 스마트폰)는 포함되지 않습니다.',
    '선박 수출의 상대국은 실제 선주 국가가 아니라 등록국(파나마, 라이베리아, 마셜제도 등)인 경우가 많습니다.',
    "품목은 HS 코드 기준이라 정부 발표의 품목 분류(MTI)와 범위가 다릅니다. 예: 2025년 '반도체' 수출은 산업통상부 발표 1,734억 달러, HS 8542 기준 1,428억 달러.",
  ],
  lang: '한국어',
}

export type Strings = typeof ko_

const en_: Strings = {
  title: 'Korea Trade Map',
  subtitle: 'Who Korea trades with, what, and how much',
  views: { export: 'Exports', import: 'Imports', balance: 'Balance', total: 'Total trade' },
  view: 'View',
  product: 'Product',
  year: 'Year',
  play: '▶ Play',
  pause: '❚❚ Pause',
  count: 'Countries shown',
  countValue: (n) => `Top ${n}`,
  zoomOut: '🌍 World map',
  worldView: '🌍 World',
  asiaView: '🌏 Asia',
  zoomIn: '🔍 Zoom to pair',
  clear: 'Clear',
  mapHint: 'Click a country to see its trade with Korea',
  exportArrow: 'Exports (Korea → partner)',
  importArrow: 'Imports (partner → Korea)',
  surplusArrow: 'Surplus (exports > imports)',
  deficitArrow: 'Deficit (imports > exports)',
  less: 'Less',
  more: 'More',
  noData: 'No data',
  totalExports: 'Total exports',
  totalImports: 'Total imports',
  balance: 'Trade balance',
  topPartner: (v) => (v === 'Balance' ? 'Largest balance' : `Top partner (${v.toLowerCase()})`),
  pairExport: (c) => `Korea → ${c} exports`,
  pairImport: (c) => `${c} → Korea imports`,
  share: (v) => `Share of Korea's ${v.toLowerCase()}`,
  rank: (n) => `#${n}`,
  yoy: 'vs. last year',
  surplus: 'surplus',
  deficit: 'deficit',
  trend: (scope) => `${scope}: trade over time`,
  korea: 'Korea (all partners)',
  pairScope: (c) => `Korea–${c}`,
  shareOfTrade: "Share of Korea's total trade",
  prevYear: (y, v) => `${y}: ${v}`,
  topChapters: (scope) => `${scope}: main products`,
  exportsOf: 'Exports',
  importsOf: 'Imports',
  chaptersOnlyTotal: "Product breakdown is shown when 'All products' is selected.",
  showAllProducts: 'Show all products',
  chaptersMissing: 'No product breakdown for this country (collected for top partners only).',
  other: 'Other',
  ranking: (v, p) => `${p}: partners ranked by ${v.toLowerCase()}`,
  colRank: '#',
  colCountry: 'Country',
  colExport: 'Exports',
  colImport: 'Imports',
  colBalance: 'Balance',
  colShare: 'Share',
  unitNote: 'US dollars, customs basis',
  summary: {
    export: (y, c, v, s, c2, v2) => `In ${y}, Korea's largest export market was ${c} (${v}, ${s}), followed by ${c2} (${v2}).`,
    import: (y, c, v, s, c2, v2) => `In ${y}, Korea imported the most from ${c} (${v}, ${s}), followed by ${c2} (${v2}).`,
    balance: (y, c, v, c2, v2) => `In ${y}, Korea's largest surplus was with ${c} (${v}) and its largest deficit with ${c2} (${v2}).`,
    total: (y, c, v, s, c2, v2) => `In ${y}, Korea traded the most with ${c} (${v}, ${s}), followed by ${c2} (${v2}).`,
    product: (p) => `[${p}] `,
  },
  pair: (y, c, x, m, b, surplus) =>
    `In ${y}, Korea exported ${x} to ${c} and imported ${m}, a ${surplus ? 'surplus' : 'deficit'} of ${b}.`,
  source: (date) => `Source: UN Comtrade (as reported by Korea, HS, annual). Retrieved ${date}.`,
  caveats: [
    'Exports are recorded by final destination, imports by origin. Much of Hong Kong’s share is re-exported to China.',
    'Comtrade lists Taiwan as "Other Asia, nes"; this map shows it as Taiwan.',
    'Goods made and sold abroad without passing Korean customs (e.g. phones from factories in Vietnam) are not included.',
    'Ship exports are often recorded under the flag country (Panama, Liberia, Marshall Islands) rather than the owner’s.',
    'Products follow HS codes, which differ from the categories in government releases: 2025 "semiconductor" exports were $173.4B per the trade ministry but $142.8B under HS 8542.',
  ],
  lang: 'English',
}

export const STRINGS: Record<Lang, Strings> = { ko: ko_, en: en_ }

export const LangContext = createContext<{ lang: Lang; t: Strings }>({ lang: 'ko', t: ko_ })
export const useI18n = () => useContext(LangContext)
