import { describe, expect, it } from 'vitest'
import { illustrativeDistribution, splitTopAndTail } from './distribution'
import { tokenize } from './tokenizer'
import { ENGLISH_POOLS, GERMAN_POOLS } from './vocabulary'

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

describe('illustrativeDistribution', () => {
  const tokens = tokenize('The dog barked because it was hungry.')

  it('has at least 60 candidates whose probabilities sum to 1, sorted', () => {
    const candidates = illustrativeDistribution(tokens, tokens.length - 1)
    expect(candidates.length).toBeGreaterThanOrEqual(60)
    expect(sum(candidates.map((c) => c.probability))).toBeCloseTo(1, 10)
    const probabilities = candidates.map((c) => c.probability)
    expect(probabilities).toEqual([...probabilities].sort((a, b) => b - a))
  })

  it('changes with the context position', () => {
    const atEnd = illustrativeDistribution(tokens, tokens.length - 1).map((c) => c.token)
    const afterThe = illustrativeDistribution(tokens, 0).map((c) => c.token)
    expect(afterThe.slice(0, 5)).not.toEqual(atEnd.slice(0, 5))
  })

  it('favours sentence starters after a full stop and nouns after "the"', () => {
    const afterStop = illustrativeDistribution(tokens, tokens.length - 1)[0].token
    expect(ENGLISH_POOLS.starters).toContain(afterStop)
    const afterThe = illustrativeDistribution(tokenize('I saw the'), 2)[0].token
    expect(ENGLISH_POOLS.nouns).toContain(afterThe)
  })

  it.each([...Object.values(ENGLISH_POOLS).flat(), ...Object.values(GERMAN_POOLS).flat()])(
    'candidate %j is exactly one o200k_base token',
    (text) => {
      expect(tokenize(text)).toHaveLength(1)
    },
  )
})

describe('splitTopAndTail', () => {
  it('gives the tail bar 1 minus the sum of the top 20', () => {
    const tokens = tokenize('The dog barked because it was hungry.')
    const candidates = illustrativeDistribution(tokens, tokens.length - 1)
    const { top, tailProbability } = splitTopAndTail(candidates, 20)
    expect(top).toHaveLength(20)
    expect(tailProbability).toBeCloseTo(1 - sum(top.map((c) => c.probability)), 12)
    expect(tailProbability).toBeGreaterThan(0)
  })

  it('has an empty tail when the list fits in the top', () => {
    const tokens = tokenize('Hi')
    const candidates = illustrativeDistribution(tokens, 0).slice(0, 3)
    const scaled = candidates.map((c) => ({ ...c, probability: 1 / 3 }))
    expect(splitTopAndTail(scaled, 20).tailProbability).toBeCloseTo(0, 12)
  })
})
