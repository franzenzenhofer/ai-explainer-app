// The fixed map of the 2,980 demo tokens (the old app's 'semantic space'): a PCA of their 768 numbers
// down to two. A flat map keeps only a small share of the variation, so tokens that are neighbours in
// 768 numbers can sit far apart here. Your tokens are labelled in their identity colours; violet rings
// mark the chosen token's most similar tokens. The similar-token list sits under the map.
import { useMemo } from 'react'
import { motion } from 'motion/react'
import { tokenColor } from '../../core/colors'
import type { Token } from '../../core/types'
import { MODEL_SPECS } from '../../core/types'
import { formatPercent, formatTokenDisplay } from '../../core/utils/formatters'
import { cn } from '../../core/utils/cn'
import { lookupToken, type Gpt2Table } from '../../model/gpt2Table'

const PERCENT = 100
const INSET = 4
const X_SPAN = 72
const Y_SPAN = 86
const DOT_UNITS = 5
const SVG_WIDTH = 1000
const SVG_HEIGHT = 600

interface TokenMapProps {
  table: Gpt2Table
  tokens: Token[]
  selectedIndex: number
  outside: ReadonlySet<number>
}

interface Place {
  left: number
  top: number
}

function placeOf(table: Gpt2Table, x: number, y: number): Place {
  const { minX, maxX, minY, maxY } = table.bounds
  return {
    left: INSET + ((x - minX) / (maxX - minX)) * X_SPAN,
    top: INSET + ((maxY - y) / (maxY - minY)) * Y_SPAN,
  }
}

function Cloud({ table }: { table: Gpt2Table }) {
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      {table.file.tokens.map((token) => {
        const place = placeOf(table, token.x, token.y)
        return (
          <rect
            key={token.id}
            x={(place.left / PERCENT) * SVG_WIDTH - DOT_UNITS / 2}
            y={(place.top / PERCENT) * SVG_HEIGHT - DOT_UNITS / 2}
            width={DOT_UNITS}
            height={DOT_UNITS}
            fill="var(--concept-soft)"
          />
        )
      })}
    </svg>
  )
}

// The faint grid behind the map, like the old app's semantic space.
const MAP_GRID = 'linear-gradient(to right, rgb(124 58 237 / 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgb(124 58 237 / 0.07) 1px, transparent 1px)'

function MapBody({ table, tokens, selectedIndex, outside }: TokenMapProps) {
  const labels = useMemo(
    () =>
      tokens.flatMap((token, index) => {
        const entry = lookupToken(table, token.text)
        if (!entry || outside.has(index)) return []
        return [{ index, entry, label: formatTokenDisplay(token.text), place: placeOf(table, entry.x, entry.y), color: tokenColor(token.text) }]
      }),
    [table, tokens, outside],
  )
  const selected = labels.find((item) => item.index === selectedIndex)
  const neighbours = useMemo(
    () => (selected ? selected.entry.neighbours.flatMap((n) => {
      const found = table.byText.get(n.text)
      return found ? [{ id: found.id, place: placeOf(table, found.x, found.y) }] : []
    }) : []),
    [table, selected],
  )
  return (
    <div role="img" aria-label="Map of the demo tokens with the tokens of your text labelled" className="relative min-h-0 w-full flex-1 rounded-lg border-2 border-[var(--concept-soft)] bg-paper"
      style={{ backgroundImage: MAP_GRID, backgroundSize: '10% 10%' }}
    >
      <Cloud table={table} />
      {neighbours.map((neighbour) => (
        <motion.span
          key={neighbour.id}
          aria-hidden="true"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -ml-2 -mt-2 h-4 w-4 rounded-full border-[3px] bg-paper"
          style={{ left: `${neighbour.place.left}%`, top: `${neighbour.place.top}%`, borderColor: 'var(--concept)' }}
        />
      ))}
      {labels.map(({ index, label, place, color }) => {
        const isSelected = index === selectedIndex
        return (
          <span
            key={index}
            className={cn('absolute -ml-1.5 flex -translate-y-1/2 items-center gap-1 whitespace-nowrap text-base', isSelected ? 'z-10 font-bold' : 'font-semibold')}
            style={{ left: `${place.left}%`, top: `${place.top}%`, color: color.text }}
          >
            <span aria-hidden="true" className="h-3 w-3 shrink-0 rounded-full" style={{ background: color.mark, boxShadow: isSelected ? '0 0 0 3px var(--concept)' : undefined }} />
            <span className="rounded px-1" style={{ background: isSelected ? color.fill : 'rgb(255 255 255 / 0.8)' }}>{label}</span>
          </span>
        )
      })}
    </div>
  )
}

export function mapCaption(table: Gpt2Table): string {
  const variance = table.file.pca.explainedVarianceRatio.reduce((sum, share) => sum + share, 0)
  return `The map is computed once offline (PCA) from ${MODEL_SPECS.modelName}'s numbers for ${table.file.tokenCount.toLocaleString('en-US')} common words; the light violet squares are all of them. Its two axes keep only ${formatPercent(variance)} of the variation, so the violet rings (the 8 most similar tokens) are not always close. Tokens with no entry are not drawn.`
}

export function TokenMap({ table, tokens, selectedIndex, outside }: TokenMapProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1">
      <h3 className="m-0 text-base font-bold" style={{ color: 'var(--concept-strong)' }}>
        Map of {table.file.tokenCount.toLocaleString('en-US')} tokens
      </h3>
      <MapBody table={table} tokens={tokens} selectedIndex={selectedIndex} outside={outside} />
    </div>
  )
}
