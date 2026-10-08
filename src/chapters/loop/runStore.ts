// One animated run of the token machine: after the real pick is known, the stages light up one after
// the other in their concept colours (a depiction: the model ran them on its server), the pick flies to
// the end of the text, and only then is it appended. Speed comes from the store's generation speed.

import { create } from 'zustand'
import type { StageId } from '../../core/colors'
import { useAppStore } from '../../store/appStore'
import { loopContext, prepareNext } from './useGeneration'

export const RUN_STAGES = ['tokens', 'numbers', 'attention', 'feedforward', 'layers', 'scores', 'pick', 'append'] as const satisfies readonly StageId[]

export type RunStage = (typeof RUN_STAGES)[number]

// Time one stage stays lit at 1x speed.
export const STAGE_MS = 280

interface RunState {
  stage: RunStage | null
  // The text the running step was computed for; its candidates are shown while the run lasts.
  context: string | null
  pick: string | null
  runId: number
}

export const useRunStore = create<RunState>()(() => ({ stage: null, context: null, pick: null, runId: 0 }))

// The Append stage lasts longer so the flight of the pick to the end of the text can be followed.
const APPEND_FACTOR = 3

export const stageDuration = (stage: RunStage, speed: number): number => (STAGE_MS / speed) * (stage === 'append' ? APPEND_FACTOR : 1)

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

// Stops a run in progress: nothing is appended and the strip goes dark.
export function cancelRun(): void {
  useRunStore.setState((s) => ({ stage: null, context: null, pick: null, runId: s.runId + 1 }))
}

async function lightStages(runId: number): Promise<boolean> {
  for (const stage of RUN_STAGES) {
    if (useRunStore.getState().runId !== runId) return false
    useRunStore.setState({ stage })
    await wait(stageDuration(stage, useAppStore.getState().generationSpeed))
  }
  return useRunStore.getState().runId === runId
}

// One press: get the real pick, play the stages, append the pick.
export async function runPick(): Promise<void> {
  if (useRunStore.getState().stage !== null) return
  const runId = useRunStore.getState().runId + 1
  useRunStore.setState({ runId })
  const next = await prepareNext()
  if (!next || useRunStore.getState().runId !== runId) return
  useRunStore.setState({ context: next.context, pick: next.pick })
  const finished = await lightStages(runId)
  const store = useAppStore.getState()
  if (finished && loopContext(store) === next.context) store.appendPiece(next.pick)
  if (useRunStore.getState().runId === runId) useRunStore.setState({ stage: null, context: null, pick: null })
}

// Start over: stop any run and clear the appended tokens.
export function resetMachine(): void {
  cancelRun()
  useAppStore.getState().resetGeneration()
}

// True once the run has reached the target stage (or no run is going on, so everything is shown).
export function stageReached(current: RunStage | null, target: RunStage): boolean {
  if (current === null) return true
  return RUN_STAGES.indexOf(current) >= RUN_STAGES.indexOf(target)
}
