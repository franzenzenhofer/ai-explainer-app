// Chapter 3: each token becomes a list of numbers. Real GPT-2 small numbers, loaded when the chapter opens.
import { useMemo } from 'react'
import { useAppStore } from '../../store/appStore'
import { useTokens } from '../../core/hooks/useDerived'
import { useLoaded } from '../../core/hooks/useLoaded'
import { SlideLayout, SentenceTokens, type Provenance } from '../../core/components'
import { loadGpt2Table, lookupToken, type Gpt2Table } from '../../model/gpt2Table'
import { TokenMap } from './TokenMap'
import { TokenVector } from './TokenVector'

export const provenance: Provenance = 'real'

const NOT_IN_SET = 'not in demo set'

function tokensOutsideSet(table: Gpt2Table | null, texts: string[]): ReadonlySet<number> {
  if (!table) return new Set()
  return new Set(texts.flatMap((text, index) => (lookupToken(table, text) ? [] : [index])))
}

export function NumbersChapter() {
  const tokens = useTokens()
  const selected = useAppStore((s) => s.selectedTokenIndex)
  const setSelected = useAppStore((s) => s.setSelectedTokenIndex)
  const state = useLoaded(loadGpt2Table)
  const table = state.status === 'ready' ? state.value : null
  const active = selected !== null && selected < tokens.length ? selected : 0
  const token = tokens[active]
  const outside = useMemo(() => tokensOutsideSet(table, tokens.map((entry) => entry.text)), [table, tokens])

  return (
    <SlideLayout id="numbers">
      <div data-primary-control className="mb-8">
        <SentenceTokens
          tokens={tokens}
          selectedIndex={active}
          onSelect={setSelected}
          label="Pick a token"
          muted={outside}
          mutedHint={NOT_IN_SET}
        />
      </div>
      {token && (
        <div className="grid gap-10 lg:grid-cols-2">
          <TokenVector state={state} token={token} outside={outside.has(active)} />
          <TokenMap state={state} tokens={tokens} selectedIndex={active} outside={outside} />
        </div>
      )}
    </SlideLayout>
  )
}
