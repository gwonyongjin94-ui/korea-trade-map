import { useEffect, useMemo, useState } from 'react'
import { ChapterBars } from './components/ChapterBars'
import { ControlPanel } from './components/ControlPanel'
import { RankTable } from './components/RankTable'
import { StatCards, type Stat } from './components/StatCards'
import { TradeMap, type LegendSpec } from './components/TradeMap'
import { RicardoTab } from './components/RicardoTab'
import { TheoryTab } from './components/theory/TheoryTab'
import { TrendChart } from './components/TrendChart'
import { PRODUCTS, productById } from './data/products'
import {
  change,
  chapterList,
  DATA,
  metric,
  pairOf,
  partnerStats,
  rankOf,
  ranked,
  series,
  WORLD,
  YEARS,
  type View,
} from './data/trade'
import { arrows as buildArrows, arrowScale, fills as buildFills, scales } from './derive'
import { money, percent } from './format'
import { KOREA } from './geo'
import { countryFlag, countryName, LangContext, STRINGS, type Lang } from './i18n'
import { THEORY_TEXT } from './theoryText'

const LANG_KEY = 'korea-trade-lang'
const FIRST = YEARS[0]
const LAST = YEARS[YEARS.length - 1]
const VIEWS: View[] = ['export', 'import', 'balance', 'total']
const TABLE_ROWS = 20

type Tab = 'map' | 'theory' | 'ricardo'
const TABS: Tab[] = ['map', 'theory', 'ricardo']

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY)
    if (saved === 'ko' || saved === 'en') return saved
  } catch {
    // Storage can be unavailable (private mode); fall through to the browser language.
  }
  return navigator.language.startsWith('ko') ? 'ko' : 'en'
}

interface UrlState {
  tab: Tab
  view: View
  product: string
  year: number
  country: string | null
}

/** The view lives in the URL hash so a link (e.g. in a report) opens the same map. */
function readHash(): UrlState {
  const q = new URLSearchParams(location.hash.slice(1))
  const view = q.get('view') as View
  const product = q.get('product') ?? ''
  const year = Number(q.get('year'))
  const country = q.get('country')
  return {
    tab: TABS.includes(q.get('tab') as Tab) ? (q.get('tab') as Tab) : 'map',
    view: VIEWS.includes(view) ? view : 'export',
    product: PRODUCTS.some((p) => p.id === product) ? product : 'TOTAL',
    year: YEARS.includes(year) ? year : LAST,
    country: country && /^\d{3}$/.test(country) && country !== KOREA ? country : null,
  }
}

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang)
  const t = STRINGS[lang]
  const tt = THEORY_TEXT[lang]
  const [start] = useState(readHash)
  const [tab, setTab] = useState<Tab>(start.tab)
  const [view, setView] = useState<View>(start.view)
  const [product, setProduct] = useState(start.product)
  const [year, setYear] = useState(start.year)
  const [selected, setSelected] = useState<string | null>(start.country)
  const [count, setCount] = useState(10)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = t.title
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      // Ignore: remembering the language is only a convenience.
    }
  }, [lang, t.title])

  useEffect(() => {
    const q = new URLSearchParams({ view, product, year: String(year) })
    if (selected) q.set('country', selected)
    if (tab !== 'map') q.set('tab', tab)
    history.replaceState(null, '', `#${q}`)
  }, [tab, view, product, year, selected])

  // Playback: step one year at a time and stop at the last one.
  useEffect(() => {
    if (!playing) return
    const id = setTimeout(() => (year < LAST ? setYear(year + 1) : setPlaying(false)), year === FIRST ? 900 : 1300)
    return () => clearTimeout(id)
  }, [playing, year])

  const togglePlay = () => {
    if (!playing && year === LAST) setYear(FIRST)
    setPlaying(!playing)
  }

  const prod = productById(product)
  const productLabel = `${prod.icon} ${prod.name[lang]}`
  const name = (iso: string) => countryName(iso, lang)
  const fmtShort = (v: number, signed = false) => money(v, lang, { short: true, signed })
  const fmt = (v: number, signed = false) => money(v, lang, { signed })

  const scale = useMemo(() => scales(product), [product])
  const stats = useMemo(() => partnerStats(product, year), [product, year])
  const list = useMemo(() => ranked(view, product, year), [view, product, year])
  const top = list.slice(0, count)
  const world = pairOf(product, year, WORLD)
  const prevWorld = year > FIRST ? pairOf(product, year - 1, WORLD) : null
  const pair = selected ? pairOf(product, year, selected) : null
  const prevPair = selected && year > FIRST ? pairOf(product, year - 1, selected) : null

  const mapArrows = buildArrows({
    view,
    product,
    year,
    top,
    selected: selected && pair ? { iso: selected, ...pair } : null,
    format: fmtShort,
  })
  const mapFills = useMemo(() => buildFills(view, stats, scale), [view, stats, scale])

  const legend: LegendSpec = {
    arrows: selected
      ? [
          { tone: 'a', label: t.exportArrow },
          { tone: 'b', label: t.importArrow },
        ]
      : view === 'export'
        ? [{ tone: 'a', label: t.exportArrow }]
        : view === 'import'
          ? [{ tone: 'b', label: t.importArrow }]
          : view === 'balance'
            ? [
                { tone: 'a', label: t.surplusArrow },
                { tone: 'b', label: t.deficitArrow },
              ]
            : [
                { tone: 'a', label: t.exportArrow },
                { tone: 'b', label: t.importArrow },
              ],
    fill: { tones: view === 'export' ? ['a'] : view === 'import' ? ['b'] : view === 'balance' ? ['a', 'b'] : ['n'], label: t.views[view] },
  }

  const describe = (iso: string) => {
    const p = iso === KOREA ? world : pairOf(product, year, iso)
    const title = `${countryFlag(iso)} ${iso === KOREA ? t.korea : name(iso)} · ${year}`
    if (!p.x && !p.m) return { title, lines: [t.noData] }
    const r = iso === KOREA ? null : rankOf(view, product, year, iso)
    return {
      title,
      lines: [
        `${t.views.export} ${fmt(p.x)}`,
        `${t.views.import} ${fmt(p.m)}`,
        `${t.views.balance} ${fmt(p.x - p.m, true)}`,
        ...(r ? [`${t.views[view]} ${t.rank(r)}`] : []),
      ],
    }
  }

  const yoy = (now: number, before: number | undefined): Pick<Stat, 'sub' | 'subTone'> => {
    if (before === undefined) return {}
    const c = change(now, before)
    return { sub: `${t.yoy} ${percent(c, { signed: true })}`, subTone: c === null ? undefined : c >= 0 ? 'up' : 'down' }
  }
  const prefix = product === 'TOTAL' ? '' : `${prod.icon} `
  const base = metric(view === 'balance' ? 'total' : view, world)

  const statCards: Stat[] =
    selected && pair
      ? [
          { label: prefix + t.pairExport(name(selected)), value: fmt(pair.x), tone: 'a', ...yoy(pair.x, prevPair?.x) },
          { label: prefix + t.pairImport(name(selected)), value: fmt(pair.m), tone: 'b', ...yoy(pair.m, prevPair?.m) },
          {
            label: prefix + t.balance,
            value: fmt(pair.x - pair.m, true),
            tone: pair.x >= pair.m ? 'a' : 'b',
            sub: prevPair ? t.prevYear(year - 1, fmtShort(prevPair.x - prevPair.m, true)) : undefined,
          },
          {
            label: prefix + (view === 'balance' ? t.shareOfTrade : t.share(t.views[view])),
            value: percent(base ? (metric(view === 'balance' ? 'total' : view, pair) / base) * 100 : null),
            sub: (() => {
              const r = rankOf(view === 'balance' ? 'total' : view, product, year, selected)
              return r ? t.rank(r) : undefined
            })(),
          },
        ]
      : [
          { label: prefix + t.totalExports, value: fmt(world.x), tone: 'a', ...yoy(world.x, prevWorld?.x) },
          { label: prefix + t.totalImports, value: fmt(world.m), tone: 'b', ...yoy(world.m, prevWorld?.m) },
          {
            label: prefix + t.balance,
            value: fmt(world.x - world.m, true),
            tone: world.x >= world.m ? 'a' : 'b',
            sub: prevWorld ? t.prevYear(year - 1, fmtShort(prevWorld.x - prevWorld.m, true)) : undefined,
          },
          list[0]
            ? {
                label: prefix + t.topPartner(t.views[view]),
                value: `${countryFlag(list[0].iso)} ${name(list[0].iso)}`,
                sub:
                  view === 'balance'
                    ? fmtShort(metric('balance', list[0]), true)
                    : `${fmtShort(metric(view, list[0]))} · ${percent(base ? (metric(view, list[0]) / base) * 100 : null)}`,
              }
            : { label: prefix + t.topPartner(t.views[view]), value: '—' },
        ]

  const summary = (() => {
    const lead = product === 'TOTAL' ? '' : t.summary.product(prod.name[lang])
    if (selected && pair) return lead + t.pair(year, name(selected), fmt(pair.x), fmt(pair.m), fmt(Math.abs(pair.x - pair.m)), pair.x >= pair.m)
    if (view === 'balance') {
      const bySign = [...stats].sort((a, b) => b.x - b.m - (a.x - a.m))
      const best = bySign[0]
      const worst = bySign[bySign.length - 1]
      if (!best || !worst) return ''
      return lead + t.summary.balance(year, name(best.iso), fmt(best.x - best.m, true), name(worst.iso), fmt(worst.x - worst.m, true))
    }
    const [a, b] = list
    if (!a || !b) return ''
    const v = (p: typeof a) => metric(view, p)
    return lead + t.summary[view](year, name(a.iso), fmt(v(a)), percent(base ? (v(a) / base) * 100 : null), name(b.iso), fmt(v(b)))
  })()

  const scope = selected ? t.pairScope(name(selected)) : t.korea

  return (
    <LangContext.Provider value={{ lang, t }}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.title}</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">{t.subtitle}</p>
          </div>
          <div className="flex rounded-lg bg-slate-200 p-1 text-sm dark:bg-slate-800">
            {(['ko', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={
                  'rounded-md px-2.5 py-1 ' + (lang === l ? 'bg-white font-semibold shadow-sm dark:bg-slate-950' : 'text-slate-500 dark:text-slate-400')
                }
              >
                {l === 'ko' ? '한국어' : 'EN'}
              </button>
            ))}
          </div>
        </header>

        <nav className="mb-5 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-slate-200 dark:border-slate-800" aria-label="tabs">
          {TABS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                setPlaying(false)
                setTab(k)
              }}
              aria-current={tab === k ? 'page' : undefined}
              className={
                '-mb-px shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold whitespace-nowrap transition sm:px-4 ' +
                (tab === k
                  ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200')
              }
            >
              {tt.tabs[k]}
            </button>
          ))}
        </nav>

        {tab === 'ricardo' ? (
          <RicardoTab />
        ) : tab === 'theory' ? (
          <TheoryTab
            view={view}
            product={product}
            year={year}
            years={YEARS}
            selected={selected}
            onView={setView}
            onProduct={setProduct}
            onYear={setYear}
            onPick={setSelected}
            onRicardo={() => {
              setTab('ricardo')
              window.scrollTo(0, 0)
            }}
          />
        ) : (
          <>
          {summary && (
            <p className="mb-4 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200" aria-live="polite">
              <span className="mr-1">📊</span>
              {summary}
            </p>
          )}

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section className="min-w-0 space-y-3 lg:col-start-1">
              <TradeMap
                arrows={mapArrows}
                fills={mapFills}
                scaleMax={arrowScale(view, scale, selected !== null)}
                selected={selected}
                legend={legend}
                onPick={setSelected}
                describe={describe}
              />
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">{t.mapHint}</p>
            </section>

            <aside className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start dark:border-slate-800 dark:bg-slate-900">
              <ControlPanel
                view={view}
                product={product}
                year={year}
                years={YEARS}
                playing={playing}
                count={count}
                onView={setView}
                onProduct={setProduct}
                onYear={(y) => {
                  setPlaying(false)
                  setYear(y)
                }}
                onPlay={togglePlay}
                onCount={setCount}
              />
            </aside>

            {/* After the controls on phones, under the map on wide screens. */}
            <div className="min-w-0 lg:col-start-1">
              <StatCards stats={statCards} />
            </div>
          </div>

          <main className="mt-8 space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TrendChart
                title={`${prefix}${t.trend(scope)}`}
                data={series(product, selected ?? WORLD)}
                year={year}
                onYear={(y) => {
                  setPlaying(false)
                  setYear(y)
                }}
              />
              <ChapterBars
                title={`${t.topChapters(scope)} · ${year}`}
                lists={{ X: chapterList('X', year, selected ?? WORLD), M: chapterList('M', year, selected ?? WORLD) }}
                notice={
                  product === 'TOTAL'
                    ? undefined
                    : { text: t.chaptersOnlyTotal, action: { label: t.showAllProducts, onClick: () => setProduct('TOTAL') } }
                }
              />
            </div>

            <RankTable
              title={`${t.ranking(t.views[view], productLabel)} · ${year}`}
              rows={list.slice(0, TABLE_ROWS)}
              view={view}
              base={base}
              selected={selected}
              onPick={(iso) => setSelected(iso === selected ? null : iso)}
            />
          </main>
          </>
        )}

        <footer className="mt-10 space-y-2 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>{t.source(DATA.meta.fetched)}</p>
          {tab === 'theory' && <p>{t.theorySource}</p>}
          <ul className="list-disc space-y-1 pl-4">
            {t.caveats.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </footer>
      </div>
    </LangContext.Provider>
  )
}
