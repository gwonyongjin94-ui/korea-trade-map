import { geoArea, geoCentroid, geoNaturalEarth1, geoPath } from 'd3-geo'
import type { Feature, FeatureCollection, Geometry, MultiPolygon, Polygon } from 'geojson'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import world from 'world-atlas/countries-110m.json'

export const WIDTH = 960
export const HEIGHT = 500
export const KOREA = '410'

export type CountryFeature = Feature<Geometry, { name: string }> & { id: string }

const topology = world as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>
const collection = feature(topology, topology.objects.countries) as FeatureCollection<Geometry, { name: string }>

/** Features with a stable id: the ISO numeric code, or the atlas name for the few disputed areas without one. */
export const COUNTRY_FEATURES: CountryFeature[] = collection.features
  .filter((f) => f.properties.name !== 'Antarctica')
  .map((f) => ({ ...f, id: String(f.id ?? f.properties.name) }))

const byId = new Map(COUNTRY_FEATURES.map((f) => [f.id, f]))

/**
 * Partners too small for the 1:110m atlas, placed as dots: city-states, islands and the flag-of-convenience
 * registries that Korea's ship exports are recorded under. [longitude, latitude]
 */
export const SMALL_PLACES: Record<string, [number, number]> = {
  '344': [114.17, 22.32], // Hong Kong
  '446': [113.55, 22.19], // Macao
  '702': [103.82, 1.35], // Singapore
  '048': [50.55, 26.05], // Bahrain
  '470': [14.45, 35.9], // Malta
  '584': [171.2, 7.1], // Marshall Islands
  '480': [57.55, -20.25], // Mauritius
  '462': [73.5, 4.2], // Maldives
  '690': [55.45, -4.6], // Seychelles
  '060': [-64.75, 32.3], // Bermuda
  '136': [-81.2, 19.3], // Cayman Islands
  '052': [-59.55, 13.15], // Barbados
  '028': [-61.8, 17.1], // Antigua and Barbuda
  '659': [-62.75, 17.3], // Saint Kitts and Nevis
  '662': [-60.97, 13.9], // Saint Lucia
  '670': [-61.2, 13.25], // Saint Vincent
  '308': [-61.68, 12.1], // Grenada
  '212': [-61.35, 15.4], // Dominica
  '533': [-69.97, 12.52], // Aruba
  '531': [-68.99, 12.17], // Curaçao
  '292': [-5.35, 36.14], // Gibraltar
  '438': [9.55, 47.15], // Liechtenstein
  '492': [7.42, 43.74], // Monaco
  '020': [1.6, 42.55], // Andorra
  '674': [12.45, 43.94], // San Marino
  '585': [134.58, 7.5], // Palau
  '583': [158.2, 6.9], // Micronesia
  '316': [144.79, 13.44], // Guam
  '580': [145.75, 15.18], // Northern Mariana Islands
  '296': [173.0, 1.42], // Kiribati
  '798': [179.2, -8.52], // Tuvalu
  '520': [166.93, -0.52], // Nauru
  '776': [-175.2, -21.18], // Tonga
  '882': [-172.1, -13.76], // Samoa
  '184': [-159.78, -21.23], // Cook Islands
  '570': [-169.87, -19.05], // Niue
  '258': [-149.4, -17.65], // French Polynesia
  '174': [43.87, -11.88], // Comoros
  '678': [6.73, 0.33], // São Tomé and Príncipe
  '132': [-23.6, 15.1], // Cabo Verde
}

// Pacific-centred so Korea sits near the middle: Asia to the left, the Americas to the right.
const projection = geoNaturalEarth1()
  .rotate([-150, 0])
  .fitExtent(
    [
      [4, 4],
      [WIDTH - 4, HEIGHT - 4],
    ],
    { type: 'FeatureCollection', features: COUNTRY_FEATURES } as FeatureCollection,
  )
export const path = geoPath(projection)

function mainPolygon(f: CountryFeature): Geometry {
  if (f.geometry.type !== 'MultiPolygon') return f.geometry
  const polys = (f.geometry as MultiPolygon).coordinates.map((c): Polygon => ({ type: 'Polygon', coordinates: c }))
  return polys.reduce((a, b) => (geoArea(b) > geoArea(a) ? b : a))
}

/** Hand-placed anchors where the centroid lands somewhere unhelpful for arrows. [longitude, latitude] */
const ANCHOR_OVERRIDES: Record<string, [number, number]> = {
  '840': [-98, 39], // United States: the contiguous states, not a point pulled north by Alaska
  '124': [-100, 55], // Canada
  '643': [60, 57], // Russia: the populated west, where most trade goes
  '410': [127.8, 36.4], // Korea
  '250': [2.5, 46.6], // France: the mainland, not French Guiana
  '528': [5.3, 52.2], // Netherlands
}

/** Projected point used for arrows and markers, or null when the place can't be drawn. */
export function anchor(id: string): [number, number] | null {
  const lonLat = ANCHOR_OVERRIDES[id] ?? SMALL_PLACES[id]
  if (lonLat) return projection(lonLat) ?? null
  const f = byId.get(id)
  if (!f) return null
  return projection(geoCentroid(mainPolygon(f))) ?? null
}

export const hasShape = (id: string) => byId.has(id)

export type ViewBox = [number, number, number, number]

export const FULL_VIEW: ViewBox = [0, 0, WIDTH, HEIGHT]

/** A view box framing the given places with some room around them, keeping the map's aspect ratio. */
export function fitView(ids: string[]): ViewBox {
  let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity]
  for (const id of ids) {
    const f = byId.get(id)
    const box: [[number, number], [number, number]] | null = f && !SMALL_PLACES[id] ? path.bounds(mainPolygon(f)) : null
    const pt = anchor(id)
    const [[a, b], [c, d]] = box ?? (pt ? [pt, pt] : [[Infinity, Infinity], [-Infinity, -Infinity]])
    x0 = Math.min(x0, a)
    y0 = Math.min(y0, b)
    x1 = Math.max(x1, c)
    y1 = Math.max(y1, d)
  }
  if (!Number.isFinite(x0)) return FULL_VIEW
  const aspect = WIDTH / HEIGHT
  let w = Math.max((x1 - x0) * 1.6, 220)
  let h = Math.max((y1 - y0) * 1.6, 220 / aspect)
  if (w / h > aspect) h = w / aspect
  else w = h * aspect
  if (w >= WIDTH) return FULL_VIEW
  const cx = Math.min(Math.max((x0 + x1) / 2, w / 2), WIDTH - w / 2)
  const cy = Math.min(Math.max((y0 + y1) / 2, h / 2), HEIGHT - h / 2)
  return [cx - w / 2, cy - h / 2, w, h]
}
