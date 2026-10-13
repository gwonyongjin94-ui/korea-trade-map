import { DATA } from '../../data/trade'
import { money } from '../../format'
import { useI18n } from '../../i18n'
import { SF_TEXT } from '../../sfText'

type Sector = keyof (typeof SF_TEXT)['ko']['korea']['sectors']

/** HS chapter ranges grouped into broad industries. */
const SECTORS: { id: Sector; icon: string; from: number; to: number }[] = [
  { id: 'agri', icon: '🌾', from: 1, to: 24 },
  { id: 'mineral', icon: '⛏️', from: 25, to: 27 },
  { id: 'chem', icon: '🧪', from: 28, to: 40 },
  { id: 'light', icon: '📄', from: 41, to: 49 },
  { id: 'textile', icon: '👕', from: 50, to: 67 },
  { id: 'metal', icon: '🏗️', from: 72, to: 83 },
  { id: 'machine', icon: '💾', from: 84, to: 85 },
  { id: 'transport', icon: '🚗', from: 86, to: 89 },
  { id: 'other', icon: '🔬', from: 68, to: 71 },
]

/** Sector of an HS chapter; 90–99 join "other" with 68–71. */
function sectorOf(code: string): Sector | null {
  const n = Number(code)
  if (!Number.isFinite(n)) return null
  if (n >= 90) return 'other'
  return SECTORS.find((s) => n >= s.from && n <= s.to)?.id ?? null
}

export function KoreaCard({ year }: { year: number }) {
  const { lang } = useI18n()
  const k = SF_TEXT[lang].korea
  const rows = SECTORS.map((s) => ({ ...s, x: 0, m: 0 }))
  for (const [code, x, m] of DATA.iit?.chapters[year] ?? []) {
    const r = rows.find((row) => row.id === sectorOf(code))
    if (r) {
      r.x += x
      r.m += m
    }
  }
  const sorted = rows.filter((r) => r.x + r.m > 0).sort((a, b) => b.x - b.m - (a.x - a.m))
  const max = Math.max(1, ...sorted.map((r) => Math.abs(r.x - r.m)))
  const name = (id: Sector) => k.sectors[id]
  const exporters = sorted.filter((r) => r.x > r.m).slice(0, 3).map((r) => name(r.id))
  const importers = sorted.filter((r) => r.x < r.m).slice(-2).reverse().map((r) => name(r.id))

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-lg font-bold">{k.title}</h3>
        <span className="text-xs text-slate-400">{year} · UN Comtrade</span>
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{k.body}</p>
      <div className="mt-4 mb-1 grid grid-cols-[minmax(0,7.5rem)_1fr_4.25rem] sm:grid-cols-[minmax(0,10rem)_1fr_4.5rem] gap-2 text-[11px] text-slate-400">
        <span />
        <span className="flex justify-between gap-1 text-[10px] whitespace-nowrap sm:text-[11px]">
          <span className="text-b">◀ {k.importer}</span>
          <span className="text-a">{k.exporter} ▶</span>
        </span>
        <span />
      </div>
      <ol className="space-y-1">
        {sorted.map((r) => {
          const net = r.x - r.m
          const width = `${(Math.abs(net) / max) * 50}%`
          return (
            <li
              key={r.id}
              className="grid grid-cols-[minmax(0,7.5rem)_1fr_4.25rem] sm:grid-cols-[minmax(0,10rem)_1fr_4.5rem] items-center gap-2 text-sm"
              title={`${money(r.x, lang)} − ${money(r.m, lang)}`}
            >
              <span className="truncate">
                {r.icon} {name(r.id)}
              </span>
              <div className="relative h-3 rounded bg-slate-100 dark:bg-slate-800">
                <span className="absolute -top-0.5 left-1/2 h-4 w-px bg-slate-900 dark:bg-white" />
                <div className={'absolute inset-y-0 rounded ' + (net >= 0 ? 'left-1/2 bg-a' : 'right-1/2 bg-b')} style={{ width }} />
              </div>
              <span className={'text-right text-xs font-semibold tabular-nums ' + (net >= 0 ? 'text-a' : 'text-b')}>
                {money(net, lang, { short: true, signed: true })}
              </span>
            </li>
          )
        })}
      </ol>
      {exporters.length > 0 && importers.length > 0 && (
        <p className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
          💡 {k.reading(exporters.join(', '), importers.join(', '))}
        </p>
      )}
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">⚠️ {k.caution}</p>
    </section>
  )
}
