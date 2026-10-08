import { describe, expect, it } from 'vitest'
import { o200kMergeRanks } from '../../model/mergeRanks'
import { tokenize } from '../../model/tokenizer'
import { bpeSteps } from './bpeSteps'
import { mergedPosition, pieceId, pieceKeys } from './bpeKeys'

const ranks = o200kMergeRanks()

describe('pieceKeys', () => {
  it('gives every step as many keys as pieces, all distinct', () => {
    const steps = bpeSteps('tokenization', ranks)
    pieceKeys(steps).forEach((keys, index) => {
      expect(keys).toHaveLength(steps[index].pieces.length)
      expect(new Set(keys).size).toBe(keys.length)
    })
  })

  it('keeps the left key for the merged piece and drops the right one', () => {
    const steps = bpeSteps('tokenization', ranks)
    const keys = pieceKeys(steps)
    const at = mergedPosition(steps, 1) ?? -1
    expect(keys[1][at]).toBe(keys[0][at])
    expect(keys[1]).not.toContain(keys[0][at + 1])
  })

  it('reports no merge position for the first step', () => {
    expect(mergedPosition(bpeSteps('token', ranks), 0)).toBeNull()
  })
})

describe('pieceId', () => {
  it('equals the tokenizer ID for the final pieces', () => {
    const steps = bpeSteps('tokenization', ranks)
    const ids = steps[steps.length - 1].pieces.map((piece) => pieceId(piece, ranks))
    expect(ids).toEqual(tokenize('tokenization').map((token) => token.tokenId))
  })
})
