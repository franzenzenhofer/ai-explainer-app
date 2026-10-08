// The stages of one run as a strip of pills in their concept colours: the current stage filled, the
// ones already passed tinted, the rest outlined. A depiction of what the model did on its server.
import { motion } from 'motion/react'
import { CONCEPT_COLORS } from '../../core/colors'
import { MODEL_SPECS } from '../../core/types'
import { useRunStore, RUN_STAGES, type RunStage } from './runStore'

const LABELS: Record<RunStage, string> = {
  tokens: 'Tokens',
  numbers: 'Numbers',
  attention: 'Attention',
  feedforward: 'Feed-forward',
  layers: 'Layers',
  scores: 'Scores',
  pick: 'Pick',
  append: 'Append',
}

export const STAGE_SENTENCES: Record<RunStage, string> = {
  tokens: 'Cutting the text so far into tokens...',
  numbers: 'Swapping every token for its list of numbers...',
  attention: 'Attention: every position looks back at earlier ones...',
  feedforward: 'Feed-forward: every position is processed on its own...',
  layers: `Through the stack of blocks (${MODEL_SPECS.modelName} has ${MODEL_SPECS.layers}; this model has its own number)...`,
  scores: 'Scoring every token of the vocabulary...',
  pick: 'Picking the next token...',
  append: 'Appending it to the end of the text...',
}

function pillStyle(stage: RunStage, state: 'now' | 'done' | 'next') {
  const color = CONCEPT_COLORS[stage]
  if (state === 'now') return { background: color.solid, borderColor: color.solid, color: '#ffffff' }
  if (state === 'done') return { background: color.tint, borderColor: color.soft, color: color.strong }
  return { background: '#ffffff', borderColor: color.soft, color: color.strong }
}

export function PhaseStrip() {
  const current = useRunStore((s) => s.stage)
  const index = current === null ? -1 : RUN_STAGES.indexOf(current)
  return (
    <ol aria-label="Stages of one run" className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
      {RUN_STAGES.map((stage, position) => {
        const state = position === index ? 'now' : position < index ? 'done' : 'next'
        return (
          <motion.li
            key={stage}
            aria-current={state === 'now' ? 'step' : undefined}
            animate={{ scale: state === 'now' ? 1.08 : 1 }}
            className="rounded-full border-2 px-2.5 py-0.5 text-base font-semibold leading-tight"
            style={pillStyle(stage, state)}
          >
            {LABELS[stage]}
          </motion.li>
        )
      })}
    </ol>
  )
}
