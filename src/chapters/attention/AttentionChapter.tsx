// Slide: looking back. Pick a token and a pattern; arcs, a grid or a network show where it looks.
import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useAttentionWeights, useTokens } from '../../core/hooks/useDerived'
import { SlideLayout } from '../../core/components'
import { Overlay } from '../../core/components/Overlay'
import { defaultQuery } from '../../model/attention'
import { AttentionView, type AttentionMode } from './AttentionView'
import { HeadTypesList } from './HeadTypesList'
import { LensPicker } from './LensPicker'

function useAttentionMode() {
  const stored = useAppStore((s) => s.attentionView)
  const setStored = useAppStore((s) => s.setAttentionView)
  const [network, setNetwork] = useState(false)
  const mode: AttentionMode = network ? 'network' : stored
  const setMode = (next: AttentionMode) => {
    setNetwork(next === 'network')
    if (next !== 'network') setStored(next)
  }
  return [mode, setMode] as const
}

export function AttentionChapter() {
  const tokens = useTokens()
  const weights = useAttentionWeights()
  const selected = useAppStore((s) => s.selectedTokenIndex)
  const setSelected = useAppStore((s) => s.setSelectedTokenIndex)
  const lens = useAppStore((s) => s.selectedLens)
  const [mode, setMode] = useAttentionMode()
  const [headTypesOpen, setHeadTypesOpen] = useState(false)
  const query = selected !== null && selected < tokens.length ? selected : defaultQuery(tokens)
  const footer = <LensPicker onShowHeadTypes={() => setHeadTypesOpen(true)} />

  return (
    <SlideLayout id="attention" drawerExtra={<HeadTypesList />}>
      {tokens.length > 0 ? (
        <AttentionView mode={mode} onMode={setMode} data={{ tokens, weights, query, drawKey: `${lens}-${query}` }} onSelect={setSelected} footer={footer} />
      ) : (
        <p className="m-0 text-lg text-ink-2">Type some text in the box above to see attention.</p>
      )}
      {headTypesOpen && (
        <Overlay title="Known attention head types" onClose={() => setHeadTypesOpen(false)}>
          <HeadTypesList />
        </Overlay>
      )}
    </SlideLayout>
  )
}
