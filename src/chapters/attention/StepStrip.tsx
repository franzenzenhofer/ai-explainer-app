// Score, Weight, Mix: the three things attention does, lit one after the other whenever the arcs redraw.
import { motion } from 'motion/react'

const STEPS = [
  { name: 'Score', text: 'how relevant?' },
  { name: 'Weight', text: 'shares of 100%' },
  { name: 'Mix', text: 'blend by share' },
]

const STEP_DELAY_S = 0.35

export function StepStrip({ drawKey }: { drawKey: string }) {
  return (
    <ol className="m-0 grid list-none grid-cols-3 gap-2 p-0" aria-label="What attention does">
      {STEPS.map((step, index) => (
        <motion.li
          key={`${drawKey}-${step.name}`}
          initial={{ opacity: 0.35, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * STEP_DELAY_S, duration: 0.3 }}
          className="flex items-center gap-2 rounded-xl border-2 border-[var(--concept-soft)] bg-[var(--concept-tint)] px-2 py-0.5 text-base leading-tight"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--concept)] font-bold text-paper">{index + 1}</span>
          <span>
            <span className="font-bold text-[var(--concept-strong)]">{step.name}:</span> <span className="text-ink">{step.text}</span>
          </span>
        </motion.li>
      ))}
    </ol>
  )
}
