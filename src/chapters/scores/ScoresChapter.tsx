// Slide 7: one score for every token. The model's real top candidates after the chosen position, plus
// all remaining tokens together, as a chart or as the network of the old app.
import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { usePredictionPosition, useTokens } from '../../core/hooks/useDerived'
import { SentenceTokens, SlideLayout, ToggleGroup, VisualFrame } from '../../core/components'
import { LOOP_MODEL } from '../../core/types'
import type { LoopStep } from '../../model/loopSteps'
import type { Token } from '../../core/types'
import { LiveListGate } from '../loop/LiveListGate'
import { ProbabilityChart, provenance } from './ProbabilityChart'
import { ScoresNetwork } from './ScoresNetwork'
import { ScoreStats } from './ScoreStats'

// The visual's provenance, re-exported so this chapter's VisualFrame declares it too.
export { provenance }

type ScoresView = 'chart' | 'network'

const VIEWS: Array<{ value: ScoresView; label: string }> = [
  { value: 'chart', label: 'Chart' },
  { value: 'network', label: 'Network' },
]

const CAPTION = `Real: the ${LOOP_MODEL.candidatesPerStep} most likely next tokens according to ${LOOP_MODEL.name}, from the model's own probabilities. "All other tokens" is 1 minus their sum. ${LOOP_MODEL.name} has its own token list (it reports no IDs), not the one of the Tokens slide; special end markers are left out of the list, so they count in the last row.`

function ContextPicker({ tokens, position, onPick }: { tokens: Token[]; position: number; onPick: (index: number) => void }) {
  const after = new Set(tokens.flatMap((_, index) => (index > position ? [index] : [])))
  return (
    <div className="flex items-start gap-3" data-primary-control>
      <p className="m-0 w-28 shrink-0 pt-2.5 text-base font-bold leading-tight" style={{ color: 'var(--concept-strong)' }}>
        Predict after:
      </p>
      <SentenceTokens tokens={tokens} selectedIndex={position} onSelect={onPick} label="Choose the position to predict from" muted={after} mutedHint="after the chosen position, not read" />
    </div>
  )
}

function Body({ step, view, context }: { step: LoopStep; view: ScoresView; context: Token[] }) {
  return (
    <div className="flex min-h-0 flex-1 items-start gap-4">
      {view === 'chart' ? <ProbabilityChart top={step.candidates} tailProbability={step.tailProbability} /> : <ScoresNetwork context={context} step={step} />}
      <ScoreStats step={step} />
    </div>
  )
}

export function ScoresChapter() {
  const tokens = useTokens()
  const position = usePredictionPosition()
  const setSelectedTokenIndex = useAppStore((s) => s.setSelectedTokenIndex)
  const [view, setView] = useState<ScoresView>('chart')
  const contextTokens = tokens.slice(0, position + 1)
  const context = contextTokens.map((token) => token.text).join('')

  return (
    <SlideLayout id="scores">
      <ContextPicker tokens={tokens} position={position} onPick={setSelectedTokenIndex} />
      <VisualFrame
        title="Probability of each next token"
        provenance={provenance}
        caption={CAPTION}
        actions={<ToggleGroup label="Scores view" options={VIEWS} value={view} onChange={setView} />}
      >
        <LiveListGate context={context}>
          {(step) => <Body key={`${context}-${view}`} step={step} view={view} context={contextTokens} />}
        </LiveListGate>
      </VisualFrame>
    </SlideLayout>
  )
}
