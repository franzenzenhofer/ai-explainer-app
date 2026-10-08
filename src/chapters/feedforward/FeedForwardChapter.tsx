// Slide: the feed-forward step. Every column is pushed through the same small network on its own;
// the four steps of a run light up, then every column changes at once. The toggle draws the attention
// step on top, where lines cross between columns.
import { useMemo } from 'react'
import { useAppStore, type FeedForwardView } from '../../store/appStore'
import { useAttentionWeights, useTokens } from '../../core/hooks/useDerived'
import { Button, SlideLayout, ToggleGroup, VisualFrame } from '../../core/components'
import { MODEL_SPECS } from '../../core/types'
import { useCenters } from '../attention/useCenters'
import { AttentionArcsBand, ARC_BAND_HEIGHT, Columns, provenance } from './FeedForwardAnimation'
import { attentionLines, columnsAfterRuns, COLUMN_LENGTH, mostChangedIndex } from './columns'
import { FORMULA_STEPS, FormulaStrip } from './FormulaStrip'
import { RUN_STEP_COUNT, useRunSteps } from './useRunSteps'

// The visual's provenance, re-exported so this chapter's VisualFrame declares it too.
export { provenance }

const VIEW_OPTIONS: Array<{ value: FeedForwardView; label: string }> = [
  { value: 'alone', label: 'Feed-forward alone' },
  { value: 'withAttention', label: 'Next to attention' },
]

const CAPTION = `Each column shows ${COLUMN_LENGTH} of the ${MODEL_SPECS.embeddingDim} numbers ${MODEL_SPECS.modelName} keeps per token. The values are simulated; the arithmetic (two matrix products with a clip at zero in between, added back to the column) is real.`

function runStatus(runs: number, step: number | null): string {
  if (step !== null) return `Step ${step + 1} of ${RUN_STEP_COUNT}: ${FORMULA_STEPS[step]}, in every column at once.`
  if (runs === 0) return 'Press Run: every column goes through the same network.'
  return `Run ${runs}: every column changed at once. Green: moved most.`
}

function useHighlights(runs: number, columns: number[][]) {
  const tokens = useTokens()
  return useMemo(() => {
    if (runs === 0) return columns.map(() => null)
    const before = columnsAfterRuns(tokens, runs - 1)
    return columns.map((column, index) => mostChangedIndex(before[index], column))
  }, [tokens, runs, columns])
}

export function FeedForwardChapter() {
  const tokens = useTokens()
  const weights = useAttentionWeights()
  const runs = useAppStore((s) => s.feedForwardRuns)
  const runFeedForward = useAppStore((s) => s.runFeedForward)
  const view = useAppStore((s) => s.feedForwardView)
  const setView = useAppStore((s) => s.setFeedForwardView)
  const { step, start } = useRunSteps(runFeedForward)
  const columns = useMemo(() => columnsAfterRuns(tokens, runs), [tokens, runs])
  const highlights = useHighlights(runs, columns)
  const lines = useMemo(() => attentionLines(weights), [weights])
  const { rowRef, geometry } = useCenters<HTMLDivElement>(tokens.map((token) => token.tokenId).join('-'))
  const withAttention = view === 'withAttention'

  return (
    <SlideLayout id="feedforward">
      <VisualFrame
        title="The same small network, each column alone"
        provenance={provenance}
        caption={CAPTION}
      >
        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <FormulaStrip active={step} />
          <div className="flex min-h-0 flex-1 flex-col justify-center overflow-x-auto" data-view>
            <div role="img" aria-label={`${tokens.length} columns of ${COLUMN_LENGTH} numbers, one per token${withAttention ? ', joined by attention lines' : ', with no line between any two columns'}`}>
              <div style={{ height: ARC_BAND_HEIGHT }} className="flex items-end">
                {withAttention ? (
                  <AttentionArcsBand geometry={geometry} lines={lines} />
                ) : (
                  <p className="m-0 pb-2 text-lg font-semibold text-[var(--concept-strong)]">No lines between columns: each one is processed alone.</p>
                )}
              </div>
              <div ref={rowRef} className="relative flex w-max gap-1.5">
                <Columns tokens={tokens} columns={columns} highlights={highlights} runs={runs} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 max-sm:flex-wrap" data-primary-control>
            <Button variant="primary" onClick={start} disabled={step !== null}>
              Run the block
            </Button>
            <span className="text-base font-semibold text-[var(--concept-strong)]">Show:</span>
            <ToggleGroup label="What to show" options={VIEW_OPTIONS} value={view} onChange={setView} />
            <p className="m-0 min-w-0 flex-1 text-base leading-snug text-ink" aria-live="polite">{runStatus(runs, step)}</p>
          </div>
        </div>
      </VisualFrame>
    </SlideLayout>
  )
}
