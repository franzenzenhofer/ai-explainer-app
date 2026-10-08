// The old app's values grid: the first numbers of the list with their position dim[i], each with a
// small bar that grows right for a positive number and left for a negative one.
import { motion } from 'motion/react'
import { formatVectorValue } from '../../core/utils/formatters'

interface ValuesGridProps {
  values: number[]
  scale: number
}

const STAGGER_S = 0.03
const HALF = 50

export function ValuesGrid({ values, scale }: ValuesGridProps) {
  return (
    <ol aria-label="The first numbers of the list" className="m-0 grid list-none grid-cols-4 gap-1 p-0">
      {values.map((value, index) => {
        const width = Math.min(1, Math.abs(value) / scale) * HALF
        return (
          <motion.li
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 + index * STAGGER_S }}
            className="flex flex-col items-center rounded-lg border-2 px-1 pb-0.5"
            style={{ borderColor: 'var(--concept-soft)', background: 'var(--concept-tint)' }}
          >
            <span className="text-base leading-5 text-ink-2">dim[{index}]</span>
            <span className="font-mono text-base font-bold leading-5 tabular-nums" style={{ color: 'var(--concept-strong)' }}>
              {value >= 0 ? '+' : ''}{formatVectorValue(value)}
            </span>
            <span className="relative mt-0.5 block h-1.5 w-full rounded-full bg-paper">
              <span className="absolute inset-y-0 left-1/2 w-px" style={{ background: 'var(--concept-soft)' }} />
              <motion.span
                className="absolute inset-y-0 rounded-full"
                style={{ background: 'var(--concept)', left: value >= 0 ? `${HALF}%` : undefined, right: value < 0 ? `${HALF}%` : undefined }}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ delay: 0.3 + index * STAGGER_S, duration: 0.35 }}
              />
            </span>
          </motion.li>
        )
      })}
    </ol>
  )
}
