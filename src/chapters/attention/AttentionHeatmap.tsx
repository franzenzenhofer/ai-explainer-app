// Attention as a grid: one row per token, one column per earlier token. Only the lower triangle is
// drawn because a token cannot look ahead. No per-cell animation; the grid scrolls in its own box.
import { useMemo } from 'react'
import type { AttentionWeight, Token } from '../../core/types'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { cn } from '../../core/utils/cn'
import { createAttentionMatrix } from '../../model/attention'

interface AttentionHeatmapProps {
  tokens: Token[]
  weights: AttentionWeight[]
  query: number
  onSelect: (index: number) => void
}

const LABEL_THRESHOLD = 0.1
const DARK_CELL = 0.5

function Cell({ weight }: { weight: number }) {
  return (
    <td
      className={cn('h-12 min-w-12 border border-rule text-center text-base tabular-nums', weight > DARK_CELL ? 'text-paper' : 'text-ink')}
      style={{ background: `rgba(11, 11, 12, ${weight.toFixed(3)})` }}
    >
      {weight >= LABEL_THRESHOLD ? Math.round(weight * 100) : ''}
    </td>
  )
}

export function AttentionHeatmap({ tokens, weights, query, onSelect }: AttentionHeatmapProps) {
  const matrix = useMemo(() => createAttentionMatrix(weights, tokens.length), [weights, tokens.length])
  return (
    <div className="max-h-[70vh] overflow-auto">
      <table className="border-collapse">
        <caption className="sr-only">Attention weights in percent; rows look back at columns</caption>
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 bg-paper text-left text-base font-normal text-ink-2">looks at</th>
            {tokens.map((token, key) => (
              <th key={key} scope="col" className="h-12 min-w-12 px-1 text-base font-normal text-ink-2">
                {formatTokenDisplay(token.text)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th scope="row" className="sticky left-0 bg-paper p-0 text-right">
                <button
                  type="button"
                  aria-pressed={rowIndex === query}
                  onClick={() => onSelect(rowIndex)}
                  className={cn('min-h-12 w-full whitespace-nowrap border-r-4 px-2 text-base', rowIndex === query ? 'tint-accent border-accent font-semibold' : 'border-transparent')}
                >
                  {formatTokenDisplay(tokens[rowIndex].text)}
                </button>
              </th>
              {row.map((weight, key) => (key <= rowIndex ? <Cell key={key} weight={weight} /> : <td key={key} className="min-w-12" />))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
