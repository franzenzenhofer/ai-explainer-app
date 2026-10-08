// Attention as arcs on the sentence: from the chosen token back to every earlier token, thickness
// equals weight. White background; arcs never point right because of the causal mask.
import { useMemo } from 'react'
import type { AttentionWeight, Token } from '../../core/types'
import { formatTokenInline } from '../../core/utils/formatters'
import { cn } from '../../core/utils/cn'
import { getQueryAttention } from '../../model/attention'
import { ARC_AREA_HEIGHT_PX, arcPath, strokeFor, tokenSlots } from './arcLayout'

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
  return (
    <div className="overflow-x-auto pb-2">
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
