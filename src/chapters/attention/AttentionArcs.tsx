// Attention as arcs on the sentence: from the chosen token back to every earlier token, thickness
// equals weight. White background; arcs never point right because of the causal mask.
import { useEffect, useMemo, useRef } from 'react'
import type { AttentionWeight, Token } from '../../core/types'
import { formatTokenInline } from '../../core/utils/formatters'
import { cn } from '../../core/utils/cn'
import { getQueryAttention } from '../../model/attention'
import { ARC_AREA_HEIGHT_PX, arcPath, strokeFor, tokenSlots } from './arcLayout'

// Where the chosen token sits in a scrolled view, as a share of the visible width (arcs fill the left).
const VIEW_ANCHOR = 0.8

interface AttentionArcsProps {
  tokens: Token[]
  weights: AttentionWeight[]
  query: number
  onSelect: (index: number) => void
}

export function AttentionArcs({ tokens, weights, query, onSelect }: AttentionArcsProps) {
  const slots = useMemo(() => tokenSlots(tokens.map((token) => token.text)), [tokens])
  const targets = useMemo(() => getQueryAttention(weights, query), [weights, query])
  const width = slots.length ? slots[slots.length - 1].left + slots[slots.length - 1].width : 0
  const base = ARC_AREA_HEIGHT_PX
  const scroller = useRef<HTMLDivElement>(null)
  // On a narrow screen the sentence scrolls sideways; keep the chosen token and its arcs in view.
  useEffect(() => {
    const box = scroller.current
    const slot = slots[query]
    if (!box || !slot || width <= box.clientWidth) return
    box.scrollLeft = Math.max(0, slot.center - box.clientWidth * VIEW_ANCHOR)
  }, [slots, query, width])
  return (
    <div ref={scroller} className="overflow-x-auto pb-2">
      <div style={{ width, minWidth: '100%' }}>
        <svg role="img" aria-label={`Attention arcs from token ${query + 1} back to earlier tokens`} width={width} height={base + 4} className="block">
          {targets.map(({ keyIdx, weight }) =>
            keyIdx === query ? null : (
              <path
                key={keyIdx}
                d={arcPath(slots[query].center, slots[keyIdx].center, base, query - keyIdx)}
                fill="none"
                stroke="var(--accent)"
                strokeOpacity={0.85}
                strokeWidth={strokeFor(weight)}
                strokeLinecap="round"
              />
            ),
          )}
        </svg>
        <div role="group" aria-label="Pick the token that looks back" className="flex">
          {tokens.map((token, index) => (
            <button
              key={`${index}-${token.tokenId}`}
              type="button"
              aria-pressed={index === query}
              onClick={() => onSelect(index)}
              style={{ width: slots[index].width }}
              className={cn(
                'min-h-11 shrink-0 whitespace-pre border-t-4 px-1 text-xl text-ink',
                index === query ? 'tint-accent border-accent font-semibold' : 'border-rule hover:bg-wash',
              )}
            >
              {formatTokenInline(token.text.trim()) || '·'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
