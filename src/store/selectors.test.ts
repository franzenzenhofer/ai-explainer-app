import { beforeEach, describe, expect, it } from 'vitest'
import { tokenize } from '../model/tokenizer'
import { DEFAULT_INPUT_TEXT, useAppStore } from './appStore'
import {
  selectAttentionWeights,
  selectDistribution,
  selectEmbeddings,
  selectGeneratedTokens,
  selectPredictionPosition,
  selectPredictions,
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
    expect(selectPredictions(state())).toBe(selectPredictions(state()))
    expect(selectDistribution(state())).toBe(selectDistribution(state()))
  })

  it('derives embeddings, attention and predictions without any chapter being opened', () => {
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

  it('predicts from the selected token, else from the last token', () => {
    const last = selectTokens(state()).length - 1
    expect(selectPredictionPosition(state())).toBe(last)
    state().setSelectedTokenIndex(2)
    expect(selectPredictionPosition(state())).toBe(2)
  })

  it('clears the selection and the generated text when the prompt changes', () => {
    state().setSelectedTokenIndex(1)
    state().finishFetch(tokenize(' and then'))
    state().revealNext()
    expect(selectGeneratedTokens(state())).toHaveLength(1)
    state().setInputText('Something else')
    expect(state().selectedTokenIndex).toBeNull()
    expect(selectGeneratedTokens(state())).toHaveLength(0)
  })
})

describe('generation state', () => {
  beforeEach(() => state().setInputText(DEFAULT_INPUT_TEXT))

  it('reveals the fetched continuation one token at a time and never past its end', () => {
    state().startFetch()
    state().finishFetch(tokenize(' It ran'))
    const total = state().continuation.length
    for (let i = 0; i < total + 2; i++) state().revealNext()
    expect(selectGeneratedTokens(state())).toHaveLength(total)
  })

  it('counts calls against the visit budget', () => {
    const before = state().apiCallsUsed
    state().startFetch()
    expect(state().apiCallsUsed).toBe(before + 1)
    expect(state().fetchStatus).toBe('fetching')
  })
})

describe('drawers', () => {
  it('are closed by default and toggle per chapter', () => {
    expect(state().openDrawers.tokens).toBeFalsy()
    state().toggleDrawer('tokens')
    expect(state().openDrawers.tokens).toBe(true)
    expect(state().openDrawers.attention).toBeFalsy()
    state().closeDrawer('tokens')
    expect(state().openDrawers.tokens).toBe(false)
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
