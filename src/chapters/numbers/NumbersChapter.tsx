// Chapter 3: each token becomes a list of numbers (simulated values, real sizes).
import { useAppStore } from '../../store/appStore'
import { useTokens } from '../../core/hooks/useDerived'
import { ChapterLayout, SentenceTokens } from '../../core/components'
import { TokenMap } from './TokenMap'
import { TokenVector } from './TokenVector'

export function NumbersChapter() {
  const tokens = useTokens()
  const selected = useAppStore((s) => s.selectedTokenIndex)
  const setSelected = useAppStore((s) => s.setSelectedTokenIndex)
  const active = selected !== null && selected < tokens.length ? selected : 0
  const token = tokens[active]

  return (
    <ChapterLayout id="numbers">
      <div data-primary-control className="mb-8">
        <SentenceTokens tokens={tokens} selectedIndex={active} onSelect={setSelected} label="Pick a token" />
      </div>
      {token && (
        <div className="grid gap-10 lg:grid-cols-2">
          <TokenVector token={token} position={active} />
          <TokenMap tokens={tokens} selectedIndex={active} />
        </div>
      )}
    </ChapterLayout>
  )
}
