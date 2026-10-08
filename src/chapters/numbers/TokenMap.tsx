// The fixed map of the 2,980 demo tokens: a PCA of their 768 numbers down to two. A flat map keeps only
// a small share of the variation, so tokens that are neighbours in 768 numbers can sit far apart here.
import { useMemo } from 'react'
import type { Token } from '../../core/types'
import { MODEL_SPECS } from '../../core/types'
import { LoadNotice } from '../../core/components/LoadNotice'
import { VisualFrame, type Provenance } from '../../core/components'
import type { LoadState } from '../../core/hooks/useLoaded'
import { formatPercent, formatTokenDisplay } from '../../core/utils/formatters'
import { cn } from '../../core/utils/cn'
import { lookupToken, type Gpt2Table } from '../../model/gpt2Table'

export const provenance: Provenance = 'real'

const PERCENT = 100
const INSET = 4
const X_SPAN = 72
const Y_SPAN = 86
const DOT_UNITS = 5
const SVG_WIDTH = 1000
const SVG_HEIGHT = 600

interface TokenMapProps {
  state: LoadState<Gpt2Table>
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
            fill="var(--rule-strong)"
          />
        )
      })}
    </svg>
  )
}

function MapBody({ table, tokens, selectedIndex, outside }: Omit<TokenMapProps, 'state'> & { table: Gpt2Table }) {
  const labels = useMemo(
    () =>
      tokens.flatMap((token, index) => {
        const entry = lookupToken(table, token.text)
        if (!entry || outside.has(index)) return []
        return [{ index, entry, label: formatTokenDisplay(token.text), place: placeOf(table, entry.x, entry.y) }]
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
    <div role="img" aria-label="Map of the demo tokens with the tokens of your text labelled" className="relative aspect-[5/3] w-full border border-rule">
      <Cloud table={table} />
      {neighbours.map((neighbour) => (
        <span
          key={neighbour.id}
          aria-hidden="true"
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-paper"
          style={{ left: `${neighbour.place.left}%`, top: `${neighbour.place.top}%` }}
        />
      ))}
      {labels.map(({ index, label, place }) => {
        const isSelected = index === selectedIndex
        return (
          <span
            key={index}
            className={cn('absolute -ml-1.5 flex -translate-y-1/2 items-center gap-1.5 whitespace-nowrap text-base', isSelected ? 'z-10 font-bold text-ink' : 'text-ink-2')}
            style={{ left: `${place.left}%`, top: `${place.top}%`, maxWidth: `${PERCENT - place.left}%` }}
          >
            <span aria-hidden="true" className={cn('h-3 w-3 shrink-0 rounded-full', isSelected ? 'bg-accent' : 'bg-ink')} />
            <span className={cn('truncate', isSelected && 'tint-accent px-1')}>{label}</span>
          </span>
        )
      })}
    </div>
  )
}

export function TokenMap({ state, tokens, selectedIndex, outside }: TokenMapProps) {
  const variance = state.status === 'ready' ? state.value.file.pca.explainedVarianceRatio.reduce((sum, share) => sum + share, 0) : 0
  const caption =
    state.status === 'ready'
      ? `Fixed map computed once offline (PCA) from ${MODEL_SPECS.modelName}'s numbers for ${state.value.file.tokenCount.toLocaleString('en-US')} common words; grey squares are all of them. The two axes keep only ${formatPercent(variance)} of the variation, so the circles (the 8 most similar tokens of the chosen one) are not always close. Tokens with no entry are not drawn.`
      : `A fixed map of common ${MODEL_SPECS.modelName} tokens.`
  return (
    <VisualFrame title="A map of tokens" provenance={provenance} caption={caption}>
      {state.status === 'ready' ? (
        <MapBody table={state.value} tokens={tokens} selectedIndex={selectedIndex} outside={outside} />
      ) : (
        <LoadNotice state={state} what="the GPT-2 map" />
      )}
    </VisualFrame>
  )
}
