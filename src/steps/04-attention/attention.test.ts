import { describe, expect, it } from 'vitest'
import { tokenize } from '../02-tokenization/tokenizer'
import { createAttentionMatrix, generateAttentionWeights } from './attention'

const tokens = tokenize('The dog chased the ball because it was fast')
const LAYERS_AND_HEADS = [
  [0, 0],
  [3, 5],
  [11, 11],
]

describe('generateAttentionWeights', () => {
  it.each(LAYERS_AND_HEADS)('gives weight 0 to every future key (layer %s, head %s)', (layer, head) => {
    const weights = generateAttentionWeights(tokens, layer, head)
    const future = weights.filter((w) => w.keyIdx > w.queryIdx)
    expect(future.length).toBeGreaterThan(0)
    for (const weight of future) expect(weight.weight).toBe(0)
  })

  it.each(LAYERS_AND_HEADS)('has rows that sum to 1 (layer %s, head %s)', (layer, head) => {
    const matrix = createAttentionMatrix(generateAttentionWeights(tokens, layer, head), tokens.length)
    for (const row of matrix) {
      expect(row.reduce((total, value) => total + value, 0)).toBeCloseTo(1, 10)
    }
  })

  it('returns nothing for no tokens', () => {
    expect(generateAttentionWeights([], 0, 0)).toEqual([])
  })
})
