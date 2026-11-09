import { useI18n, type Lang } from '../i18n'

type Note = 'partner' | 'world' | 'land'

const TEXT: Record<Lang, { button: string; loaded: string } & Record<Note, string>> = {
  ko: {
    button: '👜 가죽 사례 불러오기',
    loaded: '👜 가죽 사례 보는 중',
    partner:
      '원피(HS 41)와 자동차(HS 87), 상대국은 미국입니다. 원피는 소를 키울 땅이, 자동차는 자본이 많이 드는 재화입니다. 미국은 땅이 넓어 쇠고기 산업의 부산물인 원피를 많이 수출하고, 한국이 원피를 가장 많이 사 오는 나라(2023년 7,620만 달러)입니다. 한국은 거꾸로 미국에 자동차를 수출합니다.',
    world:
      '원피(HS 41)와 자동차(HS 87)입니다. 원피의 특정요소는 토지(목초지), 자동차의 특정요소는 자본(자동차 설비)이고, 노동은 두 산업 사이를 오갑니다. 특정요소 모형에는 상대국이 없어서, 한국과 세계의 실제 무역으로 가격이 움직이는 방향을 정합니다.',
    land:
      '원피(HS 41)와 자동차(HS 87), 상대국은 미국입니다. 장기에는 토지와 자본이 모두 두 산업 사이를 옮겨 다닌다고 보고, 노동 대신 토지를 두 번째 요소로 둔 헥셔–올린 모형으로 풉니다. 원피는 토지집약재, 자동차는 자본집약재입니다.',
  },
  en: {
    button: '👜 Load the leather case',
    loaded: '👜 Showing the leather case',
    partner:
      'Raw hides (HS 41) against cars (HS 87), with the United States. Hides need land to raise cattle on, cars need capital. With land to spare, the US exports many hides, a by-product of its beef industry, and is Korea’s largest source of them ($76.2M in 2023). Korea sells it cars in return.',
    world:
      'Raw hides (HS 41) against cars (HS 87). Land (pasture) is specific to hides and capital (car plants) to cars, while labor moves between them. The specific factors model has no partner, so Korea’s real trade with the world sets which way the price moves.',
    land:
      'Raw hides (HS 41) against cars (HS 87), with the United States. In the long run land and capital both move between the industries, so this runs the Heckscher–Ohlin model with land in place of labor: hides are land-intensive, cars capital-intensive.',
  },
}

/** A one-click loader for the leather case, shown at the top of a model tab. */
export function LeatherCase({ active, onLoad, note = 'partner' }: { active: boolean; onLoad: () => void; note?: Note }) {
  const { lang } = useI18n()
  const t = TEXT[lang]
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
      <button
        type="button"
        onClick={onLoad}
        disabled={active}
        aria-pressed={active}
        className={
          'shrink-0 rounded-lg px-3 py-1.5 font-semibold ' +
          (active ? 'bg-amber-200/70 dark:bg-amber-900/60' : 'bg-white shadow-sm hover:bg-amber-100 dark:bg-slate-900 dark:hover:bg-slate-800')
        }
      >
        {active ? t.loaded : t.button}
      </button>
      <p className="min-w-0 flex-1 text-xs leading-relaxed">{t[note]}</p>
    </div>
  )
}
