import { frontier, mplC, mplF, type Economy, type Outcome, type Trade } from '../../model/specificFactors'
import { linear, ticks } from '../scale'

const W = 560
const H = 320
const M = { top: 18, right: 52, bottom: 40, left: 52 }

const num = (v: number) => (v >= 100 ? v.toFixed(0) : v >= 10 ? v.toFixed(1) : v.toFixed(2))

interface LaborProps {
  e: Economy
  before: Outcome
  after: Outcome
  labels: { vmplC: string; vmplF: string; before: string; after: string; wage: string; employedC: string; employedF: string }
}

/** The textbook's labour-allocation diagram: P_C·MPL_C from the left, P_F·MPL_F from the right. */
export function LaborChart({ e, before, after, labels }: LaborProps) {
  const x = linear(0, e.L, M.left, W - M.right)
  const top = Math.max(before.w, after.w) * 2.2
  const y = linear(0, top, H - M.bottom, M.top)
  // Curves shoot up near the axes; cap them a little above the plot and let the clip path cut them off.
  const capped = (v: number) => Math.max(M.top - 40, y(v))
  const curve = (f: (LC: number) => number) =>
    Array.from({ length: 161 }, (_, i) => {
      const LC = e.L * (0.002 + (0.996 * i) / 160)
      return `${i ? 'L' : 'M'}${x(LC)},${capped(f(LC))}`
    }).join(' ')
  const cBefore = curve((LC) => before.p * mplC(e, LC))
  const cAfter = curve((LC) => after.p * mplC(e, LC))
  const fCurve = curve((LC) => mplF(e, e.L - LC))
  const moved = Math.abs(after.LC - before.LC) > e.L * 0.002

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full text-slate-500 dark:text-slate-400">
      {ticks(top).map((v) => (
        <g key={v}>
          <line x1={M.left} x2={W - M.right} y1={y(v)} y2={y(v)} className="stroke-slate-200 dark:stroke-slate-800" />
          <text x={M.left - 8} y={y(v)} dy="0.32em" textAnchor="end" className="fill-current text-[11px]">
            {num(v)}
          </text>
        </g>
      ))}
      <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} className="stroke-slate-400 dark:stroke-slate-600" />
      <line x1={M.left} x2={M.left} y1={M.top} y2={H - M.bottom} className="stroke-slate-400 dark:stroke-slate-600" />
      <line x1={W - M.right} x2={W - M.right} y1={M.top} y2={H - M.bottom} className="stroke-slate-400 dark:stroke-slate-600" />
      <text x={M.left} y={H - 12} className="fill-current text-[11px]">
        ← {labels.employedC}
      </text>
      <text x={W - M.right} y={H - 12} textAnchor="end" className="fill-current text-[11px]">
        {labels.employedF} →
      </text>

      <defs>
        <clipPath id="sf-plot">
          <rect x={M.left} y={M.top} width={W - M.left - M.right} height={H - M.top - M.bottom} />
        </clipPath>
      </defs>
      <g clipPath="url(#sf-plot)">
        {moved && <path d={cBefore} fill="none" strokeWidth={2} strokeDasharray="5 4" className="stroke-a opacity-45" />}
        <path d={cAfter} fill="none" strokeWidth={2.5} className="stroke-a" />
        <path d={fCurve} fill="none" strokeWidth={2.5} className="stroke-b" />
      </g>

      {(moved ? [before, after] : [after]).map((o, i) => (
        <g key={i}>
          <line x1={M.left} x2={x(o.LC)} y1={y(o.w)} y2={y(o.w)} strokeDasharray="3 3" className="stroke-slate-400" />
          <line x1={x(o.LC)} x2={x(o.LC)} y1={y(o.w)} y2={H - M.bottom} strokeDasharray="3 3" className="stroke-slate-400" />
          <circle cx={x(o.LC)} cy={y(o.w)} r={5} className={i === 0 && moved ? 'fill-white stroke-slate-700 dark:fill-slate-900 dark:stroke-slate-200' : 'fill-slate-900 dark:fill-white'} strokeWidth={2} />
          <text x={x(o.LC) + 8} y={y(o.w) - 8} className="fill-slate-700 text-[11px] font-semibold dark:fill-slate-200">
            {moved ? (i === 0 ? `1 ${labels.before}` : `2 ${labels.after}`) : labels.after}
          </text>
          <text x={M.left + 4} y={y(o.w) - 4} className="fill-current text-[10px]">
            {labels.wage} {num(o.w)}
          </text>
        </g>
      ))}
      {moved && (
        <line
          x1={x(before.LC)}
          x2={x(after.LC)}
          y1={H - M.bottom - 10}
          y2={H - M.bottom - 10}
          strokeWidth={2}
          markerEnd="url(#sf-arrow)"
          className="stroke-slate-600 dark:stroke-slate-300"
        />
      )}
      <defs>
        <marker id="sf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" className="fill-slate-600 dark:fill-slate-300" />
        </marker>
      </defs>
      <g className="text-[11px]">
        {/* Each label sits beside the steep end of its own curve, away from the crossing. */}
        <text x={x(e.L * 0.15) + 8} y={Math.max(M.top + 12, y(after.p * mplC(e, e.L * 0.15)))} className="fill-a font-semibold">
          {labels.vmplC}
        </text>
        <text x={x(e.L * 0.85) - 8} y={Math.max(M.top + 12, y(mplF(e, e.L * 0.15)))} textAnchor="end" className="fill-b font-semibold">
          {labels.vmplF}
        </text>
      </g>
    </svg>
  )
}

interface PpfProps {
  e: Economy
  autarky: Outcome
  trade: Trade
  /** exports / imports: labels for the trade triangle's horizontal (C) and vertical (F) legs. */
  labels: { x: string; y: string; autarky: string; production: string; consumption: string; budget: string; exports: string; imports: string }
}

/** Production possibility frontier with the autarky point, production and consumption under trade. */
export function PpfChart({ e, autarky, trade, labels }: PpfProps) {
  const pts = frontier(e)
  const xMax = Math.max(pts[pts.length - 1][0], trade.DC, trade.QC) * 1.12
  const yMax = Math.max(pts[0][1], trade.DF, trade.QF) * 1.12
  const x = linear(0, xMax, M.left, W - 20)
  const y = linear(0, yMax, H - M.bottom, M.top)
  const ppf = pts.map(([qc, qf], i) => `${i ? 'L' : 'M'}${x(qc)},${y(qf)}`).join(' ')
  // Budget line D_F = income − p·D_C through the production point, clipped to the plotted box.
  const income = trade.gdp
  const c0 = Math.max(0, (income - yMax) / trade.p)
  const c1 = Math.min(xMax, income / trade.p)
  const budget = `M${x(c0)},${y(income - trade.p * c0)} L${x(c1)},${y(income - trade.p * c1)}`
  const traded = Math.abs(trade.exportsC) > 1e-6 * trade.QC

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full text-slate-500 dark:text-slate-400">
      {ticks(xMax).map((v) => (
        <text key={`x${v}`} x={x(v)} y={H - M.bottom + 16} textAnchor="middle" className="fill-current text-[11px]">
          {num(v)}
        </text>
      ))}
      {ticks(yMax).map((v) => (
        <g key={`y${v}`}>
          <line x1={M.left} x2={W - 20} y1={y(v)} y2={y(v)} className="stroke-slate-200 dark:stroke-slate-800" />
          <text x={M.left - 8} y={y(v)} dy="0.32em" textAnchor="end" className="fill-current text-[11px]">
            {num(v)}
          </text>
        </g>
      ))}
      <line x1={M.left} x2={W - 20} y1={H - M.bottom} y2={H - M.bottom} className="stroke-slate-400 dark:stroke-slate-600" />
      <line x1={M.left} x2={M.left} y1={M.top} y2={H - M.bottom} className="stroke-slate-400 dark:stroke-slate-600" />
      <text x={(M.left + W - 20) / 2} y={H - 8} textAnchor="middle" className="fill-current text-[12px]">
        {labels.x}
      </text>
      <text transform={`translate(14,${(M.top + H - M.bottom) / 2}) rotate(-90)`} textAnchor="middle" className="fill-current text-[12px]">
        {labels.y}
      </text>

      <path d={ppf} fill="none" strokeWidth={2.5} className="stroke-slate-700 dark:stroke-slate-200" />
      {traded && <path d={budget} fill="none" strokeWidth={2} strokeDasharray="6 4" className="stroke-indigo-500" />}
      {traded && (
        <g strokeWidth={1.5} strokeDasharray="3 3" className="stroke-slate-400">
          <line x1={x(trade.QC)} x2={x(trade.DC)} y1={y(trade.QF)} y2={y(trade.QF)} />
          <line x1={x(trade.DC)} x2={x(trade.DC)} y1={y(trade.QF)} y2={y(trade.DF)} />
        </g>
      )}
      {traded && (
        <g className="text-[10px]">
          {/* Trade triangle: the horizontal leg is C traded, the vertical leg F traded the other way. */}
          <text x={(x(trade.QC) + x(trade.DC)) / 2} y={y(trade.QF) + 13} textAnchor="middle" className="fill-slate-600 dark:fill-slate-300">
            {labels.exports}
          </text>
          <text x={x(trade.DC) + (trade.exportsC > 0 ? -6 : 6)} y={(y(trade.QF) + y(trade.DF)) / 2} dy="0.32em" textAnchor={trade.exportsC > 0 ? 'end' : 'start'} className="fill-slate-600 dark:fill-slate-300">
            {labels.imports}
          </text>
        </g>
      )}
      <circle cx={x(autarky.QC)} cy={y(autarky.QF)} r={6} strokeWidth={2} className="fill-white stroke-slate-700 dark:fill-slate-900 dark:stroke-slate-200" />
      {traded && <rect x={x(trade.QC) - 5} y={y(trade.QF) - 5} width={10} height={10} className="fill-a" />}
      {traded && <circle cx={x(trade.DC)} cy={y(trade.DF)} r={6} className="fill-b" />}
      <g className="text-[13px] font-bold">
        <text x={x(autarky.QC) + 9} y={y(autarky.QF) - 7} className="fill-slate-700 dark:fill-slate-200">
          ①
        </text>
        {traded && (
          <>
            <text x={x(trade.QC) + 9} y={y(trade.QF) - 7} className="fill-a">
              ②
            </text>
            <text x={x(trade.DC) + 9} y={y(trade.DF) - 7} className="fill-b">
              ③
            </text>
          </>
        )}
      </g>
    </svg>
  )
}

export function PpfLegend({ labels }: { labels: PpfProps['labels'] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full border-2 border-slate-700 dark:border-slate-200" />
        {labels.autarky}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 bg-a" />
        {labels.production}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-b" />
        {labels.consumption}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-0 w-4 border-t-2 border-dashed border-indigo-500" />
        {labels.budget}
      </span>
    </div>
  )
}
