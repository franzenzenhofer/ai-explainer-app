// Pure helpers for the Layers chapter: a fixed scale for every block and the numbers that moved most.

// The largest absolute value anywhere in the stream, so every block is drawn on the same scale.
export function streamScale(stream: number[][]): number {
  const largest = Math.max(0, ...stream.flat().map(Math.abs))
  return largest === 0 ? 1 : largest
}

// Indices of the `count` numbers that changed most between two versions of a vector.
export function mostChangedIndices(before: number[], after: number[], count: number): Set<number> {
  const ranked = after
    .map((value, index) => ({ index, change: Math.abs(value - before[index]) }))
    .sort((a, b) => b.change - a.change)
  return new Set(ranked.slice(0, count).map((entry) => entry.index))
}
