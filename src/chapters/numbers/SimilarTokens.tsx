// The 8 tokens whose 768 numbers point most nearly the same way as the chosen token's (cosine
// similarity), as chips in their identity colours with the cosine next to them.
import { motion } from 'motion/react'
import { tokenColor } from '../../core/colors'
import { formatTokenDisplay } from '../../core/utils/formatters'
import type { Gpt2Token } from '../../model/gpt2Table'

const STAGGER_S = 0.05

export function SimilarTokens({ entry }: { entry: Gpt2Token }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <h3 className="m-0 text-base font-bold" style={{ color: 'var(--concept-strong)' }}>Most similar (cosine)</h3>
      <ol aria-label="Most similar tokens" className="m-0 grid list-none grid-cols-2 gap-1 p-0">
        {entry.neighbours.map((neighbour, index) => {
          const color = tokenColor(neighbour.text)
          return (
            <motion.li
              key={neighbour.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + index * STAGGER_S }}
              className="flex min-w-0 items-center justify-between gap-1 rounded-md border-2 px-1 text-base leading-7"
              style={{ background: color.fill, borderColor: color.border, color: color.text }}
            >
              <span className="truncate font-mono font-semibold">{formatTokenDisplay(neighbour.text)}</span>
              <span className="shrink-0 tabular-nums">{neighbour.cosine.toFixed(2)}</span>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}
