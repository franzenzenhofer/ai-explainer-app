// SamplingChart - the most likely candidates of the illustrative list, kept or cut by the settings.
import type { Provenance } from '../../core/components/ProvenanceBadge'
import { cn } from '../../core/utils/cn'
import { formatPercent, formatTokenDisplay } from '../../core/utils/formatters'
import type { SamplingRow } from './samplingRows'

export const provenance: Provenance = 'simulated'

const FULL_WIDTH_PERCENT = 100
const MIN_BAR_PERCENT = 0.5

interface SamplingChartProps {
  rows: SamplingRow[]
}

function width(probability: number, max: number): string {
  return `${Math.max(MIN_BAR_PERCENT, (probability / max) * FULL_WIDTH_PERCENT)}%`
}

export function SamplingChart({ rows }: SamplingChartProps) {
  const max = Math.max(...rows.map((row) => row.keptProbability ?? row.candidate.probability))
  return (
    <ol aria-label="Candidates after the settings" className="m-0 list-none p-0">
      {rows.map(({ candidate, keptProbability }) => {
        const kept = keptProbability !== null
        const label = formatTokenDisplay(candidate.token)
        return (
          <li
            key={candidate.token}
            className="grid min-h-9 grid-cols-[6.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 sm:grid-cols-[9rem_minmax(0,1fr)_5rem]"
          >
            <span title={label} className={cn('truncate text-base font-semibold', kept ? 'text-ink' : 'text-ink-3 line-through')}>
              {label}
            </span>
            <span className="block h-4">
              <span
                className={cn('block h-full', kept ? 'bg-accent' : 'border border-dashed border-rule-strong')}
                style={{ width: width(keptProbability ?? candidate.probability, max) }}
              />
            </span>
            <span className={cn('text-right text-base tabular-nums', kept ? 'text-ink' : 'text-ink-3')}>
              {kept ? formatPercent(keptProbability) : 'cut'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
