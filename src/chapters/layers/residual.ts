// Pure helpers for the Layers chapter: a robust scale for a set of vectors and the numbers that moved most.

// Share of the numbers that fit inside the frame. Real residual streams have a few huge numbers
// (GPT-2 small reaches 224 where most are below 10), so the scale ignores the top 1%.
const SCALE_QUANTILE = 0.99

// The absolute value below which 99% of the given numbers lie (one vector or a whole stream).
export function streamScale(stream: number[][]): number {
  const sorted = stream.flat().map(Math.abs).sort((a, b) => a - b)
  if (sorted.length === 0) return 1
  const scale = sorted[Math.ceil(SCALE_QUANTILE * sorted.length) - 1]
  return scale === 0 ? 1 : scale
}

export function largestMagnitude(vector: number[]): number {
  return Math.max(0, ...vector.map(Math.abs))
}

// Indices of the `count` numbers that changed most between two versions of a vector.
export function mostChangedIndices(before: number[], after: number[], count: number): Set<number> {
  const ranked = after
    .map((value, index) => ({ index, change: Math.abs(value - before[index]) }))
    .sort((a, b) => b.change - a.change)
  return new Set(ranked.slice(0, count).map((entry) => entry.index))
}
