import { beforeEach, describe, expect, it } from 'vitest'
import { tokenize } from '../model/tokenizer'
import { DEFAULT_INPUT_TEXT, useAppStore } from './appStore'
import {
  selectAttentionWeights,
  selectPredictionPosition,
  selectTokens,
} from './selectors'

const state = () => useAppStore.getState()

describe('derived selectors', () => {
  beforeEach(() => {
    state().setInputText('The dog chased the ball because it was fast')
    state().setTemperature(1)
  })

  it('updates tokens synchronously when inputText changes', () => {
    const before = selectTokens(state())
    state().setInputText('tokenization')
    const after = selectTokens(state())
    expect(after.map((token) => token.text)).toEqual(['token', 'ization'])
    expect(after).not.toBe(before)
  })

  it('returns the same array reference while the input is unchanged', () => {
    expect(selectTokens(state())).toBe(selectTokens(state()))
  })

  it('derives attention without any chapter being opened', () => {
    const tokenCount = selectTokens(state()).length
    expect(selectAttentionWeights(state())).toHaveLength(tokenCount * tokenCount)
  })

  it('predicts from the selected token, else from the last token', () => {
    const last = selectTokens(state()).length - 1
    expect(selectPredictionPosition(state())).toBe(last)
    state().setSelectedTokenIndex(2)
    expect(selectPredictionPosition(state())).toBe(2)
  })

  it('clears the selection and the appended text when the prompt changes', () => {
    state().setSelectedTokenIndex(1)
    state().appendPiece(' and then')
    expect(state().appended).toEqual([' and then'])
    state().setInputText('Something else')
    expect(state().selectedTokenIndex).toBeNull()
    expect(state().appended).toEqual([])
  })
})

describe('generation state', () => {
  beforeEach(() => state().setInputText(DEFAULT_INPUT_TEXT))

  it('stores every fetched step under the text the model read, and keeps them when the prompt changes', () => {
    state().startFetch()
    state().storeSteps([
      { context: 'A', step: { candidates: [{ token: ' b', probability: 0.5 }], tailProbability: 0.5, pick: ' b' } },
      { context: 'A b', step: { candidates: [{ token: ' c', probability: 0.4 }], tailProbability: 0.6, pick: ' c' } },
    ])
    expect(state().fetchStatus).toBe('idle')
    expect(Object.keys(state().loopSteps)).toEqual(expect.arrayContaining(['A', 'A b']))
    state().setInputText('Something else')
    expect(state().loopSteps['A b'].pick).toBe(' c')
  })

  it('replaces only the last appended piece when the reader picks another candidate', () => {
    state().appendPiece(' one')
    state().appendPiece(' two')
    state().replaceLastPiece(' three')
    expect(state().appended).toEqual([' one', ' three'])
  })

  it('counts calls against the visit budget', () => {
    const before = state().apiCallsUsed
    state().startFetch()
    expect(state().apiCallsUsed).toBe(before + 1)
    expect(state().fetchStatus).toBe('fetching')
  })

  it('forgets an error when the reader moves to another chapter', () => {
    state().failFetch('rate limited')
    state().setChapterId('scores')
    expect(state().fetchStatus).toBe('idle')
    expect(state().fetchError).toBeNull()
  })
})

describe('default prompt', () => {
  it('is one short sentence of 8 to 12 tokens with "it" after a single noun', () => {
    const tokens = tokenize(DEFAULT_INPUT_TEXT)
    expect(tokens.length).toBeGreaterThanOrEqual(8)
    expect(tokens.length).toBeLessThanOrEqual(12)
    expect(tokens.map((token) => token.text.trim())).toContain('it')
    expect(tokens.map((token) => token.text.trim())).toContain('dog')
  })
})
