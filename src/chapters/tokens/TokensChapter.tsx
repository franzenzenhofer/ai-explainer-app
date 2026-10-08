// Slide: your text becomes tokens. Real o200k_base tokenization of the shared prompt: the text, the
// colourful token chips with their IDs (they split in one by one), the counts, and the byte pair
// encoding demo that shows how the fixed list cuts a word.
import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useTokens } from '../../core/hooks/useDerived'
import { SentenceTokens, SlideLayout, ToggleGroup, VisualFrame, type Provenance } from '../../core/components'
import { TOKENIZER_SPECS } from '../../core/types'
import { BPEVisualizer } from './BPEVisualizer'
import { SamplePrompts } from './SamplePrompts'
import { StatTiles } from './StatTiles'
import { SplitArrow, TextRow, type TextPanel } from './TextRow'
import { TokenDetail } from './TokenDetail'
import { TokenFacts } from './TokenFacts'

export const provenance: Provenance = 'real'

type View = 'tokens' | 'bpe'

// Up to this many tokens the chips are drawn large.
const LARGE_CHIP_LIMIT = 24

const VIEWS: Array<{ value: View; label: string }> = [
  { value: 'tokens', label: 'Your tokens' },
  { value: 'bpe', label: 'How a word is cut' },
]

const CAPTION = `${TOKENIZER_SPECS.name}, the tokenizer OpenAI publishes for ${TOKENIZER_SPECS.publishedFor}, has ${TOKENIZER_SPECS.vocabulary.toLocaleString('en-US')} tokens. The IDs are its real IDs; the merges are computed from its real merge ranks.`

function TokensView({ panel, onSample }: { panel: TextPanel; onSample: (text: string) => void }) {
  const tokens = useTokens()
  const inputText = useAppStore((s) => s.inputText)
  const selected = useAppStore((s) => s.selectedTokenIndex)
  const setSelected = useAppStore((s) => s.setSelectedTokenIndex)
  const [replay, setReplay] = useState(0)
  return (
    <>
      <SplitArrow count={tokens.length} onReplay={() => setReplay((count) => count + 1)} />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border-2 p-2.5" style={{ borderColor: 'var(--concept)', background: 'var(--concept-tint)' }}>
        {panel === 'samples' ? (
          <SamplePrompts onSelect={onSample} />
        ) : (
          <div key={replay} className="my-auto">
            <SentenceTokens
              tokens={tokens}
              selectedIndex={selected}
              onSelect={setSelected}
              label="Tokens of your text"
              size={tokens.length > LARGE_CHIP_LIMIT ? 'md' : 'lg'}
            />
          </div>
        )}
      </div>
      <TokenDetail />
      <StatTiles text={inputText} tokenCount={tokens.length} />
    </>
  )
}

export function TokensChapter() {
  const setInputText = useAppStore((s) => s.setInputText)
  const [panel, setPanel] = useState<TextPanel>('none')
  const [view, setView] = useState<View>('tokens')
  const toggle = (target: TextPanel) => setPanel((open) => (open === target ? 'none' : target))
  const onSample = (text: string) => {
    setInputText(text)
    setPanel('none')
  }

  return (
    <SlideLayout id="tokens" drawerExtra={<TokenFacts />}>
      <VisualFrame
        title="Your text, cut into tokens"
        provenance={provenance}
        caption={CAPTION}
        actions={<ToggleGroup label="What to show" options={VIEWS} value={view} onChange={setView} />}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          {view === 'tokens' ? (
            <>
              <TextRow panel={panel} onToggle={toggle} />
              <TokensView panel={panel} onSample={onSample} />
            </>
          ) : (
            <BPEVisualizer />
          )}
        </div>
      </VisualFrame>
    </SlideLayout>
  )
}
