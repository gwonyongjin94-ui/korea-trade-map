import { useState } from 'react'
import { HO_TEXT, type Names } from '../../hoText'
import { useI18n } from '../../i18n'
import {
  autarkyPrice,
  capitalPerWorker,
  distribution,
  frontier,
  outcome,
  produce,
  utilityOf,
  worldPrice,
  type Endowment,
  type Group,
  type Tech,
} from '../../model/heckscherOhlin'
import { PpfChart, PpfLegend } from '../sf/SfCharts'
import { GroupCard, Slider } from '../sf/SpecificFactorsTab'
import { BoxChart, FactorPriceChart, RsRdChart } from './HoCharts'
import { units } from './units'

export interface HoSetup {
  names: Names
  icons: { C: string; F: string }
  e: { A: Endowment; B: Endowment }
  t: Tech
  /**
   * Real endowments: capital in USD billions and labour in thousands of workers, so K/L is millions of
   * USD per worker and L/K workers per USD 1 million. Otherwise plain model units.
   */
  real: boolean
}

const f1 = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%`
/** Frontier ticks: real-data outputs run to tens of thousands of model units, so abbreviate them. */
const qty = (lang: string) => (v: number) =>
  v === 0 ? '0' : v < 1e4 ? v.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US', { maximumFractionDigits: v >= 10 ? 0 : 2 }) : lang === 'ko' ? `${+(v / 1e4).toFixed(1)}만` : `${+(v / 1e3).toFixed(0)}k`
const sig = (v: number) => (v >= 100 ? v.toFixed(0) : v.toPrecision(3))
const span = (g: Group) => {
  const [lo, hi] = [Math.min(g.inC, g.inF), Math.max(g.inC, g.inF)]
  return `${f1(lo)}~${f1(hi)}`
}

/**
 * Where the Rybczynski card holds prices: the world price, in a country that still makes both goods
 * there (Home first); if both specialize, Home's autarky price instead.
 */
function rybczynskiAt(t: Tech, e: { A: Endowment; B: Endowment }) {
  const pw = worldPrice(t, e.A, e.B)
  const k = (['A', 'B'] as const).find((c) => produce(t, e[c], pw).only === null)
  return k ? { k, p: pw, atWorld: true } : { k: 'A' as const, p: autarkyPrice(t, e.A), atWorld: false }
}

/** A first capital increase for the Rybczynski card, at most +20%, that keeps the country making both goods. */
function rybczynskiStart(t: Tech, e: { A: Endowment; B: Endowment }): number {
  const { k, p } = rybczynskiAt(t, e)
  const omega = produce(t, e[k], p).omega
  const room = Math.max(capitalPerWorker(t.sC, omega), capitalPerWorker(t.sF, omega)) / (e[k].K / e[k].L) - 1
  return Math.min(0.2, Math.max(0.01, Math.floor(room * 0.8 * 100) / 100))
}

/**
 * The two-country Heckscher–Ohlin model on one setup: headline results, the factor price diagram,
 * world relative supply and demand, both frontiers, income distribution, steps and Rybczynski.
 * Remount it (with a key) when the setup changes so edits start from its values again.
 */
export function HoModel({ setup }: { setup: HoSetup }) {
  const { lang } = useI18n()
  const h = HO_TEXT[lang]
  const [e, setE] = useState(setup.e)
  const [t, setT] = useState(setup.t)
  const [grow, setGrow] = useState(() => rybczynskiStart(setup.t, setup.e))
  const { names, icons } = setup
  const u = units(setup.real, lang)

  const pa = { A: autarkyPrice(t, e.A), B: autarkyPrice(t, e.B) }
  const pw = worldPrice(t, e.A, e.B)
  const aut = { A: produce(t, e.A, pa.A), B: produce(t, e.B, pa.B) }
  const trade = { A: outcome(t, e.A, pw), B: outcome(t, e.B, pw) }
  const traded = Math.abs(Math.log(pa.A / pa.B)) > 1e-6
  const gain = (k: 'A' | 'B') => (trade[k].utility / utilityOf(t, aut[k].QC, aut[k].QF) - 1) * 100
  const dist = { A: distribution(t, aut.A, trade.A), B: distribution(t, aut.B, trade.B) }
  const richA = e.A.K / e.A.L > e.B.K / e.B.L
  const rich = richA ? 'A' : 'B'
  const fpe = trade.A.only === null && trade.B.only === null
  const only = (['A', 'B'] as const).filter((k) => trade[k].only !== null).map((k) => names[k])
  const edited = JSON.stringify({ e, t }) !== JSON.stringify({ e: setup.e, t: setup.t })
  const at = rybczynskiAt(t, e)
  const ref = trade[at.k]
  const lkAt = (s: number) => sig((1 - s) / s / ref.omega)
  const exportGood = (k: 'A' | 'B') => (trade[k].exportsC > 0 ? 'C' : 'F')
  // Groups whose outcome departs from Stolper–Samuelson (the abundant factor gains, the scarce one loses),
  // named for running text: without the card's emoji and lower-cased.
  const prose = (title: string) => title.slice(title.indexOf(' ') + 1).replace(/^./, (c) => c.toLowerCase())
  const odd = (['A', 'B'] as const).flatMap((k) => {
    const capitalAbundant = (k === 'A') === richA
    return [
      dist[k].capital.verdict !== (capitalAbundant ? 'gain' : 'loss') ? prose(h.groups.capital(names[k])) : null,
      dist[k].labor.verdict !== (capitalAbundant ? 'loss' : 'gain') ? prose(h.groups.labor(names[k])) : null,
    ].filter((x): x is string => x !== null)
  })

  const steps = h.steps(names, {
    lkC: lkAt(t.sC),
    lkF: lkAt(t.sF),
    kA: u.k(e.A.K, e.A.L),
    kB: u.k(e.B.K, e.B.L),
    paA: sig(pa.A),
    paB: sig(pa.B),
    pw: sig(pw),
    rich: names[rich],
    poor: names[richA ? 'B' : 'A'],
    dr: span(dist[rich].capital),
    dw: span(dist[rich].labor),
    magnified: dist[rich].capital.verdict === 'gain' && dist[rich].labor.verdict === 'loss',
    fpe,
    only,
  })

  const range = (base: number) => (setup.real ? { min: base * 0.2, max: base * 3, step: base / 100 } : { min: 10, max: 400, step: 5 })
  const setEnd = (k: 'A' | 'B', f: 'K' | 'L', v: number) => setE({ ...e, [k]: { ...e[k], [f]: v } })
  const ppfLabels = (k: 'A' | 'B') => ({
    x: `${icons.C} ${h.output(names.C)}`,
    y: `${icons.F} ${h.output(names.F)}`,
    ...h.ppfLegend,
    exports: trade[k].exportsC > 0 ? h.exports(names.C) : h.imports(names.C),
    imports: trade[k].exportsC > 0 ? h.imports(names.F) : h.exports(names.F),
  })

  const stat = (label: string, value: string, sub?: string, tone = '') => (
    <div className="min-w-0 rounded-xl bg-white px-4 py-3 dark:bg-slate-900">
      <div className="text-xs leading-snug text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className={`mt-0.5 text-lg leading-snug font-semibold tabular-nums ${tone}`}>{value}</div>
      {sub && <div className="text-[11px] leading-snug text-slate-500 tabular-nums dark:text-slate-400">{sub}</div>}
    </div>
  )

  const ryb = (() => {
    const { k, p } = at
    const before = produce(t, e[k], p)
    const after = produce(t, { ...e[k], K: e[k].K * (1 + grow) }, p)
    const pct = (a: number, b: number) => (b > 0 ? f1((a / b - 1) * 100) : '—')
    return { ...at, before, after, df: pct(after.QF, before.QF), dc: pct(after.QC, before.QC) }
  })()

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900/40">
      {traded && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-slate-100 p-2 sm:grid-cols-3 lg:grid-cols-5 dark:border-slate-800 dark:bg-slate-950">
          {stat(h.headline.exports(names.A), `${icons[exportGood('A')]} ${names[exportGood('A')]}`, undefined, 'text-a')}
          {stat(h.headline.exports(names.B), `${icons[exportGood('B')]} ${names[exportGood('B')]}`, undefined, 'text-b')}
          {stat(h.headline.price, sig(pw), h.headline.autarky(sig(pa.A), sig(pa.B)))}
          {stat(h.headline.gain(names.A, names.B), `${f1(gain('A'))} / ${f1(gain('B'))}`, undefined, 'text-emerald-600 dark:text-emerald-400')}
          {stat(h.headline.fpe, fpe ? h.headline.fpeYes : h.headline.fpeNo, fpe ? undefined : h.headline.fpeWhy(only), fpe ? '' : 'text-amber-600 dark:text-amber-400')}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold">{h.factorChart}</h3>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{h.factorChartNote(names.C)}</p>
            <FactorPriceChart
              t={t}
              countries={[
                { name: names.A, tone: 'a', e: e.A, autarky: aut.A, trade: trade.A },
                { name: names.B, tone: 'b', e: e.B, autarky: aut.B, trade: trade.B },
              ]}
              labels={{
                price: h.axisPrice(names.C),
                lk: h.axisLK,
                omega: h.axisOmega,
                ss: h.ss,
                cc: h.cc(names.C),
                ff: h.ff(names.F),
                autarky: h.autarkyOf,
                trade: h.tradeOf,
                endowment: h.endowmentOf,
              }}
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold">{h.rsrd}</h3>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">{h.rsrdNote(names.C, names.F)}</p>
            <RsRdChart
              t={t}
              a={{ name: names.A, e: e.A, pa: pa.A }}
              b={{ name: names.B, e: e.B, pa: pa.B }}
              pw={pw}
              labels={{ x: `Q_C / Q_F (${names.C} ÷ ${names.F})`, y: 'P_C / P_F', rsA: h.rs(names.A), rsB: h.rs(names.B), rsWorld: h.rsWorld, rd: h.rd }}
            />
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              1 {h.autarkyOf(names.A)} · 2 {h.headline.price} · 3 {h.autarkyOf(names.B)}
            </p>
          </div>
        </div>

        <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:self-start dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{h.setup}</h3>
            {edited && (
              <button
                type="button"
                onClick={() => {
                  setE(setup.e)
                  setT(setup.t)
                }}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                {h.reset}
              </button>
            )}
          </div>
          {(['A', 'B'] as const).map((k) => (
            <div key={k} className="space-y-3">
              <div className={'text-xs font-semibold ' + (k === 'A' ? 'text-a' : 'text-b')}>
                {h.endowments(names[k])} · K/L {u.k(e[k].K, e[k].L)}
              </div>
              <Slider label={`🏦 ${h.capitalK}`} value={e[k].K} {...range(setup.e[k].K)} onChange={(v) => setEnd(k, 'K', v)} format={u.K} />
              <Slider label={`👷 ${h.laborL}`} value={e[k].L} {...range(setup.e[k].L)} onChange={(v) => setEnd(k, 'L', v)} format={u.L} />
            </div>
          ))}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{h.shares}</div>
            <Slider label={`${icons.C} ${h.sC(names.C)}`} value={t.sC} min={0.05} max={0.9} step={0.01} onChange={(v) => setT({ ...t, sC: Math.min(v, t.sF - 0.02) })} />
            <Slider label={`${icons.F} ${h.sF(names.F)}`} value={t.sF} min={0.1} max={0.95} step={0.01} onChange={(v) => setT({ ...t, sF: Math.max(v, t.sC + 0.02) })} />
            <Slider label={h.gamma(names.C)} value={t.gamma} min={0.1} max={0.9} step={0.05} onChange={(gamma) => setT({ ...t, gamma })} />
          </div>
        </aside>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(['A', 'B'] as const).map((k) => (
            <div key={k} className="min-w-0">
              <h3 className={'mb-2 font-semibold ' + (k === 'A' ? 'text-a' : 'text-b')}>{h.ppf(names[k])}</h3>
              <PpfChart points={frontier(t, e[k])} autarky={aut[k]} trade={trade[k]} labels={ppfLabels(k)} format={qty(lang)} />
            </div>
          ))}
        </div>
        <PpfLegend labels={{ x: '', y: '', ...h.ppfLegend, exports: '', imports: '' }} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-bold">{h.distTitle}</h3>
        <p className="mt-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200" aria-live="polite">
          {traded ? h.distSummary(names, richA, gain('A'), gain('B'), odd) : h.noTrade}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(['A', 'B'] as const).flatMap((k) => [
            <GroupCard key={`${k}l`} title={h.groups.labor(names[k])} g={dist[k].labor} names={names} icons={icons} traded={traded} />,
            <GroupCard key={`${k}k`} title={h.groups.capital(names[k])} g={dist[k].capital} names={names} icons={icons} traded={traded} />,
          ])}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-bold">{h.stepsTitle}</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((st) => (
            <div key={st.title} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="font-semibold">{st.title}</div>
              {st.formula && <div className="mt-2 overflow-x-auto rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs whitespace-nowrap dark:bg-slate-800/60">{st.formula}</div>}
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{st.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-bold">{h.ryb.title}</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{h.ryb.body(names[ryb.k], names.C, names.F, ryb.atWorld)}</p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
          <BoxChart
            t={t}
            e={e[ryb.k]}
            p={ryb.p}
            grow={grow}
            labels={{ L: h.laborL, K: h.capitalK, before: h.ryb.before, after: h.ryb.after, originC: h.ryb.originC(names.C), originF: h.ryb.originF(names.F) }}
          />
          <div className="space-y-3">
            <Slider label={`🏦 ${h.ryb.slider}`} value={grow} min={0} max={1} step={0.01} onChange={setGrow} format={(v) => `+${Math.round(v * 100)}%`} />
            <dl className="space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
              {(
                [
                  [icons.F, h.output(names.F), ryb.df],
                  [icons.C, h.output(names.C), ryb.dc],
                ] as const
              ).map(([ic, label, v]) => (
                <div key={label} className="flex justify-between gap-2">
                  <dt className="text-slate-500 dark:text-slate-400">
                    {ic} {label}
                  </dt>
                  <dd className="font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {ryb.after.only ? h.ryb.exits(names.F) : h.ryb.reading(`+${Math.round(grow * 100)}%`, names.F, ryb.df, names.C, ryb.dc)}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
