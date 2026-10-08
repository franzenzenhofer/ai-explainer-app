// The appended tokens one by one, as chips in their identity colours that spring in. The worker does
// not return the model's token IDs, so these chips show none.
import { motion } from 'motion/react'
import { useAppStore } from '../../store/appStore'
import { CONCEPT_COLORS, tokenColor } from '../../core/colors'
import { formatTokenDisplay } from '../../core/utils/formatters'

export function TokenStream() {
  const appended = useAppStore((s) => s.appended)
  if (appended.length === 0) return <p className="m-0 text-base text-ink-2">No tokens appended yet. Press Play or Step.</p>
  return (
    <ol aria-label="Appended tokens in order" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {appended.map((piece, index) => {
        const color = tokenColor(piece)
        const newest = index === appended.length - 1
        return (
          <motion.li
            key={`${index}-${piece}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            className="flex min-h-9 items-center whitespace-pre rounded-md border-2 px-2 font-mono text-base font-semibold"
            style={{ background: color.fill, color: color.text, borderColor: newest ? CONCEPT_COLORS.append.solid : color.border }}
          >
            {formatTokenDisplay(piece)}
          </motion.li>
        )
      })}
    </ol>
  )
}
