// While the first live answer loads: ten empty rose bars in the place of the real candidates, pulsing
// under "Llama 3.1 8B is thinking". No numbers are shown until the real ones arrive.
import { motion } from 'motion/react'
import { CONCEPT_COLORS } from '../../core/colors'
import { LOOP_MODEL } from '../../core/types'
import { SHOWN_CANDIDATES } from './CandidateColumns'

const SCORES = CONCEPT_COLORS.scores
// Widths of the placeholder bars, falling like a typical candidate list; they carry no data.
const SHAPE = [90, 46, 30, 22, 16, 12, 9, 7, 5, 4]
const PULSE = { opacity: [0.45, 1] }
const PULSE_TIMING = { duration: 0.8, repeat: Infinity, repeatType: 'reverse' as const }

function SkeletonRow({ index }: { index: number }) {
  return (
    <li className="grid grid-cols-[7.5rem_minmax(0,1fr)_3.75rem] items-center gap-2">
      <motion.span className="block min-h-11 rounded-md border-2" style={{ background: SCORES.tint, borderColor: SCORES.soft }} animate={PULSE} transition={{ ...PULSE_TIMING, delay: index * 0.05 }} />
      <span className="block h-5 rounded" style={{ background: SCORES.tint }}>
        <motion.span className="block h-full rounded" style={{ width: `${SHAPE[index]}%`, background: SCORES.soft }} animate={PULSE} transition={{ ...PULSE_TIMING, delay: index * 0.05 }} />
      </span>
      <span />
    </li>
  )
}

export function CandidateSkeleton({ error }: { error: string | null }) {
  return (
    <div aria-busy={error === null}>
      <motion.h3 className="m-0 mb-1 text-base font-bold" style={{ color: SCORES.strong }} animate={error ? undefined : PULSE} transition={PULSE_TIMING}>
        {error ?? `${LOOP_MODEL.name} is thinking: asking it for the candidates of the next token...`}
      </motion.h3>
      <ol aria-hidden="true" className="m-0 grid list-none grid-flow-col grid-cols-2 grid-rows-5 gap-x-6 gap-y-0.5 p-0 max-md:grid-flow-row max-md:grid-cols-1 max-md:grid-rows-none">
        {Array.from({ length: SHOWN_CANDIDATES }, (_, index) => <SkeletonRow key={index} index={index} />)}
      </ol>
    </div>
  )
}
