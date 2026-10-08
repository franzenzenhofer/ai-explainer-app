import { describe, expect, it } from 'vitest'
import { CONCEPT_COLORS, STAGE_IDS, conceptVars, tokenColor, tokenHue } from './colors'

describe('concept colours', () => {
  it('has one colour set per pipeline stage', () => {
    expect(Object.keys(CONCEPT_COLORS).sort()).toEqual([...STAGE_IDS].sort())
  })

  it('uses a different solid colour for every stage', () => {
    const solids = STAGE_IDS.map((stage) => CONCEPT_COLORS[stage].solid)
    expect(new Set(solids).size).toBe(STAGE_IDS.length)
  })

  it('sets the accent to the readable shade', () => {
    expect(conceptVars('attention')['--accent']).toBe(CONCEPT_COLORS.attention.strong)
  })
})

describe('token identity colours', () => {
  it('gives the same text the same colour every time', () => {
    expect(tokenColor(' dog')).toEqual(tokenColor(' dog'))
  })

  it('ignores the leading space and case, so " dog" in two tokenizers matches', () => {
    expect(tokenHue(' dog')).toBe(tokenHue('dog'))
    expect(tokenHue(' Dog')).toBe(tokenHue('dog'))
  })

  it('spreads different tokens over different hues', () => {
    const hues = ['The', ' dog', ' barked', ' because', ' it', ' was', ' hungry', '.'].map(tokenHue)
    expect(new Set(hues).size).toBe(hues.length)
  })
})
