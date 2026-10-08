// ProbabilityChart - the model's real top 20 tokens plus one row for all remaining tokens, in two
// columns (ranks 1 to 10, 11 to 20 and the tail) so all 21 rows fit on the slide. Bars grow in one after the other.
import { useState } from 'react'
import type { PredictionCandidate } from '../../core/types'
import type { Provenance } from '../../core/components/ProvenanceBadge'
import { formatPercent } from '../../core/utils/formatters'
import { CandidateBar } from './CandidateBar'

export const provenance: Provenance = 'real'

interface ProbabilityChartProps {
  top: PredictionCandidate[]
  tailProbability: number
}

const ROWS_PER_COLUMN = 10

// Ranks 1 to 10 in the first column, 11 to 20 in the second, the tail row under them.
const cell = (index: number) => ({ gridColumn: index < ROWS_PER_COLUMN ? 1 : 2, gridRow: (index % ROWS_PER_COLUMN) + 1 })

function TailRow({ probability, max, order }: { probability: number; max: number; order: number }) {
  const [open, setOpen] = useState(false)
  return (
    <li className="relative" style={{ gridColumn: 2, gridRow: ROWS_PER_COLUMN + 1 }}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={`All other tokens of the vocabulary together: ${formatPercent(probability)}`}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 w-full items-center rounded-md px-1 text-left hover:bg-[var(--concept-tint)]"
      >
        <span className="w-full">
          <CandidateBar token={null} probability={probability} max={max} tone="tail" value={formatPercent(probability)} order={order} />
        </span>
      </button>
      {open && (
        <p role="status" className="absolute bottom-12 right-0 z-10 m-0 w-80 rounded-xl border-2 bg-paper p-3 text-base text-ink shadow-lg" style={{ borderColor: 'var(--concept-soft)' }}>
          Every remaining token of the vocabulary shares this {formatPercent(probability)}. Each one alone is tiny, but none is zero.
        </p>
      )}
    </li>
  )
}

export function ProbabilityChart({ top, tailProbability }: ProbabilityChartProps) {
  const max = Math.max(tailProbability, ...top.map((candidate) => candidate.probability))
  return (
    <ol aria-label="Probability of each next token" className="m-0 grid min-w-0 flex-1 list-none grid-cols-2 content-start gap-x-6 gap-y-0.5 p-0">
      {top.map((candidate, rank) => (
        <li key={candidate.token} className="px-1" style={cell(rank)} aria-label={`Rank ${rank + 1}: ${candidate.token}, ${formatPercent(candidate.probability)}`}>
          <CandidateBar token={candidate.token} probability={candidate.probability} max={max} tone="probability" value={formatPercent(candidate.probability)} order={rank} />
        </li>
      ))}
      <TailRow probability={tailProbability} max={max} order={top.length} />
    </ol>
  )
}
