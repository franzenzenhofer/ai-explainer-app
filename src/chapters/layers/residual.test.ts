import { describe, expect, it } from 'vitest'
import { largestMagnitude, mostChangedIndices, streamScale } from './residual'

describe('streamScale', () => {
  it('is the largest absolute value when few numbers are involved', () => {
    expect(streamScale([[0.2, -1.5], [0.9, 1.1]])).toBe(1.5)
  })

  it('ignores the top 1% so one huge number does not flatten the rest', () => {
    const ordinary = Array.from({ length: 199 }, (_, i) => (i % 10) / 10)
    expect(streamScale([[...ordinary, 224]])).toBeCloseTo(0.9, 10)
  })

  it('is 1 for an empty or all-zero stream', () => {
    expect(streamScale([])).toBe(1)
    expect(streamScale([[0, 0]])).toBe(1)
  })
})

describe('largestMagnitude', () => {
  it('is the largest absolute value of one vector', () => {
    expect(largestMagnitude([0.5, -3.25, 2])).toBe(3.25)
  })
})

describe('mostChangedIndices', () => {
  it('returns the indices that moved most', () => {
    expect(mostChangedIndices([0, 0, 0, 0], [0.1, -0.9, 0.5, 0], 2)).toEqual(new Set([1, 2]))
  })
})
