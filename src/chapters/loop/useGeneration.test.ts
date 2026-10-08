import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_INPUT_TEXT, useAppStore } from '../../store/appStore'
import type { LoopStep } from '../../model/loopSteps'
import { generationPhase, loopContext, MAX_APPENDED, pickNext, resetLoop } from './useGeneration'

const state = () => useAppStore.getState()

const step = (pick: string | null): LoopStep => ({
  candidates: [{ token: pick ?? ' x', probability: 0.5 }],
  tailProbability: 0.5,
  pick,
})

describe('generationPhase', () => {
  beforeEach(() => {
    useAppStore.setState({ loopSteps: {} })
    state().setInputText(DEFAULT_INPUT_TEXT)
  })

  it('walks from empty to fetching to showing', () => {
    expect(generationPhase(state())).toBe('empty')
    state().startFetch()
    expect(generationPhase(state())).toBe('fetching')
    state().storeSteps([{ context: DEFAULT_INPUT_TEXT, step: step(' It') }])
    state().appendPiece(' It')
    expect(generationPhase(state())).toBe('showing')
  })

  it('ends when the model picked a special end token for the text so far', () => {
    state().storeSteps([{ context: DEFAULT_INPUT_TEXT, step: step(null) }])
    expect(generationPhase(state())).toBe('ended')
  })

  it('stops at the demo limit', () => {
    for (let i = 0; i < MAX_APPENDED; i++) state().appendPiece(' a')
    expect(generationPhase(state())).toBe('limit')
  })

  it('reports an error and stops playing', () => {
    state().setIsPlaying(true)
    state().failFetch('down')
    expect(generationPhase(state())).toBe('error')
    expect(state().isPlaying).toBe(false)
  })
})

describe('pickNext with steps the model already answered', () => {
  beforeEach(() => {
    useAppStore.setState({ loopSteps: {}, apiCallsUsed: 0 })
    state().setInputText('The sky is')
    state().storeSteps([
      { context: 'The sky is', step: step(' blue') },
      { context: 'The sky is blue', step: step(' today') },
    ])
  })

  it('appends the model pick for each text without a new call', async () => {
    await pickNext()
    await pickNext()
    expect(state().appended).toEqual([' blue', ' today'])
    expect(loopContext(state())).toBe('The sky is blue today')
    expect(state().apiCallsUsed).toBe(0)
  })

  it('uses the reader choice as the new text, and reset clears the loop but keeps known steps', async () => {
    await pickNext()
    state().replaceLastPiece(' grey')
    expect(loopContext(state())).toBe('The sky is grey')
    resetLoop()
    expect(state().appended).toEqual([])
    expect(Object.keys(state().loopSteps)).toContain('The sky is')
  })
})
