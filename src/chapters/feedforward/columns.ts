// Pure helpers for the Feed-forward chapter: one short column of numbers per token, and the
// attention lines that cross between columns (only from earlier to later positions).

import type { AttentionWeight, Token } from '../../core/types'
import { addVectors, feedForward, positionVector, tokenVector } from '../../model/vectors'

// How many of each token's numbers one column shows.
export const COLUMN_LENGTH = 8
// Lines thinner than this weight are left out so the picture stays readable.
export const MIN_LINE_WEIGHT = 0.05

// Token numbers plus position numbers: the column before any block has run.
export function startColumn(token: Token, position: number): number[] {
  return addVectors(tokenVector(token.tokenId, COLUMN_LENGTH), positionVector(position, COLUMN_LENGTH))
}

// Every column after the feed-forward step has run `runs` times; each column only ever sees itself.
export function columnsAfterRuns(tokens: Token[], runs: number): number[][] {
  return tokens.map((token, position) => {
    let column = startColumn(token, position)
    for (let run = 0; run < runs; run++) column = feedForward(column)
    return column
  })
}

// Index of the number that moved most between two versions of a column.
export function mostChangedIndex(before: number[], after: number[]): number {
  let best = 0
  for (let i = 1; i < after.length; i++) {
    if (Math.abs(after[i] - before[i]) > Math.abs(after[best] - before[best])) best = i
  }
  return best
}

export interface AttentionLine {
  from: number
  to: number
  weight: number
}

// Lines from earlier columns into later ones; a column's weight on itself is not a line.
export function attentionLines(weights: AttentionWeight[]): AttentionLine[] {
  return weights
    .filter((w) => w.keyIdx < w.queryIdx && w.weight >= MIN_LINE_WEIGHT)
    .map((w) => ({ from: w.keyIdx, to: w.queryIdx, weight: w.weight }))
}
