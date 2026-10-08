// Chapter 2: your text becomes tokens. Real o200k_base tokenization of the shared prompt.
import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useTokens } from '../../core/hooks/useDerived'
import { Button, ChapterLayout, SentenceTokens, VisualFrame, type Provenance } from '../../core/components'
import { TOKENIZER_SPECS } from '../../core/types'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { tokenByteLength } from '../../model/tokenizer'
import { BPEVisualizer } from './BPEVisualizer'
import { SamplePrompts } from './SamplePrompts'
import { TokenFacts } from './TokenFacts'
import { PromptEditor } from './PromptEditor'

export const provenance: Provenance = 'real'

type Panel = 'none' | 'edit' | 'samples'

function TokenDetail() {
  const tokens = useTokens()
  const selected = useAppStore((s) => s.selectedTokenIndex)
  const token = selected === null ? undefined : tokens[selected]
  if (!token) return <p className="m-0 text-lg text-ink-2">No token chosen yet.</p>
  return (
    <p className="m-0 text-lg" aria-live="polite">
      <span className="font-semibold">&quot;{formatTokenDisplay(token.text)}&quot;</span>: token ID{' '}
      <span className="font-semibold tabular-nums">{token.tokenId.toLocaleString('en-US')}</span>, {tokenByteLength(token)}{' '}
      {tokenByteLength(token) === 1 ? 'byte' : 'bytes'}. A dot stands for a space that belongs to the token.
    </p>
  )
}

export function TokensChapter() {
  const tokens = useTokens()
  const selected = useAppStore((s) => s.selectedTokenIndex)
  const setSelected = useAppStore((s) => s.setSelectedTokenIndex)
  const setInputText = useAppStore((s) => s.setInputText)
  const [panel, setPanel] = useState<Panel>('none')
  const toggle = (target: Panel) => setPanel((open) => (open === target ? 'none' : target))

  return (
    <ChapterLayout
      id="tokens"
      drawerExtra={
        <div className="space-y-8">
          <TokenFacts />
          <BPEVisualizer />
        </div>
      }
    >
      <VisualFrame
        title="Your text, cut into tokens"
        provenance={provenance}
        caption={`${TOKENIZER_SPECS.name}, the tokenizer OpenAI publishes for ${TOKENIZER_SPECS.publishedFor}, has ${TOKENIZER_SPECS.vocabulary.toLocaleString('en-US')} tokens.`}
      >
        {panel === 'edit' ? (
          <PromptEditor onDone={() => setPanel('none')} />
        ) : (
          <SentenceTokens tokens={tokens} selectedIndex={selected} onSelect={setSelected} label="Tokens of your text" />
        )}
        <p className="m-0 mt-6 font-serif text-3xl font-semibold tabular-nums" aria-live="polite">
          {tokens.length} {tokens.length === 1 ? 'token' : 'tokens'}
        </p>
        <div className="mt-2">
          <TokenDetail />
        </div>
      </VisualFrame>
      <div className="mt-6 flex flex-wrap gap-2" data-primary-control>
        <Button variant="primary" aria-expanded={panel === 'edit'} onClick={() => toggle('edit')}>
          {panel === 'edit' ? 'Done editing' : 'Edit text'}
        </Button>
        <Button aria-expanded={panel === 'samples'} onClick={() => toggle('samples')}>
          Try a hard one
        </Button>
      </div>
      {panel === 'samples' && (
        <div className="mt-4">
          <SamplePrompts
            onSelect={(text) => {
              setInputText(text)
              setPanel('none')
            }}
          />
        </div>
      )}
    </ChapterLayout>
  )
}
