// One honest status line for the live loop: it only says "asking" while the call is in flight.
import { useAppStore } from '../../store/appStore'
import { useGeneratedTokens } from '../../core/hooks/useDerived'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { generationPhase, MAX_CONTINUATION_TOKENS } from './useGeneration'

export function GenerationStatus() {
  const phase = useAppStore(generationPhase)
  const fetchError = useAppStore((s) => s.fetchError)
  const total = useAppStore((s) => s.continuation.length)
  const generated = useGeneratedTokens()
  const last = generated[generated.length - 1]
  const message: Record<typeof phase, string> = {
    empty: 'Nothing picked yet.',
    fetching: 'Asking the model for a continuation...',
    showing: `Picked "${last ? formatTokenDisplay(last.text) : ''}". The continuation came in one call; this is token ${generated.length} of ${total}.`,
    limit: `Picked "${last ? formatTokenDisplay(last.text) : ''}". That is the end of this continuation (at most ${MAX_CONTINUATION_TOKENS} tokens). Start over to run it again.`,
    error: `The call failed: ${fetchError ?? 'unknown error'}`,
  }
  return (
    <p role="status" className="m-0 min-h-14 text-lg text-ink">
      {message[phase]}
    </p>
  )
}
