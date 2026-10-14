import { useId } from 'react'
import { GOODS, isProduct } from '../data/goods'
import { useI18n } from '../i18n'

interface Props {
  label: string
  value: string
  onChange: (id: string) => void
  groups: { products: string; chapters: string }
  /** Ids that can't be chosen here, e.g. the other good of the pair. */
  disabled?: string[]
  /** Shown while nothing is chosen (value ""). */
  placeholder?: string
}

/** Choice of one good: the filter's products first, then every HS chapter. */
export function GoodSelect({ label, value, onChange, groups, disabled = [], placeholder }: Props) {
  const { lang } = useI18n()
  const id = useId()
  const option = (g: (typeof GOODS)[number]) => (
    <option key={g.id} value={g.id} disabled={disabled.includes(g.id)}>
      {g.icon} {g.name[lang]} · HS {g.hs}
    </option>
  )
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-1 block text-xs font-semibold">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
      >
        {value === '' && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        <optgroup label={groups.products}>{GOODS.filter((g) => isProduct(g.id)).map(option)}</optgroup>
        <optgroup label={groups.chapters}>{GOODS.filter((g) => !isProduct(g.id)).map(option)}</optgroup>
      </select>
    </div>
  )
}
