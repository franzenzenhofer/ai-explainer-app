// Chapter 6: stacking. Attention plus feed-forward is one block; the stepper walks the stack and
// the last position's running vector changes at every block. Real GPT-2 small numbers for four sample prompts.
import { useMemo } from 'react'
import { useAppStore } from '../../store/appStore'
import { useLoaded } from '../../core/hooks/useLoaded'
import { Button, SlideLayout, VisualFrame, type Provenance } from '../../core/components'
import { LoadNotice } from '../../core/components/LoadNotice'
import { VectorStrip } from '../../core/components/VectorStrip'
import { LARGE_MODEL_SPECS, MODEL_SPECS } from '../../core/types'
import { formatTokenDisplay, formatVectorValue } from '../../core/utils/formatters'
import { findSamplePrompt, loadGpt2Activations, type Gpt2Activations, type Gpt2Prompt } from '../../model/gpt2Activations'
import { LayerStack, blockLabel } from './LayerStack'
import { SamplePromptChoice } from './SamplePromptChoice'
import { largestMagnitude, mostChangedIndices, streamScale } from './residual'

export const provenance: Provenance = 'real'

const HIGHLIGHT_COUNT = 4
const STRIP_HEIGHT = 140

const CAPTION = `Real numbers from ${MODEL_SPECS.modelName}: all ${MODEL_SPECS.embeddingDim} numbers of the last position, ${MODEL_SPECS.layers} blocks (${LARGE_MODEL_SPECS.modelName}: ${LARGE_MODEL_SPECS.layers}). ${MODEL_SPECS.modelName} cuts text slightly differently from the tokenizer in the Tokens chapter. Each block adds to the running vector; nothing is replaced.`

function stripTitle(block: number, tokenText: string): string {
  const where = `the last position ("${formatTokenDisplay(tokenText)}")`
  return block === 0 ? `Vector at ${where} before any block` : `Vector at ${where} after block ${block}`
}

function Stack({ sample }: { sample: Gpt2Prompt }) {
  const selectedBlock = useAppStore((s) => s.selectedBlock)
  const setSelectedBlock = useAppStore((s) => s.setSelectedBlock)
  const stream = useMemo(() => sample.residualStream.map((stage) => stage.vector), [sample])
  const scale = useMemo(() => streamScale(stream), [stream])
  const current = stream[selectedBlock] ?? []
  const highlight = useMemo(
    () => (selectedBlock === 0 || !stream[selectedBlock] ? new Set<number>() : mostChangedIndices(stream[selectedBlock - 1], stream[selectedBlock], HIGHLIGHT_COUNT)),
    [stream, selectedBlock],
  )
  const title = stripTitle(selectedBlock, sample.tokens[sample.lastPosition]?.text ?? '')

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <div className="order-2 lg:order-1">
        <LayerStack selectedBlock={selectedBlock} onSelect={setSelectedBlock} />
      </div>
      <div className="order-1 lg:order-2">
        <p className="m-0 mb-1 text-base text-ink-2">
          {MODEL_SPECS.modelName} reads &quot;{sample.prompt}&quot; as: {sample.tokens.map((token) => formatTokenDisplay(token.text)).join(' | ')}
        </p>
        <p className="m-0 mb-3 text-lg font-semibold" aria-live="polite">{title}</p>
        <VectorStrip values={current} label={title} scale={scale} highlight={highlight} height={STRIP_HEIGHT} />
        <p className="m-0 mt-3 text-base text-ink-2">
          {selectedBlock === 0
            ? 'The token numbers plus the position numbers: where every position starts.'
            : `${blockLabel(selectedBlock)} added to it. The accent marks the ${HIGHLIGHT_COUNT} numbers that moved most.`}{' '}
          Largest number here: {formatVectorValue(largestMagnitude(current))}. All blocks share one scale; the few largest numbers are cut at the frame edge.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row" data-primary-control>
          <Button onClick={() => setSelectedBlock(selectedBlock - 1)} disabled={selectedBlock === 0} className="w-full sm:w-auto">
            Block down
          </Button>
          <Button
            variant="primary"
            onClick={() => setSelectedBlock(selectedBlock + 1)}
            disabled={selectedBlock === MODEL_SPECS.layers}
            className="w-full sm:w-auto"
          >
            Block up
          </Button>
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
