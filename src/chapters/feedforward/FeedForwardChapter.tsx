// Chapter 5: the feed-forward step. Every column is pushed through the same small network on its
// own; the toggle puts the attention step next to it, where lines cross between columns.
import { useMemo, type ReactNode } from 'react'
import { useAppStore, type FeedForwardView } from '../../store/appStore'
import { useAttentionWeights, useTokens } from '../../core/hooks/useDerived'
import { Button, SlideLayout, ToggleGroup, VisualFrame } from '../../core/components'
import { MODEL_SPECS } from '../../core/types'
import { AttentionArcsBand, Columns, provenance } from './FeedForwardAnimation'
import { attentionLines, columnsAfterRuns, COLUMN_LENGTH, mostChangedIndex } from './columns'

// The visual's provenance, re-exported so this chapter's VisualFrame declares it too.
export { provenance }

const VIEW_OPTIONS: Array<{ value: FeedForwardView; label: string }> = [
  { value: 'alone', label: 'Feed-forward alone' },
  { value: 'withAttention', label: 'Next to attention' },
]

const CAPTION = `Each column shows ${COLUMN_LENGTH} of the ${MODEL_SPECS.embeddingDim} numbers ${MODEL_SPECS.modelName} keeps per token. The values are simulated; the arithmetic (two matrix products with a clip at zero in between, added back to the column) is real.`

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="m-0 mb-3 text-base font-semibold text-ink">{title}</h3>
      <div className="overflow-x-auto pb-2">{children}</div>
    </div>
  )
}

function runStatus(runs: number): string {
  if (runs === 0) return 'Press Run the block to push every column through the network once.'
  return `Run ${runs}: every column changed at the same moment. The accent marks the number that moved most in each column.`
}

export function FeedForwardChapter() {
  const tokens = useTokens()
  const weights = useAttentionWeights()
  const runs = useAppStore((s) => s.feedForwardRuns)
  const runFeedForward = useAppStore((s) => s.runFeedForward)
  const view = useAppStore((s) => s.feedForwardView)
  const setView = useAppStore((s) => s.setFeedForwardView)

  const columns = useMemo(() => columnsAfterRuns(tokens, runs), [tokens, runs])
  const highlights = useMemo(() => {
    if (runs === 0) return columns.map(() => null)
    const before = columnsAfterRuns(tokens, runs - 1)
    return columns.map((column, index) => mostChangedIndex(before[index], column))
  }, [tokens, runs, columns])
  const lines = useMemo(() => attentionLines(weights), [weights])
  const summary = `${tokens.length} columns of ${COLUMN_LENGTH} numbers, one column per token`

  return (
    <SlideLayout id="feedforward">
      <VisualFrame title="One small network, every column on its own" provenance={provenance} caption={CAPTION}>
        <div className="space-y-8">
          {view === 'withAttention' && (
            <Panel title="Attention: lines run from earlier columns into later ones">
              <div role="img" aria-label={`${summary}, joined by attention lines from earlier to later columns`}>
                <AttentionArcsBand count={tokens.length} lines={lines} />
                <Columns tokens={tokens} columns={columns} highlights={columns.map(() => null)} />
              </div>
            </Panel>
          )}
          <Panel title="Feed-forward: each column alone, no lines between them">
            <div role="img" aria-label={`${summary}, with no line between any two columns`}>
              <Columns tokens={tokens} columns={columns} highlights={highlights} />
            </div>
          </Panel>
        </div>
        <p className="m-0 mt-6 text-lg" aria-live="polite">{runStatus(runs)}</p>
      </VisualFrame>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center" data-primary-control>
        <Button variant="primary" onClick={runFeedForward} className="w-full sm:w-auto">
          Run the block
        </Button>
        <ToggleGroup label="What to show" options={VIEW_OPTIONS} value={view} onChange={setView} />
      </div>
    </SlideLayout>
  )
}
