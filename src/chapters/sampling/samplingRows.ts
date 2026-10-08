// Which candidates of the raw list survive the sampling settings, and with what probability.

import type { PredictionCandidate } from '../../core/types'

export interface SamplingRow {
  candidate: PredictionCandidate
  // Probability after temperature, top-k and top-p; null when the settings cut the candidate.
  keptProbability: number | null
}

// The first `size` candidates of the raw list (most likely first), each marked kept or cut.
export function samplingRows(raw: PredictionCandidate[], kept: PredictionCandidate[], size: number): SamplingRow[] {
  const keptByToken = new Map(kept.map((candidate) => [candidate.token, candidate.probability]))
  return [...raw]
    .sort((a, b) => b.probability - a.probability)
    .slice(0, size)
    .map((candidate) => ({ candidate, keptProbability: keptByToken.get(candidate.token) ?? null }))
}
