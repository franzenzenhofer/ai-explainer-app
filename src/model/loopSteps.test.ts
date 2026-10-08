import { describe, expect, it } from 'vitest'
import { isSpecialToken, joinLeadingSpace, stepsFromTokens, tailOf, type RawLoopToken } from './loopSteps'

const raw = (text: string, top: [string, number][]): RawLoopToken => ({
  text,
  logprob: Math.log(top[0][1]),
  top: top.map(([candidate, probability]) => ({ text: candidate, logprob: Math.log(probability) })),
})

describe('joinLeadingSpace', () => {
  it('adds a space before a word token when the text does not end in whitespace', () => {
    expect(joinLeadingSpace('To make tea, first', 'you')).toBe(' you')
    expect(joinLeadingSpace('Total:', '2')).toBe(' 2')
    expect(joinLeadingSpace('Straße', 'Ö')).toBe(' Ö')
  })

  it('adds nothing after whitespace, before punctuation or an existing space, or into an empty text', () => {
    expect(joinLeadingSpace('The cat ', 'sat')).toBe('sat')
    expect(joinLeadingSpace('The cat\n', 'sat')).toBe('sat')
    expect(joinLeadingSpace('The cat', '.')).toBe('.')
    expect(joinLeadingSpace('The cat', ' sat')).toBe(' sat')
    expect(joinLeadingSpace('', 'The')).toBe('The')
  })
})

describe('isSpecialToken', () => {
  it('recognises <|...|> tokens only', () => {
    expect(isSpecialToken('<|eot_id|>')).toBe(true)
    expect(isSpecialToken('<|end_of_text|>')).toBe(true)
    expect(isSpecialToken('<b>')).toBe(false)
    expect(isSpecialToken(' <|x|>')).toBe(false)
    expect(isSpecialToken('is')).toBe(false)
  })
})

describe('stepsFromTokens', () => {
  const tokens = [
    raw('Paris', [['Paris', 0.9], ['located', 0.05], ['<|eot_id|>', 0.02], ['the', 0.01]]),
    raw('.', [['.', 0.8], [',', 0.1], ['<|eot_id|>', 0.05]]),
    raw('<|eot_id|>', [['<|eot_id|>', 0.7], ['\n', 0.2]]),
    raw('never shown', [['never shown', 1]]),
  ]
  const steps = stepsFromTokens('The capital of France is', tokens)

  it('keys every step by the text the model read, with the first space joined', () => {
    expect(steps.map((entry) => entry.context)).toEqual(['The capital of France is', 'The capital of France is Paris', 'The capital of France is Paris.'])
    expect(steps[0].step.pick).toBe(' Paris')
    expect(steps[0].step.candidates.map((c) => c.token)).toEqual([' Paris', ' located', ' the'])
  })

  it('hides special tokens from the candidate list', () => {
    for (const { step } of steps) expect(step.candidates.some((c) => isSpecialToken(c.token))).toBe(false)
  })

  it('converts log-probabilities to probabilities and keeps them sorted', () => {
    const [first] = steps[0].step.candidates
    expect(first.probability).toBeCloseTo(0.9, 10)
    const probabilities = steps[0].step.candidates.map((c) => c.probability)
    expect(probabilities).toEqual([...probabilities].sort((a, b) => b - a))
  })

  it('makes the tail 1 minus the sum of the visible candidates, so hidden special tokens fall into it', () => {
    expect(steps[0].step.tailProbability).toBeCloseTo(1 - (0.9 + 0.05 + 0.01), 10)
    for (const { step } of steps) {
      const total = step.candidates.reduce((sum, c) => sum + c.probability, 0) + step.tailProbability
      expect(total).toBeCloseTo(1, 10)
    }
  })

  it('stops after a step whose pick is a special end token', () => {
    expect(steps).toHaveLength(3)
    expect(steps[2].step.pick).toBeNull()
  })

  it('adds the probabilities of candidates that read the same after the space is joined', () => {
    const [entry] = stepsFromTokens('Hello', [raw('world', [['world', 0.5], [' world', 0.25], ['you', 0.1]])])
    expect(entry.step.candidates[0]).toEqual({ token: ' world', probability: 0.75 })
    expect(entry.step.candidates).toHaveLength(2)
  })
})

describe('tailOf', () => {
  it('is never negative', () => {
    expect(tailOf([{ token: 'a', probability: 0.6000000001 }, { token: 'b', probability: 0.4 }])).toBe(0)
    expect(tailOf([])).toBe(1)
  })
})
