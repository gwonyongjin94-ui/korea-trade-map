import { useId, useMemo, useState } from 'react'
import { SF_PRESETS, type SfPreset } from '../../data/sfPresets'
import { atPrice, autarkyPrice, distribution, utilityAt, withTrade, type Economy, type Group } from '../../model/specificFactors'
import { useI18n } from '../../i18n'
import { SF_TEXT, type Names } from '../../sfText'
import { KoreaCard } from './KoreaCard'
import { LandCard } from './LandCard'
import { MigrationCard } from './MigrationCard'
import { LaborChart, PpfChart, PpfLegend } from './SfCharts'

const signed = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%`

export function SpecificFactorsTab({ year, onYear }: { year: number; onYear: (y: number) => void }) {
  const { lang } = useI18n()
  const s = SF_TEXT[lang]
  const [presetId, setPresetId] = useState(SF_PRESETS[0].id)
  const preset = SF_PRESETS.find((p) => p.id === presetId) ?? SF_PRESETS[0]
  const [e, setE] = useState<Economy>(preset.economy)
  const [gap, setGap] = useState(preset.worldGap)

  const load = (p: SfPreset) => {
    setPresetId(p.id)
    setE(p.economy)
    setGap(p.worldGap)
  }

  const names: Names = preset.names[lang]
  const icon = preset.icons
  const pa = useMemo(() => autarkyPrice(e), [e])
  const pw = pa * (1 + gap / 100)
  const autarky = useMemo(() => atPrice(e, pa), [e, pa])
  const trade = useMemo(() => withTrade(e, pw), [e, pw])
  const dist = distribution(e, autarky, trade)
  const gain = (trade.utility / utilityAt(e, autarky.QC, autarky.QF) - 1) * 100
  const dw = (trade.w / autarky.w - 1) * 100
  const traded = Math.abs(gap) >= 0.5
  const up = gap > 0
  const winner = up ? names.K : names.T
  const loser = up ? names.T : names.K
  const share = (v: number) => `${((v / e.L) * 100).toFixed(0)}%`

  const steps = s.steps(names, {
    LC: share(trade.LC),
    LF: share(trade.LF),
    w: trade.w.toFixed(2),
    dp: signed(gap),
    dw: signed(dw),
    pa: pa.toFixed(2),
    pw: pw.toFixed(2),
    gain: signed(gain),
    winner,
    loser,
  })

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold">{s.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.subtitle}</p>
            <p className="mt-2 text-xs text-slate-400">{s.source}</p>
          </div>
          <select
            value={presetId}
            onChange={(ev) => load(SF_PRESETS.find((p) => p.id === ev.target.value) ?? SF_PRESETS[0])}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            aria-label={s.presets}
          >
            {SF_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                📚 {p.title[lang]}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
          <span className="font-semibold">📚 {preset.title[lang]}</span> · {preset.note[lang]}
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold">{s.laborChart}</h3>
            <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
              {s.laborChartNote(`${icon.C} ${names.C}`, `${icon.F} ${names.F}`)} {s.wageUnit}
            </p>
            <LaborChart
              e={e}
              before={autarky}
              after={trade}
              labels={{
                vmplC: s.vmplC(names.C),
                vmplF: s.vmplF(names.F),
                before: s.before,
                after: s.after,
                wage: s.wage,
                employedC: s.employed(names.C),
                employedF: s.employed(names.F),
              }}
            />
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-2 font-semibold">{s.ppfChart}</h3>
            <PpfChart
              e={e}
              autarky={autarky}
              trade={trade}
              labels={{
                x: `${icon.C} ${s.output(names.C)}`,
                y: `${icon.F} ${s.output(names.F)}`,
                ...s.ppfLegend,
                exports: trade.exportsC > 0 ? s.exports(names.C) : s.imports(names.C),
                imports: trade.exportsC > 0 ? s.imports(names.F) : s.exports(names.F),
              }}
            />
            <PpfLegend labels={{ x: '', y: '', ...s.ppfLegend, exports: '', imports: '' }} />
          </section>
        </div>

        <aside className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 lg:self-start dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-semibold">{s.setup}</h3>
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.endowments}</div>
            <Slider label={`🏭 ${names.K} (K)`} value={e.K} min={10} max={500} step={10} onChange={(K) => setE({ ...e, K })} />
            <Slider label={`🌾 ${names.T} (T)`} value={e.T} min={10} max={500} step={10} onChange={(T) => setE({ ...e, T })} />
            <Slider label={`👷 ${s.labor}`} value={e.L} min={20} max={300} step={10} onChange={(L) => setE({ ...e, L })} />
          </div>
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{s.shares}</div>
            <Slider label={s.alpha(names.C, names.K)} value={e.alpha} min={0.1} max={0.9} step={0.05} onChange={(alpha) => setE({ ...e, alpha })} />
            <Slider label={s.beta(names.F, names.T)} value={e.beta} min={0.1} max={0.9} step={0.05} onChange={(beta) => setE({ ...e, beta })} />
            <Slider label={s.gamma(names.C)} value={e.gamma} min={0.1} max={0.9} step={0.05} onChange={(gamma) => setE({ ...e, gamma })} />
          </div>
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
            <Slider
              label={`🌍 ${s.worldPrice(names.C)}`}
              value={gap}
              min={-60}
              max={150}
              step={5}
              onChange={setGap}
              format={(v) => `${pw.toFixed(2)} (${s.worldPriceNote(signed(v))})`}
            />
            <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              P_C/P_F: {s.before} {pa.toFixed(2)} → {s.after} {pw.toFixed(2)}
            </div>
          </div>
        </aside>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-lg font-bold">{s.distTitle}</h3>
        <p className="mt-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200" aria-live="polite">
          {traded ? s.summary(names, up, gap, dw, gain) : s.noTrade}
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <GroupCard title={s.groups.labor} g={dist.labor} names={names} icons={icon} traded={traded} />
          <GroupCard title={s.groups.capital(names.K)} g={dist.capital} names={names} icons={icon} traded={traded} />
          <GroupCard title={s.groups.land(names.T)} g={dist.land} names={names} icons={icon} traded={traded} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold">{s.stepsTitle}</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((st) => (
            <div key={st.title} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="font-semibold">{st.title}</div>
              {st.formula && <div className="mt-2 overflow-x-auto rounded-lg bg-slate-50 px-3 py-2 font-mono text-xs whitespace-nowrap dark:bg-slate-800/60">{st.formula}</div>}
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{st.body}</p>
            </div>
          ))}
        </div>
      </section>

      <LandCard year={year} onYear={onYear} />
      <KoreaCard year={year} />
      <MigrationCard />
    </div>
  )
}

function GroupCard({ title, g, names, icons, traded }: { title: string; g: Group; names: Names; icons: { C: string; F: string }; traded: boolean }) {
  const { lang } = useI18n()
  const s = SF_TEXT[lang]
  const tone = !traded ? 'slate' : g.verdict === 'gain' ? 'emerald' : g.verdict === 'loss' ? 'rose' : 'amber'
  const badge = {
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300',
    amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  }[tone]
  const value = (v: number) => (
    <span className={'font-semibold tabular-nums ' + (Math.abs(v) < 0.05 ? '' : v > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>
      {signed(v)}
    </span>
  )
  return (
    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold">{title}</span>
        <span className={'rounded-full px-2.5 py-0.5 text-xs font-semibold ' + badge}>{traded ? s.verdict[g.verdict] : '—'}</span>
      </div>
      <dl className="mt-3 space-y-1.5 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500 dark:text-slate-400">
            {icons.C} {s.inGood(names.C)}
          </dt>
          <dd>{value(g.inC)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-slate-500 dark:text-slate-400">
            {icons.F} {s.inGood(names.F)}
          </dt>
          <dd>{value(g.inF)}</dd>
        </div>
        <div className="flex justify-between gap-2 border-t border-slate-200 pt-1.5 dark:border-slate-700">
          <dt className="text-slate-500 dark:text-slate-400">🧺 {s.inBundle}</dt>
          <dd>{value(g.inBundle)}</dd>
        </div>
      </dl>
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  const id = useId()
  return (
    <div>
      {/* A formatted value is long, so it gets its own line under the label. */}
      <div className={'mb-1 gap-2 text-sm ' + (format ? 'flex flex-col' : 'flex items-baseline justify-between')}>
        <label htmlFor={id} className="min-w-0">
          {label}
        </label>
        <span className="shrink-0 font-semibold tabular-nums">{format ? format(value) : step < 1 ? value.toFixed(2) : value}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}
