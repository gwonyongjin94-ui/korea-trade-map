import { useMemo, useState } from 'react'
import { useI18n } from '../i18n'
import { ricardoGoods, ricardoTest } from '../realExamples'
import { setupFromGoods, setupFromProductivity } from '../ricardo/fromData'
import { RicardoModel } from '../ricardo/RicardoModel'
import { THEORY_TEXT } from '../theoryText'
import { RicardoRealCard, type RicardoMode } from './RicardoRealCard'

const DEFAULT_PARTNER = '704'

/**
 * Ricardian tab: the real-data comparison on top, and the two-country, two-good model solved on the
 * same selection below (production possibilities, RS–RD, explanation, wages, summary).
 */
export function RicardoTab({ year }: { year: number }) {
  const { lang } = useI18n()
  const r = THEORY_TEXT[lang].ricardo.real
  const [mode, setMode] = useState<RicardoMode>('productivity')
  const [pick, setPick] = useState(DEFAULT_PARTNER)
  const [goods, setGoods] = useState({ x: '8542', y: '1006' })

  // Each mode has its own set of partners with data; fall back to the first when the pick has none.
  const partners = useMemo(
    () => (mode === 'goods' ? ricardoGoods(goods.x, goods.y) : ricardoTest(year)).map((row) => row.iso),
    [mode, goods, year],
  )
  const partner = partners.includes(pick) ? pick : (partners[0] ?? pick)
  const setup = useMemo(
    () => (mode === 'goods' ? setupFromGoods(partner, goods.x, goods.y, year, lang) : setupFromProductivity(partner, year, lang)),
    [mode, partner, goods, year, lang],
  )

  return (
    <div className="space-y-6">
      <RicardoRealCard
        year={year}
        mode={mode}
        onMode={setMode}
        partner={partner}
        onPartner={setPick}
        goods={goods}
        onGoods={(x, y) => setGoods({ x, y })}
      />
      {setup && partners.length > 0 && (
        <RicardoModel
          // A new selection starts again from its real values.
          key={`${mode}-${partner}-${goods.x}-${goods.y}-${year}-${lang}`}
          setup={setup}
          isos={{ A: '410', B: partner }}
          title={r.modelTitle(setup.names.A, setup.names.B, setup.names.X, setup.names.Y)}
        />
      )}
    </div>
  )
}
