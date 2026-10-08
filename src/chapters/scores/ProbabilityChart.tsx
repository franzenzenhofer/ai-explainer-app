// ProbabilityChart - the top 20 tokens of the illustrative list plus one bar for all remaining tokens.
// Each row is a button; the chosen row carries the chapter accent.
import type { PredictionCandidate } from '../../core/types'
import type { Provenance } from '../../core/components/ProvenanceBadge'
import { cn } from '../../core/utils/cn'
import { formatPercent, formatTokenDisplay } from '../../core/utils/formatters'

export const provenance: Provenance = 'simulated'

const FULL_WIDTH_PERCENT = 100
const MIN_BAR_PERCENT = 0.5

interface ProbabilityChartProps {
  top: PredictionCandidate[]
  tailProbability: number
  tailLabel: string
  selectedRank: number | null
  onSelect: (rank: number) => void
}

interface BarRowProps {
  label: string
  title: string
  probability: number
  maxProbability: number
  selected: boolean | undefined
  onClick: () => void
}

function barWidth(probability: number, maxProbability: number): string {
  const share = maxProbability > 0 ? (probability / maxProbability) * FULL_WIDTH_PERCENT : 0
  return `${Math.max(MIN_BAR_PERCENT, share)}%`
}

function BarRow({ label, title, probability, maxProbability, selected, onClick }: BarRowProps) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`${title}: ${formatPercent(probability)}`}
        onClick={onClick}
        className={cn(
          'grid min-h-11 w-full grid-cols-[7rem_minmax(0,1fr)_4.5rem] items-center gap-3 rounded-[3px] px-2 text-left hover:bg-wash sm:grid-cols-[10rem_minmax(0,1fr)_5rem]',
          selected && 'tint-accent',
        )}
      >
        <span title={title} className="truncate text-base font-semibold text-ink">{label}</span>
        <span className="block h-5">
          <span
            className={cn('block h-full', selected ? 'bg-accent' : 'bg-ink')}
            style={{ width: barWidth(probability, maxProbability) }}
          />
        </span>
        <span className="text-right text-base tabular-nums text-ink">{formatPercent(probability)}</span>
      </button>
    </li>
  )
}

export function ProbabilityChart({ top, tailProbability, tailLabel, selectedRank, onSelect }: ProbabilityChartProps) {
  const tailRank = top.length
  const maxProbability = Math.max(tailProbability, ...top.map((candidate) => candidate.probability))
  return (
    <ol aria-label="Probability of each next token" className="m-0 list-none space-y-0 p-0">
      {top.map((candidate, rank) => (
        <BarRow
          key={candidate.token}
          label={formatTokenDisplay(candidate.token)}
          title={`Rank ${rank + 1}, "${formatTokenDisplay(candidate.token)}"`}
          probability={candidate.probability}
          maxProbability={maxProbability}
          selected={rank === selectedRank}
          onClick={() => onSelect(rank)}
        />
      ))}
      <BarRow
        label={tailLabel}
        title={tailLabel}
        probability={tailProbability}
        maxProbability={maxProbability}
        selected={tailRank === selectedRank}
        onClick={() => onSelect(tailRank)}
      />
    </ol>
  )
}
