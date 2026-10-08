// A sketch of the "map" idea: tokens as points on a plane. The positions are not computed from a
// real table (hand-placed for a few words, seeded for the rest), so the frame says Simulated.
import { useMemo } from 'react'
import type { Token } from '../../core/types'
import { VisualFrame, type Provenance } from '../../core/components'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { sketchPosition } from './sketchPositions'

export const provenance: Provenance = 'simulated'

const WIDTH = 600
const HEIGHT = 360
const PADDING = 48
const DOT_RADIUS = 7
const LABEL_OFFSET = 12

interface TokenMapProps {
  tokens: Token[]
  selectedIndex: number
}

export function TokenMap({ tokens, selectedIndex }: TokenMapProps) {
  const points = useMemo(
    () =>
      tokens.map((token, index) => {
        const [x, y] = sketchPosition(token.text, token.tokenId)
        return { index, label: formatTokenDisplay(token.text), x: PADDING + x * (WIDTH - 2 * PADDING), y: PADDING + y * (HEIGHT - 2 * PADDING) }
      }),
    [tokens],
  )
  return (
    <VisualFrame
      title="A map of tokens (sketch)"
      provenance={provenance}
      caption="In a real model, tokens used in similar ways sit close together. These positions are placed by hand or at random, so distances here mean nothing yet."
    >
      <div className="overflow-x-auto">
        <svg role="img" aria-label="Sketch of tokens as points on a plane" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="block h-auto w-full min-w-[20rem] border border-rule">
          {points.map((point) => {
            const selected = point.index === selectedIndex
            return (
              <g key={point.index}>
                <circle cx={point.x} cy={point.y} r={DOT_RADIUS} fill={selected ? 'var(--accent)' : 'var(--ink)'} />
                <text x={point.x + LABEL_OFFSET} y={point.y + 6} fontSize={20} fontWeight={selected ? 700 : 400} fill="var(--ink)">
                  {point.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </VisualFrame>
  )
}
