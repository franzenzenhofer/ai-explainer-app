// A sketch of the "map" idea: tokens as points on a plane. The positions are not computed from a
// real table (hand-placed for a few words, seeded for the rest), so the frame says Simulated.
import { useMemo } from 'react'
import type { Token } from '../../core/types'
import { VisualFrame, type Provenance } from '../../core/components'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { cn } from '../../core/utils/cn'
import { sketchPosition } from './sketchPositions'

export const provenance: Provenance = 'simulated'

const PERCENT = 100
// Keep points away from the right edge so their labels stay inside the frame.
const X_SPAN = 72
const Y_SPAN = 86
const INSET = 4

interface TokenMapProps {
  tokens: Token[]
  selectedIndex: number
}

export function TokenMap({ tokens, selectedIndex }: TokenMapProps) {
  const points = useMemo(
    () =>
      tokens.map((token, index) => {
        const [x, y] = sketchPosition(token.text, token.tokenId)
        return { index, label: formatTokenDisplay(token.text), left: INSET + x * X_SPAN, top: INSET + y * Y_SPAN }
      }),
    [tokens],
  )
  return (
    <VisualFrame
      title="A map of tokens (sketch)"
      provenance={provenance}
      caption="In a real model, tokens used in similar ways sit close together. These positions are placed by hand or at random, so distances here mean nothing yet."
    >
      <div role="img" aria-label="Sketch of the tokens as points on a plane" className="relative aspect-[5/3] w-full border border-rule">
        {points.map((point) => {
          const selected = point.index === selectedIndex
          return (
            <span
              key={point.index}
              className={cn('absolute flex items-center gap-1.5 whitespace-nowrap text-base', selected ? 'z-10 font-bold text-ink' : 'text-ink-2')}
              style={{ left: `${point.left}%`, top: `${point.top}%`, maxWidth: `${PERCENT - point.left}%` }}
            >
              <span aria-hidden="true" className={cn('h-3 w-3 shrink-0 rounded-full', selected ? 'bg-accent' : 'bg-ink')} />
              <span className={cn('truncate', selected && 'tint-accent px-1')}>{point.label}</span>
            </span>
          )
        })}
      </div>
    </VisualFrame>
  )
}
