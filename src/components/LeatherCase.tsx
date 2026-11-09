import { useI18n, type Lang } from '../i18n'

const TEXT: Record<Lang, { button: string; loaded: string; partner: string; world: string }> = {
  ko: {
    button: '👜 가죽 사례 불러오기',
    loaded: '👜 가죽 사례 보는 중',
    partner:
      '원피·가죽(HS 41)과 반도체(HS 8542), 상대국은 미국입니다. 미국은 한국이 원피·가죽을 가장 많이 수입하는 나라(2023년 7,620만 달러)이고, 쇠고기 산업의 부산물인 소가죽을 많이 수출합니다.',
    world:
      '원피·가죽(HS 41)과 반도체(HS 8542)입니다. 특정요소 모형에는 상대국이 없어서, 한국과 세계의 실제 무역으로 가격이 움직이는 방향을 정합니다.',
  },
  en: {
    button: '👜 Load the leather case',
    loaded: '👜 Showing the leather case',
    partner:
      'Hides and leather (HS 41) against semiconductors (HS 8542), with the United States: Korea’s largest source of HS 41 imports ($76.2M in 2023) and a big exporter of cattle hides, a by-product of its beef industry.',
    world:
      'Hides and leather (HS 41) against semiconductors (HS 8542). The specific factors model has no partner, so Korea’s real trade with the world sets which way the price moves.',
  },
}

/** A one-click loader for the leather case, shown at the top of a model tab. */
export function LeatherCase({ active, onLoad, withPartner = true }: { active: boolean; onLoad: () => void; withPartner?: boolean }) {
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
      <p className="min-w-0 flex-1 text-xs leading-relaxed">{withPartner ? t.partner : t.world}</p>
    </div>
  )
}
