/** Turns the real-data Ricardian examples into inputs for the two-country, two-good model. */
import { goodById } from '../data/goods'
import { DATA } from '../data/trade'
import { countryName, type Lang } from '../i18n'
import type { CountryInput } from '../model/ricardian'
import { goodRca, KOREA, productivity, valueNear, workersPerMillion } from '../realExamples'
import type { Names } from './text'

export interface RicardoSetup {
  names: Names
  icons: { X: string; Y: string }
  inputs: { A: CountryInput; B: CountryInput }
  /** Unit of the labour figures, shown in the inputs and the explanation. */
  unit: string
  /** Where the numbers come from. */
  source: string
  /** Shown prominently when the magnitudes should not be read literally. */
  warning?: string
}

/** Labour force in units of 10,000 workers, the unit both setups use for L. */
function laborForce(iso: string, year: number): number | null {
  const v = valueNear(DATA.wb?.labor?.[iso], year)
  return v ? Math.round(v.value / 1e4) : null
}

/**
 * Industry (X) against agriculture (Y) from World Bank value added per worker. One unit of output is
 * USD 100 million of value added and labour is counted in 10,000 workers, so labour per unit is workers
 * per USD 1 million ÷ 100, L / a is output in units of USD 100 million, and a wage of 1 (in farm goods)
 * is USD 10,000 per worker.
 */
export function setupFromProductivity(partner: string, year: number, lang: Lang): RicardoSetup | null {
  const k = productivity(KOREA, year)
  const p = productivity(partner, year)
  const lk = laborForce(KOREA, year)
  const lp = laborForce(partner, year)
  if (!k || !p || !lk || !lp) return null
  const a = (va: number) => Math.round(workersPerMillion(va) * 10) / 1000
  return {
    names: {
      A: countryName(KOREA, lang),
      B: countryName(partner, lang),
      X: lang === 'ko' ? '공산품' : 'manufactures',
      Y: lang === 'ko' ? '농산물' : 'farm goods',
    },
    icons: { X: '🏭', Y: '🌾' },
    inputs: { A: { aX: a(k.ind), aY: a(k.agri), labor: lk }, B: { aX: a(p.ind), aY: a(p.agri), labor: lp } },
    unit: lang === 'ko' ? '만 명' : '10k workers',
    source:
      lang === 'ko'
        ? '1단위 = 1억 달러어치 생산, 노동은 만 명 단위입니다. 노동투입은 세계은행 노동자 1인당 부가가치, 총 노동량은 세계은행 경제활동인구로 계산했습니다. 임금 1은 노동자 1인당 1만 달러어치입니다.'
        : 'One unit = USD 100 million of output; labor is counted in 10,000 workers. Labor per unit comes from World Bank value added per worker and the labor force from World Bank data. A wage of 1 is USD 10,000 per worker.',
  }
}

/**
 * Any two goods from revealed comparative advantage: labour per unit = 10 ÷ RCA, so only the ratios
 * (and so the direction of comparative advantage) carry meaning; L is the real labour force.
 */
export function setupFromGoods(partner: string, x: string, y: string, year: number, lang: Lang): RicardoSetup | null {
  const gx = goodById(x)
  const gy = goodById(y)
  const kx = goodRca(KOREA, x)
  const ky = goodRca(KOREA, y)
  const px = goodRca(partner, x)
  const py = goodRca(partner, y)
  const lk = laborForce(KOREA, year)
  const lp = laborForce(partner, year)
  if (!gx || !gy || !kx || !ky || !px || !py || !lk || !lp) return null
  const a = (rca: number) => Math.round((10 / rca) * 100) / 100
  const short = (s: string) => s.replace(/\s*\(.*\)/, '')
  return {
    names: { A: countryName(KOREA, lang), B: countryName(partner, lang), X: short(gx.name[lang]), Y: short(gy.name[lang]) },
    icons: { X: gx.icon, Y: gy.icon },
    inputs: { A: { aX: a(kx), aY: a(ky), labor: lk }, B: { aX: a(px), aY: a(py), labor: lp } },
    unit: '',
    source:
      lang === 'ko'
        ? '노동투입은 10 ÷ RCA로 만든 지수라 비교우위의 방향만 실제와 같고 크기는 상대적입니다. 총 노동량은 세계은행 경제활동인구(만 명)입니다.'
        : 'Labor per unit is an index, 10 ÷ RCA, so only the direction of comparative advantage is real; sizes are relative. Labor force is World Bank data (10k workers).',
    warning:
      lang === 'ko'
        ? 'RCA는 생산성이 아니라 수출 구조라서, 이 모드의 그래프는 비교우위의 방향과 특화 패턴을 보여주는 데까지만 의미가 있습니다. 교역이익(%)·임금·생산량 같은 크기는 실제 값이 아니니 보고서에서 수치로 인용하지 마세요. 실제 수치가 필요하면 노동생산성 모드를 쓰세요.'
        : 'RCA is export structure, not productivity, so in this mode the charts only show the direction of comparative advantage and specialisation. Magnitudes such as the gains (%), wages and output are not real values; do not cite them. Use the labor-productivity mode for real numbers.',
  }
}
