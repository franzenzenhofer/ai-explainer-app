// Which candidate list to show and how far it is revealed: during a run, the step being computed
// (bars appear at Scores, the pick is framed at Pick); after a press, the step of the token just
// added; before the first press, what the model predicts for the text so far.
import { useAppStore } from '../../store/appStore'
import type { LoopStep } from '../../model/loopSteps'
import { stageReached, useRunStore } from './runStore'
import { useShownStep } from './useShownStep'
import { loopContext } from './useGeneration'

export type RunViewKind = 'next' | 'running' | 'added'

export interface RunView {
  kind: RunViewKind
  step: LoopStep
  // The candidate framed as chosen: the pick during a run, what is in the text afterwards.
  chosen: string | null
  running: boolean
  barsShown: boolean
}

export const RUN_VIEW_LABELS: Record<RunViewKind, string> = {
  next: 'What the model predicts next',
  running: 'Candidates for the next token',
  added: 'Candidates for the token just added',
}

export function useRunView(): RunView | null {
  const stage = useRunStore((s) => s.stage)
  const runPickText = useRunStore((s) => s.pick)
  const context = useRunStore((s) => s.context)
  const runStep: LoopStep | undefined = useAppStore((s) => (context === null ? undefined : s.loopSteps[context]))
  const nextStep: LoopStep | undefined = useAppStore((s) => (s.appended.length === 0 ? s.loopSteps[loopContext(s)] : undefined))
  const shown = useShownStep()
  if (stage !== null && runStep) {
    return { kind: 'running', step: runStep, chosen: stageReached(stage, 'pick') ? runPickText : null, running: true, barsShown: stageReached(stage, 'scores') }
  }
  if (shown) return { kind: 'added', step: shown.step, chosen: shown.appended, running: false, barsShown: true }
  if (nextStep) return { kind: 'next', step: nextStep, chosen: null, running: false, barsShown: true }
  return null
}
