// The model's real candidates as rose bars that grow from the left, two columns of five, each bar
// next to its token chip (a token never wraps). The pick is framed amber. When the reader may choose,
// tapping a chip replaces the last token.
import { motion } from 'motion/react'
import { CONCEPT_COLORS, tokenColor } from '../../core/colors'
import { LOOP_MODEL } from '../../core/types'
import { formatPercent, formatTokenDisplay } from '../../core/utils/formatters'
import type { PredictionCandidate } from '../../core/types'
import { RUN_VIEW_LABELS, type RunView } from './useRunView'

export const SHOWN_CANDIDATES = 10
const FULL = 100
const MIN_BAR = 1.5
const SCORES = CONCEPT_COLORS.scores
const PICK = CONCEPT_COLORS.pick

interface RowProps {
  candidate: PredictionCandidate
  rank: number
  max: number
  view: RunView
  onChoose: ((token: string) => void) | null
}

function Row({ candidate, rank, max, view, onChoose }: RowProps) {
  const chosen = candidate.token === view.chosen
  const color = tokenColor(candidate.token)
  const width = view.barsShown ? Math.max(MIN_BAR, (candidate.probability / max) * FULL) : 0
  return (
    <li className="grid grid-cols-[minmax(7.5rem,max-content)_minmax(0,1fr)_3.75rem] items-center gap-2">
      <button
        type="button"
        aria-pressed={chosen}
        disabled={onChoose === null}
        data-pick-source={chosen && view.running ? '' : undefined}
        onClick={() => onChoose?.(candidate.token)}
        className="flex min-h-11 items-center whitespace-pre rounded-md border-2 px-2 font-mono text-base font-bold"
        style={{ background: color.fill, color: color.text, borderColor: chosen ? PICK.solid : color.border, boxShadow: chosen ? `0 0 0 3px ${PICK.soft}` : undefined }}
      >
        {formatTokenDisplay(candidate.token)}
      </button>
      <span className="block h-5 rounded" style={{ background: SCORES.tint }}>
        <motion.span
          className="block h-full rounded"
          style={{ background: chosen ? PICK.solid : SCORES.solid }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ delay: view.running ? rank * 0.04 : 0, duration: 0.4 }}
        />
      </span>
      <span className="text-right text-base font-semibold tabular-nums" style={{ color: SCORES.strong, opacity: view.barsShown ? 1 : 0 }}>
        {formatPercent(candidate.probability)}
      </span>
    </li>
  )
}

interface CandidateColumnsProps {
  view: RunView
  onChoose: ((token: string) => void) | null
}

export function CandidateColumns({ view, onChoose }: CandidateColumnsProps) {
  const shown = view.step.candidates.slice(0, SHOWN_CANDIDATES)
  const max = Math.max(...shown.map((candidate) => candidate.probability))
  const label = RUN_VIEW_LABELS[view.kind]
  return (
    <div>
      <h3 className="m-0 mb-1 text-base font-bold" style={{ color: CONCEPT_COLORS.scores.strong }}>
        {label}
        <span className="font-normal text-ink-2">
          {' '}{LOOP_MODEL.name}, real. All others: {formatPercent(view.step.tailProbability)}
        </span>
      </h3>
      <ol aria-label={label} className="m-0 grid list-none grid-flow-col grid-cols-2 grid-rows-5 gap-x-6 gap-y-0.5 p-0 max-md:grid-flow-row max-md:grid-cols-1 max-md:grid-rows-none">
        {shown.map((candidate, rank) => (
          <Row key={candidate.token} candidate={candidate} rank={rank} max={max} view={view} onChoose={onChoose} />
        ))}
      </ol>
      {onChoose && <p className="m-0 mt-0.5 text-base text-ink-2">Tap another token to use it instead.</p>}
    </div>
  )
}
