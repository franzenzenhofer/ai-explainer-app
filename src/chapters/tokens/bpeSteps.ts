// Byte pair encoding as a list of steps, computed from the real o200k_base merge ranks.
// Start from the UTF-8 bytes of one word. Repeatedly merge the adjacent pair whose joined bytes have
// the lowest rank; stop when no adjacent pair is a token. The last step is the tokenizer's answer.

import { bytesKey, type MergeRanks } from '../../model/mergeRanks'

export interface BpePiece {
  bytes: number[]
  // The piece as text, or its byte in hex when the piece is only part of a character.
  label: string
}

export interface BpeMerge {
  left: BpePiece
  right: BpePiece
  result: BpePiece
  // Rank of the merged token in o200k_base.
  rank: number
}

export interface BpeStep {
  pieces: BpePiece[]
  // The merge that produced this step; null for the first step (single bytes).
  merge: BpeMerge | null
}

const utf8 = new TextDecoder('utf-8', { fatal: true })
const HEX_RADIX = 16

function pieceFrom(bytes: number[]): BpePiece {
  try {
    return { bytes, label: utf8.decode(Uint8Array.from(bytes)) }
  } catch {
    return { bytes, label: bytes.map((byte) => `<${byte.toString(HEX_RADIX).toUpperCase().padStart(2, '0')}>`).join('') }
  }
}

interface Candidate {
  index: number
  rank: number
}

function lowestRankPair(pieces: BpePiece[], ranks: MergeRanks): Candidate | null {
  let best: Candidate | null = null
  for (let index = 0; index < pieces.length - 1; index++) {
    const rank = ranks.get(bytesKey([...pieces[index].bytes, ...pieces[index + 1].bytes]))
    if (rank !== undefined && (best === null || rank < best.rank)) best = { index, rank }
  }
  return best
}

function mergeAt(pieces: BpePiece[], candidate: Candidate): BpeStep {
  const left = pieces[candidate.index]
  const right = pieces[candidate.index + 1]
  const result = pieceFrom([...left.bytes, ...right.bytes])
  const next = [...pieces.slice(0, candidate.index), result, ...pieces.slice(candidate.index + 2)]
  return { pieces: next, merge: { left, right, result, rank: candidate.rank } }
}

export function bpeSteps(word: string, ranks: MergeRanks): BpeStep[] {
  const bytes = Array.from(new TextEncoder().encode(word))
  const steps: BpeStep[] = [{ pieces: bytes.map((byte) => pieceFrom([byte])), merge: null }]
  for (;;) {
    const current = steps[steps.length - 1].pieces
    const candidate = lowestRankPair(current, ranks)
    if (candidate === null) return steps
    steps.push(mergeAt(current, candidate))
  }
}
