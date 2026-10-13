import type { Lang } from '../i18n'
import type { Economy } from '../model/specificFactors'

export interface SfPreset {
  id: string
  title: Record<Lang, string>
  note: Record<Lang, string>
  names: Record<Lang, { C: string; F: string; K: string; T: string }>
  icons: { C: string; F: string }
  economy: Economy
  /** World relative price of C, in % above (+) or below (−) the autarky price. */
  worldGap: number
}

export const SF_PRESETS: SfPreset[] = [
  {
    id: 'textbook',
    title: { ko: '기본형: 의류와 식량', en: 'Basic: cloth and food' },
    note: {
      ko: '교과서와 같은 구조입니다. 의류는 자본과 노동으로, 식량은 토지와 노동으로 만듭니다. 세계 시장의 의류 가격이 더 높아 의류를 수출합니다.',
      en: 'The same structure as the textbook: cloth uses capital and labor, food uses land and labor. Cloth is dearer on world markets, so the country exports it.',
    },
    names: { ko: { C: '의류', F: '식량', K: '자본', T: '토지' }, en: { C: 'cloth', F: 'food', K: 'capital', T: 'land' } },
    icons: { C: '🧵', F: '🌾' },
    economy: { K: 100, T: 100, L: 100, alpha: 0.4, beta: 0.4, gamma: 0.5 },
    worldGap: 30,
  },
  {
    id: 'korea',
    title: { ko: '한국에 적용: 제조업과 농산물', en: 'Korea: manufactures and farm goods' },
    note: {
      ko: '자본은 많고 농지는 적은 한국을 단순화했습니다. 자급자족이라면 공산품이 상대적으로 싸지만, 세계 가격은 더 높아 공산품을 수출하고 농산물을 수입합니다. 숫자는 설명용입니다.',
      en: 'A stylised Korea with plenty of capital and little farmland. In autarky manufactures would be relatively cheap; at world prices they are dearer, so Korea exports them and imports farm goods. Numbers are illustrative.',
    },
    names: {
      ko: { C: '공산품', F: '농산물', K: '제조업 설비', T: '농지' },
      en: { C: 'manufactures', F: 'farm goods', K: 'factories', T: 'farmland' },
    },
    icons: { C: '🏭', F: '🌾' },
    economy: { K: 300, T: 40, L: 100, alpha: 0.45, beta: 0.35, gamma: 0.6 },
    worldGap: 60,
  },
  {
    id: 'landRich',
    title: { ko: '토지가 풍부한 나라', en: 'A land-rich country' },
    note: {
      ko: '토지가 많은 나라는 자급자족 때 식량이 싸서, 무역을 하면 식량을 수출하고 의류를 수입합니다. 이번에는 토지 소유자가 이득, 자본 소유자가 손해입니다.',
      en: 'With abundant land, food is cheap in autarky, so trade means exporting food and importing cloth. Now landowners gain and capital owners lose.',
    },
    names: { ko: { C: '의류', F: '식량', K: '자본', T: '토지' }, en: { C: 'cloth', F: 'food', K: 'capital', T: 'land' } },
    icons: { C: '🧵', F: '🌾' },
    economy: { K: 60, T: 300, L: 100, alpha: 0.4, beta: 0.4, gamma: 0.5 },
    worldGap: -35,
  },
]
