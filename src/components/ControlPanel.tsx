import { useId } from 'react'
import { PRODUCTS } from '../data/products'
import type { View } from '../data/trade'
import { useI18n } from '../i18n'

interface Props {
  view: View
  product: string
  year: number
  years: number[]
  playing: boolean
  count: number
  onView: (v: View) => void
  onProduct: (id: string) => void
  onYear: (y: number) => void
  onPlay: () => void
  onCount: (n: number) => void
}

const VIEWS: View[] = ['export', 'import', 'balance', 'total']

export function ControlPanel(p: Props) {
  const { t, lang } = useI18n()
  const productId = useId()
  const yearId = useId()
  const countId = useId()
  const first = p.years[0]
  const last = p.years[p.years.length - 1]

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-2 text-sm font-semibold">{t.view}</h3>
        <div className="grid grid-cols-4 rounded-xl bg-slate-100 p-1 text-sm dark:bg-slate-800">
          {VIEWS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => p.onView(v)}
              aria-pressed={p.view === v}
              className={
                'rounded-lg px-1 py-2 whitespace-nowrap transition ' +
                (p.view === v ? 'bg-white font-semibold shadow-sm dark:bg-slate-950' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200')
              }
            >
              {t.views[v]}
            </button>
          ))}
        </div>
      </section>

      <section>
        <label htmlFor={productId} className="mb-2 block text-sm font-semibold">
          {t.product}
        </label>
        <select
          id={productId}
          value={p.product}
          onChange={(e) => p.onProduct(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          {PRODUCTS.map((prod) => (
            <option key={prod.id} value={prod.id}>
              {prod.icon} {prod.name[lang]}
              {prod.hs ? ` · HS ${prod.hs}` : ''}
            </option>
          ))}
        </select>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor={yearId} className="text-sm font-semibold">
            {t.year}
          </label>
          <span className="text-2xl font-bold tabular-nums">{p.year}</span>
        </div>
        <input
          id={yearId}
          type="range"
          min={first}
          max={last}
          step={1}
          value={p.year}
          onChange={(e) => p.onYear(Number(e.target.value))}
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>{first}</span>
          <span>{last}</span>
        </div>
        <button
          type="button"
          onClick={p.onPlay}
          aria-pressed={p.playing}
          className={
            'mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold transition ' +
            (p.playing
              ? 'bg-slate-800 text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900'
              : 'border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800')
          }
        >
          {p.playing ? t.pause : `${t.play} (${first}–${last})`}
        </button>
      </section>

      <section>
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor={countId} className="text-sm font-semibold">
            {t.count}
          </label>
          <span className="text-sm font-semibold tabular-nums">{t.countValue(p.count)}</span>
        </div>
        <input id={countId} type="range" min={5} max={20} step={1} value={p.count} onChange={(e) => p.onCount(Number(e.target.value))} />
      </section>
    </div>
  )
}
