// Scripted attention patterns (Simulated). Each lens is one pattern that researchers have found in
// real attention heads; the weights here follow that pattern by rule, they are not measured.
// The causal mask is exact: a position never attends to a later position, and every row sums to 1.

import type { AttentionWeight, Token } from '../core/types'
import type { SourceKey } from '../core/chapters/sources'

export type LensId = 'previous' | 'sameWord' | 'pronoun' | 'firstToken'

export interface Lens {
  id: LensId
  name: string
  description: string
  source: SourceKey
}

export const LENSES: Lens[] = [
  {
    id: 'pronoun',
    name: 'Pronoun to noun',
    description: 'A word like "it" looks back at the noun it stands for.',
    source: 'vaswaniAnaphora',
  },
  {
    id: 'previous',
    name: 'Previous token',
    description: 'Every position looks at the token right before it.',
    source: 'previousTokenHead',
  },
  {
    id: 'sameWord',
    name: 'Same word earlier',
    description: 'A token looks back at earlier copies of itself.',
    source: 'duplicateTokenHeads',
  },
  {
    id: 'firstToken',
    name: 'First token',
    description: 'Many positions park most of their attention on the very first token.',
    source: 'attentionSinks',
  },
]

const STRONG = 4
const MEDIUM = 1.5
const WEAK = 0.5
const PRONOUNS = new Set(['it', 'its', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their', 'er', 'sie', 'es', 'ihn', 'ihm'])
const DETERMINERS = new Set(['the', 'a', 'an', 'this', 'that', 'my', 'your', 'der', 'die', 'das', 'ein', 'eine', 'den', 'dem'])

const normalized = (token: Token | undefined) => (token?.text ?? '').trim().toLowerCase()
const isWord = (text: string) => /\p{L}/u.test(text)

// The noun a pronoun at position query most likely refers to: the latest word right after a determiner.
export function antecedentOf(tokens: Token[], query: number): number | null {
  if (!PRONOUNS.has(normalized(tokens[query]))) return null
  for (let key = query - 1; key > 0; key--) {
    const text = normalized(tokens[key])
    if (isWord(text) && !PRONOUNS.has(text) && DETERMINERS.has(normalized(tokens[key - 1]))) return key
  }
  return null
}

function rawScore(tokens: Token[], lens: LensId, query: number, key: number): number {
  const self = key === query ? MEDIUM : 0
  switch (lens) {
    case 'previous':
      return key === query - 1 ? STRONG : self
    case 'firstToken':
      return key === 0 ? STRONG : self
    case 'sameWord': {
      const same = key < query && isWord(normalized(tokens[key])) && normalized(tokens[key]) === normalized(tokens[query])
      return same ? STRONG : self || (key === query - 1 ? WEAK : 0)
    }
    case 'pronoun':
      return key === antecedentOf(tokens, query) ? STRONG + 1 : self || (key === query - 1 ? WEAK : 0)
  }
}

function attentionRow(tokens: Token[], lens: LensId, query: number): AttentionWeight[] {
  const scores = tokens.map((_, key) => (key > query ? null : rawScore(tokens, lens, query, key)))
  const total = scores.reduce<number>((sum, score) => sum + (score === null ? 0 : Math.exp(score)), 0)
  return scores.map((score, key) => ({
    queryIdx: query,
    keyIdx: key,
    weight: score === null ? 0 : Math.exp(score) / total,
  }))
}

export function generateAttentionWeights(tokens: Token[], lens: LensId): AttentionWeight[] {
  return tokens.flatMap((_, query) => attentionRow(tokens, lens, query))
}

// Earlier positions that query attends to, strongest first.
export function getQueryAttention(weights: AttentionWeight[], queryIdx: number): Array<{ keyIdx: number; weight: number }> {
  return weights
    .filter((w) => w.queryIdx === queryIdx && w.weight > 0)
    .map((w) => ({ keyIdx: w.keyIdx, weight: w.weight }))
    .sort((a, b) => b.weight - a.weight)
}

export function createAttentionMatrix(weights: AttentionWeight[], tokenCount: number): number[][] {
  const matrix = Array.from({ length: tokenCount }, () => new Array<number>(tokenCount).fill(0))
  for (const w of weights) matrix[w.queryIdx][w.keyIdx] = w.weight
  return matrix
}

// The position the attention chapter selects first: the first pronoun with a noun before it, else the last token.
export function defaultQuery(tokens: Token[]): number {
  const pronoun = tokens.findIndex((_, index) => antecedentOf(tokens, index) !== null)
  return pronoun === -1 ? tokens.length - 1 : pronoun
}
