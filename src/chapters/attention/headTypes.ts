// Attention head types that a source we read documents. Every entry links to that source;
// head types without a source were removed (plan E11).

import type { SourceKey } from '../../core/chapters/sources'

export interface HeadType {
  name: string
  what: string
  example: string
  source: SourceKey
}

export const KNOWN_HEAD_TYPES: HeadType[] = [
  {
    name: 'Previous token head',
    what: 'Copies information from the token right before into each position.',
    example: 'In "the cat sat", the position of "sat" picks up "cat".',
    source: 'previousTokenHead',
  },
  {
    name: 'Induction head',
    what: 'Works with a previous token head in an earlier layer: if A was followed by B before, seeing A again points to B.',
    example: 'After "Harry Potter ... Harry", it points to "Potter".',
    source: 'inductionHeads',
  },
  {
    name: 'Duplicate token head',
    what: 'Looks back at an earlier copy of the current token and marks that the token is repeated.',
    example: 'In "Mary and John went out. John gave", the second "John" looks back at the first.',
    source: 'duplicateTokenHeads',
  },
]
