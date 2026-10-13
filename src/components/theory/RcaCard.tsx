import { chapterIcon, chapterName, PRODUCTS } from '../../data/products'
import { DATA } from '../../data/trade'
import { percent } from '../../format'
import { useI18n } from '../../i18n'
import { rcaOf, rcaYear } from '../../theory'
import { THEORY_TEXT } from '../../theoryText'
import { TheoryCard } from './TheoryCard'

interface Props {
  product: string
  year: number
  onProduct: (id: string) => void
}

interface Row {
  code: string
  label: string
  rca: number
  share: number
  before: number | null
}

export function RcaCard({ product, year, onProduct }: Props) {
  const { lang, t } = useI18n()
  const c = THEORY_TEXT[lang].rca
  const shown = rcaYear(year)
  const rca = DATA.rca
  if (!rca || shown === null) {
    return (
      <TheoryCard title={c.title} question={c.question} formula={c.formula} reading={[]} cautions={c.cautions}>
        <p className="py-10 text-center text-sm text-slate-400">{THEORY_TEXT[lang].noData}</p>
      </TheoryCard>
    )
  }
  const first = rca.years[0]
  const productCodes = new Set(PRODUCTS.map((p) => p.id))

  const row = (code: string, label: string): Row | null => {
    const now = rcaOf(code, shown)
    if (!now) return null
    return { code, label, rca: now.rca, share: now.share, before: shown === first ? null : (rcaOf(code, first)?.rca ?? null) }
  }
  const chapters = Object.keys(rca.byYear[shown] ?? {})
    .filter((code) => code.length === 2)
    .map((code) => row(code, `${chapterIcon(code)} ${chapterName(code, lang, t.other)}`))
    .filter((r) => r !== null)
    .sort((a, b) => b.rca - a.rca)
  const products = PRODUCTS.filter((p) => p.id !== 'TOTAL' && productCodes.has(p.id))
    .map((p) => row(p.id, `${p.icon} ${p.name[lang]}`))
    .filter((r) => r !== null)
    .sort((a, b) => b.rca - a.rca)

  // Log scale centred on RCA = 1, symmetric so 0.5 and 2 sit the same distance from the middle.
  const values = [...chapters, ...products].flatMap((r) => [r.rca, r.before ?? 1]).filter((v) => v > 0)
  const span = Math.max(Math.log(4), ...values.map((v) => Math.abs(Math.log(v))))
  const strip = (label: string) => label.replace(/^\S+\s/, '')
  const top = chapters
    .slice(0, 3)
    .map((r) => `${strip(r.label)}${lang === 'ko' ? '' : ' '}(${r.rca.toFixed(1)})`)
    .join(', ')
  const riser = [...chapters].filter((r) => r.before != null).sort((a, b) => b.rca - b.before! - (a.rca - a.before!))[0]
  const reading = [
    c.reading(top, riser && riser.rca - riser.before! > 0.1 ? c.rose(strip(riser.label), riser.before!.toFixed(2), riser.rca.toFixed(2), first) : ''),
    c.ricardo,
  ]

  return (
    <TheoryCard title={c.title} question={c.question} formula={c.formula} note={c.scaleNote} reading={reading} cautions={c.cautions}>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold">{c.basis(shown, year)}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">{c.world(rca.reporters, percent((rca.share[shown] ?? 0) * 100))}</span>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        <Bars title={c.chapters} rows={chapters} span={span} sinceLabel={shown === first ? null : c.since(first)} />
        <Bars title={c.products} rows={products} span={span} sinceLabel={shown === first ? null : c.since(first)} highlight={product} onPick={onProduct} />
      </div>
    </TheoryCard>
  )
}

function Bars({
  title,
  rows,
  span,
  sinceLabel,
  highlight,
  onPick,
}: {
  title: string
  rows: Row[]
  /** Largest |ln RCA| shown; it maps to the ends of the track. */
  span: number
  sinceLabel: string | null
  highlight?: string
  onPick?: (code: string) => void
}) {
  const { lang } = useI18n()
  const c = THEORY_TEXT[lang].rca
  /** Position in % of the track: 50% is RCA = 1. Zero (no exports) sits at the left end. */
  const at = (v: number) => (v > 0 ? 50 + 50 * Math.max(-1, Math.min(1, Math.log(v) / span)) : 0)
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {sinceLabel && <span className="text-[11px] text-slate-400">{sinceLabel}</span>}
      </div>
      <div className="mb-1 grid grid-cols-[minmax(0,8.5rem)_1fr_2.75rem] gap-2 px-1.5 text-[10px] text-slate-400">
        <span />
        <span className="flex justify-between">
          <span>{(1 / Math.exp(span)).toFixed(2)}</span>
          <span>1</span>
          <span>{Math.exp(span).toFixed(1)}</span>
        </span>
        <span />
      </div>
      <ol className="space-y-0.5">
        {rows.map((r) => {
          const Tag = onPick ? 'button' : 'div'
          return (
            <li key={r.code}>
              <Tag
                {...(onPick ? { type: 'button' as const, onClick: () => onPick(r.code) } : {})}
                title={c.worldShare(percent(r.share * 100))}
                className={
                  'block w-full rounded-md px-1.5 py-0.5 text-left ' +
                  (r.code === highlight ? 'bg-slate-100 dark:bg-slate-800' : onPick ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : '')
                }
              >
                <div className="grid grid-cols-[minmax(0,8.5rem)_1fr_2.75rem] items-center gap-2 text-sm">
                  <span className="truncate" title={r.label}>
                    {r.label}
                  </span>
                  <div className="relative h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    {/* Bars grow out from RCA = 1: right for an advantage, left for a disadvantage. */}
                    <div
                      className={'absolute inset-y-0 rounded-full ' + (r.rca >= 1 ? 'bg-a' : 'bg-slate-400 dark:bg-slate-500')}
                      style={{ left: `${Math.min(50, at(r.rca))}%`, width: `${Math.abs(at(r.rca) - 50)}%` }}
                    />
                    <span className="absolute -top-0.5 left-1/2 h-3 w-px bg-slate-900 dark:bg-white" />
                    {r.before != null && (
                      <span
                        className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-700 bg-white dark:border-slate-200 dark:bg-slate-900"
                        style={{ left: `${at(r.before)}%` }}
                      />
                    )}
                  </div>
                  <span className={'text-right font-semibold tabular-nums ' + (r.rca >= 1 ? 'text-a' : 'text-slate-500 dark:text-slate-400')}>
                    {r.rca.toFixed(2)}
                  </span>
                </div>
              </Tag>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
