// Attention as arcs over the sentence: from the chosen token back to every earlier token, thickness
// equals weight, drawn in one after the other. Later tokens are dashed: a token cannot look ahead.
import { motion } from 'motion/react'
import { useEffect, useRef } from 'react'
import type { AttentionWeight, Token } from '../../core/types'
import { TokenChip } from '../../core/components/TokenChip'
import { formatPercent } from '../../core/utils/formatters'
import { getQueryAttention } from '../../model/attention'
import { ARC_AREA_HEIGHT_PX, arcApexY, arcPath, strokeFor } from './arcLayout'
import { useCenters, type RowGeometry } from './useCenters'

// Arcs at least this heavy get their share printed at the top.
const LABEL_FROM = 0.05
const DRAW_S = 0.55
const DRAW_STAGGER_S = 0.12
const LABEL_LIFT_PX = 8
const MASK_TOP_PX = 12
// Where the chosen token sits in a scrolled view, as a share of the visible width (arcs fill the left).
const VIEW_ANCHOR = 0.8

interface AttentionArcsProps {
  tokens: Token[]
  weights: AttentionWeight[]
  query: number
  drawKey: string
  onSelect: (index: number) => void
}

function FutureMask({ geometry, query }: { geometry: RowGeometry; query: number }) {
  const start = geometry.centers[query + 1]
  if (start === undefined || geometry.centers[query] === undefined) return null
  const left = (geometry.centers[query] + start) / 2
  const width = geometry.width - left
  return (
    <g>
      <rect x={left} y={MASK_TOP_PX} width={width} height={ARC_AREA_HEIGHT_PX - MASK_TOP_PX} rx={10} fill="var(--concept-tint)" stroke="var(--concept-soft)" strokeWidth={2} strokeDasharray="6 5" />
      <text x={left + width / 2} y={ARC_AREA_HEIGHT_PX / 2} textAnchor="middle" fontSize={16} fontWeight={600} fill="var(--concept-strong)">
        later: cannot look ahead
      </text>
    </g>
  )
}

function Arcs({ weights, query, drawKey, geometry }: Omit<AttentionArcsProps, 'onSelect' | 'tokens'> & { geometry: RowGeometry }) {
  const base = ARC_AREA_HEIGHT_PX
  if (geometry.centers[query] === undefined) return null
  const targets = getQueryAttention(weights, query).filter(({ keyIdx }) => keyIdx !== query && geometry.centers[keyIdx] !== undefined)
  return (
    <>
      {targets.map(({ keyIdx, weight }, rank) => (
        <motion.path
          key={`${drawKey}-${keyIdx}`}
          d={arcPath(geometry.centers[query], geometry.centers[keyIdx], base, query - keyIdx)}
          fill="none"
          stroke="var(--concept)"
          strokeWidth={strokeFor(weight)}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: DRAW_S, delay: rank * DRAW_STAGGER_S }}
        />
      ))}
      {targets.filter(({ weight }) => weight >= LABEL_FROM).map(({ keyIdx, weight }, rank) => (
        <motion.text
          key={`${drawKey}-label-${keyIdx}`}
          x={(geometry.centers[query] + geometry.centers[keyIdx]) / 2}
          y={arcApexY(base, query - keyIdx) - strokeFor(weight) / 2 - LABEL_LIFT_PX}
          textAnchor="middle"
          fontSize={17}
          fontWeight={700}
          fill="var(--concept-strong)"
          stroke="#ffffff"
          strokeWidth={4}
          paintOrder="stroke"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: DRAW_S + rank * DRAW_STAGGER_S }}
        >
          {formatPercent(weight)}
        </motion.text>
      ))}
    </>
  )
}

export function AttentionArcs({ tokens, weights, query, drawKey, onSelect }: AttentionArcsProps) {
  const { rowRef, geometry } = useCenters<HTMLDivElement>(tokens.map((token) => token.tokenId).join('-'))
  const scroller = useRef<HTMLDivElement>(null)
  // On a long text the sentence scrolls sideways; keep the chosen token and its arcs in view.
  useEffect(() => {
    const box = scroller.current
    const center = geometry.centers[query]
    if (!box || center === undefined || geometry.width <= box.clientWidth) return
    box.scrollLeft = Math.max(0, center - box.clientWidth * VIEW_ANCHOR)
  }, [geometry, query])
  return (
    <div ref={scroller} className="overflow-x-auto overflow-y-hidden pb-1">
      <div className="relative inline-block min-w-full">
        <svg role="img" aria-label={`Attention arcs from token ${query + 1} back to earlier tokens`} width={geometry.width} height={ARC_AREA_HEIGHT_PX} className="block">
          <FutureMask geometry={geometry} query={query} />
          <Arcs weights={weights} query={query} drawKey={drawKey} geometry={geometry} />
        </svg>
        <div ref={rowRef} role="group" aria-label="Pick the token that looks back" className="relative flex gap-1.5">
          {tokens.map((token, index) => (
            <span key={`${index}-${token.tokenId}`} data-slot className="flex">
              <TokenChip
                text={token.text}
                tokenId={token.tokenId}
                selected={index === query}
                muted={index > query}
                order={index}
                onClick={() => onSelect(index)}
                label={`Token ${index + 1}: "${token.text}", ID ${token.tokenId}`}
                className="flex-col items-center gap-0 py-1"
              />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
