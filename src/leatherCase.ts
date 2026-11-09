import type { Lang } from './i18n'

/**
 * The PBL leather case: raw hides (HS 41) against cars (HS 87), with the United States, Korea's largest
 * source of HS 41 imports. Hides need land to raise cattle on and cars need capital; the US has land to
 * spare and Korea has little, so Korea imports hides and exports cars. Each model tab loads it in one click.
 */
export const LEATHER_CASE = { partner: '840', leather: '41', other: '87' }

/** Short names for the two goods, and in the specific factors model the factor tied to each. */
export const LEATHER_LABELS: Record<Lang, { C: string; F: string; K: string; T: string }> = {
  ko: { C: '원피', F: '자동차', K: '토지(목초지)', T: '자본(자동차 설비)' },
  en: { C: 'hides', F: 'cars', K: 'land (pasture)', T: 'capital (car plants)' },
}

/**
 * Heckscher–Ohlin technology for the leather case with land in place of labour: capital's share of hide
 * output (sC) and of car output (sF), and the share of spending on hides (γ). Illustrative values,
 * chosen so that Korea and the US both still make both goods at the world price, as they do.
 */
export const LEATHER_TECH = { sC: 0.1, sF: 0.95, gamma: 0.6 }
