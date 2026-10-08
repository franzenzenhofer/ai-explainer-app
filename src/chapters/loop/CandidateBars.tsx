// A compact view of the latest step's candidates: the top five as rose bars, the pick in amber.
import { motion } from 'motion/react'
import { CONCEPT_COLORS, tokenColor } from '../../core/colors'
import { formatPercent, formatTokenDisplay } from '../../core/utils/formatters'
import type { RunView } from './useRunView'

const SHOWN = 5
const FULL = 100

const NO_BREAK_SPACE = '\u00a0'

// The same five rows with empty chips and bars, so the box keeps its size until the real ones arrive.
export function CandidateBarsSkeleton() {
  return (
    <ol aria-hidden="true" className="m-0 flex list-none flex-col gap-1 p-0">
      {Array.from({ length: SHOWN }, (_, index) => (
        <li key={index} className="grid grid-cols-[6.5rem_minmax(0,1fr)_3.5rem] items-center gap-2">
          <span className="animate-pulse rounded-md border-2 px-1.5 text-base" style={{ background: CONCEPT_COLORS.scores.tint, borderColor: CONCEPT_COLORS.scores.soft }}>{NO_BREAK_SPACE}</span>
          <span className="block h-4 animate-pulse rounded-sm" style={{ background: CONCEPT_COLORS.scores.tint }} />
          <span className="text-base">{NO_BREAK_SPACE}</span>
        </li>
      ))}
    </ol>
  )
}

export function CandidateBars({ view }: { view: RunView }) {
  const shown = view.step.candidates.slice(0, SHOWN)
  const max = Math.max(...shown.map((candidate) => candidate.probability))
  return (
    <ol aria-label="Top candidates of the latest step" className="m-0 flex list-none flex-col gap-1 p-0">
      {shown.map((candidate) => {
        const chosen = candidate.token === view.chosen
        const color = tokenColor(candidate.token)
        const width = view.barsShown ? (candidate.probability / max) * FULL : 0
        return (
          <li key={candidate.token} className="grid grid-cols-[6.5rem_minmax(0,1fr)_3.5rem] items-center gap-2">
            <span
              data-pick-source={chosen && view.running ? '' : undefined}
              className="truncate rounded-md border-2 px-1.5 font-mono text-base font-semibold"
              style={{ background: color.fill, color: color.text, borderColor: chosen ? CONCEPT_COLORS.pick.solid : color.border }}
            >
              {formatTokenDisplay(candidate.token)}
            </span>
            <span className="block h-4 rounded-sm" style={{ background: CONCEPT_COLORS.scores.tint }}>
              <motion.span
                className="block h-full rounded-sm"
                style={{ background: chosen ? CONCEPT_COLORS.pick.solid : CONCEPT_COLORS.scores.solid }}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ duration: 0.35 }}
              />
            </span>
            <span className="text-right text-base tabular-nums" style={{ color: CONCEPT_COLORS.scores.strong }}>
              {formatPercent(candidate.probability)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
