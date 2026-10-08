// Stable keys for the pieces of every byte pair encoding step, so a merge can be animated: the merged
// piece keeps the key of its left half and the right half leaves. Also the o200k_base ID of each piece
// (in tiktoken a token's merge rank is its token ID).

import { bytesKey, type MergeRanks } from '../../model/mergeRanks'
import type { BpePiece, BpeStep } from './bpeSteps'

// Index of the first piece that changed between two steps: where the merge happened.
function mergeIndex(previous: BpePiece[], next: BpePiece[]): number {
  const index = next.findIndex((piece, position) => piece !== previous[position])
  return index === -1 ? next.length - 1 : index
}

export function pieceKeys(steps: BpeStep[]): string[][] {
  if (steps.length === 0) return []
  const keys: string[][] = [steps[0].pieces.map((_, index) => `b${index}`)]
  for (let step = 1; step < steps.length; step++) {
    const previousKeys = keys[step - 1]
    const at = mergeIndex(steps[step - 1].pieces, steps[step].pieces)
    keys.push([...previousKeys.slice(0, at + 1), ...previousKeys.slice(at + 2)])
  }
  return keys
}

// The position of the piece the last merge produced, or null for the first step.
export function mergedPosition(steps: BpeStep[], step: number): number | null {
  if (step <= 0 || step >= steps.length) return null
  return mergeIndex(steps[step - 1].pieces, steps[step].pieces)
}

export function pieceId(piece: BpePiece, ranks: MergeRanks): number | undefined {
  return ranks.get(bytesKey(piece.bytes))
}
