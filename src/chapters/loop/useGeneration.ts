// The token machine's live loop, shared by Home and Loop. Each press appends the model's own pick for
// the text so far. One call returns up to 20 real steps, so most presses need no new call; a candidate
// the reader chooses instead makes a new text, which is asked about on the next press.

import { useAppStore, type AppStoreState } from '../../store/appStore'
import { askModel, stepFor } from './askModel'

// Most pieces the loop may append in this demo.
export const MAX_APPENDED = 30

export type GenerationPhase = 'empty' | 'fetching' | 'showing' | 'ended' | 'limit' | 'error'

type PhaseState = Pick<AppStoreState, 'fetchStatus' | 'appended' | 'loopSteps' | 'inputText'>

// The text the model reads next: the prompt plus everything appended so far.
export const loopContext = (state: Pick<AppStoreState, 'inputText' | 'appended'>): string => state.inputText + state.appended.join('')

export function generationPhase(state: PhaseState): GenerationPhase {
  if (state.fetchStatus === 'fetching') return 'fetching'
  if (state.fetchStatus === 'error') return 'error'
  if (state.loopSteps[loopContext(state)]?.pick === null) return 'ended'
  if (state.appended.length >= MAX_APPENDED) return 'limit'
  return state.appended.length === 0 ? 'empty' : 'showing'
}

export interface NextPick {
  context: string
  pick: string
}

// The model's pick for the text so far, asking the model first when that text is new. Null when the
// loop cannot go on (busy, at the limit, ended, failed) or the text changed while the call ran.
export async function prepareNext(): Promise<NextPick | null> {
  const before = useAppStore.getState()
  const phase = generationPhase(before)
  if (phase === 'fetching' || phase === 'limit' || phase === 'ended') return null
  const context = loopContext(before)
  if (!stepFor(context)) await askModel(context)
  const after = useAppStore.getState()
  if (loopContext(after) !== context) return null
  const pick = after.loopSteps[context]?.pick
  return pick ? { context, pick } : null
}

// Appends the model's pick for the text so far at once (no animation).
export async function pickNext(): Promise<void> {
  const next = await prepareNext()
  if (next) useAppStore.getState().appendPiece(next.pick)
}

export const resetLoop = (): void => useAppStore.getState().resetGeneration()
