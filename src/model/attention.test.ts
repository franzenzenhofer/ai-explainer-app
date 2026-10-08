import { describe, expect, it } from 'vitest'
import { tokenize } from './tokenizer'
import { LENSES, antecedentOf, createAttentionMatrix, defaultQuery, generateAttentionWeights, getQueryAttention, type LensId } from './attention'
import { SOURCES } from '../core/chapters/sources'

const tokens = tokenize('The dog chased the ball because it was fast and the dog was tired')
const LENS_IDS = LENSES.map((lens) => lens.id)
const indexOf = (text: string, from = 0) => tokens.findIndex((t, i) => i >= from && t.text.trim() === text)

describe('generateAttentionWeights', () => {
  it.each(LENS_IDS)('gives weight 0 to every future key (%s)', (lens) => {
    const future = generateAttentionWeights(tokens, lens).filter((w) => w.keyIdx > w.queryIdx)
    expect(future.length).toBeGreaterThan(0)
    for (const weight of future) expect(weight.weight).toBe(0)
  })

  it.each(LENS_IDS)('has rows that sum to 1 (%s)', (lens) => {
    const matrix = createAttentionMatrix(generateAttentionWeights(tokens, lens), tokens.length)
    for (const row of matrix) expect(row.reduce((total, value) => total + value, 0)).toBeCloseTo(1, 10)
  })

  const strongest = (lens: LensId, query: number) => getQueryAttention(generateAttentionWeights(tokens, lens), query)[0].keyIdx

  it('previous token lens points at query - 1', () => {
    expect(strongest('previous', 5)).toBe(4)
  })

  it('pronoun lens points "it" at "ball", the latest noun after a determiner', () => {
    expect(strongest('pronoun', indexOf('it'))).toBe(indexOf('ball'))
  })

  it('same word lens points the second "dog" at the first', () => {
    expect(strongest('sameWord', indexOf('dog', 3))).toBe(indexOf('dog'))
  })

  it('first token lens points late positions at position 0', () => {
    expect(strongest('firstToken', tokens.length - 1)).toBe(0)
  })

  it('returns nothing for no tokens', () => {
    expect(generateAttentionWeights([], 'previous')).toEqual([])
  })
})

describe('lenses', () => {
  it('each lens has a description and a source with a text fragment', () => {
    for (const lens of LENSES) {
      expect(lens.description.length).toBeGreaterThan(10)
      expect(SOURCES[lens.source].url).toContain('#:~:text=')
    }
  })

  it('selects the pronoun first, else the last token', () => {
    expect(defaultQuery(tokens)).toBe(indexOf('it'))
    const plain = tokenize('No pronoun here')
    expect(defaultQuery(plain)).toBe(plain.length - 1)
    expect(antecedentOf(plain, 0)).toBeNull()
  })
})
