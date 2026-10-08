import { beforeEach, describe, expect, it } from 'vitest'
import { tokenize } from '../steps/02-tokenization/tokenizer'
import { DEFAULT_INPUT_TEXT, useAppStore } from './appStore'
import {
  selectAttentionWeights,
  selectEmbeddings,
  selectPredictions,
  selectTokens,
} from './selectors'

const state = () => useAppStore.getState()

describe('derived selectors', () => {
  beforeEach(() => {
    state().setInputText('The dog chased the ball because it was fast')
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
    expect(selectPredictions(state())).toBe(selectPredictions(state()))
  })

  it('derives embeddings, attention and predictions without any step being opened', () => {
    const tokenCount = selectTokens(state()).length
    expect(selectEmbeddings(state())).toHaveLength(tokenCount)
    expect(selectAttentionWeights(state())).toHaveLength(tokenCount * tokenCount)
    expect(selectPredictions(state()).length).toBeGreaterThan(0)
  })

  it('recomputes predictions when temperature changes', () => {
    const before = selectPredictions(state())
    state().setTemperature(0)
    expect(selectPredictions(state())).not.toBe(before)
    expect(selectPredictions(state())[0].probability).toBe(1)
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
