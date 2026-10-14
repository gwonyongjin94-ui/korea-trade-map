import { josa, type Lang } from './i18n'

export interface Names {
  C: string
  F: string
  K: string
  T: string
}

const f1 = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%`

const ko = {
  tab: '⚖️ 특정요소 모형',
  title: '⚖️ 특정요소 모형과 소득분배',
  subtitle:
    '노동은 두 산업 사이를 옮겨 다니지만 자본과 토지는 한 산업에 묶여 있는 경제입니다. 무역이 상대가격을 바꾸면 누가 이득을 보고 누가 손해를 보는지 따라가 봅니다.',
  source: 'Krugman·Obstfeld·Melitz 『국제경제학』 4장 (Samuelson–Jones 모형). 생산함수와 효용함수는 콥–더글러스로 두고 계산했습니다.',
  presets: '예시',
  setup: '경제 설정',
  endowments: '부존량',
  shares: '생산·소비 구조',
  alpha: (c: string, k: string) => `${c} 생산에서 ${k} 몫 (α)`,
  beta: (f: string, t: string) => `${f} 생산에서 ${t} 몫 (β)`,
  gamma: (c: string) => `소득 중 ${c}에 쓰는 비중 (γ)`,
  labor: '노동 (L, 이동 가능)',
  worldPrice: (c: string) => `세계 시장의 ${c} 상대가격`,
  worldPriceNote: (pct: string) => `자급자족 가격 대비 ${pct}`,
  laborChart: '노동 배분과 임금',
  laborChartNote: (c: string, f: string) => `왼쪽에서 ${c}, 오른쪽에서 ${f} 고용을 잽니다. 두 곡선이 만나는 곳에서 임금이 정해집니다.`,
  vmplC: (c: string) => `${c}의 노동 수요 (P × MPL)`,
  vmplF: (f: string) => `${f}의 노동 수요 (P × MPL)`,
  before: '자급자족',
  after: '무역 후',
  wage: '임금',
  wageUnit: '세로축: 임금과 노동의 한계생산가치 (식량 단위, P_F = 1)',
  employed: (g: string) => `${g} 고용`,
  ppfChart: '생산가능곡선과 무역의 이익',
  ppfLegend: { autarky: '① 자급자족 (생산 = 소비)', production: '② 무역 후 생산', consumption: '③ 무역 후 소비', budget: '예산선 (기울기 = −세계 상대가격)' },
  exports: (g: string) => `${g} 수출`,
  imports: (g: string) => `${g} 수입`,
  output: (g: string) => `${g} 생산량`,
  groups: { labor: '👷 노동자', capital: (k: string) => `🏭 ${k} 소유자`, land: (t: string) => `🌾 ${t} 소유자` },
  verdict: { gain: '이득', loss: '손해', ambiguous: '불분명' },
  inGood: (g: string) => `${josa(g, '으로/로')} 따진 실질소득`,
  inBundle: '소비 묶음 기준 (γ로 가중)',
  distTitle: '무역으로 누가 이득을 보나',
  summary: (n: Names, up: boolean, dp: number, dw: number, gain: number) =>
    up
      ? `세계 시장에서 ${n.C}의 상대가격이 자급자족 때보다 ${dp.toFixed(0)}% 높아, 이 나라는 ${josa(n.C, '을/를')} 수출하고 ${josa(n.F, '을/를')} 수입합니다. 임금은 ${f1(dw)}로 가격보다 덜 오르고, ${n.K} 소유자는 이득, ${n.T} 소유자는 손해를 봅니다. 나라 전체의 효용은 ${f1(gain)} 늘어납니다.`
      : `세계 시장에서 ${n.C}의 상대가격이 자급자족 때보다 ${Math.abs(dp).toFixed(0)}% 낮아, 이 나라는 ${josa(n.F, '을/를')} 수출하고 ${josa(n.C, '을/를')} 수입합니다. ${n.T} 소유자는 이득, ${n.K} 소유자는 손해를 보고, 노동자는 소비 구성에 따라 다릅니다. 나라 전체의 효용은 ${f1(gain)} 늘어납니다.`,
  noTrade: '세계 가격이 자급자족 가격과 같으면 무역이 일어나지 않고 소득분배도 바뀌지 않습니다.',
  stepsTitle: '단계별 해설',
  steps: (n: Names, v: { LC: string; LF: string; w: string; dp: string; dw: string; pa: string; pw: string; gain: string; winner: string; loser: string }) => [
    {
      title: '① 노동은 임금이 같아질 때까지 움직인다',
      body: `기업은 노동의 한계생산가치(가격 × 한계생산)가 임금과 같아질 때까지 고용합니다. 노동은 두 산업을 오갈 수 있으므로 균형에서 P_C·MPL_C = P_F·MPL_F = w 입니다. 지금 세계 가격에서는 ${n.C}에 ${v.LC}, ${n.F}에 ${v.LF}의 노동이 쓰이고 임금은 ${v.w}입니다.`,
      formula: 'P_C × MPL_C = P_F × MPL_F = w',
    },
    {
      title: '② 가격이 오른 만큼 임금이 오르지는 않는다',
      body: `${n.C}의 상대가격이 ${v.dp} 바뀌면 ${n.C} 부문의 노동 수요곡선이 같은 비율로 움직이지만, 노동이 옮겨 가면서 한계생산이 떨어져 임금은 ${v.dw}만 바뀝니다. 두 재화 가격이 같은 비율로 오르면 임금도 같은 비율로 올라 실질적으로는 아무것도 바뀌지 않습니다. 중요한 것은 상대가격입니다.`,
      formula: '|Δw/w| < |ΔP_C/P_C|',
    },
    {
      title: '③ 특정요소는 확실히 이득 또는 손해, 노동은 불분명',
      body: `상대가격이 오른 산업에 묶인 요소(${v.winner})는 두 재화 어느 것으로 따져도 소득이 늘고, 다른 산업에 묶인 요소(${v.loser})는 줄어듭니다. 노동자는 한 재화로 따지면 실질임금이 오르고 다른 재화로 따지면 내려가서, 무엇을 주로 소비하느냐에 달려 있습니다.`,
      formula: '',
    },
    {
      title: '④ 그래도 나라 전체로는 이득이다',
      body: `무역 후 소비는 예산선(PC×DC + PF×DF = PC×QC + PF×QF) 위에서 고르므로 생산가능곡선 밖으로 나갈 수 있습니다. 이 예에서 효용은 ${v.gain} 늘어납니다. 승자가 얻은 것으로 패자를 보상하고도 남는다는 뜻이지만, 실제로 보상이 이루어진다는 뜻은 아닙니다.`,
      formula: 'D_F − Q_F = (P_C/P_F) × (Q_C − D_C)',
    },
    {
      title: '⑤ 그래서 무역은 정치적으로 다툼이 된다',
      body: `손해를 보는 쪽(수입경쟁 산업에 묶인 ${v.loser})은 특정 산업·지역에 몰려 있어 조직적으로 보호를 요구하기 쉽고, 이득은 많은 사람에게 조금씩 퍼집니다. 그래도 경제학자 대부분은 무역을 막기보다 무역을 허용하고 손해 보는 사람을 실업급여·재교육 같은 안전망으로 보상하는 편이 낫다고 봅니다. 특정성은 시간의 문제이기도 해서, 장기에는 자본도 산업 사이를 옮겨 갈 수 있고 그때는 헥셔–올린 모형(5장)이 더 맞습니다.`,
      formula: '',
    },
  ],
  korea: {
    title: '🇰🇷 한국 데이터로 보면',
    body: '한국의 산업별 순수출(수출 − 수입)입니다. 이 모형에서는 순수출 산업이 "상대가격이 오르는 수출 부문", 순수입 산업이 "수입경쟁 부문"입니다.',
    exporter: '수출 부문',
    importer: '수입경쟁 부문',
    reading: (exp: string, imp: string) =>
      `특정요소 모형으로 읽으면, 무역 개방으로 ${exp}에 묶인 요소(그 산업의 설비, 숙련 인력)는 이득을 보고, ${imp}에 묶인 요소(농지, 농어업 종사자, 광산)는 손해를 봅니다. 한국 농업계가 FTA 협상 때마다 시장 개방에 반대해 온 것은 이 모형의 예측과 맞습니다.`,
    caution:
      '광물·에너지는 한국에 부존 자원이 거의 없어 수입이 대신하는 국내 생산 자체가 작습니다. 이 표는 HS 2단위 순수출을 산업으로 묶은 것이라, 실제 산업별 고용·자본과는 다를 수 있습니다.',
    sectors: {
      agri: '농림수산·식품',
      mineral: '광물·에너지',
      chem: '화학·플라스틱·고무',
      light: '가죽·목재·종이',
      textile: '섬유·의류·신발',
      metal: '철강·금속',
      machine: '기계·전자',
      transport: '수송기기 (자동차·선박)',
      other: '정밀기기·기타',
    },
  },
  land: {
    title: '📊 실제 데이터로 보기: 땅이 많은 나라가 한국에 농산물을 판다',
    body: '특정요소 모형에서 토지는 농업에만 쓰이는 특정요소입니다. 토지가 풍부한 나라는 자급자족 때 식량이 싸서, 무역을 하면 식량을 수출합니다. 한국의 상대국 자료로 확인해 봅니다.',
    x: '1인당 경지 면적 (ha, 세계은행)',
    y: '한국이 그 나라에서 사는 물건 중 농산물(HS 01–24) 비중',
    supplier: '한국에 농산물을 상대적으로 더 파는 나라',
    buyer: '한국에서 농산물을 상대적으로 더 사는 나라',
    korea: (v: string) => `한국 ${v}ha`,
    line: '회귀선',
    stats: { slope: '탄력성', r: '상관계수 r', n: '국가 수' },
    sig: (se: string, sig: boolean) => `표준오차 ${se}${sig ? ' · 5% 유의' : ' · 유의하지 않음'}`,
    reading: (b: string, r: string, top: string, k: string) =>
      `1인당 경지 면적이 1% 넓은 나라일수록, 한국이 그 나라에서 사는 물건 중 농산물 비중이 약 ${b}% 높습니다 (r = ${r}). 땅이 많은 ${top} 같은 나라가 한국의 농산물 공급국입니다. 특정요소 모형으로 읽으면, 무역은 이런 나라에서 식량의 상대가격을 올려 토지 소유자에게 이득을 주고, 1인당 경지가 ${k}ha로 아주 적은 한국에서는 농산물 가격을 낮춰 농지 소유자에게 손해를 줍니다.`,
    tooltip: (land: string, share: string) => [`1인당 경지 ${land}ha`, `농산물 비중 ${share}`],
    trendTitle: '한국 농산물(HS 01–24) 교역 추이',
    trendReading: (y0: number, m0: string, y1: number, m1: string, g: string, e0: string, e1: string) =>
      `농산물 수입은 ${y0}년 ${m0}에서 ${y1}년 ${m1}로 ${g} 늘었습니다. 같은 기간 농업 고용 비중은 ${e0}에서 ${e1}로 거의 그대로였습니다(세계은행·ILO 추정). 모형에서 노동은 상대가격이 바뀔 때 움직이므로, 수입이 늘었다는 것만으로 노동 이동을 확인할 수는 없습니다.`,
    cautions: [
      '농산물 수입이 0인 나라(카타르·쿠웨이트·이라크 등)는 로그를 쓸 수 없어 빠졌고, 대만은 세계은행 자료가 없습니다.',
      '1인당 경지 면적은 농업 종사자 1인당 토지가 아니며, 기후·거리·FTA·식품가공 산업 같은 다른 요인도 작용합니다. 상관관계이지 인과관계가 아닙니다.',
    ],
  },
  migration: {
    title: '🌏 국제 노동이동',
    body: '한 가지 재화를 노동과 토지로 만드는 두 나라가 있고, 노동자는 실질임금이 높은 나라로 옮겨 갑니다.',
    home: '자국',
    foreign: '외국',
    productivity: (c: string) => `${c} 생산성`,
    moved: '외국으로 옮겨 간 노동자',
    toEquilibrium: '임금이 같아질 때까지 이동',
    reset: '처음으로',
    wage: (c: string) => `${c} 실질임금`,
    worldOutput: '세계 생산',
    reading: (wh: string, wf: string, dy: string, from: string, to: string) =>
      `노동자가 옮겨 가면 자국 임금은 ${wh}, 외국 임금은 ${wf} 바뀌어 서로 가까워지고, 세계 전체 생산은 ${dy} 늘어납니다. 이득을 보는 쪽은 옮겨 간 노동자, ${from}에 남은 노동자, ${to}의 토지 소유자이고, 손해를 보는 쪽은 ${to}의 기존 노동자와 ${from}의 토지 소유자입니다.`,
  },
}

export type SfText = typeof ko

const en: SfText = {
  tab: '⚖️ Specific factors',
  title: '⚖️ Specific factors and income distribution',
  subtitle:
    'Labor can move between two industries, but capital and land are tied to one each. When trade changes relative prices, follow who gains and who loses.',
  source: 'Krugman, Obstfeld & Melitz, International Economics, ch. 4 (the Samuelson–Jones model). Computed with Cobb–Douglas technology and preferences.',
  presets: 'Examples',
  setup: 'Economy',
  endowments: 'Endowments',
  shares: 'Technology and tastes',
  alpha: (c, k) => `${k}'s share of ${c} output (α)`,
  beta: (f, t) => `${t}'s share of ${f} output (β)`,
  gamma: (c) => `Share of income spent on ${c} (γ)`,
  labor: 'Labor (L, mobile)',
  worldPrice: (c) => `World relative price of ${c}`,
  worldPriceNote: (pct) => `${pct} vs. autarky`,
  laborChart: 'Labor allocation and the wage',
  laborChartNote: (c, f) => `${c} employment is measured from the left, ${f} from the right. The wage is where the two curves cross.`,
  vmplC: (c) => `Labor demand in ${c} (P × MPL)`,
  vmplF: (f) => `Labor demand in ${f} (P × MPL)`,
  before: 'Autarky',
  after: 'With trade',
  wage: 'Wage',
  wageUnit: 'Vertical axis: wage and value of marginal product (in units of food, P_F = 1)',
  employed: (g) => `${g} employment`,
  ppfChart: 'Production possibilities and the gains from trade',
  ppfLegend: { autarky: '① Autarky (production = consumption)', production: '② Production with trade', consumption: '③ Consumption with trade', budget: 'Budget line (slope = −world relative price)' },
  exports: (g) => `${g} exports`,
  imports: (g) => `${g} imports`,
  output: (g) => `${g} output`,
  groups: { labor: '👷 Workers', capital: (k) => `🏭 Owners of ${k}`, land: (t) => `🌾 Owners of ${t}` },
  verdict: { gain: 'Gain', loss: 'Loss', ambiguous: 'Ambiguous' },
  inGood: (g) => `Real income in ${g}`,
  inBundle: 'In the consumption bundle (weighted by γ)',
  distTitle: 'Who gains from trade',
  summary: (n, up, dp, dw, gain) =>
    up
      ? `The world relative price of ${n.C} is ${dp.toFixed(0)}% above autarky, so the country exports ${n.C} and imports ${n.F}. The wage moves ${f1(dw)}, less than the price; owners of ${n.K} gain and owners of ${n.T} lose. Utility for the country as a whole rises ${f1(gain)}.`
      : `The world relative price of ${n.C} is ${Math.abs(dp).toFixed(0)}% below autarky, so the country exports ${n.F} and imports ${n.C}. Owners of ${n.T} gain, owners of ${n.K} lose, and workers depend on what they buy. Utility for the country as a whole rises ${f1(gain)}.`,
  noTrade: 'At the autarky price there is no trade and no change in the distribution of income.',
  stepsTitle: 'Step by step',
  steps: (n, v) => [
    {
      title: '① Labor moves until wages are equal',
      body: `Firms hire until the value of labor's marginal product (price × marginal product) equals the wage. Since labor can move, in equilibrium P_C·MPL_C = P_F·MPL_F = w. At the world price, ${v.LC} of labor works in ${n.C}, ${v.LF} in ${n.F}, and the wage is ${v.w}.`,
      formula: 'P_C × MPL_C = P_F × MPL_F = w',
    },
    {
      title: '② The wage moves less than the price',
      body: `When the relative price of ${n.C} changes by ${v.dp}, labor demand in ${n.C} shifts by the same proportion, but as labor moves its marginal product falls, so the wage changes by only ${v.dw}. If both prices rose by the same proportion, the wage would too and nothing real would change: only relative prices matter.`,
      formula: '|Δw/w| < |ΔP_C/P_C|',
    },
    {
      title: '③ Specific factors clearly gain or lose; labor is ambiguous',
      body: `The factor tied to the sector whose relative price rises (${v.winner}) earns more in terms of both goods; the factor tied to the other sector (${v.loser}) earns less. Workers' real wage rises in terms of one good and falls in terms of the other, so it depends on what they consume.`,
      formula: '',
    },
    {
      title: '④ Still, the country as a whole gains',
      body: `With trade, consumption is chosen on the budget line (PC×DC + PF×DF = PC×QC + PF×QF), which reaches beyond the production possibility frontier. Here utility rises ${v.gain}. The winners could compensate the losers and still be better off, which is not the same as compensation actually happening.`,
      formula: 'D_F − Q_F = (P_C/P_F) × (Q_C − D_C)',
    },
    {
      title: '⑤ Which is why trade is politically contested',
      body: `The losers (${v.loser}, tied to the import-competing sector) are concentrated in particular industries and regions, so they organise for protection, while gains are spread thinly. Most economists still argue it is better to allow trade and compensate those who lose through a safety net (unemployment benefits, retraining) than to restrict it. Specificity is also a matter of time: in the long run capital can move between industries, and the Heckscher–Ohlin model (ch. 5) fits better.`,
      formula: '',
    },
  ],
  korea: {
    title: '🇰🇷 Applied to Korea',
    body: 'Korea’s net exports (exports − imports) by industry. In the model, net exporters are the export sector whose relative price rises with trade; net importers are import-competing.',
    exporter: 'Export sector',
    importer: 'Import-competing',
    reading: (exp, imp) =>
      `Read through the specific factors model, opening to trade helps factors tied to ${exp} (their plants and skilled workers) and hurts those tied to ${imp} (farmland, farm and fishery workers, mines). Korean farm groups’ opposition to market opening in each FTA negotiation fits the model’s prediction.`,
    caution:
      'Korea has almost no domestic minerals or energy, so imports there replace little domestic production. The table groups HS 2-digit net exports into industries and may differ from industry employment and capital.',
    sectors: {
      agri: 'Agriculture, fisheries & food',
      mineral: 'Minerals & energy',
      chem: 'Chemicals, plastics & rubber',
      light: 'Leather, wood & paper',
      textile: 'Textiles, clothing & footwear',
      metal: 'Steel & metals',
      machine: 'Machinery & electronics',
      transport: 'Transport equipment (cars, ships)',
      other: 'Instruments & other',
    },
  },
  land: {
    title: '📊 Real data: land-rich countries sell Korea farm goods',
    body: 'In the specific factors model, land is the factor specific to farming. A land-rich country has cheap food in autarky, so with trade it exports food. Here is the check against Korea’s partners.',
    x: 'Arable land per person (ha, World Bank)',
    y: 'Farm goods (HS 01–24) in what Korea buys from the country',
    supplier: 'Sells Korea relatively more farm goods',
    buyer: 'Buys relatively more farm goods from Korea',
    korea: (v) => `Korea ${v} ha`,
    line: 'Fitted line',
    stats: { slope: 'Elasticity', r: 'Correlation r', n: 'Countries' },
    sig: (se, sig) => `s.e. ${se}${sig ? ' · significant at 5%' : ' · not significant'}`,
    reading: (b, r, top, k) =>
      `A country with 1% more arable land per person has a farm share of Korea's imports from it about ${b}% higher (r = ${r}). Land-rich countries such as ${top} are Korea's farm suppliers. Read through the specific factors model, trade raises the relative price of food there, helping landowners, and lowers it in Korea, with only ${k} ha of arable land per person, hurting owners of farmland.`,
    tooltip: (land, share) => [`Arable land ${land} ha per person`, `Farm share ${share}`],
    trendTitle: 'Korea’s trade in farm goods (HS 01–24)',
    trendReading: (y0, m0, y1, m1, g, e0, e1) =>
      `Farm imports rose ${g}, from ${m0} in ${y0} to ${m1} in ${y1}. Agriculture's share of employment barely moved, from ${e0} to ${e1} (World Bank/ILO estimate). In the model labor moves when relative prices change, so rising imports alone do not show labor moving.`,
    cautions: [
      'Countries with no farm imports (Qatar, Kuwait, Iraq and others) drop out of the log scale, and Taiwan has no World Bank data.',
      'Arable land per person is not land per farm worker, and climate, distance, FTAs and food processing matter too. This is correlation, not causation.',
    ],
  },
  migration: {
    title: '🌏 International labor mobility',
    body: 'Two countries make one good with labor and land, and workers move to whichever pays the higher real wage.',
    home: 'Home',
    foreign: 'Foreign',
    productivity: (c) => `${c} productivity`,
    moved: 'Workers who moved abroad',
    toEquilibrium: 'Move until wages are equal',
    reset: 'Reset',
    wage: (c) => `${c} real wage`,
    worldOutput: 'World output',
    reading: (wh, wf, dy, from, to) =>
      `As workers move, Home's wage changes ${wh} and Foreign's ${wf}, converging, and world output changes ${dy}. The movers, the workers who stay in ${from} and ${to}'s landowners gain; ${to}'s existing workers and ${from}'s landowners lose.`,
  },
}

export const SF_TEXT: Record<Lang, SfText> = { ko, en }
