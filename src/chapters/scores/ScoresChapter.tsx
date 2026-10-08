// Chapter 7: one score for every token. The model's real top candidates after the chosen position,
// plus one bar for all remaining tokens together (1 minus the sum of the top list).
import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { usePredictionPosition, useTokens } from '../../core/hooks/useDerived'
import { ChapterLayout, SentenceTokens, VisualFrame } from '../../core/components'
import { LOOP_MODEL } from '../../core/types'
import { formatPercent, formatTokenDisplay } from '../../core/utils/formatters'
import type { LoopStep } from '../../model/loopSteps'
import { LiveListGate } from '../loop/LiveListGate'
import { ProbabilityChart, provenance } from './ProbabilityChart'

// The visual's provenance, re-exported so this chapter's VisualFrame declares it too.
export { provenance }

const TAIL_LABEL = 'all remaining tokens of the vocabulary together'

interface DetailProps {
  rank: number | null
  step: LoopStep
}

function BarDetail({ rank, step }: DetailProps) {
  if (rank === null) return <p className="m-0 text-lg text-ink-2">Tap a bar to see its token and its probability.</p>
  const candidate = step.candidates[rank]
  if (!candidate) {
    return (
      <p className="m-0 text-lg">
        All remaining tokens of the vocabulary share {formatPercent(step.tailProbability)}. Each one alone is tiny, but none is zero.
      </p>
    )
  }
  return (
    <p className="m-0 text-lg">
      <span className="font-semibold">&quot;{formatTokenDisplay(candidate.token)}&quot;</span>: rank {rank + 1}, {formatPercent(candidate.probability)}.
    </p>
  )
}

const CAPTION = `Real: the ${LOOP_MODEL.candidatesPerStep} most likely next tokens according to ${LOOP_MODEL.name}, from the model's own probabilities. The last bar is 1 minus their sum. ${LOOP_MODEL.name} has its own token list, not the one from the Tokens chapter; special end markers are left out of the list, so they count in the last bar.`

export function ScoresChapter() {
  const tokens = useTokens()
  const position = usePredictionPosition()
  const selectedTokenIndex = useAppStore((s) => s.selectedTokenIndex)
  const setSelectedTokenIndex = useAppStore((s) => s.setSelectedTokenIndex)
  const [selectedRank, setSelectedRank] = useState<number | null>(null)
  const context = tokens.slice(0, position + 1).map((token) => token.text).join('')
  const last = formatTokenDisplay(tokens[position]?.text ?? '')

  const predictFrom = (index: number) => {
    setSelectedTokenIndex(index)
    setSelectedRank(null)
  }

  return (
    <ChapterLayout id="scores">
      <div className="mb-8">
        <p className="m-0 mb-3 text-base font-semibold">Predict from here: tap a token</p>
        <SentenceTokens
          tokens={tokens}
          selectedIndex={selectedTokenIndex ?? position}
          onSelect={predictFrom}
          label="Choose the position to predict from"
        />
      </div>
      <VisualFrame title="Probability of each next token" provenance={provenance} caption={CAPTION}>
        <LiveListGate context={context}>
          {(step) => (
            <>
              <p className="m-0 mb-4 text-lg" aria-live="polite">
                Predicting what comes after &quot;{last}&quot;. Top token {formatPercent(step.candidates[0]?.probability ?? 0)}, all other
                tokens share {formatPercent(step.tailProbability)}.
              </p>
              <div data-primary-control>
                <ProbabilityChart
                  top={step.candidates}
                  tailProbability={step.tailProbability}
                  tailLabel={TAIL_LABEL}
                  selectedRank={selectedRank}
                  onSelect={setSelectedRank}
                />
              </div>
              <div className="mt-4" aria-live="polite">
                <BarDetail rank={selectedRank} step={step} />
              </div>
            </>
          )}
        </LiveListGate>
      </VisualFrame>
    </ChapterLayout>
  )
}
