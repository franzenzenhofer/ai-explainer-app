// The step the reader just saw happen: the candidates the model had before the last appended piece.
import { useAppStore } from '../../store/appStore'
import type { LoopStep } from '../../model/loopSteps'

export interface ShownStep {
  step: LoopStep
  // What is in the text now: the model's pick or the reader's own choice.
  appended: string
}

export function useShownStep(): ShownStep | null {
  const step = useAppStore((s) => s.loopSteps[s.inputText + s.appended.slice(0, -1).join('')])
  const appended = useAppStore((s) => s.appended[s.appended.length - 1])
  return step && appended !== undefined ? { step, appended } : null
}
