// Chapter 4: looking back. Pick a token and a lens; arcs or a grid show where it looks.
import { useAppStore } from '../../store/appStore'
import { useAttentionWeights, useTokens } from '../../core/hooks/useDerived'
import { SlideLayout, ToggleGroup } from '../../core/components'
import { defaultQuery } from '../../model/attention'
import { AttentionView } from './AttentionView'
import { HeadTypesList } from './HeadTypesList'
import { LensPicker } from './LensPicker'

export function AttentionChapter() {
  const tokens = useTokens()
  const weights = useAttentionWeights()
  const selected = useAppStore((s) => s.selectedTokenIndex)
  const setSelected = useAppStore((s) => s.setSelectedTokenIndex)
  const view = useAppStore((s) => s.attentionView)
  const setView = useAppStore((s) => s.setAttentionView)
  const query = selected !== null && selected < tokens.length ? selected : defaultQuery(tokens)

  return (
    <SlideLayout id="attention" drawerExtra={<HeadTypesList />}>
      {tokens.length > 0 ? (
        <AttentionView view={view} tokens={tokens} weights={weights} query={query} onSelect={setSelected} />
      ) : (
        <p className="m-0 text-lg text-ink-2">Type some text in the bar above to see attention.</p>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start" data-primary-control>
        <LensPicker />
        <div>
          <p className="m-0 mb-2 text-base font-semibold">Show as</p>
          <ToggleGroup
            label="Attention view"
            options={[
              { value: 'arcs', label: 'Arcs' },
              { value: 'grid', label: 'Grid' },
            ]}
            value={view}
            onChange={setView}
          />
        </div>
      </div>
    </SlideLayout>
  )
}
