import { describe, expect, it } from 'vitest'
import { addVectors, createEmbeddings, feedForward, positionVector, residualStream, seededValues, tokenVector } from './vectors'
import { tokenize } from './tokenizer'
import { MODEL_SPECS } from '../core/types'

describe('simulated vectors', () => {
  it('gives the same token the same vector and a different token a different one', () => {
    expect(tokenVector(42, 8)).toEqual(tokenVector(42, 8))
    expect(tokenVector(42, 8)).not.toEqual(tokenVector(43, 8))
  })

  it('stays in [-1, 1)', () => {
    for (const value of seededValues(7, 500)) {
      expect(value).toBeGreaterThanOrEqual(-1)
      expect(value).toBeLessThan(1)
    }
  })

  it('makes one vector of the demo width per token', () => {
    const tokens = tokenize('The dog barked')
    const embeddings = createEmbeddings(tokens)
    expect(embeddings).toHaveLength(tokens.length)
    for (const embedding of embeddings) expect(embedding.values).toHaveLength(MODEL_SPECS.embeddingDim)
  })

  it('changes the position vector with the position', () => {
    expect(positionVector(0, 8)).not.toEqual(positionVector(1, 8))
  })
})

describe('feedForward', () => {
  it('is applied to each position alone: the output depends only on that position', () => {
    const a = tokenVector(1, 8)
    const b = tokenVector(2, 8)
    expect(feedForward(a)).toEqual(feedForward([...a]))
    expect(feedForward(a)).not.toEqual(feedForward(b))
  })

  it('adds to the vector instead of replacing it', () => {
    const x = tokenVector(5, 8)
    const out = feedForward(x)
    const delta = out.map((value, i) => value - x[i])
    expect(addVectors(x, delta).map((v) => v.toFixed(10))).toEqual(out.map((v) => v.toFixed(10)))
    expect(delta.some((value) => value !== 0)).toBe(true)
  })
})

describe('residualStream', () => {
  const tokens = tokenize('The dog barked because it was hungry.')

  it('has the start vector plus one entry per block', () => {
    expect(residualStream(tokens, MODEL_SPECS.layers, 32)).toHaveLength(MODEL_SPECS.layers + 1)
  })

  it('changes the vector at every block', () => {
    const stream = residualStream(tokens, 3, 16)
    for (let block = 1; block < stream.length; block++) expect(stream[block]).not.toEqual(stream[block - 1])
  })

  it('is empty without tokens', () => {
    expect(residualStream([], 3, 16)).toEqual([])
  })
})
