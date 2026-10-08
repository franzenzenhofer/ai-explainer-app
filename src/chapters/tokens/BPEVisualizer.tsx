// Byte pair encoding demo: the characters of a word, then the real o200k_base result.
// The merge order in between is not shown because it is not computed here.
import { useStepAnimation } from '../../core/hooks/useAnimation'
import { TOKENIZER_SPECS } from '../../core/types'
import { Button } from '../../core/components/Button'
import { tokenize } from '../../model/tokenizer'

const DEMO_WORD = 'Großmutter'
const REAL_TOKENS = tokenize(DEMO_WORD).map((token) => token.text)
const STAGE_INTERVAL_MS = 800

const BPE_STAGES = [
  { phase: 'Characters', description: 'Start with the single characters.', pieces: Array.from(DEMO_WORD) },
  { phase: 'Result', description: `The ${TOKENIZER_SPECS.name} tokenizer returns ${REAL_TOKENS.length} tokens.`, pieces: REAL_TOKENS },
]

export function BPEVisualizer() {
  const { currentIndex, isComplete, start, reset, stepForward } = useStepAnimation(BPE_STAGES, STAGE_INTERVAL_MS)
  const stage = currentIndex >= 0 ? BPE_STAGES[currentIndex] : null

  return (
    <div className="border-t border-rule pt-4">
      <h3 className="m-0 text-lg font-semibold">How &quot;{DEMO_WORD}&quot; is cut</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="primary" onClick={currentIndex < 0 ? start : stepForward} disabled={isComplete}>
          {currentIndex < 0 ? 'Start' : isComplete ? 'Done' : 'Next stage'}
        </Button>
        <Button onClick={reset}>Reset</Button>
      </div>
      <div className="mt-4 min-h-24" aria-live="polite">
        {stage ? (
          <>
            <p className="m-0 text-base text-ink-2">{stage.phase}: {stage.description}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {stage.pieces.map((piece, index) => (
                <span key={`${currentIndex}-${index}`} className="border-b-4 border-ink px-1 text-2xl odd:border-rule-strong">
                  {piece}
                </span>
              ))}
            </div>
          </>
        ) : (
          <p className="m-0 text-base text-ink-2">Press Start to see the characters, then the real tokens.</p>
        )}
      </div>
    </div>
  )
}
