import { HO_TEXT, type HoText, type Names } from './hoText'
import { josa, type Lang } from './i18n'

/**
 * The Heckscher–Ohlin text for the leather case, where land takes the place of labour: the engine's
 * second factor L is arable land, its "wage" w the rent on land, and good C (hides) the land-intensive good.
 */

const f1 = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%`

type Steps = HoText['steps']
type StepValues = Parameters<Steps>[1]

const ko: HoText = {
  ...HO_TEXT.ko,
  subtitle:
    '두 나라의 기술과 취향은 같고, 가진 자본과 토지의 비율만 다릅니다. 자본과 토지 모두 산업 사이를 자유롭게 옮겨 다니는 장기에, 요소 부존의 차이만으로 무역이 생기고 소득분배가 바뀌는 과정을 따라가 봅니다.',
  source:
    'Krugman·Obstfeld·Melitz 『국제경제학』 5장 (2국 × 2재화 × 2요소)의 노동 자리에 토지를 넣었습니다. 생산함수와 효용함수는 콥–더글러스로 두고 계산했습니다. 자본은 Penn World Table 11.0 (FRED 재배포), 경지 면적은 세계은행(AG.LND.ARBL.HA)입니다.',
  laborL: '토지 (T)',
  ratio: 'K/T',
  factorChartNote: (c: string) =>
    `가운데 세로축이 지대–임대료 비율(지대/r)입니다. 왼쪽 SS 곡선은 ${c} 상대가격(왼쪽으로 갈수록 높음)과 지대/r의 일대일 관계, 오른쪽 CC·FF 곡선은 지대/r에 따라 각 산업이 고르는 토지–자본 비율(T/K)입니다. 점선은 각 나라 전체의 T/K입니다.`,
  axisLK: '토지–자본 비율 T/K →',
  axisOmega: '지대–임대료 비율 지대/r',
  endowmentOf: (n: string) => `${n} 전체 T/K`,
  distSummary: (n: Names, capRichA: boolean, gainA: number, gainB: number, odd: string[]) => {
    const rich = capRichA ? n.A : n.B
    const poor = capRichA ? n.B : n.A
    const caveat = odd.length
      ? ` 다만 지금은 완전특화가 일어나 ${odd.join(', ')}의 결과가 교과서와 다릅니다. 한 재화만 만들면 요소가격이 그 산업의 한계생산으로만 정해져 확대 효과가 성립하지 않습니다.`
      : ''
    return `땅에 비해 자본이 풍부한 ${josa(rich, '은/는')} ${josa(n.F, '을/를')}, 토지가 풍부한 ${josa(poor, '은/는')} ${josa(n.C, '을/를')} 수출합니다. 스톨퍼–사뮤엘슨 정리대로라면 ${rich}에서는 자본 소유자가, ${poor}에서는 토지 소유자가 두 재화 어느 것으로 따져도 이득을 보고, 각 나라의 희소한 요소는 손해를 봅니다.${caveat} 나라 전체의 효용은 ${n.A} ${f1(gainA)}, ${n.B} ${f1(gainB)} 늘어납니다.`
  },
  noTrade: '두 나라의 토지–자본 비율이 같으면 자급자족 가격이 같아 무역이 일어나지 않습니다.',
  groups: { labor: (n: string) => `🌾 ${n} 토지 소유자`, capital: (n: string) => `🏦 ${n} 자본 소유자` },
  steps: (n: Names, v: StepValues) => [
    {
      title: '① 토지집약재와 자본집약재',
      body: `기업은 지대와 자본 임대료(r)를 보고 토지와 자본을 섞는 비율을 정합니다. 땅값이 비싸지면 두 산업 모두 자본을 더 씁니다(축사 사육, 공장 고층화). 그래도 같은 지대/r에서 ${josa(n.C, '은/는')} 언제나 ${n.F}보다 토지를 더 많이 씁니다. 지금 세계 가격에서 토지–자본 비율은 ${n.C} ${v.lkC}, ${n.F} ${v.lkF}입니다.`,
      formula: 'K/T = s / (1 − s) × 지대 / r',
    },
    {
      title: '② 재화가격이 요소가격을 정한다',
      body: `두 재화를 모두 만드는 한, 각 재화의 가격은 생산비(지대와 임대료의 가중합)와 같아야 합니다. 그래서 ${n.C} 상대가격 하나가 지대/r 하나를 정합니다. 토지를 많이 쓰는 ${n.C}의 가격이 오르면 토지 수요가 늘어 지대/r이 오릅니다(SS 곡선).`,
      formula: 'P_C / P_F = 비용_C(지대, r) / 비용_F(지대, r)',
    },
    {
      title: '③ 부존량이 생산을 정한다 (립진스키)',
      body: `가격이 그대로일 때 자본이 늘거나 토지가 줄면, 토지와 자본이 함께 자본집약재 ${n.F} 쪽으로 옮겨 갑니다. 그래서 ${n.F} 생산은 늘고 ${n.C} 생산은 오히려 줄어듭니다. 땅이 좁고 자본이 많은 나라의 생산가능곡선이 ${n.F} 쪽으로 치우친 이유입니다.`,
      formula: '',
    },
    {
      title: '④ 풍부한 요소를 집약적으로 쓰는 재화를 수출한다',
      body: `경지 1ha당 자본은 ${n.A} ${v.kA}, ${n.B} ${v.kB}입니다. 자급자족 때 ${n.C} 상대가격은 ${n.A} ${v.paA}, ${n.B} ${v.paB}라서, 땅에 비해 자본이 풍부한 ${v.rich}에서는 ${josa(n.F, '이/가')} 상대적으로 쌉니다. 무역을 하면 가격이 ${v.pw}로 모이고, ${josa(v.rich, '은/는')} ${josa(n.F, '을/를')}, ${josa(v.poor, '은/는')} ${josa(n.C, '을/를')} 수출합니다 (헥셔–올린 정리).`,
      formula: 'K_A / T_A > K_B / T_B  ⇒  A는 F 수출',
    },
    {
      title: '⑤ 풍부한 요소는 이득, 희소한 요소는 손해 (스톨퍼–사뮤엘슨)',
      body: v.magnified
        ? `${v.rich}에서 ${n.F}의 상대가격이 오르면 자본 임대료는 두 재화 어느 것으로 따져도 ${v.dr}, 지대는 ${v.dw} 바뀝니다. 가격 변화보다 요소가격 변화가 더 커서(확대 효과), 특정요소 모형과 달리 "불분명"한 집단이 없습니다. 토지와 자본이 장기에 산업 사이를 옮겨 가도 소득분배 효과는 사라지지 않습니다.`
        : `${v.rich}에서 ${n.F}의 상대가격이 오르면, 두 재화를 계속 만드는 한 자본 임대료는 두 재화 어느 것으로 따져도 오르고 지대는 내립니다(확대 효과). 그런데 지금은 ${josa(v.rich, '이/가')} ${n.F}만 만들게 되어(완전특화) 임대료는 ${v.dr}, 지대는 ${v.dw} 바뀝니다. 세계 가격이 두 재화를 모두 만들 수 있는 범위를 벗어나면 요소가격은 한 산업의 한계생산으로만 정해지기 때문입니다.`,
      formula: '',
    },
    {
      title: '⑥ 요소가격 균등화와 그 한계',
      body: v.fpe
        ? `무역 후 두 나라 모두 두 재화를 만들고 기술이 같으므로, 땅과 자본이 국경을 넘지 않아도 지대와 임대료가 두 나라에서 같아집니다. 원피를 사 오는 것은 미국의 넓은 땅을 빌려 쓰는 것과 같습니다. 현실에서는 기술 차이, 운송비·관세, 그리고 부존량 차이가 커서 생기는 완전특화 때문에 성립하지 않습니다.`
        : `두 나라의 토지–자본 비율 차이가 너무 커서 ${josa(v.only.join('·'), '이/가')} ${v.only.length > 1 ? '각각 ' : ''}한 재화만 만듭니다(완전특화). 이때는 같은 기술이어도 지대와 임대료가 같아지지 않습니다. 교과서가 꼽는 요소가격 균등화가 실패하는 세 이유(기술 차이, 운송비·관세, 완전특화) 중 마지막 경우입니다.`,
      formula: '',
    },
  ],
  ryb: {
    ...HO_TEXT.ko.ryb,
    title: '📦 립진스키 효과: 땅에 비해 자본이 늘면',
    body: (n: string, c: string, f: string, atWorld: boolean) =>
      `${atWorld ? `${n}의 세계 가격` : `세계 가격에서는 두 나라 모두 한 재화만 만들기 때문에(완전특화), 대신 ${n}의 자급자족 가격`}(P_C/P_F)과 요소가격을 그대로 두고 자본만 늘려 봅니다. 경지가 줄어드는 것도 T/K를 낮춘다는 점에서 같습니다. 상자의 가로는 토지, 세로는 자본이고, 왼쪽 아래에서 ${c}, 오른쪽 위에서 ${f} 투입을 잽니다.`,
    reading: (dk: string, f: string, df: string, c: string, dc: string) =>
      `자본이 ${dk} 늘면 ${f} 생산은 ${df}, ${c} 생산은 ${dc} 바뀝니다. 지대와 임대료는 그대로입니다.`,
  },
}

const en: HoText = {
  ...HO_TEXT.en,
  subtitle:
    'Two countries share technology and tastes and differ only in how much capital they have per hectare of land. With both capital and land free to move between industries, follow how that difference alone creates trade and shifts the distribution of income.',
  source:
    'Krugman, Obstfeld & Melitz, International Economics, ch. 5 (2 countries × 2 goods × 2 factors), with land in place of labor. Computed with Cobb–Douglas technology and preferences. Capital from Penn World Table 11.0 (via FRED), arable land from the World Bank (AG.LND.ARBL.HA).',
  laborL: 'Land (T)',
  ratio: 'K/T',
  factorChartNote: (c) =>
    `The middle axis is the ratio of land rent to the rental on capital. On the left, the SS curve links it one-to-one to the relative price of ${c} (rising to the left); on the right, CC and FF show the land–capital ratio T/K each industry picks at each rent ratio. Dashed lines mark each country’s overall T/K.`,
  axisLK: 'Land–capital ratio T/K →',
  axisOmega: 'Land rent ÷ rental on capital',
  endowmentOf: (n) => `${n} overall T/K`,
  distSummary: (n, capRichA, gainA, gainB, odd) => {
    const rich = capRichA ? n.A : n.B
    const poor = capRichA ? n.B : n.A
    const caveat = odd.length
      ? ` Here, though, complete specialization makes ${odd.join(', ')} depart from the textbook: making only one good, factor prices follow that sector’s marginal products alone and magnification fails.`
      : ''
    return `${rich}, rich in capital relative to land, exports ${n.F}; land-abundant ${poor} exports ${n.C}. By the Stolper–Samuelson theorem, capital owners in ${rich} and landowners in ${poor} gain in terms of both goods, while each country’s scarce factor loses.${caveat} Utility for each country as a whole rises: ${n.A} ${f1(gainA)}, ${n.B} ${f1(gainB)}.`
  },
  noTrade: 'With the same land–capital ratio the autarky prices are equal, so there is no trade.',
  groups: { labor: (n) => `🌾 Landowners in ${n}`, capital: (n) => `🏦 Capital owners in ${n}` },
  steps: (n, v) => [
    {
      title: '① Land-intensive and capital-intensive goods',
      body: `Firms choose how to combine land and capital given the land rent and the rental on capital (r). When land gets dearer both industries use more capital (feedlots, taller plants), but at any rent ratio ${n.C} uses more land than ${n.F}. At the world price the land–capital ratios are ${v.lkC} in ${n.C} and ${v.lkF} in ${n.F}.`,
      formula: 'K/T = s / (1 − s) × rent / r',
    },
    {
      title: '② Goods prices set factor prices',
      body: `As long as both goods are made, each price must equal its unit cost (a weighted mix of land rent and rental), so one relative price of ${n.C} pins down one rent ratio. If the price of land-intensive ${n.C} rises, demand for land rises and so does the rent ratio (the SS curve).`,
      formula: 'P_C / P_F = cost_C(rent, r) / cost_F(rent, r)',
    },
    {
      title: '③ Endowments set output (Rybczynski)',
      body: `At unchanged prices, more capital or less land moves land and capital together into capital-intensive ${n.F}. ${n.F} output grows and ${n.C} output actually falls. That is why the frontier of a country with little land and much capital is skewed towards ${n.F}.`,
      formula: '',
    },
    {
      title: '④ Countries export what uses their abundant factor',
      body: `Capital per hectare of arable land is ${v.kA} in ${n.A} and ${v.kB} in ${n.B}. In autarky the relative price of ${n.C} is ${v.paA} in ${n.A} and ${v.paB} in ${n.B}, so ${n.F} is relatively cheap in ${v.rich}, rich in capital relative to land. With trade the price converges to ${v.pw}, ${v.rich} exports ${n.F} and ${v.poor} exports ${n.C} (the Heckscher–Ohlin theorem).`,
      formula: 'K_A / T_A > K_B / T_B  ⇒  A exports F',
    },
    {
      title: '⑤ The abundant factor gains, the scarce one loses (Stolper–Samuelson)',
      body: v.magnified
        ? `As the relative price of ${n.F} rises in ${v.rich}, the rental on capital changes ${v.dr} and land rent ${v.dw}, whichever good you measure them in. Factor prices move by more than goods prices (magnification), so unlike the specific factors model no group is ambiguous, and the effect lasts in the long run when land and capital can move.`
        : `As the relative price of ${n.F} rises in ${v.rich}, the rental rises and land rent falls in terms of both goods for as long as both goods are made (magnification). Here, though, ${v.rich} ends up making only ${n.F} (complete specialization), so the rental changes ${v.dr} and land rent ${v.dw}: once the world price leaves the range where both goods can be made, factor prices are set by one sector’s marginal products alone.`,
      formula: '',
    },
    {
      title: '⑥ Factor-price equalization and its limits',
      body: v.fpe
        ? `With trade both countries still make both goods with the same technology, so land rents and rentals become equal across them although no land or capital crosses a border: importing hides is like renting America’s land. In reality technology differences, transport costs and tariffs, and specialization when endowments differ a lot keep it from holding.`
        : `The land–capital ratios differ so much that ${v.only.length > 1 ? `${v.only.join(' and ')} each make` : `${v.only[0]} makes`} only one good. Then rents and rentals stay apart even with the same technology: the last of the three reasons the textbook gives for factor-price equalization failing (technology differences, trade costs, specialization).`,
      formula: '',
    },
  ],
  ryb: {
    ...HO_TEXT.en.ryb,
    title: '📦 Rybczynski: more capital relative to land',
    body: (n, c, f, atWorld) =>
      `${atWorld ? `Hold ${n}’s world price (P_C/P_F) and factor prices fixed and add capital.` : `Both countries make only one good at the world price (complete specialization), so this holds ${n}’s autarky price (P_C/P_F) and factor prices fixed instead and adds capital.`} Shrinking farmland lowers T/K the same way. The box is land wide and capital tall; ${c} inputs are measured from the bottom left, ${f} from the top right.`,
    reading: (dk, f, df, c, dc) => `With ${dk} more capital, ${f} output changes ${df} and ${c} output ${dc}. Land rent and the rental stay the same.`,
  },
}

export const HO_LAND_TEXT: Record<Lang, HoText> = { ko, en }

/** The leather case panel above the model: the real endowments it uses. */
export const LEATHER_HO_TEXT: Record<
  Lang,
  { real: (y: number) => string; capital: string; land: string; perHa: string; note: (sC: number, sF: number, gamma: number) => string; noData: string }
> = {
  ko: {
    real: (y) => `실제 데이터 (자본: Penn World Table, 경지: 세계은행, ${y}년)`,
    capital: '자본',
    land: '경지',
    perHa: '경지 1ha당 자본',
    note: (sC, sF, gamma) =>
      `두 나라의 자본과 경지 면적은 실제 값입니다. 자본 몫(원피 ${sC}, 자동차 ${sF})과 원피 지출 비중(γ ${gamma})은 원피가 토지집약재, 자동차가 자본집약재라는 점만 담은 예시값이라, 교역이익(%)·지대 같은 크기는 실제와 다릅니다. 노동은 이 장기 모형에서 뺐습니다.`,
    noData: '자본 또는 경지 자료가 없습니다.',
  },
  en: {
    real: (y) => `Real data (capital: Penn World Table, arable land: World Bank, ${y})`,
    capital: 'Capital',
    land: 'Arable land',
    perHa: 'Capital per hectare',
    note: (sC, sF, gamma) =>
      `Capital and arable land are the two countries’ real values. The capital shares (hides ${sC}, cars ${sF}) and the share of spending on hides (γ ${gamma}) are illustrative, capturing only that hides are land-intensive and cars capital-intensive, so magnitudes such as the gains (%) and rents are not real. Labor is left out of this long-run model.`,
    noData: 'Capital or arable land data is missing.',
  },
}
