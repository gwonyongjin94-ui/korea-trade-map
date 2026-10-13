import { chapterIcon, chapterName, productById } from '../../data/products'
import { DATA, pairOf, partnerStats, WORLD, YEARS } from '../../data/trade'
import { money } from '../../format'
import { countryFlag, countryName, useI18n } from '../../i18n'
import { gl } from '../../theory'
import { THEORY_TEXT } from '../../theoryText'
import { TheoryCard } from './TheoryCard'

interface Props {
  product: string
  year: number
  selected: string | null
  onPick: (iso: string) => void
}

const CHAPTER_ROWS = 12
const PARTNER_ROWS = 15
const FIRST = YEARS[0]

interface Row {
  key: string
  label: string
  gl: number
  before: number | null
  x: number
  m: number
}

export function IitCard({ product, year, selected, onPick }: Props) {
  const { lang, t } = useI18n()
  const tt = THEORY_TEXT[lang]
  const c = tt.iit
  const name = (iso: string) => countryName(iso, lang)
  const all = product === 'TOTAL'
  const prod = productById(product)
  const prodLabel = `${prod.icon} ${prod.name[lang]}`

  // Left panel: chapters of Korea–world trade, or one product's index over the years.
  const left: Row[] = all
    ? (DATA.iit?.chapters[year] ?? []).slice(0, CHAPTER_ROWS).map(([code, x, m]) => {
        const first = DATA.iit?.chapters[FIRST]?.find(([k]) => k === code)
        return {
          key: code,
          label: `${chapterIcon(code)} ${chapterName(code, lang, t.other)}`,
          gl: gl(x, m) ?? 0,
          before: first ? gl(first[1], first[2]) : null,
          x,
          m,
        }
      })
    : YEARS.map((y) => {
        const p = pairOf(product, y, WORLD)
        return { key: String(y), label: String(y), gl: gl(p.x, p.m) ?? 0, before: null, x: p.x, m: p.m }
      })

  // Right panel: partners, from the chapter-based index or from the single product's flows.
  const right: Row[] = all
    ? Object.entries(DATA.iit?.partners[year] ?? {})
        .filter(([iso]) => iso !== WORLD)
        .map(([iso, v]) => {
          const p = pairOf(product, year, iso)
          return { key: iso, label: `${countryFlag(iso)} ${name(iso)}`, gl: v, before: DATA.iit?.partners[FIRST]?.[iso] ?? null, x: p.x, m: p.m }
        })
        // The largest trading partners, ordered from most to least intra-industry.
        .sort((a, b) => b.x + b.m - (a.x + a.m))
        .slice(0, PARTNER_ROWS)
        .sort((a, b) => b.gl - a.gl)
    : partnerStats(product, year)
        .sort((a, b) => b.x + b.m - (a.x + a.m))
        .slice(0, PARTNER_ROWS)
        .map((p) => {
          const first = pairOf(product, FIRST, p.iso)
          return { key: p.iso, label: `${countryFlag(p.iso)} ${name(p.iso)}`, gl: gl(p.x, p.m) ?? 0, before: gl(first.x, first.m), x: p.x, m: p.m }
        })
        .sort((a, b) => b.gl - a.gl)

  const overall = all ? DATA.iit?.partners[year]?.[WORLD] : left.find((r) => r.key === String(year))?.gl
  const overallBefore = all ? DATA.iit?.partners[FIRST]?.[WORLD] : left[0]?.gl

  const reading: string[] = []
  if (all && left.length) {
    const byGl = [...left].sort((a, b) => b.gl - a.gl)
    reading.push(c.reading(stripIcon(byGl[0].label), stripIcon(byGl[byGl.length - 1].label)))
  }
  if (right.length > 1) reading.push(c.readingPartner(stripIcon(right[0].label), stripIcon(right[right.length - 1].label)))

  return (
    <TheoryCard title={c.title} question={c.question} formula={c.formula} note={c.scaleNote} reading={reading} cautions={c.cautions}>
      {overall != null && (
        <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-sm text-slate-500 dark:text-slate-400">{all ? t.korea : prodLabel} · GL</span>
          <span className="text-3xl font-bold tabular-nums">{overall.toFixed(2)}</span>
          {overallBefore != null && year !== FIRST && (
            <span className="text-sm text-slate-500 tabular-nums dark:text-slate-400">
              ({FIRST}: {overallBefore.toFixed(2)})
            </span>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel
          title={all ? `${c.byChapter} · ${year}` : c.productOverYears(prodLabel)}
          rows={left}
          showFlows
          highlight={all ? null : String(year)}
          sinceLabel={all ? c.since(FIRST) : null}
        />
        <Panel
          title={`${all ? c.byPartner : c.byPartnerProduct(prodLabel)} · ${year}`}
          rows={right}
          highlight={selected}
          onPick={onPick}
          sinceLabel={c.since(FIRST)}
        />
      </div>
    </TheoryCard>
  )
}

const stripIcon = (label: string) => label.replace(/^\S+\s/, '')

function Panel({
  title,
  rows,
  showFlows = false,
  highlight,
  onPick,
  sinceLabel,
}: {
  title: string
  rows: Row[]
  showFlows?: boolean
  highlight: string | null
  onPick?: (key: string) => void
  sinceLabel: string | null
}) {
  const { lang } = useI18n()
  const c = THEORY_TEXT[lang].iit
  const maxFlow = Math.max(1, ...rows.map((r) => Math.max(r.x, r.m)))
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {sinceLabel && <span className="text-[11px] text-slate-400">{sinceLabel}</span>}
      </div>
      <div className="mb-1 flex justify-between text-[10px] text-slate-400">
        <span>{c.scale[0]}</span>
        <span>{c.scale[1]}</span>
      </div>
      <ol className={showFlows ? 'space-y-1.5' : 'space-y-0.5'}>
        {rows.map((r) => {
          const Tag = onPick ? 'button' : 'div'
          return (
            <li key={r.key}>
              <Tag
                {...(onPick ? { type: 'button' as const, onClick: () => onPick(r.key) } : {})}
                className={
                  'block w-full rounded-md px-1.5 text-left ' +
                  (showFlows ? 'py-1 ' : 'py-0.5 ') +
                  (r.key === highlight ? 'bg-slate-100 dark:bg-slate-800' : onPick ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50' : '')
                }
              >
                {showFlows ? (
                  <>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="min-w-0 truncate" title={r.label}>
                        {r.label}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums">{r.gl.toFixed(2)}</span>
                    </div>
                    <div className="mt-1">
                      <GlBar value={r.gl} before={r.before} />
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-[minmax(0,8.5rem)_1fr_2.5rem] items-center gap-2 text-sm">
                    <span className="truncate" title={r.label}>
                      {r.label}
                    </span>
                    <GlBar value={r.gl} before={r.before} />
                    <span className="text-right font-semibold tabular-nums">{r.gl.toFixed(2)}</span>
                  </div>
                )}
                {showFlows && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 tabular-nums dark:text-slate-400">
                    <span className="w-14 text-right">{money(r.m, lang, { short: true })}</span>
                    <div className="flex h-1 flex-1">
                      <div className="flex flex-1 justify-end">
                        <div className="h-full rounded-l bg-b" style={{ width: `${(r.m / maxFlow) * 100}%` }} />
                      </div>
                      <div className="flex-1">
                        <div className="h-full rounded-r bg-a" style={{ width: `${(r.x / maxFlow) * 100}%` }} />
                      </div>
                    </div>
                    <span className="w-14">{money(r.x, lang, { short: true })}</span>
                  </div>
                )}
              </Tag>
            </li>
          )
        })}
      </ol>
      {showFlows && (
        <div className="mt-2 flex justify-between text-[10px] text-slate-400">
          <span className="text-b">◀ {c.cols.imp}</span>
          <span className="text-a">{c.cols.exp} ▶</span>
        </div>
      )}
    </div>
  )
}

/** Index on a 0–1 track, with a ring marking the earlier year's value. */
function GlBar({ value, before }: { value: number; before: number | null }) {
  return (
    <div className="relative h-2 rounded-full bg-slate-100 dark:bg-slate-800">
      <div className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400" style={{ width: `${value * 100}%` }} />
      {before != null && (
        <span
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-slate-700 bg-white dark:border-slate-200 dark:bg-slate-900"
          style={{ left: `${before * 100}%` }}
        />
      )}
    </div>
  )
}
