// Chapter 7: one score for every token. The illustrative list after the chosen position:
// the top 20 plus one bar for all remaining tokens together.
import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useDistribution, usePredictionPosition, useTokens } from '../../core/hooks/useDerived'
import { ChapterLayout, SentenceTokens, VisualFrame } from '../../core/components'
import { TOKENIZER_SPECS, type PredictionCandidate } from '../../core/types'
import { formatPercent, formatTokenDisplay } from '../../core/utils/formatters'
import { splitTopAndTail } from '../../model/distribution'
import { ProbabilityChart, provenance } from './ProbabilityChart'

// The visual's provenance, re-exported so this chapter's VisualFrame declares it too.
export { provenance }

const TOP_SIZE = 20
const OTHER_TOKENS = (TOKENIZER_SPECS.vocabulary - TOP_SIZE).toLocaleString('en-US')
const TAIL_LABEL = `the other ${OTHER_TOKENS} tokens together`

interface DetailProps {
  rank: number | null
  top: PredictionCandidate[]
  tailProbability: number
}

function BarDetail({ rank, top, tailProbability }: DetailProps) {
  if (rank === null) return <p className="m-0 text-lg text-ink-2">Tap a bar to see the token&apos;s ID.</p>
  const candidate = top[rank]
  if (!candidate) {
    return (
      <p className="m-0 text-lg">
        The other {OTHER_TOKENS} tokens share {formatPercent(tailProbability)}. Each one alone is tiny, but none is zero.
      </p>
    )
  }
  return (
    <p className="m-0 text-lg">
      <span className="font-semibold">&quot;{formatTokenDisplay(candidate.token)}&quot;</span>: rank {rank + 1}, token ID{' '}
      <span className="font-semibold tabular-nums">{candidate.tokenId.toLocaleString('en-US')}</span>,{' '}
      {formatPercent(candidate.probability)}.
    </p>
  )
}

function caption(candidateCount: number) {
  return `Simulated: an illustrative list of ${candidateCount} candidate tokens, ordered by a simple rule about the last token. It is not a model. A real model scores every one of the ${TOKENIZER_SPECS.vocabulary.toLocaleString('en-US')} tokens.`
}

export function ScoresChapter() {
  const tokens = useTokens()
  const distribution = useDistribution()
  const position = usePredictionPosition()
  const selectedTokenIndex = useAppStore((s) => s.selectedTokenIndex)
  const setSelectedTokenIndex = useAppStore((s) => s.setSelectedTokenIndex)
  const [selectedRank, setSelectedRank] = useState<number | null>(null)
  const { top, tailProbability } = splitTopAndTail(distribution, TOP_SIZE)
  const context = formatTokenDisplay(tokens[position]?.text ?? '')

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
      <VisualFrame title="Probability of each next token" provenance={provenance} caption={caption(distribution.length)}>
        <p className="m-0 mb-4 text-lg" aria-live="polite">
          Predicting what comes after &quot;{context}&quot;. Top token {formatPercent(top[0]?.probability ?? 0)}, the
          other {OTHER_TOKENS} tokens share {formatPercent(tailProbability)}.
        </p>
        <div data-primary-control>
          <ProbabilityChart
            top={top}
            tailProbability={tailProbability}
            tailLabel={TAIL_LABEL}
            selectedRank={selectedRank}
            onSelect={setSelectedRank}
          />
        </div>
        <div className="mt-4" aria-live="polite">
          <BarDetail rank={selectedRank} top={top} tailProbability={tailProbability} />
        </div>
      </VisualFrame>
    </ChapterLayout>
  )
}
