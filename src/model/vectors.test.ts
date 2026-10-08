import { describe, expect, it } from 'vitest'
import { addVectors, feedForward, positionVector, seededValues, tokenVector } from './vectors'

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
