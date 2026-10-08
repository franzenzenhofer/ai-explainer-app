// Slide: stacking. Attention plus feed-forward is one block; Play walks the last position's running
// vector up the stack, block by block. Real GPT-2 small numbers for four sample prompts.
import { useMemo } from 'react'
import { useAppStore } from '../../store/appStore'
import { useLoaded } from '../../core/hooks/useLoaded'
import { SlideLayout, TokenChip, VisualFrame, type Provenance } from '../../core/components'
import { LoadNotice } from '../../core/components/LoadNotice'
import { LARGE_MODEL_SPECS, MODEL_SPECS } from '../../core/types'
import { formatTokenDisplay, formatVectorValue } from '../../core/utils/formatters'
import { findSamplePrompt, loadGpt2Activations, type Gpt2Activations, type Gpt2Prompt } from '../../model/gpt2Activations'
import { BlockPicker } from './BlockPicker'
import { LayerStack } from './LayerStack'
import { LayerVector } from './LayerVector'
import { SamplePromptChoice } from './SamplePromptChoice'
import { largestMagnitude, mostChangedIndices, streamScale } from './residual'
import { usePlayBlocks } from './usePlayBlocks'

export const provenance: Provenance = 'real'

const HIGHLIGHT_COUNT = 4

const CAPTION = `Real numbers from ${MODEL_SPECS.modelName}: all ${MODEL_SPECS.embeddingDim} numbers of the last position, ${MODEL_SPECS.layers} blocks (${LARGE_MODEL_SPECS.modelName}: ${LARGE_MODEL_SPECS.layers}). ${MODEL_SPECS.modelName} cuts text slightly differently from the tokenizer on the Tokens slide. Each block adds to the running vector; nothing is replaced. All blocks share one scale; the few largest numbers are cut at the edge.`

function stripTitle(block: number, tokenText: string): string {
  const where = `the last position ("${formatTokenDisplay(tokenText)}")`
  return block === 0 ? `Vector at ${where} before any block` : `Vector at ${where} after block ${block}`
}

function blockNote(block: number, largest: number): string {
  const what = block === 0 ? 'Token numbers plus position numbers: the start.' : `Block ${block} added its result; teal: the ${HIGHLIGHT_COUNT} numbers it moved most.`
  return `${what} Largest: ${formatVectorValue(largest)}.`
}

function SampleTokens({ sample }: { sample: Gpt2Prompt }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-base leading-snug text-ink-2">{MODEL_SPECS.modelName} reads &quot;{sample.prompt}&quot; as:</span>
      <div className="flex flex-wrap gap-1">
        {sample.tokens.map((token, index) => (
          <TokenChip
            key={token.position}
            text={token.text}
            tokenId={token.id}
            order={index}
            selected={token.position === sample.lastPosition}
            className="min-h-9 gap-1 px-1.5 text-base"
          />
        ))}
      </div>
    </div>
  )
}

function Stack({ sample }: { sample: Gpt2Prompt }) {
  const selectedBlock = useAppStore((s) => s.selectedBlock)
  const setSelectedBlock = useAppStore((s) => s.setSelectedBlock)
  const { playing, toggle } = usePlayBlocks(selectedBlock, setSelectedBlock, MODEL_SPECS.layers)
  const stream = useMemo(() => sample.residualStream.map((stage) => stage.vector), [sample])
  const scale = useMemo(() => streamScale(stream), [stream])
  const current = stream[selectedBlock] ?? []
  const highlight = useMemo(
    () => (selectedBlock === 0 || !stream[selectedBlock] ? new Set<number>() : mostChangedIndices(stream[selectedBlock - 1], stream[selectedBlock], HIGHLIGHT_COUNT)),
    [stream, selectedBlock],
  )
  const title = stripTitle(selectedBlock, sample.tokens[sample.lastPosition]?.text ?? '')
  return (
    <div className="flex min-h-0 flex-1 gap-4 max-sm:flex-col">
      <LayerStack selectedBlock={selectedBlock} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <SampleTokens sample={sample} />
        <p className="m-0 text-lg font-bold text-[var(--concept-strong)]" aria-live="polite">{title}</p>
        <LayerVector values={current} label={title} scale={scale} highlight={highlight} />
        <p className="m-0 text-base text-ink">{blockNote(selectedBlock, largestMagnitude(current))}</p>
        <div className="mt-auto">
          <BlockPicker selectedBlock={selectedBlock} onSelect={setSelectedBlock} playing={playing} onPlay={toggle} />
        </div>
      </div>
    </div>
  )
}

function Body({ activations }: { activations: Gpt2Activations }) {
  const inputText = useAppStore((s) => s.inputText)
  const sample = findSamplePrompt(activations, inputText)
  return sample ? <Stack sample={sample} /> : <SamplePromptChoice samples={activations.prompts} />
}

export function LayersChapter() {
  const state = useLoaded(loadGpt2Activations)
  return (
    <SlideLayout id="layers">
      <VisualFrame title="The stack, and one running vector" provenance={provenance} caption={CAPTION}>
        {state.status === 'ready' ? <Body activations={state.value} /> : <LoadNotice state={state} what="the GPT-2 block numbers" />}
      </VisualFrame>
    </SlideLayout>
  )
}
