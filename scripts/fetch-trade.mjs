// Downloads Korea's annual goods trade by partner country from the UN Comtrade public API (no key needed)
// and writes the compact dataset the app imports: src/data/trade.json.
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
async function rows({ year, flow, cmd, partners }) {
  const q = new URLSearchParams({ reporterCode: String(KOREA), period: String(year), flowCode: flow, cmdCode: cmd.join(',') })
  if (partners) q.set('partnerCode', partners.join(','))
  const body = await getJson(`${BASE}?${q}`)
  const data = body.data ?? []
  if (data.length >= ROW_CAP) {
    const [list, key] = partners && partners.length > 1 ? [partners, 'partners'] : [cmd, 'cmd']
    if (list.length < 2) throw new Error(`Row cap hit for a single query: ${q}`)
    const mid = Math.ceil(list.length / 2)
    return [
      ...(await rows({ year, flow, cmd, partners, [key]: list.slice(0, mid) })),
      ...(await rows({ year, flow, cmd, partners, [key]: list.slice(mid) })),
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
  for (const year of skipChapters ? [] : YEARS) {
    for (const flow of FLOWS) {
      const sums = {}
      for (let i = 0; i < chapterPartners.length; i += 4) {
        for (const r of await rows({ year, flow, cmd: ['AG2'], partners: chapterPartners.slice(i, i + 4) })) {
          const iso = r.partnerCode === 0 ? '000' : isoOf.get(r.partnerCode)
          if (!iso) continue
          ;(sums[iso] ??= []).push([r.cmdCode, r.primaryValue])
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

  const out = {
    meta: {
      source: 'UN Comtrade, reporter: Republic of Korea, HS, annual, customs value in USD',
      unit: 'USD million',
      fetched: new Date().toISOString().slice(0, 10),
      years: YEARS,
    },
    partners: byPartner,
    chapters,
  }
  await mkdir(new URL('.', OUT), { recursive: true })
  await writeFile(OUT, JSON.stringify(out))
  const unmappedTotal = [...unmapped.values()].reduce((a, b) => a + b, 0)
  console.log(`Wrote ${OUT.pathname} after ${calls} API calls. Unmapped partner value (all years, flows, products): ${millions(unmappedTotal)}M USD`)
  console.log('Unmapped codes:', [...unmapped.keys()].join(', '))
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
