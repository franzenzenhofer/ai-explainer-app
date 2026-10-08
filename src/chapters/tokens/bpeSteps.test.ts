import { describe, expect, it } from 'vitest'
import { o200kMergeRanks } from '../../model/mergeRanks'
import { tokenize } from '../../model/tokenizer'
import { bpeSteps } from './bpeSteps'

const ranks = o200kMergeRanks()
const labels = (word: string) => bpeSteps(word, ranks).map((step) => step.pieces.map((piece) => piece.label))

describe('bpeSteps (real o200k_base merge ranks)', () => {
  it.each(['Großmutter', 'tokenization', 'understanding', 'Donaudampfschifffahrtsgesellschaftskapitän'])(
    'the last step of %s equals the tokenizer result',
    (word) => {
      const steps = bpeSteps(word, ranks)
      const last = steps[steps.length - 1].pieces.map((piece) => piece.label)
      expect(last).toEqual(tokenize(word).map((token) => token.text))
    },
  )

  it('starts Großmutter from its 11 UTF-8 bytes and ends with Gro, ß, m, utter', () => {
    const all = labels('Großmutter')
    expect(all[0]).toHaveLength(11)
    expect(all[0]).toContain('<C3>')
    expect(all[all.length - 1]).toEqual(['Gro', 'ß', 'm', 'utter'])
  })

  it('merges tokenization into token + ization', () => {
    const all = labels('tokenization')
    expect(all[0]).toHaveLength('tokenization'.length)
    expect(all[all.length - 1]).toEqual(['token', 'ization'])
  })

  it('removes exactly one piece per step and records the rank of each merge', () => {
    const steps = bpeSteps('tokenization', ranks)
    steps.slice(1).forEach((step, index) => {
      expect(step.pieces).toHaveLength(steps[index].pieces.length - 1)
      expect(step.merge?.rank).toBe(ranks.get(step.merge?.result.bytes.join(',') ?? ''))
    })
  })

  it('takes the lowest-rank pair first', () => {
    const [first, second] = bpeSteps('tokenization', ranks)
    const before = first.pieces
    const rankOfPair = (i: number) => ranks.get([...before[i].bytes, ...before[i + 1].bytes].join(','))
    const candidateRanks = before.slice(0, -1).map((_, i) => rankOfPair(i)).filter((rank): rank is number => rank !== undefined)
    expect(second.merge?.rank).toBe(Math.min(...candidateRanks))
  })

  it('returns a single step for an empty word', () => {
    expect(bpeSteps('', ranks)).toEqual([{ pieces: [], merge: null }])
  })
})
