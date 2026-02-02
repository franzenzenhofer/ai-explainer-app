// Sampling logic - Temperature, Top-K, Top-P

import type { PredictionCandidate, Token } from '../../core/types'
import { GPT5_SPECS } from '../../core/types'

// Sample vocabulary for demonstrations (NOTE: leading space = separate word, like real tokenizers)
const SAMPLE_VOCABULARY_EN: Array<{ token: string; baseProb: number }> = [
  { token: ' the', baseProb: 0.15 },
  { token: ' a', baseProb: 0.12 },
  { token: ' and', baseProb: 0.08 },
  { token: ' is', baseProb: 0.07 },
  { token: ' to', baseProb: 0.06 },
  { token: ' of', baseProb: 0.05 },
  { token: ' that', baseProb: 0.04 },
  { token: ' in', baseProb: 0.04 },
  { token: ' it', baseProb: 0.03 },
  { token: ' was', baseProb: 0.03 },
  { token: ' for', baseProb: 0.025 },
  { token: ' with', baseProb: 0.02 },
  { token: ' on', baseProb: 0.02 },
  { token: ' be', baseProb: 0.018 },
  { token: ' at', baseProb: 0.015 },
  { token: ' by', baseProb: 0.012 },
  { token: ' from', baseProb: 0.01 },
  { token: ' or', baseProb: 0.008 },
  { token: ' an', baseProb: 0.007 },
  { token: ' are', baseProb: 0.006 },
]

const SAMPLE_VOCABULARY_DE: Array<{ token: string; baseProb: number }> = [
  { token: ' und', baseProb: 0.12 },
  { token: ' die', baseProb: 0.10 },
  { token: ' der', baseProb: 0.10 },
  { token: ' das', baseProb: 0.08 },
  { token: ' ist', baseProb: 0.07 },
  { token: ' ein', baseProb: 0.06 },
  { token: ' eine', baseProb: 0.05 },
  { token: ' für', baseProb: 0.04 },
  { token: ' mit', baseProb: 0.04 },
  { token: ' auf', baseProb: 0.03 },
  { token: ' nicht', baseProb: 0.03 },
  { token: ' von', baseProb: 0.025 },
  { token: ' zu', baseProb: 0.02 },
  { token: ' den', baseProb: 0.02 },
  { token: ' sind', baseProb: 0.018 },
  { token: ' haben', baseProb: 0.015 },
  { token: ' werden', baseProb: 0.012 },
  { token: ' es', baseProb: 0.01 },
  { token: ' sich', baseProb: 0.008 },
  { token: ' als', baseProb: 0.006 },
]

// Detect if text is likely German based on common patterns
function isGermanText(tokens: Token[]): boolean {
  const text = tokens.map(t => t.text.toLowerCase()).join('')
  const germanPatterns = ['sch', 'ß', 'ü', 'ö', 'ä', 'und', 'der', 'die', 'das', 'ist', 'sind', 'werden', 'haben', 'menschen', 'würde', 'rechte']
  return germanPatterns.some(pattern => text.includes(pattern))
}

// Context-aware predictions based on input
function getContextualPredictions(tokens: Token[]): Array<{ token: string; baseProb: number }> {
  if (tokens.length === 0) return SAMPLE_VOCABULARY_EN

  // Detect language and use appropriate vocabulary
  const isGerman = isGermanText(tokens)
  const baseVocab = isGerman ? SAMPLE_VOCABULARY_DE : SAMPLE_VOCABULARY_EN

  const lastToken = tokens[tokens.length - 1]?.text.toLowerCase().trim() || ''

  // German context-specific predictions
  const germanContexts: Record<string, Array<{ token: string; baseProb: number }>> = {
    '.': [
      { token: ' Die', baseProb: 0.15 },
      { token: ' Der', baseProb: 0.12 },
      { token: ' Das', baseProb: 0.10 },
      { token: ' Sie', baseProb: 0.08 },
      { token: ' Es', baseProb: 0.06 },
      ...SAMPLE_VOCABULARY_DE.slice(0, 10),
    ],
    'und': [
      { token: ' die', baseProb: 0.15 },
      { token: ' der', baseProb: 0.12 },
      { token: ' das', baseProb: 0.10 },
      { token: ' sollen', baseProb: 0.08 },
      { token: ' müssen', baseProb: 0.06 },
      ...SAMPLE_VOCABULARY_DE.slice(0, 10),
    ],
    'sind': [
      { token: ' frei', baseProb: 0.12 },
      { token: ' gleich', baseProb: 0.10 },
      { token: ' mit', baseProb: 0.08 },
      { token: ' von', baseProb: 0.06 },
      { token: ' zu', baseProb: 0.05 },
      ...SAMPLE_VOCABULARY_DE.slice(0, 10),
    ],
    'nen': [  // end of "begegnen"
      { token: '.', baseProb: 0.20 },
      { token: ' und', baseProb: 0.15 },
      { token: ' sollen', baseProb: 0.10 },
      { token: ' können', baseProb: 0.08 },
      ...SAMPLE_VOCABULARY_DE.slice(0, 10),
    ],
  }

  // English context-specific predictions
  const englishContexts: Record<string, Array<{ token: string; baseProb: number }>> = {
    'the': [
      { token: ' capital', baseProb: 0.2 },
      { token: ' city', baseProb: 0.15 },
      { token: ' country', baseProb: 0.1 },
      { token: ' world', baseProb: 0.08 },
      ...SAMPLE_VOCABULARY_EN.slice(0, 10),
    ],
    'france': [
      { token: ' is', baseProb: 0.35 },
      { token: '.', baseProb: 0.15 },
      { token: ',', baseProb: 0.1 },
      { token: ' and', baseProb: 0.08 },
      ...SAMPLE_VOCABULARY_EN.slice(0, 10),
    ],
    'is': [
      { token: ' Paris', baseProb: 0.2 },
      { token: ' the', baseProb: 0.15 },
      { token: ' a', baseProb: 0.12 },
      { token: ' not', baseProb: 0.08 },
      ...SAMPLE_VOCABULARY_EN.slice(0, 10),
    ],
  }

  const contexts = isGerman ? germanContexts : englishContexts
  return contexts[lastToken] || baseVocab
}

// Apply temperature scaling to logits
export function applyTemperature(probs: number[], temperature: number): number[] {
  if (temperature === 0) {
    // Greedy: return one-hot on max
    const maxIdx = probs.indexOf(Math.max(...probs))
    return probs.map((_, i) => (i === maxIdx ? 1 : 0))
  }

  // Scale logits by temperature and re-normalize
  const logits = probs.map((p) => Math.log(p + 1e-10) / temperature)
  const maxLogit = Math.max(...logits)
  const expLogits = logits.map((l) => Math.exp(l - maxLogit))
  const sumExp = expLogits.reduce((a, b) => a + b, 0)

  return expLogits.map((e) => e / sumExp)
}

// Apply Top-K filtering
export function applyTopK(
  candidates: PredictionCandidate[],
  k: number
): PredictionCandidate[] {
  if (k >= candidates.length) return candidates

  // Sort by probability descending
  const sorted = [...candidates].sort((a, b) => b.probability - a.probability)
  const topK = sorted.slice(0, k)

  // Renormalize
  const sum = topK.reduce((s, c) => s + c.probability, 0)
  return topK.map((c) => ({ ...c, probability: c.probability / sum }))
}

// Apply Top-P (nucleus) filtering
export function applyTopP(
  candidates: PredictionCandidate[],
  p: number
): PredictionCandidate[] {
  if (p >= 1) return candidates

  // Sort by probability descending
  const sorted = [...candidates].sort((a, b) => b.probability - a.probability)

  let cumProb = 0
  const nucleus: PredictionCandidate[] = []

  for (const candidate of sorted) {
    nucleus.push(candidate)
    cumProb += candidate.probability
    if (cumProb >= p) break
  }

  // Renormalize
  const sum = nucleus.reduce((s, c) => s + c.probability, 0)
  return nucleus.map((c) => ({ ...c, probability: c.probability / sum }))
}

// Generate predictions based on context and sampling parameters
export function generatePredictions(
  tokens: Token[],
  temperature: number,
  topK: number,
  topP: number
): PredictionCandidate[] {
  const contextPreds = getContextualPredictions(tokens)

  // Create initial candidates
  let candidates: PredictionCandidate[] = contextPreds.map((p, i) => ({
    token: p.token,
    tokenId: 1000 + i,
    probability: p.baseProb,
  }))

  // Normalize initial probabilities
  const totalProb = candidates.reduce((s, c) => s + c.probability, 0)
  candidates = candidates.map((c) => ({
    ...c,
    probability: c.probability / totalProb,
  }))

  // Apply temperature
  const tempProbs = applyTemperature(
    candidates.map((c) => c.probability),
    temperature
  )
  candidates = candidates.map((c, i) => ({
    ...c,
    probability: tempProbs[i],
  }))

  // Apply Top-K
  candidates = applyTopK(candidates, topK)

  // Apply Top-P
  candidates = applyTopP(candidates, topP)

  return candidates.sort((a, b) => b.probability - a.probability)
}

// Sample one token from the distribution
export function sampleToken(candidates: PredictionCandidate[]): PredictionCandidate {
  const r = Math.random()
  let cumProb = 0

  for (const candidate of candidates) {
    cumProb += candidate.probability
    if (r < cumProb) {
      return candidate
    }
  }

  return candidates[candidates.length - 1]
}
