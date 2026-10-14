/**
 * Strings for the Ricardian model panels, ported from the Ricardian Model Explorer
 * (github.com/gwonyongjin94-ui/ricardian-model). Labour is measured in whatever unit the real data
 * provides (e.g. 10,000 workers per USD 1 trillion of output) instead of hours.
 */
import { josa, useI18n, type Lang } from '../i18n'

export type Names = { A: string; B: string; X: string; Y: string }

const ko = {
  inputsTitle: '생산 조건',
  laborPer: (good: string, unit: string) => `${good} 1단위당 노동투입${unit ? ` (${unit})` : ''}`,
  laborForce: (unit: string) => `총 노동량 (L${unit ? `, ${unit}` : ''})`,
  beta: (x: string) => `${x}에 대한 지출 비중 (β)`,
  betaHelp: '소비자가 소득의 몇 %를 X재에 쓰는지 정합니다. 세계 상대수요곡선(RD)을 결정합니다.',
  priceMode: '교역가격 결정 방식',
  equilibrium: '시장균형',
  manual: '직접 설정',
  manualHelp: '두 나라의 자급자족 가격 사이에서 교역가격을 직접 움직여 보세요.',
  equilibriumHelp: '상대공급(RS)과 상대수요(RD)가 만나는 점에서 가격이 정해집니다.',
  price: (x: string, y: string) => `${x} 1단위 = ${y} 몇 단위`,
  excessWarning: '직접 설정한 가격에서는 세계 시장이 청산되지 않을 수 있습니다 (초과공급 또는 초과수요).',
  invalid: '모든 값은 0보다 커야 합니다.',
  reset: '실제 값으로 되돌리기',
  edited: '값을 바꿨습니다',

  exports: (c: string, g: string) => `${c} → ${g} 수출`,
  gain: '교역이익',
  tradePrice: '교역가격',
  noTradeBadge: '교역 없음',

  ppfTitle: (c: string) => `${c}의 생산가능곡선`,
  autarky: '자급자족',
  production: '교역 후 생산',
  consumption: '교역 후 소비',
  tradeLine: '교역선',
  rsrdTitle: '세계 상대공급(RS)·상대수요(RD)',
  rsrdX: (x: string, y: string) => `상대수량 Q${x}/Q${y}`,
  rsrdY: (x: string, y: string) => `상대가격 P${x}/P${y}`,
  equilibriumPoint: '교역가격',

  explainTitle: '단계별 해설',
  step1Title: '① 기회비용',
  step1: (n: Names, c: string, aX: string, aY: string, oc: string, unit: string) =>
    `${c}에서 ${n.X} 1단위를 만드는 데 노동 ${aX}${unit}이 듭니다. 그 노동이면 ${josa(n.Y, '을/를')} ${aX}÷${aY} = ${oc}단위 만들 수 있으므로, ${n.X}의 기회비용은 ${n.Y} ${oc}단위입니다.`,
  step2Title: '② 절대우위',
  step2Good: (good: string, who: string | null) =>
    who ? `${good}: ${josa(who, '이/가')} 더 적은 노동으로 생산합니다.` : `${good}: 두 나라의 노동투입이 같습니다.`,
  step2Note: '절대우위는 누가 더 효율적인지를 알려줄 뿐, 교역 패턴을 결정하지는 않습니다.',
  step3Title: '③ 비교우위와 특화',
  step3: (n: Names, s: string, t: string, ocS: string, ocT: string) =>
    `${n.X}의 기회비용은 ${s}(${ocS}) < ${t}(${ocT})입니다. 따라서 ${josa(s, '은/는')} ${n.X}에, ${josa(t, '은/는')} ${n.Y}에 비교우위가 있습니다.`,
  step3None: (ocS: string) => `두 나라의 기회비용이 ${ocS}로 같습니다. 비교우위가 없으므로 교역해도 이익이 생기지 않습니다.`,
  step4Title: '④ 교역가격',
  step4Band: (n: Names, lo: string, hi: string) =>
    `교역가격(${n.X} 1단위당 ${n.Y})은 두 자급자족 가격 사이인 ${lo}와 ${hi} 사이에 있어야 두 나라 모두 교역에 참여합니다.`,
  step4Eq: (p: string) => `RD가 RS와 만나는 균형 교역가격은 ${p}입니다.`,
  step4Manual: (p: string) => `직접 설정한 교역가격은 ${p}입니다.`,
  step4Large: (c: string) =>
    `${c}의 경제 규모가 커서 교역가격이 ${c}의 자급자족 가격과 같아졌습니다. ${josa(c, '은/는')} 두 재화를 모두 계속 생산하고 교역이익을 얻지 못합니다.`,
  step5Title: '⑤ 교역이익',
  step5: (c: string, pct: string) => `${c}: 효용이 ${pct}% 증가합니다. 소비점이 자국의 생산가능곡선 바깥으로 나갑니다.`,
  step5Zero: (c: string) => `${c}: 교역 전후 효용이 같습니다.`,
  step5Wage: (a: string, b: string, w: string, lo: string, hi: string) =>
    `상대임금 w${a}/w${b} = ${w}이며, 두 재화의 생산성 비율 범위(${lo}~${hi}) 안에 있습니다.`,

  tableTitle: '수치 요약',
  row: {
    oc: (x: string) => `${x}의 기회비용`,
    prod: '교역 후 생산',
    cons: '교역 후 소비',
    net: '순수출 (+) / 순수입 (−)',
    wage: (y: string) => `임금 (${y} 단위)`,
    gain: '효용 변화',
  },
  wages: {
    title: '💰 임금',
    intro:
      '리카도 모형에서 임금은 생산성이 결정합니다. 노동자는 더 높은 임금을 주는 산업으로 옮겨 가므로, 각 나라의 임금은 그 나라가 특화한 재화의 생산성과 가격으로 정해집니다.',
    relTitle: '① 상대임금',
    ratio: (good: string, r: string) => `${good} 생산성 ${r}배`,
    relBody: (n: Names, w: string, rX: string, rY: string) =>
      `${n.A}의 임금은 ${n.B}의 ${w}배입니다. ${josa(n.A, '은/는')} ${n.B}보다 ${n.X}에서 ${rX}배, ${n.Y}에서 ${rY}배 생산적이므로 상대임금은 이 두 생산성 격차 사이에서 정해집니다. 교역가격이 바뀌면 이 범위 안에서 움직입니다.`,
    relEdge: (c: string) => `상대임금이 범위의 끝에 있습니다. ${josa(c, '은/는')} 두 재화를 모두 생산하므로 교역에서 얻는 이익이 없습니다.`,
    costTitle: '② 단위생산비 = 임금 × 노동투입',
    cheaper: '더 쌈',
    costUnit: (y: string) => `(${y} 단위)`,
    costBody: '임금 차이가 생산성 차이를 상쇄합니다. 그래서 각 나라는 비교우위가 있는 재화를 상대국보다 싸게 만듭니다.',
    pauper: (poor: string, rich: string, good: string) =>
      `${josa(poor, '은/는')} 두 재화 모두 ${rich}보다 생산성이 낮지만, 임금이 충분히 낮아서 ${josa(good, '을/를')} 더 싸게 만들 수 있습니다. "저임금 국가와의 교역은 불공정하다"는 주장(저임금 노동 논쟁)이 틀린 이유입니다.`,
    realTitle: '③ 실질임금: 노동 1단위로 살 수 있는 양',
    before: '자급자족',
    after: '교역 후',
    realBody: '수출재로 잰 실질임금은 그대로이고, 수입재로 잰 실질임금은 올라갑니다. 교역으로 두 나라 노동자 모두 더 많이 소비할 수 있게 됩니다.',
    realLarge: (large: string, small: string) =>
      `${large}의 실질임금은 변하지 않고, ${small}의 실질임금만 수입재 기준으로 올라갑니다. 교역이익이 모두 작은 나라로 가는 큰 나라 케이스입니다.`,
    realNone: '교역이 일어나지 않으므로 실질임금도 그대로입니다.',
  },
  footer: '가정: 노동이 유일한 생산요소이고, 국가 간 이동하지 않으며, 두 나라 소비자는 동일한 Cobb-Douglas 선호를 가집니다.',
  twoCountry:
    '이 모형은 두 나라만 서로 교역하는 세계를 가정합니다. 그래서 교역이익(%)은 한국의 실제 교역이익이 아니라 모형 안의 값이고, 경제 규모가 크게 다르면 큰 나라는 두 재화를 모두 생산하며 이익을 얻지 못하는 "큰 나라 케이스"가 됩니다. 보고서에는 비교우위의 방향과 특화 패턴을 중심으로 쓰세요.',
}

export type RicardoStrings = typeof ko

const en: RicardoStrings = {
  inputsTitle: 'Production',
  laborPer: (good, unit) => `Labor per unit of ${good}${unit ? ` (${unit})` : ''}`,
  laborForce: (unit) => `Labor force (L${unit ? `, ${unit}` : ''})`,
  beta: (x) => `Spending share on ${x} (β)`,
  betaHelp: 'The share of income consumers spend on good X. It sets the world relative demand curve (RD).',
  priceMode: 'World price',
  equilibrium: 'Market equilibrium',
  manual: 'Set manually',
  manualHelp: 'Move the world price between the two autarky prices.',
  equilibriumHelp: 'The price is where relative supply (RS) meets relative demand (RD).',
  price: (x, y) => `units of ${y} per ${x}`,
  excessWarning: 'At a manually set price the world market may not clear (excess supply or demand).',
  invalid: 'All values must be greater than zero.',
  reset: 'Back to the real values',
  edited: 'Values edited',

  exports: (c, g) => `${c} exports ${g}`,
  gain: 'Gain from trade',
  tradePrice: 'World price',
  noTradeBadge: 'No trade',

  ppfTitle: (c) => `${c} production possibilities`,
  autarky: 'Autarky',
  production: 'Production with trade',
  consumption: 'Consumption with trade',
  tradeLine: 'Trade line',
  rsrdTitle: 'World relative supply (RS) and demand (RD)',
  rsrdX: (x, y) => `Relative quantity Q${x}/Q${y}`,
  rsrdY: (x, y) => `Relative price P${x}/P${y}`,
  equilibriumPoint: 'World price',

  explainTitle: 'Step by step',
  step1Title: '① Opportunity cost',
  step1: (n, c, aX, aY, oc, unit) =>
    `In ${c}, one unit of ${n.X} takes ${aX}${unit ? ` ${unit}` : ''} of labor. That labor could make ${aX}÷${aY} = ${oc} units of ${n.Y}, so the opportunity cost of ${n.X} is ${oc} ${n.Y}.`,
  step2Title: '② Absolute advantage',
  step2Good: (good, who) => (who ? `${good}: ${who} uses less labor.` : `${good}: both countries use the same labor.`),
  step2Note: 'Absolute advantage says who is more efficient. It does not decide the pattern of trade.',
  step3Title: '③ Comparative advantage',
  step3: (n, s, t, ocS, ocT) =>
    `The opportunity cost of ${n.X} is lower in ${s} (${ocS}) than in ${t} (${ocT}). So ${s} has the comparative advantage in ${n.X} and ${t} in ${n.Y}.`,
  step3None: (ocS) => `Both countries have the same opportunity cost (${ocS}). With no comparative advantage there is nothing to gain from trade.`,
  step4Title: '④ World price',
  step4Band: (n, lo, hi) => `The world price (${n.Y} per ${n.X}) must lie between the autarky prices ${lo} and ${hi} for both countries to want to trade.`,
  step4Eq: (p) => `RD meets RS at a world price of ${p}.`,
  step4Manual: (p) => `You set the world price to ${p}.`,
  step4Large: (c) => `${c} is large enough that the world price equals its autarky price. ${c} keeps producing both goods and gains nothing.`,
  step5Title: '⑤ Gains from trade',
  step5: (c, pct) => `${c}: utility rises by ${pct}%. Consumption moves outside its own PPF.`,
  step5Zero: (c) => `${c}: utility is unchanged.`,
  step5Wage: (a, b, w, lo, hi) => `The relative wage w${a}/w${b} = ${w}, inside the range set by the productivity ratios (${lo} to ${hi}).`,

  tableTitle: 'Numbers',
  row: {
    oc: (x) => `Opportunity cost of ${x}`,
    prod: 'Production with trade',
    cons: 'Consumption with trade',
    net: 'Net exports (+) / imports (−)',
    wage: (y) => `Wage (in ${y})`,
    gain: 'Change in utility',
  },
  wages: {
    title: '💰 Wages',
    intro:
      'In the Ricardian model productivity sets wages. Workers move to whichever industry pays more, so each country’s wage is set by productivity and prices in the good it specialises in.',
    relTitle: '① Relative wage',
    ratio: (good, r) => `${good} productivity ${r}×`,
    relBody: (n, w, rX, rY) =>
      `Workers in ${n.A} earn ${w} times as much as in ${n.B}. ${n.A} is ${rX} times as productive in ${n.X} and ${rY} times in ${n.Y}, so the relative wage lies between these two productivity gaps. It moves within this range as the world price changes.`,
    relEdge: (c) => `The relative wage is at the edge of the range: ${c} produces both goods and gains nothing from trade.`,
    costTitle: '② Unit cost = wage × labor input',
    cheaper: 'cheaper',
    costUnit: (y) => `(in ${y})`,
    costBody: 'Wage differences offset productivity differences, so each country makes its comparative-advantage good more cheaply than the other.',
    pauper: (poor, rich, good) =>
      `${poor} is less productive than ${rich} in both goods, but its wage is low enough that it still makes ${good} more cheaply. This is why the “pauper labor” argument against trading with low-wage countries fails.`,
    realTitle: '③ Real wages: what one unit of labor buys',
    before: 'Autarky',
    after: 'With trade',
    realBody:
      'Measured in the exported good the real wage is unchanged; measured in the imported good it rises. Trade lets workers in both countries consume more.',
    realLarge: (large, small) =>
      `Real wages in ${large} do not change; only ${small}'s real wage rises, in terms of its imported good. In the large-country case the small country gets all the gains.`,
    realNone: 'With no trade, real wages stay the same.',
  },
  footer: 'Assumptions: labor is the only factor, it cannot move between countries, and consumers in both countries share the same Cobb-Douglas preferences.',
  twoCountry:
    'The model assumes a world of just these two countries. The gains (%) are values inside the model, not Korea’s actual gains from trade, and when the two economies differ a lot in size the larger one keeps producing both goods and gains nothing (the large-country case). In a report, focus on the direction of comparative advantage and specialisation.',
}

export const RICARDO_TEXT: Record<Lang, RicardoStrings> = { ko, en }

/** The page language and the Ricardian strings for it. */
export function useRicardoText() {
  const { lang } = useI18n()
  return { lang, t: RICARDO_TEXT[lang] }
}
