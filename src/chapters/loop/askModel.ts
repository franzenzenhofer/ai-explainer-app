// One call to the live model for one text, shared by every chapter that shows real candidates. The
// answer fills the store with a real step for this text and for every text the model continued into.

import { useAppStore, VISIT_CALL_BUDGET } from '../../store/appStore'
import { requestLoop } from '../../services/loopApi'
import type { LoopStep } from '../../model/loopSteps'

export const budgetMessage = `This visit has used its ${VISIT_CALL_BUDGET} calls to the live model. Reload the page to start again. Nothing is shown in place of real numbers.`

export const callsLeft = (apiCallsUsed: number): number => Math.max(0, VISIT_CALL_BUDGET - apiCallsUsed)

export async function askModel(context: string): Promise<void> {
  const store = useAppStore.getState()
  if (store.fetchStatus === 'fetching') return
  if (callsLeft(store.apiCallsUsed) === 0) return store.failFetch(budgetMessage)
  store.startFetch()
  const result = await requestLoop(context)
  const after = useAppStore.getState()
  if (!result.ok) return after.failFetch(result.message)
  after.storeSteps(result.steps)
}

export const stepFor = (context: string): LoopStep | undefined => useAppStore.getState().loopSteps[context]
