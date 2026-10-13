import type { Lang } from '../i18n'

export interface Product {
  id: string
  icon: string
  name: Record<Lang, string>
  /** HS code as printed, e.g. "8542" or "1902.30". */
  hs: string
}

/** Products in the filter: all goods, plus the markets suggested for the PBL report. */
export const PRODUCTS: Product[] = [
  { id: 'TOTAL', icon: '🌐', name: { ko: '전체 품목', en: 'All products' }, hs: '' },
  { id: '8542', icon: '💾', name: { ko: '반도체 (집적회로)', en: 'Semiconductors (ICs)' }, hs: '8542' },
  { id: '8703', icon: '🚗', name: { ko: '승용차', en: 'Passenger cars' }, hs: '8703' },
  { id: '8901', icon: '🚢', name: { ko: '선박 (상선)', en: 'Merchant ships' }, hs: '8901' },
  { id: '8507', icon: '🔋', name: { ko: '축전지 (배터리)', en: 'Batteries' }, hs: '8507' },
  { id: '2710', icon: '⛽', name: { ko: '석유제품', en: 'Refined petroleum' }, hs: '2710' },
  { id: '2709', icon: '🛢️', name: { ko: '원유', en: 'Crude oil' }, hs: '2709' },
  { id: '2846', icon: '🧲', name: { ko: '희토류 화합물', en: 'Rare-earth compounds' }, hs: '2846' },
  { id: '190230', icon: '🍜', name: { ko: '라면 등 면류', en: 'Instant noodles & pasta' }, hs: '1902.30' },
]

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0]

interface Chapter {
  icon: string
  ko: string
  en: string
}

/** HS 2-digit chapters with short names. Icons mark the chapters that matter for Korea's trade. */
const CHAPTERS: Record<string, Chapter> = {
  '01': { icon: '🐄', ko: '산 동물', en: 'Live animals' },
  '02': { icon: '🥩', ko: '육류', en: 'Meat' },
  '03': { icon: '🐟', ko: '수산물', en: 'Fish & seafood' },
  '04': { icon: '🥛', ko: '낙농품·계란', en: 'Dairy & eggs' },
  '05': { icon: '📦', ko: '기타 동물성 생산품', en: 'Other animal products' },
  '06': { icon: '🌷', ko: '화훼', en: 'Plants & flowers' },
  '07': { icon: '🥬', ko: '채소', en: 'Vegetables' },
  '08': { icon: '🍊', ko: '과일·견과', en: 'Fruit & nuts' },
  '09': { icon: '☕', ko: '커피·차·향신료', en: 'Coffee, tea & spices' },
  '10': { icon: '🌾', ko: '곡물', en: 'Cereals' },
  '11': { icon: '🌾', ko: '제분 제품', en: 'Milling products' },
  '12': { icon: '🫘', ko: '채유용 종자', en: 'Oil seeds' },
  '13': { icon: '📦', ko: '식물성 수액', en: 'Plant extracts' },
  '14': { icon: '📦', ko: '기타 식물성 생산품', en: 'Other plant products' },
  '15': { icon: '🫒', ko: '동식물성 유지', en: 'Fats & oils' },
  '16': { icon: '🥫', ko: '육류·어류 조제품', en: 'Prepared meat & fish' },
  '17': { icon: '🍬', ko: '당류', en: 'Sugars' },
  '18': { icon: '🍫', ko: '코코아', en: 'Cocoa' },
  '19': { icon: '🍜', ko: '라면·과자 등 곡물 조제품', en: 'Noodles & cereal foods' },
  '20': { icon: '🥫', ko: '채소·과일 조제품', en: 'Prepared fruit & vegetables' },
  '21': { icon: '🥣', ko: '기타 조제 식료품', en: 'Misc. food preparations' },
  '22': { icon: '🍶', ko: '음료·주류', en: 'Beverages' },
  '23': { icon: '📦', ko: '사료', en: 'Animal feed' },
  '24': { icon: '🚬', ko: '담배', en: 'Tobacco' },
  '25': { icon: '🪨', ko: '소금·시멘트 등 광물', en: 'Salt, cement & minerals' },
  '26': { icon: '⛏️', ko: '광석', en: 'Ores' },
  '27': { icon: '🛢️', ko: '석유·가스·석탄', en: 'Oil, gas & coal' },
  '28': { icon: '🧪', ko: '무기화학품', en: 'Inorganic chemicals' },
  '29': { icon: '🧪', ko: '유기화학품', en: 'Organic chemicals' },
  '30': { icon: '💊', ko: '의약품', en: 'Pharmaceuticals' },
  '31': { icon: '🌱', ko: '비료', en: 'Fertilisers' },
  '32': { icon: '🎨', ko: '염료·도료', en: 'Dyes & paints' },
  '33': { icon: '💄', ko: '화장품·향료', en: 'Cosmetics & perfumes' },
  '34': { icon: '🧼', ko: '비누·세제', en: 'Soaps & detergents' },
  '35': { icon: '📦', ko: '단백질계 물질', en: 'Albumins & glues' },
  '36': { icon: '🧨', ko: '화약류', en: 'Explosives' },
  '37': { icon: '🎞️', ko: '사진·영화용 재료', en: 'Photographic goods' },
  '38': { icon: '🧪', ko: '기타 화학제품', en: 'Misc. chemicals' },
  '39': { icon: '🧴', ko: '플라스틱', en: 'Plastics' },
  '40': { icon: '🛞', ko: '고무', en: 'Rubber' },
  '41': { icon: '📦', ko: '원피·가죽', en: 'Hides & leather' },
  '42': { icon: '👜', ko: '가죽제품', en: 'Leather goods' },
  '43': { icon: '📦', ko: '모피', en: 'Furskins' },
  '44': { icon: '🪵', ko: '목재', en: 'Wood' },
  '45': { icon: '📦', ko: '코르크', en: 'Cork' },
  '46': { icon: '📦', ko: '짚 제품', en: 'Plaiting materials' },
  '47': { icon: '📦', ko: '펄프', en: 'Pulp' },
  '48': { icon: '📄', ko: '종이', en: 'Paper' },
  '49': { icon: '📚', ko: '인쇄물', en: 'Printed matter' },
  '50': { icon: '🧵', ko: '견', en: 'Silk' },
  '51': { icon: '🧶', ko: '양모', en: 'Wool' },
  '52': { icon: '🧵', ko: '면', en: 'Cotton' },
  '53': { icon: '🧵', ko: '기타 식물성 섬유', en: 'Other plant fibres' },
  '54': { icon: '🧵', ko: '인조 필라멘트', en: 'Man-made filaments' },
  '55': { icon: '🧵', ko: '인조 스테이플 섬유', en: 'Man-made staple fibres' },
  '56': { icon: '🧵', ko: '부직포·끈', en: 'Wadding & nonwovens' },
  '57': { icon: '🧵', ko: '양탄자', en: 'Carpets' },
  '58': { icon: '🧵', ko: '특수직물', en: 'Special fabrics' },
  '59': { icon: '🧵', ko: '도포 직물', en: 'Coated fabrics' },
  '60': { icon: '🧵', ko: '편물', en: 'Knitted fabrics' },
  '61': { icon: '👕', ko: '의류 (편물)', en: 'Clothing (knitted)' },
  '62': { icon: '👔', ko: '의류 (비편물)', en: 'Clothing (not knitted)' },
  '63': { icon: '🧺', ko: '기타 섬유제품', en: 'Other textile articles' },
  '64': { icon: '👟', ko: '신발', en: 'Footwear' },
  '65': { icon: '🧢', ko: '모자', en: 'Headgear' },
  '66': { icon: '☂️', ko: '우산', en: 'Umbrellas' },
  '67': { icon: '📦', ko: '깃털·조화', en: 'Feathers & artificial flowers' },
  '68': { icon: '🧱', ko: '석재·시멘트 제품', en: 'Stone & cement articles' },
  '69': { icon: '🏺', ko: '도자기', en: 'Ceramics' },
  '70': { icon: '🪟', ko: '유리', en: 'Glass' },
  '71': { icon: '💎', ko: '귀금속·보석', en: 'Precious metals & stones' },
  '72': { icon: '🏗️', ko: '철강', en: 'Iron & steel' },
  '73': { icon: '🔩', ko: '철강 제품', en: 'Steel articles' },
  '74': { icon: '🟠', ko: '구리', en: 'Copper' },
  '75': { icon: '⚪', ko: '니켈', en: 'Nickel' },
  '76': { icon: '🥫', ko: '알루미늄', en: 'Aluminium' },
  '78': { icon: '⚫', ko: '납', en: 'Lead' },
  '79': { icon: '⚪', ko: '아연', en: 'Zinc' },
  '80': { icon: '⚪', ko: '주석', en: 'Tin' },
  '81': { icon: '⚪', ko: '기타 비금속', en: 'Other base metals' },
  '82': { icon: '🔧', ko: '공구', en: 'Tools' },
  '83': { icon: '🔑', ko: '기타 금속제품', en: 'Misc. metal articles' },
  '84': { icon: '⚙️', ko: '기계·컴퓨터', en: 'Machinery & computers' },
  '85': { icon: '💾', ko: '전기전자·반도체', en: 'Electronics & chips' },
  '86': { icon: '🚆', ko: '철도차량', en: 'Railway vehicles' },
  '87': { icon: '🚗', ko: '자동차·부품', en: 'Vehicles & parts' },
  '88': { icon: '✈️', ko: '항공기', en: 'Aircraft' },
  '89': { icon: '🚢', ko: '선박', en: 'Ships' },
  '90': { icon: '🔬', ko: '광학·정밀기기', en: 'Optical & precision instruments' },
  '91': { icon: '⌚', ko: '시계', en: 'Clocks & watches' },
  '92': { icon: '🎹', ko: '악기', en: 'Musical instruments' },
  '93': { icon: '🛡️', ko: '무기·탄약', en: 'Arms & ammunition' },
  '94': { icon: '🛋️', ko: '가구·조명', en: 'Furniture & lighting' },
  '95': { icon: '🧸', ko: '완구·운동용품', en: 'Toys & sports goods' },
  '96': { icon: '✏️', ko: '잡품', en: 'Misc. manufactures' },
  '97': { icon: '🖼️', ko: '예술품', en: 'Works of art' },
  '99': { icon: '📦', ko: '기타 (미분류)', en: 'Not classified' },
}

export function chapterIcon(code: string): string {
  return CHAPTERS[code]?.icon ?? '📦'
}

export function chapterName(code: string, lang: Lang, otherLabel: string): string {
  if (code === 'other') return otherLabel
  return CHAPTERS[code]?.[lang] ?? `HS ${code}`
}
