import { describe, expect, it } from 'vitest'
import { tokenize } from './tokenizer'

const texts = (input: string) => tokenize(input).map((token) => token.text)

const ROUND_TRIP_SAMPLES = [
  'Hello world',
  'The cat sat on the mat.',
  'tokenization',
  'Großmutter',
  'Künstliche Intelligenz (AI) revolutioniert unsere Weltanschauung!',
  'Donaudampfschifffahrtsgesellschaftskapitän',
  '  leading and trailing spaces  ',
  'line one\nline two\n\nline four',
  'Numbers: 3.14159, 1,000,000 and 2026-10-08',
  'emoji 🙂 and 日本語 and العربية',
  'a',
  'It is what it is.',
  'def f(x): return x ** 2',
  '"Quoted" text - with dashes, commas; and colons: all of them?',
  'ALL CAPS SHOUTING',
  'mixed Deutsch and English, oder?',
  'tab\tseparated\tvalues',
  'https://example.com/path?query=1#anchor',
  'Straße, Fußball, Öl, Äpfel, Übung',
  'The quick brown fox jumps over the lazy dog',
]

describe('tokenize (real o200k_base)', () => {
  it('splits Großmutter into Gro, ß, m, utter', () => {
    expect(texts('Großmutter')).toEqual(['Gro', 'ß', 'm', 'utter'])
  })

  it('splits tokenization into token, ization', () => {
    expect(texts('tokenization')).toEqual(['token', 'ization'])
  })

  it('returns no tokens for empty text', () => {
    expect(tokenize('')).toEqual([])
  })

  it('assigns sequential ids and uses the token id as the color index', () => {
    const tokens = tokenize('Hello world')
    expect(tokens.map((token) => token.id)).toEqual([0, 1])
    for (const token of tokens) expect(token.colorIndex).toBe(token.tokenId)
  })

  it.each(ROUND_TRIP_SAMPLES)('round trips %j through encode and decode', (sample) => {
    expect(tokenize(sample).map((token) => token.text).join('')).toBe(sample)
  })
})
