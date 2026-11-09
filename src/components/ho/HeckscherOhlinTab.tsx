import { useId, useMemo, useState } from 'react'
import { goodById } from '../../data/goods'
import { DATA, WORLD } from '../../data/trade'
import { capitalPerWorker, landAndCapitalAt, revealedIntensity, sharesFromIntensity, type Scope } from '../../hoExamples'
import { HO_LAND_TEXT, LEATHER_HO_TEXT } from '../../hoLandText'
import { HO_TEXT } from '../../hoText'
import { countryFlag, countryName, useI18n, type Lang } from '../../i18n'
import { KOREA } from '../../realExamples'
import { GoodSelect } from '../GoodSelect'
import { LEATHER_CASE, LEATHER_LABELS, LEATHER_TECH } from '../../leatherCase'
import { LeatherCase } from '../LeatherCase'
import { EndowmentCard } from './EndowmentCard'
import { HoModel, type HoSetup } from './HoModel'
import { perHectare, perWorker, units } from './units'
import { IntensityCard } from './IntensityCard'
import { PartnerCard } from './PartnerCard'

type Mode = 'textbook' | 'korea' | 'leather'

const DEFAULT_PARTNER = '704'
/** Goods whose revealed capital intensities differ by less than this (in logs) can't be told apart. */
const MIN_GAP = 0.03

const shortName = (name: string) => name.replace(/\s*\(.*\)/, '')

function textbookSetup(lang: Lang): HoSetup {
  const h = HO_TEXT[lang]
  return {
    names: { A: h.home, B: h.foreign, ...h.textbookGoods },
    icons: { C: '🧵', F: '🌾' },
    e: { A: { K: 100, L: 150 }, B: { K: 150, L: 100 } },
    t: { sC: 0.3, sF: 0.6, gamma: 0.5 },
    real: false,
  }
}

/**
 * Korea and a partner with their real capital and employment (capital in USD billions, labour in
 * thousands), and two goods ordered by revealed capital intensity, with capital shares to match.
 */
function koreaSetup(partner: string, g1: string, g2: string, year: number, kappa: Record<string, number>, lang: Lang): HoSetup | 'same' | null {
  const ka = capitalPerWorker(KOREA, year)
  const kb = capitalPerWorker(partner, year)
  const [x, y] = [goodById(g1), goodById(g2)]
  if (!ka || !kb || !x || !y || !kappa[g1] || !kappa[g2]) return null
  if (Math.abs(Math.log(kappa[g1] / kappa[g2])) < MIN_GAP) return 'same'
  const [C, F] = kappa[g1] < kappa[g2] ? [x, y] : [y, x]
  return {
    names: { A: countryName(KOREA, lang), B: countryName(partner, lang), C: shortName(C.name[lang]), F: shortName(F.name[lang]) },
    icons: { C: C.icon, F: F.icon },
    e: { A: { K: ka.K, L: ka.L * 1000 }, B: { K: kb.K, L: kb.L * 1000 } },
    t: { ...sharesFromIntensity(kappa[C.id], kappa[F.id]), gamma: 0.5 },
    real: true,
  }
}

/**
 * The leather case: Korea and the US with their real capital (USD billions) and arable land (thousands
 * of hectares) in place of labour, hides as the land-intensive good C and cars as the capital-intensive F.
 */
function leatherSetup(year: number, lang: Lang): HoSetup | null {
  const [a, b] = landAndCapitalAt([KOREA, LEATHER_CASE.partner], year) ?? []
  const [C, F] = [goodById(LEATHER_CASE.leather), goodById(LEATHER_CASE.other)]
  if (!a || !b || !C || !F) return null
  const l = LEATHER_LABELS[lang]
  return {
    names: { A: countryName(KOREA, lang), B: countryName(LEATHER_CASE.partner, lang), C: l.C, F: l.F },
    icons: { C: C.icon, F: F.icon },
    e: { A: { K: a.K, L: a.T }, B: { K: b.K, L: b.T } },
    t: LEATHER_TECH,
    real: true,
    factor: 'land',
  }
}

/** Heckscher–Ohlin tab: the model on the textbook example or on Korea and a partner, then real-data checks. */
export function HeckscherOhlinTab({ year }: { year: number }) {
  const { lang } = useI18n()
  const h = HO_TEXT[lang]
  const p = h.pick
  const selectId = useId()
  const [mode, setMode] = useState<Mode>('textbook')
  const [partner, setPartner] = useState(DEFAULT_PARTNER)
  const [goods, setGoods] = useState({ g1: '61', g2: '8542' })
  const [scope, setScope] = useState<Scope>('all')
  const kappa = useMemo(() => revealedIntensity([KOREA]), [])
  const partners = useMemo(
    () =>
      Object.keys(DATA.goods?.bilateral.X ?? {})
        .filter((iso) => iso !== WORLD && iso !== KOREA && capitalPerWorker(iso, year))
        .sort((a, b) => countryName(a, lang).localeCompare(countryName(b, lang), lang)),
    [year, lang],
  )
  const setup = useMemo(
    () =>
      mode === 'textbook'
        ? textbookSetup(lang)
        : mode === 'leather'
          ? leatherSetup(year, lang)
          : koreaSetup(partner, goods.g1, goods.g2, year, kappa, lang),
    [mode, partner, goods, year, kappa, lang],
  )
  const ka = capitalPerWorker(KOREA, year)
  const kb = capitalPerWorker(partner, year)
  const u = units(true, lang)

  const lt = LEATHER_HO_TEXT[lang]
  const pair = mode === 'leather' ? landAndCapitalAt([KOREA, LEATHER_CASE.partner], year) : null
  const land = mode === 'leather' ? [KOREA, LEATHER_CASE.partner].map((iso, i) => [iso, pair?.[i] ?? null] as const) : []

  return (
    <div className="space-y-6">
      <LeatherCase active={mode === 'leather'} onLoad={() => setMode('leather')} note="land" />
      <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold">{h.title}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{mode === 'leather' ? HO_LAND_TEXT[lang].subtitle : h.subtitle}</p>
            <p className="mt-2 text-xs text-slate-400">{mode === 'leather' ? HO_LAND_TEXT[lang].source : h.source}</p>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs dark:bg-slate-800" role="group" aria-label={h.presets.label}>
            {(['textbook', 'korea'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setMode(k)}
                aria-pressed={mode === k}
                className={'rounded-md px-2.5 py-1.5 ' + (mode === k ? 'bg-white font-semibold shadow-sm dark:bg-slate-950' : 'text-slate-500 dark:text-slate-400')}
              >
                {k === 'textbook' ? '📚 ' : '🇰🇷 '}
                {h.presets[k]}
              </button>
            ))}
          </div>
        </div>

        {mode === 'leather' ? (
          <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-800/50">
            {land.every(([, v]) => v) ? (
              <>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{lt.real(land[0][1]!.year)}</div>
                {land.map(([iso, v]) => (
                  <div key={iso} className="mt-1 flex flex-wrap justify-between gap-x-3 tabular-nums">
                    <span>
                      {countryFlag(iso)} {countryName(iso, lang)}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {lt.capital} {units(true, lang, 'land').K(v!.K)} · {lt.land} {units(true, lang, 'land').L(v!.T)} · {lt.perHa} {perHectare(v!.K / v!.T, lang)}
                    </span>
                  </div>
                ))}
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{lt.note(LEATHER_TECH.sC, LEATHER_TECH.sF, LEATHER_TECH.gamma)}</p>
              </>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">{lt.noData}</p>
            )}
          </div>
        ) : mode === 'textbook' ? (
          <p className="mt-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
            <span className="font-semibold">📚 {h.presets.textbook}</span> · {h.textbookNote}
          </p>
        ) : (
          <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="mb-3 text-sm font-semibold">{p.title}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="min-w-0">
                <label htmlFor={selectId} className="mb-1 block text-xs font-semibold">
                  {p.partner}
                </label>
                <select
                  id={selectId}
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  {partners.map((iso) => (
                    <option key={iso} value={iso}>
                      {countryFlag(iso)} {countryName(iso, lang)}
                    </option>
                  ))}
                </select>
              </div>
              <GoodSelect label={p.good1} value={goods.g1} onChange={(g1) => setGoods({ ...goods, g1 })} groups={p.groups} disabled={[goods.g2]} />
              <GoodSelect label={p.good2} value={goods.g2} onChange={(g2) => setGoods({ ...goods, g2 })} groups={p.groups} disabled={[goods.g1]} />
            </div>

            {ka && kb && (
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm dark:bg-slate-800/50">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{p.real(ka.year)}</div>
                {(
                  [
                    [KOREA, ka],
                    [partner, kb],
                  ] as const
                ).map(([iso, k]) => (
                  <div key={iso} className="mt-1 flex flex-wrap justify-between gap-x-3 tabular-nums">
                    <span>
                      {countryFlag(iso)} {countryName(iso, lang)}
                    </span>
                    <span className="text-slate-600 dark:text-slate-300">
                      {p.capital} {perWorker(k.value, lang)} · {p.workers} {u.L(k.L * 1000)}
                    </span>
                  </div>
                ))}
                {[goods.g1, goods.g2].map((id) => {
                  const g = goodById(id)
                  return g && kappa[id] ? (
                    <div key={id} className="mt-1 flex flex-wrap justify-between gap-x-3 tabular-nums">
                      <span>
                        {g.icon} {shortName(g.name[lang])}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {p.kappa} {perWorker(kappa[id], lang)}
                      </span>
                    </div>
                  ) : null
                })}
                {setup && setup !== 'same' && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{p.roles(setup.names.C, setup.names.F)}</p>}
              </div>
            )}
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{setup === 'same' ? p.same : setup ? p.note : p.noData}</p>
          </div>
        )}
      </section>

      {setup && setup !== 'same' && (
        <HoModel
          // A new selection starts again from its own values.
          key={`${mode}-${partner}-${goods.g1}-${goods.g2}-${year}-${lang}`}
          setup={setup}
        />
      )}

      <EndowmentCard year={year} />
      <IntensityCard year={year} scope={scope} onScope={setScope} />
      <PartnerCard scope={scope} onScope={setScope} />
    </div>
  )
}
