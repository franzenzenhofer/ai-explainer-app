// One honest status line for the live loop: it says "asking" only while a call is in flight, names the
// stage while a run plays, and says whether the last piece was the model's pick or the reader's choice.
import { useAppStore } from '../../store/appStore'
import { LOOP_MODEL } from '../../core/types'
import { formatPercent, formatTokenDisplay } from '../../core/utils/formatters'
import { generationPhase, MAX_APPENDED, type GenerationPhase } from './useGeneration'
import { useShownStep, type ShownStep } from './useShownStep'
import { useRunStore } from './runStore'
import { STAGE_SENTENCES } from './PhaseStrip'

function lastPieceSentence(shown: ShownStep | null, count: number): string {
  if (!shown) return ''
  const label = `Added "${formatTokenDisplay(shown.appended)}" (token ${count}).`
  const candidate = shown.step.candidates.find((entry) => entry.token === shown.appended)
  const chance = candidate ? ` ${LOOP_MODEL.name} gave it ${formatPercent(candidate.probability)}.` : ''
  if (shown.appended === shown.step.pick) return `${label} The model's own pick.${chance}`
  return `${label} Your choice; the model's own pick was "${formatTokenDisplay(shown.step.pick ?? '')}".${chance}`
}

interface GenerationStatusProps {
  className?: string
}

export function GenerationStatus({ className }: GenerationStatusProps) {
  const phase = useAppStore(generationPhase)
  const stage = useRunStore((s) => s.stage)
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
    <p role="status" className={className ?? 'm-0 text-base text-ink'}>
      {stage ? STAGE_SENTENCES[stage] : message[phase]}
    </p>
  )
}
