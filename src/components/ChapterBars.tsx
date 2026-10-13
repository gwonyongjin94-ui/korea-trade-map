import { chapterIcon, chapterName } from '../data/products'
import type { Flow } from '../data/trade'
import { money, percent } from '../format'
import { useI18n } from '../i18n'

interface Props {
  title: string
  lists: Record<Flow, [string, number][] | undefined>
  /** Shown instead of the bars, e.g. when a single product is selected. */
  notice?: { text: string; action?: { label: string; onClick: () => void } }
}

const SHOWN = 6

/** Largest HS chapters of exports and imports side by side, as shares of the flow. */
export function ChapterBars({ title, lists, notice }: Props) {
  const { t } = useI18n()
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 font-semibold">{title}</h3>
      {notice ? (
        <div className="grid min-h-48 place-items-center rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div>
            <p>{notice.text}</p>
            {notice.action && (
              <button
                type="button"
                onClick={notice.action.onClick}
                className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                {notice.action.label}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {(['X', 'M'] as const).map((flow) => (
            <Column key={flow} flow={flow} label={flow === 'X' ? t.exportsOf : t.importsOf} list={lists[flow]} />
          ))}
        </div>
      )}
    </div>
  )
}

function Column({ flow, label, list }: { flow: Flow; label: string; list: [string, number][] | undefined }) {
  const { t, lang } = useI18n()
  if (!list?.length) return <p className="text-sm text-slate-400">{t.chaptersMissing}</p>
  const total = list.reduce((s, [, v]) => s + v, 0)
  const top = list.filter(([code]) => code !== 'other').slice(0, SHOWN)
  const max = top[0]?.[1] ?? 1
  return (
    <div>
      <div className={'mb-2 text-xs font-semibold ' + (flow === 'X' ? 'text-a' : 'text-b')}>{label}</div>
      <ol className="space-y-2">
        {top.map(([code, v]) => (
          <li key={code}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="min-w-0 truncate" title={chapterName(code, lang, t.other)}>
                <span className="mr-1">{chapterIcon(code)}</span>
                {chapterName(code, lang, t.other)}
              </span>
              <span className="shrink-0 text-xs text-slate-500 tabular-nums dark:text-slate-400">{money(v, lang, { short: true })}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={'h-full rounded-full ' + (flow === 'X' ? 'bg-a' : 'bg-b')} style={{ width: `${(v / max) * 100}%` }} />
              </div>
              <span className="w-11 shrink-0 text-right text-xs text-slate-400 tabular-nums">{percent((v / total) * 100)}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
