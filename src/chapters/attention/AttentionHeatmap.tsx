// Attention as a grid: one row per token, one column per earlier token, darker orange = more weight.
// Only the lower triangle has weights; the cells to the right are hatched because a token cannot look ahead.
import { motion } from 'motion/react'
import { useMemo } from 'react'
import type { AttentionWeight, Token } from '../../core/types'
import { tokenColor } from '../../core/colors'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { cn } from '../../core/utils/cn'
import { createAttentionMatrix } from '../../model/attention'

interface AttentionHeatmapProps {
  tokens: Token[]
  weights: AttentionWeight[]
  query: number
  drawKey: string
}

const LABEL_THRESHOLD = 0.1
const LIGHT_TEXT_FROM = 0.45
// Weights below one are lifted (square root) so small but real weights still show.
const SHADE_POWER = 0.6
const ROW_STAGGER_S = 0.04
const PERCENT = 100
const FUTURE = 'repeating-linear-gradient(135deg, var(--concept-tint) 0 6px, #ffffff 6px 12px)'

function Cell({ weight }: { weight: number }) {
  return (
    <td
      className={cn('h-[26px] min-w-11 border border-white text-center text-base font-semibold tabular-nums', weight > LIGHT_TEXT_FROM ? 'text-paper' : 'text-[var(--concept-strong)]')}
      style={{ background: `color-mix(in srgb, var(--concept) ${Math.round(Math.pow(weight, SHADE_POWER) * PERCENT)}%, #ffffff)` }}
    >
      {weight >= LABEL_THRESHOLD ? Math.round(weight * PERCENT) : ''}
    </td>
  )
}

function Label({ token, strong }: { token: Token; strong: boolean }) {
  return (
    <span className={cn('whitespace-pre font-mono text-base', strong ? 'font-extrabold' : 'font-semibold')} style={{ color: tokenColor(token.text).text }}>
      {formatTokenDisplay(token.text)}
    </span>
  )
}

export function AttentionHeatmap({ tokens, weights, query, drawKey }: AttentionHeatmapProps) {
  const matrix = useMemo(() => createAttentionMatrix(weights, tokens.length), [weights, tokens.length])
  return (
    <div className="overflow-auto">
      <table className="border-collapse">
        <caption className="sr-only">Attention weights in percent; rows look back at columns</caption>
        <thead>
          <tr>
            <th scope="col" className="px-2 text-left text-base font-semibold text-[var(--concept-strong)]">looks at</th>
            {tokens.map((token, key) => (
              <th key={key} scope="col" className="h-[26px] px-1 text-center">
                <Label token={token} strong={false} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rowIndex) => (
            <motion.tr
              key={`${drawKey}-${rowIndex}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: rowIndex * ROW_STAGGER_S }}
              className={cn(rowIndex === query && 'outline outline-[3px] outline-[var(--concept)]')}
            >
              <th scope="row" className="px-2 text-right">
                <Label token={tokens[rowIndex]} strong={rowIndex === query} />
              </th>
              {row.map((weight, key) => (key <= rowIndex ? <Cell key={key} weight={weight} /> : <td key={key} className="min-w-11 border border-white" style={{ background: FUTURE }} />))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
