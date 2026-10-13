import { useId } from 'react'
import { PRODUCTS } from '../../data/products'
import type { View } from '../../data/trade'
import { countryFlag, countryName, useI18n } from '../../i18n'
import { gravityFlow } from '../../theory'
import { THEORY_TEXT } from '../../theoryText'
import { GravityCard } from './GravityCard'
import { IitCard } from './IitCard'
import { RcaCard } from './RcaCard'

const RICARDO_URL = 'https://gwonyongjin94-ui.github.io/ricardian-model/'

interface Props {
  view: View
  product: string
  year: number
  years: number[]
  selected: string | null
  onView: (v: View) => void
  onProduct: (id: string) => void
  onYear: (y: number) => void
  onPick: (iso: string | null) => void
}

export function TheoryTab(p: Props) {
  const { lang, t } = useI18n()
  const tt = THEORY_TEXT[lang]
  const productId = useId()
  const yearId = useId()
  const flow = gravityFlow(p.view)
  const pick = (iso: string) => p.onPick(iso === p.selected ? null : iso)

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold">{tt.intro.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{tt.intro.body}</p>
          </div>
          <a
            href={RICARDO_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          >
            {tt.intro.ricardo} ↗
          </a>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {tt.intro.tools.map(([icon, name, what]) => (
            <div key={name} className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-800/50">
              <div className="font-semibold">
                {icon} {name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{what}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-wrap items-end gap-x-6 gap-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <div className="mb-1.5 text-xs font-semibold">{tt.flow}</div>
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-sm dark:bg-slate-800">
            {(['export', 'import', 'total'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => p.onView(f)}
                aria-pressed={flow === f}
                className={'rounded-md px-3 py-1.5 ' + (flow === f ? 'bg-white font-semibold shadow-sm dark:bg-slate-950' : 'text-slate-500 dark:text-slate-400')}
              >
                {tt.flows[f]}
              </button>
            ))}
          </div>
        </div>
        <div className="min-w-48 flex-1">
          <label htmlFor={productId} className="mb-1.5 block text-xs font-semibold">
            {t.product}
          </label>
          <select
            id={productId}
            value={p.product}
            onChange={(e) => p.onProduct(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {PRODUCTS.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.icon} {prod.name[lang]}
                {prod.hs ? ` · HS ${prod.hs}` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-56 flex-[2]">
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor={yearId} className="text-xs font-semibold">
              {t.year}
            </label>
            <span className="text-lg font-bold tabular-nums">{p.year}</span>
          </div>
          <input
            id={yearId}
            type="range"
            min={p.years[0]}
            max={p.years[p.years.length - 1]}
            step={1}
            value={p.year}
            onChange={(e) => p.onYear(Number(e.target.value))}
          />
        </div>
        {p.selected && (
          <button
            type="button"
            onClick={() => p.onPick(null)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            {countryFlag(p.selected)} {countryName(p.selected, lang)} ✕
          </button>
        )}
      </section>

      <GravityCard view={p.view} product={p.product} year={p.year} selected={p.selected} onPick={pick} />
      <IitCard product={p.product} year={p.year} selected={p.selected} onPick={pick} />
      <RcaCard product={p.product} year={p.year} onProduct={p.onProduct} />
    </div>
  )
}
