import { describe, expect, it } from 'vitest'
import {
  ARITHMETIC_PRODUCT,
  EXPERIMENTS,
  checkArithmeticReply,
  extractNumbers,
  findExperiment,
  resolveVerdict,
} from './experiments'

const experiment = (id: string) => {
  const found = findExperiment(id)
  if (!found) throw new Error(`missing experiment ${id}`)
  return found
}

describe('arithmetic check', () => {
  it('computes the product', () => {
    expect(ARITHMETIC_PRODUCT).toBe(309_524)
  })

  it.each(['The answer is 309,524.', '347 x 892 = 309524', 'Result: 309 524', '= 309,524 (check)'])(
    'accepts %j as correct',
    (reply) => {
      expect(checkArithmeticReply(reply)).toBe('sound')
    },
  )

  it('never calls a reply wrong by itself, it leaves the verdict to the reader', () => {
    expect(checkArithmeticReply('The answer is 309,425.')).toBeNull()
    expect(checkArithmeticReply('Step 1: 347 x 800 = 277,600')).toBeNull()
  })

  it('extracts numbers across thousands separators', () => {
    expect(extractNumbers('1,000 plus 2 and 3.5')).toEqual([1000, 2, 3, 5])
  })
})

describe('verdicts', () => {
  it('uses the computed check before the reader choice', () => {
    expect(resolveVerdict(experiment('calculation'), 'It is 309,524', 'no')).toBe('sound')
  })

  it('has no verdict until the reader answers a non-checkable experiment', () => {
    expect(resolveVerdict(experiment('sensory'), 'Red feels warm.', null)).toBeNull()
  })

  it('maps Yes and No through yesMeans', () => {
    expect(resolveVerdict(experiment('sensory'), 'x', 'yes')).toBe('sound')
    expect(resolveVerdict(experiment('sensory'), 'x', 'no')).toBe('unsound')
    expect(resolveVerdict(experiment('hallucination'), 'x', 'yes')).toBe('unsound')
    expect(resolveVerdict(experiment('hallucination'), 'x', 'no')).toBe('sound')
  })

  it('treats Not sure as unsure and never as a failure', () => {
    for (const item of EXPERIMENTS) expect(resolveVerdict(item, 'x', 'unsure')).toBe('unsure')
  })

  it('never says the model failed in the sound or unsure notes', () => {
    for (const item of EXPERIMENTS) {
      expect(item.notes.unsure.toLowerCase()).not.toContain('wrong')
      expect(item.notes.sound.toLowerCase()).not.toContain('wrong')
    }
  })
})
