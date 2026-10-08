// The model's real candidates for the piece that was just added, with its own pick highlighted.
// Choosing another one replaces the piece; the next press then asks the model about the new text.
import { useAppStore } from '../../store/appStore'
import { LOOP_MODEL } from '../../core/types'
import { cn } from '../../core/utils/cn'
import { formatPercent, formatTokenDisplay } from '../../core/utils/formatters'
import { useShownStep } from './useShownStep'

// Candidates listed here; Scores shows all 20.
const SHOWN_CANDIDATES = 10

interface NextCandidatesProps {
  // False while the loop plays on its own: the list is then only shown.
  interactive: boolean
}

export function NextCandidates({ interactive }: NextCandidatesProps) {
  const shown = useShownStep()
  const replaceLastPiece = useAppStore((s) => s.replaceLastPiece)
  return (
    <div className="mt-6 border-t border-rule pt-4">
      <h3 className="m-0 text-base font-semibold">What could have come instead</h3>
      {shown === null ? (
        <p className="m-0 mt-1 text-base text-ink-2">
          Press the button: the {LOOP_MODEL.name} candidates for the first token appear here, with the model&apos;s pick highlighted.
        </p>
      ) : (
        <>
          <p className="m-0 mt-1 text-base text-ink-2">
            The {Math.min(SHOWN_CANDIDATES, shown.step.candidates.length)} most likely tokens at this step ({LOOP_MODEL.name}, real probabilities).
            {interactive ? ' Tap another one to use it instead.' : ' Pause to choose another one.'}
          </p>
          <ul aria-label="Candidates for the token just added" className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
            {shown.step.candidates.slice(0, SHOWN_CANDIDATES).map((candidate) => {
              const chosen = candidate.token === shown.appended
              return (
                <li key={candidate.token}>
                  <button
                    type="button"
                    aria-pressed={chosen}
                    disabled={!interactive}
                    onClick={() => replaceLastPiece(candidate.token)}
                    className={cn(
                      'flex min-h-11 items-center gap-2 rounded-[3px] border-2 px-3 text-base text-ink',
                      chosen ? 'tint-accent border-accent font-semibold' : 'border-rule hover:bg-wash disabled:hover:bg-paper',
                    )}
                  >
                    <span>{formatTokenDisplay(candidate.token)}</span>
                    <span className="tabular-nums text-ink-2">{formatPercent(candidate.probability)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          <p className="m-0 mt-2 text-base text-ink-2">All other tokens together: {formatPercent(shown.step.tailProbability)}.</p>
        </>
      )}
    </div>
  )
}
