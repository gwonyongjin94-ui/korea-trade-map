// Downloads Korea's annual goods trade by partner country from the UN Comtrade public API (no key needed)
// and writes the compact dataset the app imports: src/data/trade.json. For the theory tab it also
// fetches GDP (IMF World Economic Outlook) and capital coordinates (World Bank), derives the
// Grubel–Lloyd index from the chapter breakdown, and computes Balassa RCA against major exporters.
//
//   npm run data            # uses cached responses where available
//   npm run data -- --fresh # ignores the cache
//   npm run data -- --no-chapters  # skips the slow per-partner product breakdown
//
// The public "preview" endpoint returns at most 500 rows per call and one period per call, and it
// rate-limits bursts, so requests run one at a time with a pause and retry on HTTP 429.

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import countries from 'i18n-iso-countries'

const BASE = 'https://comtradeapi.un.org/public/v1/preview/C/A/HS'
const PARTNERS_URL = 'https://comtradeapi.un.org/files/v1/app/reference/partnerAreas.json'
const GDP_URL = 'https://www.imf.org/external/datamapper/api/v1/NGDPD'
const COUNTRIES_URL = 'https://api.worldbank.org/v2/country?format=json&per_page=400'
/** World Bank indicators for the models' real-data examples. */
const WB_INDICATORS = {
  agriVa: 'NV.AGR.EMPL.KD', // agriculture, forestry and fishing value added per worker, constant 2015 USD
  indVa: 'NV.IND.EMPL.KD', // industry (incl. construction) value added per worker, constant 2015 USD
  arable: 'AG.LND.ARBL.HA.PC', // arable land, hectares per person
  agriEmp: 'SL.AGR.EMPL.ZS', // employment in agriculture, % of total (modelled ILO estimate)
}
const KOREA = 410
const YEARS = Array.from({ length: 11 }, (_, i) => 2015 + i)
const FLOWS = ['X', 'M']
/** Products offered in the filter, grouped so each call stays under the 500-row cap. */
const PRODUCT_GROUPS = [
  ['8542', '2709', '2846'],
  ['8703', '190230'],
  ['8901', '8507'],
  ['2710'],
]
/** Partners ranked this high in any year (exports or imports) get a by-chapter breakdown. */
const TOP_FOR_CHAPTERS = 15
/** Chapters kept per partner, year and flow; the rest are summed into "other". */
const CHAPTERS_KEPT = 8
/**
 * Candidate exporters whose summed exports stand in for "the world" in RCA. Only those reporting in
 * every RCA year are used, so the denominator covers the same countries each year.
 */
const RCA_REPORTERS = [
  156, 842, 276, 528, 392, 380, 251, 410, 344, 484, 124, 56, 826, 702, 490, 699, 757, 724, 784, 704, 36, 616,
  458, 764, 76, 360, 682, 372, 203, 40, 752, 792, 579, 634, 208, 608, 348, 703, 152, 710, 376, 398, 246, 620,
  642, 32, 604, 414, 512, 554, 170, 804, 818, 504, 705, 300, 442, 440, 643, 364, 368, 566, 12, 862, 586,
]
/** Korea's largest export chapters in any year, this many per year, get an RCA. */
const RCA_TOP_CHAPTERS = 20
const ROW_CAP = 500
const PAUSE_MS = 1200
const CACHE = new URL('./.cache/', import.meta.url)
const OUT = new URL('../src/data/trade.json', import.meta.url)
const fresh = process.argv.includes('--fresh')
const skipChapters = process.argv.includes('--no-chapters')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let calls = 0

async function getJson(url) {
  const key = createHash('sha1').update(url).digest('hex').slice(0, 16)
  const file = new URL(`${key}.json`, CACHE)
  if (!fresh) {
    try {
      return JSON.parse(await readFile(file, 'utf8'))
    } catch {
      // Not cached yet.
    }
  }
  for (let attempt = 0; ; attempt++) {
    await sleep(PAUSE_MS)
    calls++
    let res
    let body
    try {
      // The timeout covers reading the body too, so both sit inside the retry.
      res = await fetch(url, { signal: AbortSignal.timeout(90_000) })
      if (res.status !== 429 && res.ok) body = await res.json()
    } catch (e) {
      // Dropped connections and timeouts happen on long runs; retry like a rate limit.
      if (attempt >= 6) throw e
      console.warn(`  ${e.cause?.code ?? e.name}, retrying`)
      await sleep(5000 * (attempt + 1))
      continue
    }
    if (res.status === 429 && attempt < 6) {
      const wait = 3000 * 2 ** attempt
      console.warn(`  429, waiting ${wait / 1000}s`)
      await sleep(wait)
      continue
    }
    if (!res.ok) throw new Error(`${res.status} for ${url}`)
    if (body.error) throw new Error(`${body.error} for ${url}`)
    await writeFile(file, JSON.stringify(body))
    return body
  }
}

/** Rows for one year and flow. Splits the request if the row cap may have cut it short. */
async function rows({ year, flow, cmd, partners, reporters = [KOREA] }) {
  const q = new URLSearchParams({ reporterCode: reporters.join(','), period: String(year), flowCode: flow, cmdCode: cmd.join(',') })
  if (partners) q.set('partnerCode', partners.join(','))
  const body = await getJson(`${BASE}?${q}`)
  const data = body.data ?? []
  if (data.length >= ROW_CAP) {
    const [list, key] = partners && partners.length > 1 ? [partners, 'partners'] : [cmd, 'cmd']
    if (list.length < 2) throw new Error(`Row cap hit for a single query: ${q}`)
    const mid = Math.ceil(list.length / 2)
    return [
      ...(await rows({ year, flow, cmd, partners, reporters, [key]: list.slice(0, mid) })),
      ...(await rows({ year, flow, cmd, partners, reporters, [key]: list.slice(mid) })),
    ]
  }
  // Keep the plain totals: all customs procedures, all transport modes, no second partner.
  return data.filter((r) => r.customsCode === 'C00' && r.motCode === 0 && r.partner2Code === 0)
}

/** Comtrade partner code → ISO 3166 numeric id as used by world-atlas, or null for groups and "areas nes". */
async function partnerMap() {
  const ref = await getJson(PARTNERS_URL)
  const map = new Map()
  for (const p of ref.results ?? ref) {
    const alpha3 = (p.PartnerCodeIsoAlpha3 ?? '').trim()
    // Comtrade files Taiwan under "Other Asia, nes" (S19).
    const iso = p.id === 490 ? '158' : countries.alpha3ToNumeric(alpha3)
    map.set(p.id, iso ?? null)
  }
  return map
}

const millions = (v) => Math.round(v / 1e5) / 10
const round = (v, digits) => Math.round(v * 10 ** digits) / 10 ** digits

async function main() {
  await mkdir(CACHE, { recursive: true })
  const isoOf = await partnerMap()
  const unmapped = new Map()

  /** product → flow → year → { iso: USD millions }, plus the world total under "000". */
  const byPartner = {}
  const add = (product, flow, year, r) => {
    const iso = r.partnerCode === 0 ? '000' : isoOf.get(r.partnerCode)
    if (iso === undefined || iso === null) {
      if (r.partnerCode !== 0) unmapped.set(r.partnerCode, (unmapped.get(r.partnerCode) ?? 0) + r.primaryValue)
      return
    }
    const slot = (((byPartner[product] ??= {})[flow] ??= {})[year] ??= {})
    slot[iso] = millions((slot[iso] ?? 0) * 1e6 + r.primaryValue)
  }

  for (const year of YEARS) {
    for (const flow of FLOWS) {
      process.stdout.write(`${year} ${flow}: totals`)
      for (const r of await rows({ year, flow, cmd: ['TOTAL'] })) add('TOTAL', flow, year, r)
      process.stdout.write(', products')
      for (const group of PRODUCT_GROUPS) {
        for (const r of await rows({ year, flow, cmd: group })) add(r.cmdCode, flow, year, r)
      }
      console.log(` (${calls} calls so far)`)
    }
  }

  // Partners worth a by-chapter breakdown: top N by value in any year and flow.
  const top = new Set()
  for (const flow of FLOWS) {
    for (const year of YEARS) {
      Object.entries(byPartner.TOTAL[flow][year])
        .filter(([iso]) => iso !== '000')
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOP_FOR_CHAPTERS)
        .forEach(([iso]) => top.add(iso))
    }
  }
  const codeOf = new Map([...isoOf].filter(([, iso]) => iso).map(([code, iso]) => [iso, code]))
  // Prefer the code Comtrade actually reports under (e.g. 842 for the USA rather than 840).
  for (const r of await rows({ year: 2025, flow: 'X', cmd: ['TOTAL'] })) {
    const iso = isoOf.get(r.partnerCode)
    if (iso) codeOf.set(iso, r.partnerCode)
  }
  const chapterPartners = skipChapters ? [] : [0, ...[...top].map((iso) => codeOf.get(iso))]
  console.log(`Chapter breakdown for ${top.size} partners + world`)

  /** flow → year → iso → [[hs2, USD millions], ...] sorted, with "other" last. */
  const chapters = { X: {}, M: {} }
  /** flow → year → iso → Map(hs2 → USD), every chapter, for the indices that need the full breakdown. */
  const full = { X: {}, M: {} }
  for (const year of skipChapters ? [] : YEARS) {
    for (const flow of FLOWS) {
      const sums = {}
      for (let i = 0; i < chapterPartners.length; i += 4) {
        for (const r of await rows({ year, flow, cmd: ['AG2'], partners: chapterPartners.slice(i, i + 4) })) {
          const iso = r.partnerCode === 0 ? '000' : isoOf.get(r.partnerCode)
          if (!iso) continue
          ;(sums[iso] ??= []).push([r.cmdCode, r.primaryValue])
          ;((full[flow][year] ??= {})[iso] ??= new Map()).set(r.cmdCode, r.primaryValue)
        }
      }
      for (const [iso, list] of Object.entries(sums)) {
        list.sort((a, b) => b[1] - a[1])
        const kept = list.slice(0, CHAPTERS_KEPT).map(([c, v]) => [c, millions(v)])
        const rest = list.slice(CHAPTERS_KEPT).reduce((s, [, v]) => s + v, 0)
        if (rest > 0) kept.push(['other', millions(rest)])
        ;((chapters[flow] ??= {})[year] ??= {})[iso] = kept
      }
      console.log(`${year} ${flow}: chapters (${calls} calls so far)`)
    }
  }

  const iit = skipChapters ? null : grubelLloyd(full)
  const sectors = skipChapters ? null : farmAndIndustry(full)
  const rca = skipChapters ? null : await balassa(full)
  const { gdp, capitals } = await gravityInputs(byPartner)
  const wb = await worldBank(new Set(['410', ...Object.keys(full.X[YEARS[YEARS.length - 1]] ?? {})]))

  const out = {
    meta: {
      source: 'UN Comtrade, reporter: Republic of Korea, HS, annual, customs value in USD',
      unit: 'USD million',
      fetched: new Date().toISOString().slice(0, 10),
      years: YEARS,
    },
    partners: byPartner,
    chapters,
    iit,
    sectors,
    wb,
    rca,
    gdp,
    capitals,
  }
  await mkdir(new URL('.', OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify(out))
  const unmappedTotal = [...unmapped.values()].reduce((a, b) => a + b, 0)
  console.log(`Wrote ${OUT.pathname} after ${calls} API calls. Unmapped partner value (all years, flows, products): ${millions(unmappedTotal)}M USD`)
  console.log('Unmapped codes:', [...unmapped.keys()].join(', '))
}

/**
 * Grubel–Lloyd index of intra-industry trade, GL = Σ(X + M − |X − M|) / Σ(X + M) over HS chapters,
 * for each partner with a chapter breakdown, plus Korea–world exports and imports by chapter.
 */
function grubelLloyd(full) {
  const iit = { partners: {}, chapters: {} }
  for (const year of YEARS) {
    const X = full.X[year] ?? {}
    const M = full.M[year] ?? {}
    for (const iso of new Set([...Object.keys(X), ...Object.keys(M)])) {
      let overlap = 0
      let total = 0
      for (const c of new Set([...(X[iso]?.keys() ?? []), ...(M[iso]?.keys() ?? [])])) {
        const x = X[iso]?.get(c) ?? 0
        const m = M[iso]?.get(c) ?? 0
        total += x + m
        overlap += x + m - Math.abs(x - m)
      }
      if (total > 0) (iit.partners[year] ??= {})[iso] = round(overlap / total, 3)
    }
    const wx = X['000'] ?? new Map()
    const wm = M['000'] ?? new Map()
    iit.chapters[year] = [...new Set([...wx.keys(), ...wm.keys()])]
      .map((c) => [c, millions(wx.get(c) ?? 0), millions(wm.get(c) ?? 0)])
      // Every chapter, largest trade first: the theory tab shows the top rows, the specific factors tab groups them by sector.
      .sort((a, b) => b[1] + b[2] - (a[1] + a[2]))
  }
  return iit
}

/**
 * Farm goods (HS 01–24) and everything else (25–99) by flow, year and partner, for the Ricardian and
 * specific factors examples: flow → year → iso → [farm, other] in USD millions.
 */
function farmAndIndustry(full) {
  const out = { X: {}, M: {} }
  for (const flow of FLOWS) {
    for (const [year, byIso] of Object.entries(full[flow])) {
      for (const [iso, chapters] of Object.entries(byIso)) {
        let farm = 0
        let other = 0
        for (const [code, v] of chapters) {
          if (Number(code) <= 24) farm += v
          else other += v
        }
        ;(out[flow][year] ??= {})[iso] = [millions(farm), millions(other)]
      }
    }
  }
  return out
}

/** World Bank series for the given partners: indicator → iso → year → value. */
async function worldBank(isos) {
  const out = {}
  for (const [key, code] of Object.entries(WB_INDICATORS)) {
    const [, rows] = await getJson(`https://api.worldbank.org/v2/country/all/indicator/${code}?format=json&date=${YEARS[0]}:${YEARS[YEARS.length - 1]}&per_page=20000`)
    for (const r of rows ?? []) {
      const iso = r.countryiso3code && countries.alpha3ToNumeric(r.countryiso3code)
      if (!iso || !isos.has(iso) || r.value === null) continue
      ;((out[key] ??= {})[iso] ??= {})[r.date] = round(r.value, 3)
    }
  }
  console.log(`World Bank series for ${Object.keys(out.agriVa ?? {}).length} partners`)
  return out
}

/**
 * Balassa revealed comparative advantage, RCA = (Korea's exports of k / Korea's total) ÷ (world exports
 * of k / world total), with "world" = the exporters in RCA_REPORTERS that report in every year used.
 * Covers Korea's top export chapters and the filter's products. Also returns Korea's share of world exports.
 */
async function balassa(full) {
  const totals = {}
  for (const year of YEARS) {
    for (const r of await rows({ year, flow: 'X', cmd: ['TOTAL'], partners: [0], reporters: RCA_REPORTERS })) {
      if (r.primaryValue > 0) (totals[year] ??= {})[r.reporterCode] = r.primaryValue
    }
    console.log(`${year}: RCA reporter totals (${Object.keys(totals[year] ?? {}).length} reporters, ${calls} calls so far)`)
  }
  // Reporters present in every year up to the last complete one; the latest year joins only if they all report it.
  const base = YEARS.slice(0, -1)
  const set = RCA_REPORTERS.filter((c) => base.every((y) => totals[y]?.[c]))
  const last = YEARS[YEARS.length - 1]
  const years = set.every((c) => totals[last]?.[c]) ? YEARS : base
  const missingLast = set.filter((c) => !totals[last]?.[c])
  console.log(`RCA: ${set.length} reporters, years ${years[0]}–${years[years.length - 1]}` + (missingLast.length ? ` (${last} missing: ${missingLast.join(', ')})` : ''))

  const top = new Set()
  for (const year of YEARS) {
    ;[...(full.X[year]?.['000'] ?? new Map())]
      .filter(([c]) => c !== '99')
      .sort((a, b) => b[1] - a[1])
      .slice(0, RCA_TOP_CHAPTERS)
      .forEach(([c]) => top.add(c))
  }
  const codes = [...top, ...PRODUCT_GROUPS.flat()]
  const perCall = Math.max(1, Math.floor(450 / codes.length))

  const out = { reporters: set.length, years, byYear: {}, share: {} }
  for (const year of years) {
    const world = {}
    const korea = {}
    for (let i = 0; i < set.length; i += perCall) {
      for (const r of await rows({ year, flow: 'X', cmd: codes, partners: [0], reporters: set.slice(i, i + perCall) })) {
        world[r.cmdCode] = (world[r.cmdCode] ?? 0) + r.primaryValue
        if (r.reporterCode === KOREA) korea[r.cmdCode] = r.primaryValue
      }
    }
    const worldTotal = set.reduce((s, c) => s + totals[year][c], 0)
    const koreaTotal = totals[year][KOREA]
    out.share[year] = round(koreaTotal / worldTotal, 4)
    out.byYear[year] = Object.fromEntries(
      codes
        .filter((c) => world[c] > 0)
        .map((c) => [c, [round((korea[c] ?? 0) / koreaTotal / (world[c] / worldTotal), 2), round((korea[c] ?? 0) / world[c], 4)]]),
    )
    console.log(`${year}: RCA for ${codes.length} codes (${calls} calls so far)`)
  }
  return out
}

/** GDP in USD billions (IMF WEO) by year and partner, and capital [lon, lat] (World Bank) for distances. */
async function gravityInputs(byPartner) {
  const wanted = new Set(['410'])
  for (const flows of Object.values(byPartner)) for (const years of Object.values(flows)) for (const by of Object.values(years)) for (const iso of Object.keys(by)) wanted.add(iso)

  const imf = (await getJson(GDP_URL)).values.NGDPD
  const gdp = {}
  for (const [alpha3, series] of Object.entries(imf)) {
    const iso = countries.alpha3ToNumeric(alpha3)
    if (!iso || !wanted.has(iso)) continue
    for (const year of YEARS) if (series[year] > 0) (gdp[year] ??= {})[iso] = round(series[year], 1)
  }

  const [, list] = await getJson(COUNTRIES_URL)
  // Taipei: Taiwan is not in the World Bank's country list.
  const capitals = { '158': [121.56, 25.03] }
  for (const c of list) {
    const iso = countries.alpha3ToNumeric(c.id)
    if (!iso || !wanted.has(iso) || !c.latitude) continue
    capitals[iso] = [round(Number(c.longitude), 2), round(Number(c.latitude), 2)]
  }
  console.log(`GDP for ${Object.keys(gdp[YEARS[YEARS.length - 1]] ?? {}).length} partners, capitals for ${Object.keys(capitals).length}`)
  return { gdp, capitals }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
