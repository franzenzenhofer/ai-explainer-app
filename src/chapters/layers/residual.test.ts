import { describe, expect, it } from 'vitest'
import { mostChangedIndices, streamScale } from './residual'

describe('streamScale', () => {
  it('is the largest absolute value in the stream', () => {
    expect(streamScale([[0.2, -1.5], [0.9, 1.1]])).toBe(1.5)
  })

  it('is 1 for an empty or all-zero stream', () => {
    expect(streamScale([])).toBe(1)
    expect(streamScale([[0, 0]])).toBe(1)
  })
})

describe('mostChangedIndices', () => {
  it('returns the indices that moved most', () => {
    expect(mostChangedIndices([0, 0, 0, 0], [0.1, -0.9, 0.5, 0], 2)).toEqual(new Set([1, 2]))
  })
})
