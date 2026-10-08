// The text so far as chips: the prompt as its o200k_base tokens with their IDs, fading in one by one,
// then every appended Llama piece in its identity colour, springing in, the newest with an indigo
// frame. While a live call runs, a pulsing marker sits at the end.
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useAppStore } from '../../store/appStore'
import { useTokens } from '../../core/hooks/useDerived'
import { CONCEPT_COLORS, tokenColor } from '../../core/colors'
import { TokenChip } from '../../core/components'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { cn } from '../../core/utils/cn'

const APPEND = CONCEPT_COLORS.append
// Chips in the text are not buttons, so they can be shorter than a 44px target and fit more rows.
const COMPACT = 'min-h-8 px-1.5 text-base'

function RequestingMarker() {
  return (
    <motion.span
      className="inline-flex min-h-8 items-center rounded-md border-2 px-2 text-base font-semibold"
      style={{ borderColor: APPEND.soft, background: APPEND.tint, color: APPEND.strong }}
      animate={{ opacity: [0.45, 1] }}
      transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }}
    >
      requesting next token
    </motion.span>
  )
}

function Piece({ piece, newest }: { piece: string; newest: boolean }) {
  const color = tokenColor(piece)
  return (
    <motion.span
      initial={{ opacity: 0, y: -12, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="inline-flex min-h-8 items-center whitespace-pre rounded-md border-2 px-1.5 font-mono text-base font-semibold"
      style={{ background: color.fill, color: color.text, borderColor: newest ? APPEND.solid : color.border, boxShadow: newest ? `0 0 0 2px ${APPEND.solid}` : undefined }}
    >
      {formatTokenDisplay(piece)}
    </motion.span>
  )
}

interface GeneratedTextProps {
  className?: string
}

export function GeneratedText({ className }: GeneratedTextProps) {
  const tokens = useTokens()
  const appended = useAppStore((s) => s.appended)
  const fetching = useAppStore((s) => s.fetchStatus === 'fetching')
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight
  }, [appended.length, fetching])
  return (
    <div ref={box} className={cn('overflow-y-auto rounded-xl border-2 bg-paper p-1.5', className)} style={{ borderColor: CONCEPT_COLORS.text.soft }}>
      <div className="flex flex-wrap content-start items-center gap-1" aria-label="The text so far" aria-live="polite">
        {tokens.map((token, index) => (
          <TokenChip key={`${index}-${token.tokenId}`} text={token.text} tokenId={token.tokenId} order={index} className={COMPACT} />
        ))}
        {appended.map((piece, index) => (
          <Piece key={`${index}-${piece}`} piece={piece} newest={index === appended.length - 1} />
        ))}
        <span data-text-end className="inline-block h-7 w-px" />
        {fetching && <RequestingMarker />}
      </div>
    </div>
  )
}
