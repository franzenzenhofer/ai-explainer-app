// The network view (from the old app): the last tokens of the context on the left, the model's real
// top candidates on the right, and a curve from the chosen position to each candidate whose
// thickness is its probability. The curves draw in when the view opens.
import { motion } from 'motion/react'
import type { Token } from '../../core/types'
import { CONCEPT_COLORS } from '../../core/colors'
import { TokenChip } from '../../core/components'
import { formatPercent } from '../../core/utils/formatters'
import type { LoopStep } from '../../model/loopSteps'
import { CandidateLabel } from './CandidateLabel'

const CONTEXT_SHOWN = 6
const CANDIDATES_SHOWN = 10
const HEIGHT = 280
const VIEW_WIDTH = 1000
const MIN_STROKE = 1.5
const STROKE_PER_SHARE = 16

interface ScoresNetworkProps {
  context: Token[]
  step: LoopStep
}

const slotCentre = (index: number, count: number) => ((index + 0.5) * HEIGHT) / count

function Curves({ from, step }: { from: number; step: LoopStep }) {
  const shown = step.candidates.slice(0, CANDIDATES_SHOWN)
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${VIEW_WIDTH} ${HEIGHT}`} preserveAspectRatio="none" className="block h-[280px] w-full">
      {shown.map((candidate, index) => {
        const to = slotCentre(index, CANDIDATES_SHOWN)
        return (
          <motion.path
            key={candidate.token}
            d={`M 0 ${from} C ${VIEW_WIDTH / 2} ${from}, ${VIEW_WIDTH / 2} ${to}, ${VIEW_WIDTH} ${to}`}
            fill="none"
            stroke={CONCEPT_COLORS.scores.solid}
            strokeOpacity={0.35 + candidate.probability}
            strokeWidth={MIN_STROKE + candidate.probability * STROKE_PER_SHARE}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: index * 0.06, duration: 0.6 }}
          />
        )
      })}
    </svg>
  )
}

export function ScoresNetwork({ context, step }: ScoresNetworkProps) {
  const shown = context.slice(-CONTEXT_SHOWN)
  return (
    <div className="grid min-w-0 flex-1 grid-cols-[12rem_minmax(0,1fr)_11rem] items-center" role="img" aria-label="Lines from the chosen position to the most likely next tokens; thicker means more likely">
      <div className="flex h-[280px] flex-col items-end justify-around">
        {shown.map((token, index) => (
          <TokenChip key={`${token.id}-${token.tokenId}`} text={token.text} tokenId={token.tokenId} order={index} selected={index === shown.length - 1} />
        ))}
      </div>
      <Curves from={slotCentre(shown.length - 1, shown.length)} step={step} />
      <ol className="m-0 flex h-[280px] list-none flex-col justify-around p-0">
        {step.candidates.slice(0, CANDIDATES_SHOWN).map((candidate) => (
          <li key={candidate.token} className="flex items-center gap-2">
            <CandidateLabel token={candidate.token} className="max-w-[7rem]" />
            <span className="text-base font-semibold tabular-nums" style={{ color: CONCEPT_COLORS.scores.strong }}>{formatPercent(candidate.probability)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
