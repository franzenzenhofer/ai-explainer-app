// The old "top attention targets" view: the chosen token on the left, lines to its strongest earlier
// targets on the right, each with an orange bar and its share. Lines are straight; thickness = weight.
import { motion } from 'motion/react'
import type { AttentionWeight, Token } from '../../core/types'
import { TokenChip } from '../../core/components/TokenChip'
import { formatPercent } from '../../core/utils/formatters'
import { getQueryAttention } from '../../model/attention'
import { strokeFor } from './arcLayout'

const SHOWN_TARGETS = 6
const ROW_PX = 42
const LINK_WIDTH_PX = 120
const BAR_STAGGER_S = 0.08
const PERCENT = 100

interface AttentionNetworkProps {
  tokens: Token[]
  weights: AttentionWeight[]
  query: number
  drawKey: string
}

export function AttentionNetwork({ tokens, weights, query, drawKey }: AttentionNetworkProps) {
  const targets = getQueryAttention(weights, query).slice(0, SHOWN_TARGETS)
  const height = Math.max(1, targets.length) * ROW_PX
  const max = targets[0]?.weight ?? 1
  return (
    <div className="flex items-center gap-0 max-sm:flex-col max-sm:items-stretch max-sm:gap-2" aria-label={`Strongest earlier targets of token ${query + 1}`}>
      <div className="flex w-44 shrink-0 flex-col items-center gap-1">
        <TokenChip text={tokens[query].text} tokenId={tokens[query].tokenId} size="lg" selected />
        <span className="text-base font-semibold text-[var(--concept-strong)]">looks back at</span>
      </div>
      <svg width={LINK_WIDTH_PX} height={height} aria-hidden="true" className="shrink-0 max-sm:hidden">
        {targets.map(({ keyIdx, weight }, rank) => (
          <motion.line
            key={`${drawKey}-${keyIdx}`}
            x1={0}
            y1={height / 2}
            x2={LINK_WIDTH_PX}
            y2={rank * ROW_PX + ROW_PX / 2}
            stroke="var(--concept)"
            strokeWidth={strokeFor(weight)}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ delay: rank * BAR_STAGGER_S, duration: 0.4 }}
          />
        ))}
      </svg>
      <ol className="m-0 flex min-w-0 flex-1 list-none flex-col p-0">
        {targets.map(({ keyIdx, weight }, rank) => (
          <li key={`${drawKey}-${keyIdx}`} className="grid grid-cols-[10rem_minmax(0,1fr)_4rem] items-center gap-3 max-sm:grid-cols-[minmax(0,1fr)_4rem]" style={{ height: ROW_PX }}>
            <span className="flex items-center gap-2">
              <TokenChip text={tokens[keyIdx].text} tokenId={tokens[keyIdx].tokenId} order={rank} />
              {keyIdx === query && <span className="text-base text-ink-2">itself</span>}
            </span>
            <span className="block h-4 rounded-full bg-[var(--concept-tint)] max-sm:hidden">
              <motion.span
                className="block h-full rounded-full bg-[var(--concept)]"
                initial={{ width: 0 }}
                animate={{ width: `${(weight / max) * PERCENT}%` }}
                transition={{ delay: rank * BAR_STAGGER_S, duration: 0.5 }}
              />
            </span>
            <span className="text-right text-lg font-bold tabular-nums text-[var(--concept-strong)]">{formatPercent(weight)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
