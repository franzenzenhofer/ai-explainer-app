import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_INPUT_TEXT, useAppStore } from '../../store/appStore'
import { tokenize } from '../../model/tokenizer'
import { generationPhase } from './useGeneration'

const state = () => useAppStore.getState()

describe('generationPhase', () => {
  beforeEach(() => state().setInputText(DEFAULT_INPUT_TEXT))

  it('walks from empty to fetching to showing to the limit', () => {
    expect(generationPhase(state())).toBe('empty')
    state().startFetch()
    expect(generationPhase(state())).toBe('fetching')
    state().finishFetch(tokenize(' It ran home'))
    state().revealNext()
    expect(generationPhase(state())).toBe('showing')
    for (let i = 0; i < 5; i++) state().revealNext()
    expect(generationPhase(state())).toBe('limit')
  })

  it('reports an error and stops playing', () => {
    state().setIsPlaying(true)
    state().failFetch('down')
    expect(generationPhase(state())).toBe('error')
    expect(state().isPlaying).toBe(false)
  })
})
