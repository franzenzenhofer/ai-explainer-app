// Scores and Sampling show a real candidate list for one text. When the model has not been asked about
// that text yet, this asks it once on its own as the slide opens (one live call, cached per text), so a
// slide never opens empty. After a failure it waits for a press and says what went wrong.
import { useEffect, type ReactNode } from 'react'
import { useAppStore, VISIT_CALL_BUDGET } from '../../store/appStore'
import { LOOP_MODEL } from '../../core/types'
import { Button } from '../../core/components/Button'
import type { LoopStep } from '../../model/loopSteps'
import { askModel, callsLeft } from './askModel'

interface LiveListGateProps {
  // The exact text the list is for.
  context: string
  children: (step: LoopStep) => ReactNode
}

export function LiveListGate({ context, children }: LiveListGateProps) {
  const step = useAppStore((s) => s.loopSteps[context])
  const status = useAppStore((s) => s.fetchStatus)
  const error = useAppStore((s) => s.fetchError)
  const used = useAppStore((s) => s.apiCallsUsed)
  const empty = context.trim() === ''
  const shouldAsk = !step && !empty && status === 'idle'
  useEffect(() => {
    if (shouldAsk) void askModel(context)
  }, [shouldAsk, context])
  if (step) return <>{children(step)}</>
  return (
    <div>
      <p className="m-0 text-lg">
        {empty
          ? 'There is no text yet. Type some text in the bar above, then ask the model.'
          : status === 'error'
            ? `${LOOP_MODEL.name} could not answer for this text. Press to try again; nothing is shown in place of real numbers.`
            : `Asking ${LOOP_MODEL.name} for its real top ${LOOP_MODEL.candidatesPerStep} candidates (one live call)...`}
      </p>
      <div className="mt-4" data-primary-control>
        <Button variant="primary" onClick={() => void askModel(context)} disabled={empty || status === 'fetching'} className="max-sm:w-full">
          {status === 'fetching' ? 'Asking the model...' : 'Ask the model'}
        </Button>
      </div>
      <p role="status" className="m-0 mt-3 min-h-7 text-base text-ink-2">
        {status === 'error' ? error : `${callsLeft(used)} of ${VISIT_CALL_BUDGET} live calls left this visit.`}
      </p>
    </div>
  )
}
