// Sampling math: temperature, top-k, top-p and the weighted roll. It runs here in the browser on the
// real top candidates the model reported; temperature, top-k and top-p renormalize whatever list they get.

import type { PredictionCandidate } from '../core/types'

const LOG_EPSILON = 1e-10

export interface SamplingSettings {
  temperature: number
  topK: number
  topP: number
}

export function applyTemperature(probs: number[], temperature: number): number[] {
  if (temperature === 0) {
    const maxIdx = probs.indexOf(Math.max(...probs))
    return probs.map((_, i) => (i === maxIdx ? 1 : 0))
  }
  const logits = probs.map((p) => Math.log(p + LOG_EPSILON) / temperature)
  const maxLogit = Math.max(...logits)
  const expLogits = logits.map((l) => Math.exp(l - maxLogit))
  const sumExp = expLogits.reduce((a, b) => a + b, 0)
  return expLogits.map((e) => e / sumExp)
}

function renormalize(candidates: PredictionCandidate[]): PredictionCandidate[] {
  const sum = candidates.reduce((s, c) => s + c.probability, 0)
  return candidates.map((c) => ({ ...c, probability: c.probability / sum }))
}

const byProbability = (candidates: PredictionCandidate[]) =>
  [...candidates].sort((a, b) => b.probability - a.probability)

export function applyTopK(candidates: PredictionCandidate[], k: number): PredictionCandidate[] {
  if (k >= candidates.length) return candidates
  return renormalize(byProbability(candidates).slice(0, k))
}

// Keeps the smallest set of most likely candidates whose probabilities add up to at least p.
export function applyTopP(candidates: PredictionCandidate[], p: number): PredictionCandidate[] {
  if (p >= 1) return candidates
  const nucleus: PredictionCandidate[] = []
  let cumulative = 0
  for (const candidate of byProbability(candidates)) {
    nucleus.push(candidate)
    cumulative += candidate.probability
    if (cumulative >= p) break
  }
  return renormalize(nucleus)
}

// Temperature first, then top-k, then top-p; the result is sorted and sums to 1.
export function applySampling(candidates: PredictionCandidate[], settings: SamplingSettings): PredictionCandidate[] {
  const reshaped = applyTemperature(candidates.map((c) => c.probability), settings.temperature)
  const tempered = candidates.map((c, i) => ({ ...c, probability: reshaped[i] }))
  return byProbability(applyTopP(applyTopK(tempered, settings.topK), settings.topP))
}

// One weighted roll. random() must return a number in [0, 1).
export function sampleToken(candidates: PredictionCandidate[], random: () => number = Math.random): PredictionCandidate {
  const r = random()
  let cumulative = 0
  for (const candidate of candidates) {
    cumulative += candidate.probability
    if (r < cumulative) return candidate
  }
  return candidates[candidates.length - 1]
}

export function sampleMany(candidates: PredictionCandidate[], count: number): PredictionCandidate[] {
  return Array.from({ length: count }, () => sampleToken(candidates))
}
