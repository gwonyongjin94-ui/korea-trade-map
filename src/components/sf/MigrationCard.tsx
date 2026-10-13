import { useId, useMemo, useState } from 'react'
import { homeMpl, migrationAt, migrationEquilibrium, type Country } from '../../model/specificFactors'
import { useI18n } from '../../i18n'
import { SF_TEXT } from '../../sfText'
import { linear, ticks } from '../scale'

const WORLD = 200
const START = 100
const W = 560
const H = 300
const M = { top: 16, right: 44, bottom: 36, left: 44 }

const signed = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}%`

/** Two countries, one good, labour and land: workers move to the higher real wage (KOM fig. 4-14). */
export function MigrationCard() {
  const { lang } = useI18n()
  const m = SF_TEXT[lang].migration
  const [aHome, setAHome] = useState(1)
  const [aForeign, setAForeign] = useState(1.6)
  const home: Country = useMemo(() => ({ A: aHome, T: 100, beta: 0.4 }), [aHome])
  const foreign: Country = useMemo(() => ({ A: aForeign, T: 100, beta: 0.4 }), [aForeign])
  const eq = useMemo(() => migrationEquilibrium(home, foreign, WORLD), [home, foreign])
  const [homeL, setHomeL] = useState<number | null>(null)
  const L = homeL ?? START
  const start = migrationAt(home, foreign, WORLD, START)
  const now = migrationAt(home, foreign, WORLD, L)
  const sliderId = useId()

  const x = linear(0, WORLD, M.left, W - M.right)
  const top = Math.max(start.wHome, start.wForeign) * 1.8
  const y = linear(0, top, H - M.bottom, M.top)
  const clamp = (v: number) => Math.max(M.top, Math.min(H - M.bottom, y(v)))
  const curve = (f: (l: number) => number) =>
    Array.from({ length: 101 }, (_, i) => {
      const l = WORLD * (0.03 + (0.94 * i) / 100)
      return `${i ? 'L' : 'M'}${x(l)},${clamp(f(l))}`
    }).join(' ')
  const mplH = (l: number) => homeMpl(home, l)
  const mplF = (l: number) => homeMpl(foreign, WORLD - l)
  // World output gained: the area between the two curves from where workers started to where they are now.
  const [a, b] = [Math.min(L, START), Math.max(L, START)]
  const band = Array.from({ length: 41 }, (_, i) => a + ((b - a) * i) / 40)
  const area =
    b - a > 0.5
      ? `M${band.map((l) => `${x(l)},${clamp(mplH(l))}`).join(' L')} L${[...band].reverse().map((l) => `${x(l)},${clamp(mplF(l))}`).join(' L')} Z`
      : ''
  const moved = START - L
  const dY = (now.world / start.world - 1) * 100

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold">{m.title}</h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{m.body}</p>
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full text-slate-500 dark:text-slate-400">
          {ticks(top).map((v) => (
            <g key={v}>
              <line x1={M.left} x2={W - M.right} y1={y(v)} y2={y(v)} className="stroke-slate-200 dark:stroke-slate-800" />
              <text x={M.left - 6} y={y(v)} dy="0.32em" textAnchor="end" className="fill-current text-[11px]">
                {v.toFixed(2)}
              </text>
            </g>
          ))}
          <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} className="stroke-slate-400" />
          {area && <path d={area} className="fill-emerald-400/40 dark:fill-emerald-500/30" />}
          <path d={curve(mplH)} fill="none" strokeWidth={2.5} className="stroke-a" />
          <path d={curve(mplF)} fill="none" strokeWidth={2.5} className="stroke-b" />
          <line x1={x(START)} x2={x(START)} y1={M.top} y2={H - M.bottom} strokeDasharray="4 3" className="stroke-slate-400" />
          <line x1={x(L)} x2={x(L)} y1={M.top} y2={H - M.bottom} strokeWidth={2} className="stroke-slate-800 dark:stroke-slate-100" />
          <line x1={x(eq)} x2={x(eq)} y1={H - M.bottom} y2={H - M.bottom + 6} strokeWidth={2} className="stroke-emerald-600" />
          <circle cx={x(L)} cy={clamp(now.wHome)} r={5} className="fill-a" />
          <circle cx={x(L)} cy={clamp(now.wForeign)} r={5} className="fill-b" />
          <text x={M.left} y={H - 10} className="fill-current text-[11px]">
            ← {m.home}
          </text>
          <text x={W - M.right} y={H - 10} textAnchor="end" className="fill-current text-[11px]">
            {m.foreign} →
          </text>
          <text x={x(WORLD * 0.05)} y={M.top + 12} className="fill-a text-[11px] font-semibold">
            MPL ({m.home})
          </text>
          <text x={x(WORLD * 0.95)} y={M.top + 12} textAnchor="end" className="fill-b text-[11px] font-semibold">
            MPL* ({m.foreign})
          </text>
        </svg>

        <div className="space-y-4">
          <Slider id={sliderId} label={m.productivity(m.home)} value={aHome} onChange={(v) => { setAHome(v); setHomeL(null) }} />
          <Slider label={m.productivity(m.foreign)} value={aForeign} onChange={(v) => { setAForeign(v); setHomeL(null) }} />
          <div>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <label htmlFor={`${sliderId}-moved`}>{m.moved}</label>
              <span className="font-semibold tabular-nums">{moved.toFixed(0)}</span>
            </div>
            <input
              id={`${sliderId}-moved`}
              type="range"
              min={-95}
              max={95}
              step={1}
              value={Math.round(moved)}
              onChange={(e) => setHomeL(START - Number(e.target.value))}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setHomeL(eq)}
                className="flex-1 rounded-lg bg-slate-800 px-2 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900"
              >
                {m.toEquilibrium}
              </button>
              <button
                type="button"
                onClick={() => setHomeL(null)}
                className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs dark:border-slate-700"
              >
                {m.reset}
              </button>
            </div>
          </div>
          <dl className="space-y-1 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/50">
            <Row label={m.wage(m.home)} from={start.wHome} to={now.wHome} />
            <Row label={m.wage(m.foreign)} from={start.wForeign} to={now.wForeign} />
            <Row label={m.worldOutput} from={start.world} to={now.world} />
          </dl>
        </div>
      </div>
      {Math.abs(moved) >= 1 && (
        <p className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
          💡{' '}
          {m.reading(
            signed((now.wHome / start.wHome - 1) * 100),
            signed((now.wForeign / start.wForeign - 1) * 100),
            signed(dY),
            moved > 0 ? m.home : m.foreign,
            moved > 0 ? m.foreign : m.home,
          )}
        </p>
      )}
    </section>
  )
}

function Row({ label, from, to }: { label: string; from: number; to: number }) {
  const d = (to / from - 1) * 100
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="tabular-nums">
        {from.toFixed(2)} → <span className="font-semibold">{to.toFixed(2)}</span>{' '}
        <span className={Math.abs(d) < 0.05 ? 'text-slate-400' : d > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
          ({signed(d)})
        </span>
      </dd>
    </div>
  )
}

function Slider({ id, label, value, onChange }: { id?: string; label: string; value: number; onChange: (v: number) => void }) {
  const fallback = useId()
  const inputId = id ?? fallback
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <label htmlFor={inputId}>{label}</label>
        <span className="font-semibold tabular-nums">{value.toFixed(2)}</span>
      </div>
      <input id={inputId} type="range" min={0.5} max={2.5} step={0.05} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}
