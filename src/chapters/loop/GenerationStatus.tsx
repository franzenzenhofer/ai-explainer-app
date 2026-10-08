// One honest status line for the live loop: it only says "asking" while a call is in flight, and it
// says whether the last piece was the model's pick or the reader's choice.
import { useAppStore } from '../../store/appStore'
import { LOOP_MODEL } from '../../core/types'
import { formatPercent, formatTokenDisplay } from '../../core/utils/formatters'
import { generationPhase, MAX_APPENDED, type GenerationPhase } from './useGeneration'
import { useShownStep, type ShownStep } from './useShownStep'

function lastPieceSentence(shown: ShownStep | null, count: number): string {
  if (!shown) return ''
  const label = `Added "${formatTokenDisplay(shown.appended)}" (token ${count}).`
  const candidate = shown.step.candidates.find((entry) => entry.token === shown.appended)
  const chance = candidate ? ` ${LOOP_MODEL.name} gave it ${formatPercent(candidate.probability)}.` : ''
  if (shown.appended === shown.step.pick) return `${label} The model's own pick.${chance}`
  return `${label} Your choice; the model's own pick was "${formatTokenDisplay(shown.step.pick ?? '')}".${chance}`
}

export function GenerationStatus() {
  const phase = useAppStore(generationPhase)
  const fetchError = useAppStore((s) => s.fetchError)
  const count = useAppStore((s) => s.appended.length)
  const shown = useShownStep()
  const last = lastPieceSentence(shown, count)
  const message: Record<GenerationPhase, string> = {
    empty: 'Nothing added yet.',
    fetching: `Asking ${LOOP_MODEL.name} (a live call)...`,
    showing: last,
    limit: `${last} That is the limit of this demo (${MAX_APPENDED} tokens). Start over to run it again.`,
    ended: `${last} The model's most likely next token is its end-of-text marker, so it stops here. Start over to run it again.`.trim(),
    error: fetchError ?? 'The call failed.',
  }
  return (
    <p role="status" className="m-0 min-h-14 text-lg text-ink">
      {message[phase]}
    </p>
  )
}
