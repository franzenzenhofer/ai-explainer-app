// Chapter 6: stacking. Attention plus feed-forward is one block; the stepper walks the stack and
// the last position's running vector changes a little at every block.
import { useMemo } from 'react'
import { useAppStore } from '../../store/appStore'
import { useTokens } from '../../core/hooks/useDerived'
import { Button, ChapterLayout, VisualFrame, type Provenance } from '../../core/components'
import { VectorStrip } from '../../core/components/VectorStrip'
import { LARGE_MODEL_SPECS, MODEL_SPECS } from '../../core/types'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { residualStream } from '../../model/vectors'
import { LayerStack, blockLabel } from './LayerStack'
import { mostChangedIndices, streamScale } from './residual'

export const provenance: Provenance = 'simulated'

const STRIP_LENGTH = 32
const HIGHLIGHT_COUNT = 4
const STRIP_HEIGHT = 140

const CAPTION = `${STRIP_LENGTH} of ${MODEL_SPECS.embeddingDim} numbers shown. ${MODEL_SPECS.modelName} size demo, ${MODEL_SPECS.layers} blocks; ${LARGE_MODEL_SPECS.modelName}: ${LARGE_MODEL_SPECS.layers}. Each block adds to the running vector; nothing is replaced.`

function stripTitle(block: number, tokenText: string): string {
  const where = `the last position ("${formatTokenDisplay(tokenText)}")`
  return block === 0 ? `Vector at ${where} before any block` : `Vector at ${where} after block ${block}`
}

export function LayersChapter() {
  const tokens = useTokens()
  const selectedBlock = useAppStore((s) => s.selectedBlock)
  const setSelectedBlock = useAppStore((s) => s.setSelectedBlock)

  const stream = useMemo(() => residualStream(tokens, MODEL_SPECS.layers, STRIP_LENGTH), [tokens])
  const scale = useMemo(() => streamScale(stream), [stream])
  const current = stream[selectedBlock] ?? []
  const highlight = useMemo(
    () => (selectedBlock === 0 || !stream[selectedBlock] ? new Set<number>() : mostChangedIndices(stream[selectedBlock - 1], stream[selectedBlock], HIGHLIGHT_COUNT)),
    [stream, selectedBlock],
  )
  const lastText = tokens[tokens.length - 1]?.text ?? ''
  const title = stripTitle(selectedBlock, lastText)

  return (
    <ChapterLayout id="layers">
      <VisualFrame title="The stack, and one running vector" provenance={provenance} caption={CAPTION}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="order-2 lg:order-1">
            <LayerStack selectedBlock={selectedBlock} onSelect={setSelectedBlock} />
          </div>
          <div className="order-1 lg:order-2">
            <p className="m-0 mb-3 text-lg font-semibold" aria-live="polite">{title}</p>
            <VectorStrip values={current} label={title} scale={scale} highlight={highlight} height={STRIP_HEIGHT} />
            <p className="m-0 mt-3 text-base text-ink-2">
              {selectedBlock === 0
                ? 'The token numbers plus the position numbers: where every position starts.'
                : `${blockLabel(selectedBlock)} added to it. The accent marks the ${HIGHLIGHT_COUNT} numbers that moved most.`}
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
      </VisualFrame>
    </ChapterLayout>
  )
}
