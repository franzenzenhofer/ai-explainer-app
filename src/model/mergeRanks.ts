// The merge ranks of o200k_base: every token as its bytes, with the rank it was given when the
// list was built (lower rank = merged earlier). Parsed from the same data js-tiktoken loads, because
// the Tiktoken class does not expose its map. The key is the bytes joined by commas.

import o200kBase from 'js-tiktoken/ranks/o200k_base'

export type MergeRanks = ReadonlyMap<string, number>

export const bytesKey = (bytes: ArrayLike<number>): string => Array.prototype.join.call(bytes, ',')

function decodeBase64(token: string): Uint8Array {
  const binary = atob(token)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

// Each line is "<marker> <first rank> <base64 token> <base64 token> ...": the tokens on a line have consecutive ranks.
export function parseMergeRanks(bpeRanks: string): Map<string, number> {
  const ranks = new Map<string, number>()
  for (const line of bpeRanks.split('\n')) {
    if (!line) continue
    const [, firstRank, ...tokens] = line.split(' ')
    const offset = Number.parseInt(firstRank, 10)
    tokens.forEach((token, index) => ranks.set(bytesKey(decodeBase64(token)), offset + index))
  }
  return ranks
}

let loaded: Map<string, number> | null = null

export function o200kMergeRanks(): MergeRanks {
  loaded ??= parseMergeRanks(o200kBase.bpe_ranks)
  return loaded
}
