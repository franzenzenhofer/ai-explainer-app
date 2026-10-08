// Byte pair encoding demo: the merges the real o200k_base tokenizer makes, step by step, computed
// from its merge ranks. Start from the bytes, merge the pair with the lowest rank, repeat.
import { useMemo, useState } from 'react'
import { useStepAnimation } from '../../core/hooks/useAnimation'
import { TOKENIZER_SPECS } from '../../core/types'
import { Button, ToggleGroup } from '../../core/components/Button'
import { o200kMergeRanks } from '../../model/mergeRanks'
import { bpeSteps, type BpeStep } from './bpeSteps'

const DEMO_WORDS = ['Großmutter', 'tokenization'] as const
const STEP_INTERVAL_MS = 800

function stepText(step: BpeStep, index: number, total: number): string {
  if (!step.merge) return `Start from the bytes of the word (${step.pieces.length}). A letter like ß is two bytes, shown as hex.`
  const { left, right, result, rank } = step.merge
  const last = index === total - 1 ? ` No pair is left that is a token: this is what ${TOKENIZER_SPECS.name} returns.` : ''
  return `Merge "${left.label}" + "${right.label}" into "${result.label}" (rank ${rank.toLocaleString('en-US')}, lower means merged earlier when the list was built).${last}`
}

export function BPEVisualizer() {
  const [word, setWord] = useState<(typeof DEMO_WORDS)[number]>(DEMO_WORDS[0])
  const steps = useMemo(() => bpeSteps(word, o200kMergeRanks()), [word])
  const { currentIndex, isComplete, start, reset, stepForward } = useStepAnimation(steps, STEP_INTERVAL_MS)
  const step = currentIndex >= 0 ? steps[currentIndex] : null

  return (
    <div className="border-t border-rule pt-4">
      <h3 className="m-0 text-lg font-semibold">How &quot;{word}&quot; is cut, merge by merge</h3>
      <div className="mt-3">
        <ToggleGroup
          label="Word"
          options={DEMO_WORDS.map((value) => ({ value, label: value }))}
          value={word}
          onChange={(value) => {
            reset()
            setWord(value)
          }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="primary" onClick={currentIndex < 0 ? start : stepForward} disabled={isComplete}>
          {currentIndex < 0 ? 'Start' : isComplete ? 'Done' : 'Next merge'}
        </Button>
        <Button onClick={reset}>Reset</Button>
      </div>
      <div className="mt-4 min-h-32" aria-live="polite">
        {step ? (
          <>
            <p className="m-0 text-base text-ink-2">{stepText(step, currentIndex, steps.length)}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {step.pieces.map((piece, index) => (
                <span key={`${currentIndex}-${index}`} className="border-b-4 border-ink px-1 text-2xl odd:border-rule-strong">
                  {piece.label}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="m-0 text-base text-ink-2">Press Start to follow the real merges, from single bytes to the final tokens.</p>
        )}
      </div>
    </div>
  )
}
