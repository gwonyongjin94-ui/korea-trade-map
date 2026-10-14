import { useMemo, useState } from 'react'
import { countryFlag } from '../i18n'
import { solve, type CountryInput, type ModelResult, type PriceMode } from '../model/ricardian'
import { Explanation } from './Explanation'
import { fmt, signed } from './format'
import type { RicardoSetup } from './fromData'
import { ModelInputs } from './ModelInputs'
import { PPFChart } from './PPFChart'
import { RSRDChart } from './RSRDChart'
import { SummaryTable } from './SummaryTable'
import { useRicardoText, type Names } from './text'
import { WagePanel } from './WagePanel'

interface Props {
  setup: RicardoSetup
  /** ISO codes of the two countries, for flags. */
  isos: { A: string; B: string }
  title: string
}

/**
 * The two-country, two-good Ricardian model solved on the selected real-data example: production
 * possibilities, world relative supply and demand, step-by-step explanation, wages and a summary.
 * Remount it (with a key) when the example changes so edits start from the real values again.
 */
export function RicardoModel({ setup, isos, title }: Props) {
  const { t } = useRicardoText()
  const [inputs, setInputs] = useState(setup.inputs)
  const [beta, setBeta] = useState(0.5)
  const [priceMode, setPriceMode] = useState<PriceMode>('equilibrium')
  const [manualPrice, setManualPrice] = useState(1)
  const result = useMemo(() => solve({ A: inputs.A, B: inputs.B, beta, priceMode, manualPrice }), [inputs, beta, priceMode, manualPrice])
  const { names, icons } = setup
  const edited = (['A', 'B'] as const).some((k) => (['aX', 'aY', 'labor'] as const).some((f) => inputs[k][f] !== setup.inputs[k][f]))
  const ready = result.errors.length === 0

  const changePriceMode = (m: PriceMode) => {
    // Start the manual slider from wherever the equilibrium price currently is.
    if (m === 'manual' && Number.isFinite(result.price)) setManualPrice(result.price)
    setPriceMode(m)
  }

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900/40">
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{setup.source}</p>
        {setup.warning && (
          <p className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
            ⚠️ {setup.warning}
          </p>
        )}
      </div>

      {ready && <Headline names={names} icons={icons} result={result} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {ready && (
            // Three charts side by side on wide screens, as in the explorer; RS–RD wraps to half width below.
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {(['A', 'B'] as const).map((k) => (
                <PPFChart
                  key={k}
                  slot={k}
                  title={`${countryFlag(isos[k])} ${t.ppfTitle(names[k])}`}
                  result={result.countries[k]}
                  price={result.price}
                  goods={{ X: `${icons.X} ${names.X}`, Y: `${icons.Y} ${names.Y}` }}
                  showTrade={result.tradeCase !== 'no-trade'}
                />
              ))}
              <RSRDChart result={result} beta={beta} priceMode={priceMode} goods={{ X: names.X, Y: names.Y }} names={{ A: names.A, B: names.B }} />
            </div>
          )}
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 lg:self-start dark:border-slate-800 dark:bg-slate-900">
          <ModelInputs
            names={names}
            unit={setup.unit}
            inputs={inputs}
            beta={beta}
            priceMode={priceMode}
            result={result}
            edited={edited}
            onInput={(slot: 'A' | 'B', field: keyof CountryInput, v: number) => setInputs((i) => ({ ...i, [slot]: { ...i[slot], [field]: v } }))}
            onReset={() => setInputs(setup.inputs)}
            onBeta={setBeta}
            onPriceMode={changePriceMode}
            onManualPrice={setManualPrice}
          />
        </aside>
      </div>

      {ready && (
        <>
          <div>
            <h3 className="mb-3 text-lg font-bold">{t.explainTitle}</h3>
            <Explanation names={names} inputs={inputs} result={result} priceMode={priceMode} unit={setup.unit} />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-bold">{t.wages.title}</h3>
            <WagePanel names={names} icons={icons} result={result} />
          </div>
          <SummaryTable names={names} result={result} />
        </>
      )}
      <p className="text-xs text-slate-500 dark:text-slate-400">{t.footer}</p>
    </section>
  )
}

/** Exports of each country's comparative-advantage good, the world price and the gains, as in the explorer. */
function Headline({ names, icons, result }: { names: Names; icons: { X: string; Y: string }; result: ModelResult }) {
  const { t, lang } = useRicardoText()
  const { comparativeAdvantage: ca, countries } = result
  if (result.tradeCase === 'no-trade' || !ca.X || !ca.Y) {
    return <div className="rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold dark:bg-slate-800">{t.noTradeBadge}</div>
  }
  const stat = (label: string, value: string, tone = '') => (
    <div className="min-w-0 rounded-xl bg-white px-4 py-3 dark:bg-slate-900">
      <div className="truncate text-xs text-slate-500 dark:text-slate-400" title={label}>
        {label}
      </div>
      <div className={`mt-0.5 truncate text-lg font-semibold tabular-nums ${tone}`}>{value}</div>
    </div>
  )
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-2 sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-950">
      {stat(t.exports(names[ca.X], names.X), `${icons.X} ${fmt(countries[ca.X].trade.netExports.X, lang)}`, ca.X === 'A' ? 'text-a' : 'text-b')}
      {stat(t.exports(names[ca.Y], names.Y), `${icons.Y} ${fmt(countries[ca.Y].trade.netExports.Y, lang)}`, ca.Y === 'A' ? 'text-a' : 'text-b')}
      {stat(t.tradePrice, `${icons.X}1 = ${icons.Y}${fmt(result.price, lang)}`)}
      {stat(t.gain, `${signed(countries.A.gainPct, lang)}% / ${signed(countries.B.gainPct, lang)}%`, 'text-emerald-600 dark:text-emerald-400')}
    </div>
  )
}
