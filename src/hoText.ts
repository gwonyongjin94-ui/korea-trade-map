import { josa, type Lang } from './i18n'

/** Countries A (home) and B (foreign), and goods C (labour-intensive) and F (capital-intensive). */
export interface Names {
  A: string
  B: string
  C: string
  F: string
}

const f1 = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%`

const ko = {
  tab: '🏗️ 헥셔–올린 모형',
  title: '🏗️ 헥셔–올린 모형: 요소 부존과 무역',
  subtitle:
    '두 나라의 기술과 취향은 같고, 가진 자본과 노동의 비율만 다릅니다. 자본과 노동 모두 산업 사이를 자유롭게 옮겨 다니는 장기에, 요소 부존의 차이만으로 무역이 생기고 소득분배가 바뀌는 과정을 따라가 봅니다.',
  source:
    'Krugman·Obstfeld·Melitz 『국제경제학』 5장 (2국 × 2재화 × 2요소). 생산함수와 효용함수는 콥–더글러스로 두고 계산했습니다. 1인당 자본은 Penn World Table 11.0 (FRED 재배포)입니다.',
  presets: { label: '예시', textbook: '교과서형: 의류와 식량', korea: '한국과 상대국 (실제 1인당 자본)' },
  textbookNote:
    '교과서와 같은 구조입니다. 의류는 노동집약재, 식량은 자본집약재(기계화된 농업)이고, 자국은 노동이 풍부하고 외국은 자본이 풍부합니다. 숫자는 설명용입니다.',
  home: '자국',
  foreign: '외국',
  textbookGoods: { C: '의류', F: '식량' },
  pick: {
    title: '🔧 한국과 상대국으로 풀어 보기',
    partner: '상대국',
    good1: '재화 1',
    good2: '재화 2',
    groups: { products: 'PBL 후보 품목', chapters: 'HS 2단위 류' },
    real: (y: number) => `실제 데이터 (Penn World Table, ${y}년)`,
    capital: '1인당 자본',
    workers: '취업자',
    kappa: '드러난 자본집약도',
    roles: (c: string, f: string) => `수출국들의 1인당 자본으로 따지면 ${josa(c, '이/가')} 노동집약재(C), ${josa(f, '이/가')} 자본집약재(F)입니다.`,
    note: '두 나라의 자본과 노동은 실제 값이고, 두 재화의 자본 몫(sC, sF)은 드러난 자본집약도의 비율에 맞추되 평균을 1/3로 둔 근사치입니다. 교역이익(%)·임금 같은 크기는 기술 차이를 무시한 모형의 값이라 실제와 다릅니다.',
    same: '두 재화의 자본집약도가 거의 같아 이 모형으로는 무역 방향을 가를 수 없습니다. 다른 재화를 골라 보세요.',
    noData: '이 나라는 Penn World Table 자료가 없습니다.',
  },
  setup: '경제 설정',
  endowments: (n: string) => `${n}의 부존량`,
  /** The endowment ratio shown next to each country's endowments. */
  ratio: 'K/L',
  capitalK: '자본 (K)',
  laborL: '노동 (L)',
  shares: '기술과 취향 (두 나라 공통)',
  sC: (c: string) => `${c} 생산에서 자본 몫 (sC)`,
  sF: (f: string) => `${f} 생산에서 자본 몫 (sF)`,
  gamma: (c: string) => `소득 중 ${c}에 쓰는 비중 (γ)`,
  reset: '처음 값으로',
  headline: {
    exports: (country: string) => `${country}의 수출품`,
    price: '세계 상대가격 P_C/P_F',
    gain: (a: string, b: string) => `교역이익 (${a} / ${b})`,
    autarky: (a: string, b: string) => `자급자족 ${a} / ${b}`,
    fpe: '요소가격 균등화',
    fpeYes: '성립',
    fpeNo: '불성립',
    fpeWhy: (who: string[]) => `${who.join('·')} 완전특화`,
  },
  factorChart: '재화가격 → 요소가격 → 요소 투입 비율',
  factorChartNote: (c: string) =>
    `가운데 세로축이 임금–임대료 비율(w/r)입니다. 왼쪽 SS 곡선은 ${c} 상대가격(왼쪽으로 갈수록 높음)과 w/r의 일대일 관계, 오른쪽 CC·FF 곡선은 w/r에 따라 각 산업이 고르는 노동–자본 비율(L/K)입니다. 점선은 각 나라 전체의 L/K입니다.`,
  axisPrice: (c: string) => `← ${c} 상대가격 P_C/P_F`,
  axisLK: '노동–자본 비율 L/K →',
  axisOmega: '임금–임대료 비율 w/r',
  ss: 'SS',
  cc: (c: string) => `CC (${c})`,
  ff: (f: string) => `FF (${f})`,
  autarkyOf: (n: string) => `${n} 자급자족`,
  tradeOf: (n: string) => `${n} 무역 후`,
  endowmentOf: (n: string) => `${n} 전체 L/K`,
  rsrd: '세계 상대공급과 상대수요',
  rsrdNote: (c: string, f: string) =>
    `가로축은 ${c} 생산량 ÷ ${f} 생산량, 세로축은 ${c} 상대가격입니다. 각 나라의 상대공급(RS)이 상대수요(RD)와 만나는 곳이 자급자족 가격이고, 무역 후에는 세계 전체의 RS가 RD와 만나는 곳에서 가격이 정해집니다.`,
  rs: (n: string) => `RS ${n}`,
  rsWorld: 'RS 세계',
  rd: 'RD',
  ppf: (n: string) => `${n}의 생산가능곡선`,
  ppfLegend: { autarky: '① 자급자족 (생산 = 소비)', production: '② 무역 후 생산', consumption: '③ 무역 후 소비', budget: '예산선 (기울기 = −세계 상대가격)' },
  output: (g: string) => `${g} 생산량`,
  exports: (g: string) => `${g} 수출`,
  imports: (g: string) => `${g} 수입`,
  distTitle: '무역으로 누가 이득을 보나 (스톨퍼–사뮤엘슨)',
  distSummary: (n: Names, capRichA: boolean, gainA: number, gainB: number, odd: string[]) => {
    const rich = capRichA ? n.A : n.B
    const poor = capRichA ? n.B : n.A
    const caveat = odd.length
      ? ` 다만 지금은 완전특화가 일어나 ${odd.join(', ')}의 결과가 교과서와 다릅니다. 한 재화만 만들면 요소가격이 그 산업의 한계생산으로만 정해져 확대 효과가 성립하지 않습니다.`
      : ''
    return `자본이 풍부한 ${josa(rich, '은/는')} ${josa(n.F, '을/를')}, 노동이 풍부한 ${josa(poor, '은/는')} ${josa(n.C, '을/를')} 수출합니다. 스톨퍼–사뮤엘슨 정리대로라면 ${rich}에서는 자본 소유자가, ${poor}에서는 노동자가 두 재화 어느 것으로 따져도 이득을 보고, 각 나라의 희소한 요소는 손해를 봅니다.${caveat} 나라 전체의 효용은 ${n.A} ${f1(gainA)}, ${n.B} ${f1(gainB)} 늘어납니다.`
  },
  noTrade: '두 나라의 노동–자본 비율이 같으면 자급자족 가격이 같아 무역이 일어나지 않습니다.',
  groups: { labor: (n: string) => `👷 ${n} 노동자`, capital: (n: string) => `🏦 ${n} 자본 소유자` },
  stepsTitle: '단계별 해설',
  steps: (
    n: Names,
    v: { lkC: string; lkF: string; kA: string; kB: string; paA: string; paB: string; pw: string; rich: string; poor: string; dr: string; dw: string; magnified: boolean; fpe: boolean; only: string[] },
  ) => [
    {
      title: '① 노동집약재와 자본집약재',
      body: `기업은 임금(w)과 자본 임대료(r)를 보고 노동과 자본을 섞는 비율을 정합니다. 노동이 비싸지면 두 산업 모두 자본을 더 씁니다. 그래도 같은 w/r에서 ${josa(n.C, '은/는')} 언제나 ${n.F}보다 노동을 더 많이 씁니다. 지금 세계 가격에서 노동–자본 비율은 ${n.C} ${v.lkC}, ${n.F} ${v.lkF}입니다.`,
      formula: 'K/L = s / (1 − s) × w / r',
    },
    {
      title: '② 재화가격이 요소가격을 정한다',
      body: `두 재화를 모두 만드는 한, 각 재화의 가격은 생산비(임금과 임대료의 가중합)와 같아야 합니다. 그래서 ${n.C} 상대가격 하나가 w/r 하나를 정합니다. 노동을 많이 쓰는 ${n.C}의 가격이 오르면 노동 수요가 늘어 w/r이 오릅니다(SS 곡선).`,
      formula: 'P_C / P_F = 비용_C(w, r) / 비용_F(w, r)',
    },
    {
      title: '③ 부존량이 생산을 정한다 (립진스키)',
      body: `가격이 그대로일 때 자본만 늘면, 늘어난 자본을 쓰려고 노동과 자본이 함께 자본집약재 ${n.F} 쪽으로 옮겨 갑니다. 그래서 ${n.F} 생산은 자본보다 더 큰 비율로 늘고 ${n.C} 생산은 오히려 줄어듭니다. 자본이 풍부한 나라의 생산가능곡선이 ${n.F} 쪽으로 치우친 이유입니다.`,
      formula: '',
    },
    {
      title: '④ 풍부한 요소를 집약적으로 쓰는 재화를 수출한다',
      body: `1인당 자본은 ${n.A} ${v.kA}, ${n.B} ${v.kB}입니다. 자급자족 때 ${n.C} 상대가격은 ${n.A} ${v.paA}, ${n.B} ${v.paB}라서, 자본이 풍부한 ${v.rich}에서는 ${josa(n.F, '이/가')} 상대적으로 쌉니다. 무역을 하면 가격이 ${v.pw}로 모이고, ${josa(v.rich, '은/는')} ${josa(n.F, '을/를')}, ${josa(v.poor, '은/는')} ${josa(n.C, '을/를')} 수출합니다 (헥셔–올린 정리).`,
      formula: 'K_A / L_A > K_B / L_B  ⇒  A는 F 수출',
    },
    {
      title: '⑤ 풍부한 요소는 이득, 희소한 요소는 손해 (스톨퍼–사뮤엘슨)',
      body: v.magnified
        ? `${v.rich}에서 ${n.F}의 상대가격이 오르면 자본 임대료는 두 재화 어느 것으로 따져도 ${v.dr}, 임금은 ${v.dw} 바뀝니다. 가격 변화보다 요소가격 변화가 더 커서(확대 효과), 특정요소 모형과 달리 "불분명"한 집단이 없습니다. 자본이 장기에 산업 사이를 옮겨 가도 소득분배 효과는 사라지지 않습니다.`
        : `${v.rich}에서 ${n.F}의 상대가격이 오르면, 두 재화를 계속 만드는 한 자본 임대료는 두 재화 어느 것으로 따져도 오르고 임금은 내립니다(확대 효과). 그런데 지금은 ${josa(v.rich, '이/가')} ${n.F}만 만들게 되어(완전특화) 임대료는 ${v.dr}, 임금은 ${v.dw} 바뀝니다. 세계 가격이 두 재화를 모두 만들 수 있는 범위를 벗어나면 요소가격은 한 산업의 한계생산으로만 정해지기 때문입니다.`,
      formula: '',
    },
    {
      title: '⑥ 요소가격 균등화와 그 한계',
      body: v.fpe
        ? `무역 후 두 나라 모두 두 재화를 만들고 기술이 같으므로, 노동과 자본이 국경을 넘지 않아도 임금과 임대료가 두 나라에서 같아집니다. 재화 무역이 요소 이동을 대신하는 셈입니다. 현실에서는 기술 차이, 운송비·관세, 그리고 부존량 차이가 커서 생기는 완전특화 때문에 성립하지 않습니다.`
        : `두 나라의 노동–자본 비율 차이가 너무 커서 ${josa(v.only.join('·'), '이/가')} ${v.only.length > 1 ? '각각 ' : ''}한 재화만 만듭니다(완전특화). 이때는 같은 기술이어도 임금과 임대료가 같아지지 않습니다. 교과서가 꼽는 요소가격 균등화가 실패하는 세 이유(기술 차이, 운송비·관세, 완전특화) 중 마지막 경우입니다.`,
      formula: '',
    },
  ],
  ryb: {
    title: '📦 립진스키 효과: 자본이 늘면 무엇이 늘어나나',
    body: (n: string, c: string, f: string, atWorld: boolean) =>
      `${atWorld ? `${n}의 세계 가격` : `세계 가격에서는 두 나라 모두 한 재화만 만들기 때문에(완전특화), 대신 ${n}의 자급자족 가격`}(P_C/P_F)과 요소가격을 그대로 두고 자본만 늘려 봅니다. 상자의 가로는 노동, 세로는 자본이고, 왼쪽 아래에서 ${c}, 오른쪽 위에서 ${f} 투입을 잽니다.`,
    slider: '자본 증가',
    before: '증가 전',
    after: '증가 후',
    originC: (c: string) => `${c} 원점`,
    originF: (f: string) => `${f} 원점`,
    reading: (dk: string, f: string, df: string, c: string, dc: string) =>
      `자본이 ${dk} 늘면 ${f} 생산은 ${df}, ${c} 생산은 ${dc} 바뀝니다. 임금과 임대료는 그대로입니다.`,
    exits: (f: string) => `자본이 이만큼 늘면 가격이 그대로여도 이 나라는 ${f}만 만들게 됩니다(완전특화). 그보다 적게 늘려 보세요.`,
  },
  endow: {
    title: '🇰🇷 한국은 자본이 풍부한 나라일까',
    body: '헥셔–올린 모형의 출발점은 요소 부존입니다. Penn World Table의 자본스톡(2021년 PPP 달러)을 취업자 수로 나눈 1인당 자본으로 한국과 주요 교역국을 비교합니다.',
    rank: (r: number, n: number) => `한국 ${n}개국 중 ${r}위`,
    korea: '한국',
    growth: (y0: number, y1: number, k: string, l: string) => `${y0}→${y1}년 한국 자본 ${k}, 취업자 ${l}`,
    reading: (k: string, below: string, similar: string, above: string) =>
      `한국의 1인당 자본(${k})은 ${below} 같은 개도국보다 몇 배 많고, ${similar} 등과는 20% 안쪽으로 비슷합니다.${above ? ` 한국보다 많은 나라는 ${above} 등입니다.` : ''} 모형으로 보면 한국은 개도국에 대해서는 확실히 자본이 풍부한 나라이고, 선진국과는 부존 차이가 작습니다. 자본이 취업자보다 훨씬 빨리 늘어 온 것은 립진스키 효과대로 자본집약 산업이 커지는 방향입니다.`,
    caution:
      'PWT 자본스톡에는 공장·기계뿐 아니라 주거용 건물도 들어 있어, 집이 많고 고용률이 낮은 유럽 나라들이 높게 나옵니다. 우크라이나처럼 옛 소련 시절 설비가 크게 잡히는 나라도 있습니다. 숙련(인적자본)은 들어 있지 않습니다. 아랍에미리트와 마셜제도는 자료가 없습니다.',
  },
  intensity: {
    title: '📊 한국의 수출은 수입보다 자본집약적일까 (레온티에프식 검증)',
    body: '각 재화의 자본집약도를 "그 재화를 수출하는 나라들의 1인당 자본 평균"으로 잽니다(수출 비중으로 가중, 한국은 계산에서 뺌). 자본이 풍부한 한국이라면 수출품이 수입품보다 자본집약적이어야 합니다. 레온티에프는 1947년 미국 자료에서 반대 결과(레온티에프 역설)를 얻었습니다.',
    scope: { all: '전체 재화', manufactures: '제조업만 (HS 28–96, 71 제외)' },
    exports: '수출품의 자본집약도',
    imports: '수입품의 자본집약도',
    ratio: '수출 ÷ 수입',
    perWorker: '노동자 1인당 자본',
    x: '자본집약도 (수출국 1인당 자본 평균, 천 달러)',
    y: '한국의 수출 ÷ 수입 (HS 2단위 류)',
    net: '순수출 류',
    netImport: '순수입 류',
    line: '회귀선',
    stats: { slope: '탄력성', r: '상관계수 r', n: '류 수' },
    sig: (se: string, sig: boolean) => `표준오차 ${se}${sig ? ' · 5% 유의' : ' · 유의하지 않음'}`,
    reading: (year: number, ex: string, im: string, gap: string, slope: string, sig: boolean, scope: 'all' | 'manufactures') =>
      `${year}년 한국 수출품의 자본집약도는 ${ex}, 수입품은 ${im}입니다. 수출 쪽이 ${gap} 높아 레온티에프 역설은 나타나지 않고 방향은 헥셔–올린 모형과 맞지만, 차이는 작습니다. 류별로 보면 자본집약도가 1% 높은 류일수록 수출/수입 비율이 약 ${slope}% 높고, ${sig ? '이 관계는 5% 수준에서 유의합니다' : '이 관계는 통계적으로 유의하지 않습니다'}.${scope === 'all' ? ' 제조업만 보면 차이가 어떻게 바뀌는지 위에서 바꿔 보세요.' : ' 전체 재화에서 보이던 차이의 상당 부분은 원유·광물·농산물 수입에서 나옵니다.'}`,
    tooltip: (k: string, x: string, m: string) => [`자본집약도 ${k}`, `수출 ${x}`, `수입 ${m}`],
    note: '자본집약도는 2023년(거의 모든 수출국이 보고한 최근 연도) 수출 구조로 고정하고, 무역액만 선택한 연도의 것을 씁니다.',
  },
  partners: {
    title: '🌏 상대국별로 확인하기',
    body: (year: number) =>
      `${year}년 한국과 각 상대국의 HS 2단위 무역으로 확인합니다. 한국보다 1인당 자본이 적은 나라에는 자본집약적인 물건을 더 팔고, 많은 나라에는 덜 팔아야 합니다. 자본집약도는 한국과 그 상대국을 모두 빼고 계산합니다.`,
    x: '상대국 1인당 자본 ÷ 한국 1인당 자본',
    y: '한국 수출품 ÷ 수입품의 자본집약도',
    match: '예측과 맞음',
    miss: '예측과 다름',
    same: '한국과 같은 1인당 자본',
    equal: '수출·수입 자본집약도가 같은 선',
    stats: {
      all: '전체',
      labor: (s: string) => `노동 풍부국 (한국의 ${s} 미만)`,
      others: '나머지',
    },
    reading: (hits: number, n: number, lh: number, ln: number, good: string, bad: string) =>
      `예측이 맞은 나라는 ${n}개국 중 ${hits}개국뿐입니다. 1인당 자본이 한국보다 훨씬 적은 노동 풍부국에서는 ${ln}개국 중 ${lh}개국이 맞아(${good} 등), 한국이 자본집약적인 물건을 팔고 노동집약적인 물건을 삽니다. 그러나 부존이 비슷한 선진국(${bad} 등)과는 거의 맞지 않습니다. 한국은 이 나라들에서 오히려 더 자본집약적인 물건을 사 옵니다.`,
    why: '교과서가 소개하는 실증 연구와 같은 모습입니다. 엄격한 헥셔–올린 검증은 잘 맞지 않고(보웬·리머·스베이카우스카스, 데이비스·와인스타인), 나라마다 기술 수준이 다르다는 점을 넣으면 크게 나아집니다(트레플러). 부존 차이가 큰 남북 무역은 이 모형이 잘 설명하고, 비슷한 나라끼리의 무역은 산업내 무역(이론 분석 탭의 그루벨–로이드 지수)과 규모의 경제 모형(7·8장)이 더 잘 설명합니다.',
    tooltip: (k: string, ex: string, im: string, ok: boolean) => [`1인당 자본 ${k}`, `수출품 ${ex} · 수입품 ${im}`, ok ? '✅ 예측과 맞음' : '❌ 예측과 다름'],
    cautions: [
      'HS 2단위 류는 넓은 묶음이라, 같은 "전기전자(85)"에도 자본집약적인 반도체와 노동집약적인 조립품이 섞여 있습니다.',
      '자본집약도는 수출국들의 부존으로 잰 간접 지표이고, 각 산업이 실제로 쓰는 자본과는 다를 수 있습니다. 1인당 자본에는 숙련 노동과 기술 차이가 반영되지 않습니다.',
      '원유·광물처럼 토지·자원이 결정하는 재화는 노동과 자본 두 요소만 있는 이 모형의 범위 밖입니다.',
    ],
  },
}

export type HoText = typeof ko

const en: HoText = {
  tab: '🏗️ Heckscher–Ohlin',
  title: '🏗️ Heckscher–Ohlin: resources and trade',
  subtitle:
    'Two countries share technology and tastes and differ only in how much capital they have per worker. With both capital and labor free to move between industries, follow how that difference alone creates trade and shifts the distribution of income.',
  source:
    'Krugman, Obstfeld & Melitz, International Economics, ch. 5 (2 countries × 2 goods × 2 factors). Computed with Cobb–Douglas technology and preferences. Capital per worker from Penn World Table 11.0 (via FRED).',
  presets: { label: 'Examples', textbook: 'Textbook: cloth and food', korea: 'Korea and a partner (real capital per worker)' },
  textbookNote:
    'The textbook’s setup: cloth is labor-intensive, food capital-intensive (mechanised farming), Home is labor-abundant and Foreign capital-abundant. Numbers are illustrative.',
  home: 'Home',
  foreign: 'Foreign',
  textbookGoods: { C: 'cloth', F: 'food' },
  pick: {
    title: '🔧 Solve it for Korea and a partner',
    partner: 'Partner',
    good1: 'Good 1',
    good2: 'Good 2',
    groups: { products: 'PBL candidate products', chapters: 'HS 2-digit chapters' },
    real: (y) => `Real data (Penn World Table, ${y})`,
    capital: 'Capital per worker',
    workers: 'Workers',
    kappa: 'Revealed capital intensity',
    roles: (c, f) => `Judged by its exporters’ capital per worker, ${c} is the labor-intensive good (C) and ${f} the capital-intensive one (F).`,
    note: 'Capital and labor are the two countries’ real values; the capital shares (sC, sF) follow the ratio of the goods’ revealed capital intensities around an average of 1/3, an approximation. Magnitudes such as the gains (%) and wages ignore technology differences and are not real.',
    same: 'The two goods have almost the same capital intensity, so the model can’t tell which way trade goes. Pick other goods.',
    noData: 'No Penn World Table data for this country.',
  },
  setup: 'Economy',
  endowments: (n) => `${n}’s endowments`,
  ratio: 'K/L',
  capitalK: 'Capital (K)',
  laborL: 'Labor (L)',
  shares: 'Technology and tastes (shared)',
  sC: (c) => `Capital’s share of ${c} output (sC)`,
  sF: (f) => `Capital’s share of ${f} output (sF)`,
  gamma: (c) => `Share of income spent on ${c} (γ)`,
  reset: 'Reset',
  headline: {
    exports: (country) => `${country} exports`,
    price: 'World relative price P_C/P_F',
    gain: (a, b) => `Gains from trade (${a} / ${b})`,
    autarky: (a, b) => `Autarky ${a} / ${b}`,
    fpe: 'Factor-price equalization',
    fpeYes: 'Holds',
    fpeNo: 'Fails',
    fpeWhy: (who) => (who.length > 1 ? `${who.join(' and ')} specialize` : `${who[0]} specializes`),
  },
  factorChart: 'Goods prices → factor prices → input choices',
  factorChartNote: (c) =>
    `The middle axis is the wage–rental ratio w/r. On the left, the SS curve links it one-to-one to the relative price of ${c} (rising to the left); on the right, CC and FF show the labor–capital ratio L/K each industry picks at each w/r. Dashed lines mark each country’s overall L/K.`,
  axisPrice: (c) => `← Relative price of ${c}, P_C/P_F`,
  axisLK: 'Labor–capital ratio L/K →',
  axisOmega: 'Wage–rental ratio w/r',
  ss: 'SS',
  cc: (c) => `CC (${c})`,
  ff: (f) => `FF (${f})`,
  autarkyOf: (n) => `${n} autarky`,
  tradeOf: (n) => `${n} with trade`,
  endowmentOf: (n) => `${n} overall L/K`,
  rsrd: 'World relative supply and demand',
  rsrdNote: (c, f) =>
    `Horizontal: output of ${c} ÷ output of ${f}; vertical: the relative price of ${c}. Where each country’s relative supply (RS) meets relative demand (RD) is its autarky price; with trade the price is where world RS meets RD.`,
  rs: (n) => `RS ${n}`,
  rsWorld: 'RS world',
  rd: 'RD',
  ppf: (n) => `${n}’s production possibilities`,
  ppfLegend: { autarky: '① Autarky (production = consumption)', production: '② Production with trade', consumption: '③ Consumption with trade', budget: 'Budget line (slope = −world relative price)' },
  output: (g) => `${g} output`,
  exports: (g) => `${g} exports`,
  imports: (g) => `${g} imports`,
  distTitle: 'Who gains from trade (Stolper–Samuelson)',
  distSummary: (n, capRichA, gainA, gainB, odd) => {
    const rich = capRichA ? n.A : n.B
    const poor = capRichA ? n.B : n.A
    const caveat = odd.length
      ? ` Here, though, complete specialization makes the result differ for ${odd.join(', ')}: when a country makes only one good, factor prices are set by that sector’s marginal products alone and the magnification effect no longer holds.`
      : ''
    return `Capital-abundant ${rich} exports ${n.F} and labor-abundant ${poor} exports ${n.C}. By the Stolper–Samuelson theorem, capital owners in ${rich} and workers in ${poor} gain in terms of both goods, while each country’s scarce factor loses.${caveat} Utility for each country as a whole rises: ${n.A} ${f1(gainA)}, ${n.B} ${f1(gainB)}.`
  },
  noTrade: 'With the same labor–capital ratio the autarky prices are equal, so there is no trade.',
  groups: { labor: (n) => `👷 Workers in ${n}`, capital: (n) => `🏦 Capital owners in ${n}` },
  stepsTitle: 'Step by step',
  steps: (n, v) => [
    {
      title: '① Labor-intensive and capital-intensive goods',
      body: `Firms choose how to combine labor and capital given the wage (w) and the rental (r). When labor gets dearer both industries use more capital, but at any w/r ${n.C} uses more labor than ${n.F}. At the world price the labor–capital ratios are ${v.lkC} in ${n.C} and ${v.lkF} in ${n.F}.`,
      formula: 'K/L = s / (1 − s) × w / r',
    },
    {
      title: '② Goods prices set factor prices',
      body: `As long as both goods are made, each price must equal its unit cost (a weighted mix of wage and rental), so one relative price of ${n.C} pins down one w/r. If the price of labor-intensive ${n.C} rises, demand for labor rises and so does w/r (the SS curve).`,
      formula: 'P_C / P_F = cost_C(w, r) / cost_F(w, r)',
    },
    {
      title: '③ Resources set output (Rybczynski)',
      body: `At unchanged prices, extra capital is put to work by moving labor and capital together into capital-intensive ${n.F}. ${n.F} output grows by more than the capital did and ${n.C} output actually falls. That is why a capital-abundant country’s frontier is skewed towards ${n.F}.`,
      formula: '',
    },
    {
      title: '④ Countries export the good that uses their abundant factor intensively',
      body: `Capital per worker is ${v.kA} in ${n.A} and ${v.kB} in ${n.B}. In autarky the relative price of ${n.C} is ${v.paA} in ${n.A} and ${v.paB} in ${n.B}, so ${n.F} is relatively cheap in capital-abundant ${v.rich}. With trade the price converges to ${v.pw}, ${v.rich} exports ${n.F} and ${v.poor} exports ${n.C} (the Heckscher–Ohlin theorem).`,
      formula: 'K_A / L_A > K_B / L_B  ⇒  A exports F',
    },
    {
      title: '⑤ The abundant factor gains, the scarce one loses (Stolper–Samuelson)',
      body: v.magnified
        ? `As the relative price of ${n.F} rises in ${v.rich}, the rental changes ${v.dr} and the wage ${v.dw}, whichever good you measure them in. Factor prices move by more than goods prices (magnification), so unlike the specific factors model no group is ambiguous, and the effect lasts in the long run when capital can move.`
        : `As the relative price of ${n.F} rises in ${v.rich}, the rental rises and the wage falls in terms of both goods for as long as both goods are made (magnification). Here, though, ${v.rich} ends up making only ${n.F} (complete specialization), so the rental changes ${v.dr} and the wage ${v.dw}: once the world price leaves the range where both goods can be made, factor prices are set by one sector’s marginal products alone.`,
      formula: '',
    },
    {
      title: '⑥ Factor-price equalization and its limits',
      body: v.fpe
        ? `With trade both countries still make both goods with the same technology, so wages and rentals become equal across them although no factor crosses a border: trade in goods stands in for trade in factors. In reality technology differences, transport costs and tariffs, and specialization when endowments differ a lot keep it from holding.`
        : `The labor–capital ratios differ so much that ${v.only.length > 1 ? `${v.only.join(' and ')} each make` : `${v.only[0]} makes`} only one good. Then wages and rentals stay apart even with the same technology: the last of the three reasons the textbook gives for factor-price equalization failing (technology differences, trade costs, specialization).`,
      formula: '',
    },
  ],
  ryb: {
    title: '📦 The Rybczynski effect: what grows when capital grows',
    body: (n, c, f, atWorld) =>
      `${atWorld ? `Hold ${n}’s world price (P_C/P_F) and factor prices fixed and add capital.` : `Both countries make only one good at the world price (complete specialization), so this holds ${n}’s autarky price (P_C/P_F) and factor prices fixed instead and adds capital.`} The box is labor wide and capital tall; ${c} inputs are measured from the bottom left, ${f} from the top right.`,
    slider: 'Capital increase',
    before: 'Before',
    after: 'After',
    originC: (c) => `${c} origin`,
    originF: (f) => `${f} origin`,
    reading: (dk, f, df, c, dc) => `With capital up ${dk}, ${f} output changes ${df} and ${c} output ${dc}. Wages and rentals do not change.`,
    exits: (f) => `With this much more capital the country would make only ${f} at these prices (complete specialization). Try a smaller increase.`,
  },
  endow: {
    title: '🇰🇷 Is Korea capital-abundant?',
    body: 'The model starts from endowments. Capital per worker, the Penn World Table capital stock (2021 PPP dollars) divided by employment, for Korea and its main partners.',
    rank: (r, n) => `Korea ranks ${r} of ${n}`,
    korea: 'Korea',
    growth: (y0, y1, k, l) => `${y0}→${y1}: Korea’s capital ${k}, workers ${l}`,
    reading: (k, below, similar, above) =>
      `Korea’s capital per worker (${k}) is several times that of developing partners such as ${below}, and within 20% of ${similar} and others.${above ? ` Countries with more include ${above}.` : ''} In the model Korea is clearly capital-abundant relative to developing countries, with small differences against advanced ones. Capital growing much faster than employment points, as Rybczynski predicts, towards growing capital-intensive industries.`,
    caution:
      'PWT capital stocks include housing as well as plants and machinery, so European countries with lots of housing and low employment rates rank high; some, like Ukraine, carry large Soviet-era stocks. Skills (human capital) are not included. The UAE and the Marshall Islands have no data.',
  },
  intensity: {
    title: '📊 Are Korea’s exports more capital-intensive than its imports? (a Leontief-style test)',
    body: 'Each good’s capital intensity is measured as the average capital per worker of the countries that export it, weighted by its share of their exports (Korea left out). A capital-abundant Korea should export goods more capital-intensive than those it imports. Leontief found the opposite for the US in 1947 (the Leontief paradox).',
    scope: { all: 'All goods', manufactures: 'Manufactures only (HS 28–96 without 71)' },
    exports: 'Capital intensity of exports',
    imports: 'Capital intensity of imports',
    ratio: 'Exports ÷ imports',
    perWorker: 'capital per worker',
    x: 'Capital intensity (exporters’ capital per worker, USD thousands)',
    y: 'Korea’s exports ÷ imports (HS 2-digit chapters)',
    net: 'Net export chapter',
    netImport: 'Net import chapter',
    line: 'Fitted line',
    stats: { slope: 'Elasticity', r: 'Correlation r', n: 'Chapters' },
    sig: (se, sig) => `s.e. ${se}${sig ? ' · significant at 5%' : ' · not significant'}`,
    reading: (year, ex, im, gap, slope, sig, scope) =>
      `In ${year} Korea’s exports had a capital intensity of ${ex} against ${im} for imports, ${gap} higher. There is no Leontief paradox and the direction fits Heckscher–Ohlin, but the gap is small. Across chapters, 1% more capital intensity goes with an export/import ratio about ${slope}% higher, ${sig ? 'significant at the 5% level' : 'which is not statistically significant'}.${scope === 'all' ? ' Switch to manufactures only above to see how the gap changes.' : ' Much of the gap seen across all goods comes from imports of crude oil, minerals and farm goods.'}`,
    tooltip: (k, x, m) => [`Capital intensity ${k}`, `Exports ${x}`, `Imports ${m}`],
    note: 'Capital intensities are fixed at 2023, the latest year nearly every exporter has reported; trade values are the chosen year’s.',
  },
  partners: {
    title: '🌏 Partner by partner',
    body: (year) =>
      `Checked against Korea’s HS 2-digit trade with each partner in ${year}. Korea should sell more capital-intensive goods to partners with less capital per worker than Korea, and less to those with more. Capital intensities leave out both Korea and the partner.`,
    x: 'Partner’s capital per worker ÷ Korea’s',
    y: 'Capital intensity of Korea’s exports ÷ imports',
    match: 'Fits the prediction',
    miss: 'Does not fit',
    same: 'Same capital per worker as Korea',
    equal: 'Exports and imports equally capital-intensive',
    stats: {
      all: 'All',
      labor: (s) => `Labor-abundant (below ${s} of Korea)`,
      others: 'Others',
    },
    reading: (hits, n, lh, ln, good, bad) =>
      `The prediction holds for only ${hits} of ${n} partners. For labor-abundant partners with far less capital per worker it holds for ${lh} of ${ln} (${good} and others): Korea sells them capital-intensive goods and buys labor-intensive ones. With similarly endowed advanced economies (${bad} and others) it hardly works: Korea buys more capital-intensive goods from them.`,
    why: 'This matches the evidence in the textbook: strict Heckscher–Ohlin tests do poorly (Bowen, Leamer & Sveikauskas; Davis & Weinstein) and improve a lot once countries’ technologies are allowed to differ (Trefler). The model explains North–South trade between very different countries well; trade between similar countries is better explained by intra-industry trade (the Grubel–Lloyd index in the theory tab) and economies of scale (chs. 7–8).',
    tooltip: (k, ex, im, ok) => [`Capital per worker ${k}`, `Exports ${ex} · imports ${im}`, ok ? '✅ Fits the prediction' : '❌ Does not fit'],
    cautions: [
      'HS 2-digit chapters are broad: "electronics (85)" mixes capital-intensive chips with labor-intensive assembly.',
      'Capital intensity is an indirect measure, from exporters’ endowments, and may differ from the capital each industry actually uses. Capital per worker leaves out skills and technology differences.',
      'Goods such as crude oil and minerals depend on land and resources, outside this two-factor model.',
    ],
  },
}

export const HO_TEXT: Record<Lang, HoText> = { ko, en }
