// Slide: each token becomes a list of numbers. Real GPT-2 small numbers, loaded when the slide opens:
// pick a chip, watch it turn into its 768 numbers, see its most similar tokens and the map of tokens.
import { useMemo } from 'react'
import { useActionHalo } from '../../core/hooks/useHalo'
import { useAppStore } from '../../store/appStore'
import { useTokens } from '../../core/hooks/useDerived'
import { useLoaded } from '../../core/hooks/useLoaded'
import { SentenceTokens, SlideLayout, VisualFrame, type Provenance } from '../../core/components'
import { LoadNotice } from '../../core/components/LoadNotice'
import type { Token } from '../../core/types'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { loadGpt2Table, lookupToken, type Gpt2Table } from '../../model/gpt2Table'
import { TokenMap, mapCaption } from './TokenMap'
import { NotInSet, VECTOR_CAPTION, VectorDetails, VectorHeader } from './TokenVector'

export const provenance: Provenance = 'real'

const NOT_IN_SET = 'not in demo set'

function tokensOutsideSet(table: Gpt2Table | null, texts: string[]): ReadonlySet<number> {
  if (!table) return new Set()
  return new Set(texts.flatMap((text, index) => (lookupToken(table, text) ? [] : [index])))
}

// Until a chip is picked, show the first token that has real numbers.
// The next token after the chosen one that has numbers, for the halo; null when there is none.
function nextInSet(active: number, count: number, outside: ReadonlySet<number>): number | null {
  for (let index = active + 1; index < count; index++) if (!outside.has(index)) return index
  return null
}

function firstInSet(count: number, outside: ReadonlySet<number>): number {
  const index = Array.from({ length: count }, (_, position) => position).find((position) => !outside.has(position))
  return index ?? 0
}

interface BodyProps {
  table: Gpt2Table
  tokens: Token[]
  active: number
  outside: ReadonlySet<number>
}

function Body({ table, tokens, active, outside }: BodyProps) {
  const token = tokens[active]
  const entry = outside.has(active) ? undefined : lookupToken(table, token.text)
  return (
    <div key={token.text} className="flex min-h-0 flex-1 flex-col gap-2">
      {entry ? <VectorHeader table={table} token={token} entry={entry} /> : <NotInSet token={token} tokenCount={table.file.tokenCount} />}
      <div className={entry ? 'flow-stack grid min-h-0 flex-1 grid-cols-[16rem_17.5rem_minmax(0,1fr)] gap-3' : 'flex min-h-0 flex-1 flex-col'}>
        {entry && <VectorDetails table={table} entry={entry} />}
        <TokenMap table={table} tokens={tokens} selectedIndex={active} outside={outside} />
      </div>
    </div>
  )
}

export function NumbersChapter() {
  const tokens = useTokens()
  const selected = useAppStore((s) => s.selectedTokenIndex)
  const setSelected = useAppStore((s) => s.setSelectedTokenIndex)
  const state = useLoaded(loadGpt2Table)
  const table = state.status === 'ready' ? state.value : null
  const outside = useMemo(() => tokensOutsideSet(table, tokens.map((entry) => entry.text)), [table, tokens])
  const active = selected !== null && selected < tokens.length ? selected : firstInSet(tokens.length, outside)
  const token = tokens[active]
  const caption = table ? `${VECTOR_CAPTION} ${mapCaption(table)}` : VECTOR_CAPTION

  const halo = useActionHalo('numbers')
  const nextChip = nextInSet(active, tokens.length, outside)
  const pickToken = (index: number) => {
    halo.used()
    setSelected(index)
  }
  return (
    <SlideLayout id="numbers">
      <div data-primary-control className="max-h-[6.75rem] shrink-0 overflow-y-auto p-1">
        <SentenceTokens
          tokens={tokens}
          selectedIndex={active}
          onSelect={pickToken}
          label="Pick a token"
          muted={outside}
          mutedHint={NOT_IN_SET}
          accentChip={halo.active && nextChip !== null ? { index: nextChip, className: halo.className } : undefined}
        />
      </div>
      {token && (
        <div className="flex min-h-0 flex-1 flex-col [&>figure]:flex-1">
          <VisualFrame title={`The numbers for "${formatTokenDisplay(token.text)}"`} provenance={provenance} caption={caption}>
            {table ? <Body table={table} tokens={tokens} active={active} outside={outside} /> : state.status !== 'ready' && <LoadNotice state={state} what="the GPT-2 table" />}
          </VisualFrame>
        </div>
      )}
    </SlideLayout>
  )
}
