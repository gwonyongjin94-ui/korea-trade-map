export interface Stat {
  label: string
  value: string
  sub?: string
  /** Colour of the value: a = exports/surplus, b = imports/deficit. */
  tone?: 'a' | 'b' | 'good' | 'bad'
  subTone?: 'up' | 'down'
}

const VALUE_TONE = { a: 'text-a', b: 'text-b', good: 'text-emerald-600 dark:text-emerald-400', bad: 'text-rose-600 dark:text-rose-400' }

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 xl:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
      {stats.map((s) => (
        <div key={s.label} className="min-w-0 rounded-xl bg-slate-50 px-3 py-2.5 sm:px-4 sm:py-3 dark:bg-slate-800/50">
          <div className="truncate text-xs text-slate-500 dark:text-slate-400" title={s.label}>
            {s.label}
          </div>
          <div className={'mt-1 truncate text-lg font-bold tabular-nums ' + (s.tone ? VALUE_TONE[s.tone] : '')} title={s.value}>
            {s.value}
          </div>
          {s.sub && (
            <div
              className={
                'mt-0.5 truncate text-xs tabular-nums ' +
                (s.subTone === 'up' ? 'text-emerald-600 dark:text-emerald-400' : s.subTone === 'down' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400')
              }
            >
              {s.sub}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
