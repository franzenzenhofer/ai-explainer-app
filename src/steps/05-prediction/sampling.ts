// Sampling logic - Temperature, Top-K, Top-P
// Uses REAL tiktoken tokenization for consistent tokens/colors across the app (DRY)

import type { PredictionCandidate, Token } from '../../core/types'
import { tokenize } from '../02-tokenization/tokenizer'

// Cache for tokenized vocabulary (computed once on first use)
let tokenizedVocabCache: Map<string, { tokenId: number; colorIndex: number }> | null = null

// Get real tokenId for a prediction token using tiktoken
function getTokenInfo(text: string): { tokenId: number; colorIndex: number } {
  // Build cache on first access
  if (!tokenizedVocabCache) {
    tokenizedVocabCache = new Map()
  }

  // Check cache first
  if (tokenizedVocabCache.has(text)) {
    return tokenizedVocabCache.get(text)!
  }

  // Tokenize to get REAL tokenId (use first token if multiple)
  const tokens = tokenize(text)
  const result = tokens.length > 0
    ? { tokenId: tokens[0].tokenId, colorIndex: tokens[0].colorIndex }
    : { tokenId: Math.abs(text.split('').reduce((a, c) => a + c.charCodeAt(0), 0)), colorIndex: 0 }

  tokenizedVocabCache.set(text, result)
  return result
}

// Detect if text is likely German based on common patterns
function isGermanText(tokens: Token[]): boolean {
  const text = tokens.map(t => t.text.toLowerCase()).join('')
  const germanPatterns = ['sch', 'ß', 'ü', 'ö', 'ä', 'und', 'der', 'die', 'das', 'ist', 'sind', 'werden', 'haben', 'menschen', 'würde', 'rechte', 'künstlich', 'intelligenz']
  return germanPatterns.some(pattern => text.includes(pattern))
}

// Context-aware predictions - returns common tokens that could follow the given context
function getContextualPredictions(tokens: Token[], positionIndex: number): Array<{ token: string; baseProb: number }> {
  if (tokens.length === 0) {
    return [
      { token: 'The', baseProb: 0.15 },
      { token: 'I', baseProb: 0.12 },
      { token: 'A', baseProb: 0.10 },
    ]
  }

  const isGerman = isGermanText(tokens)
  const lastToken = tokens[tokens.length - 1]?.text.toLowerCase().trim() || ''
  const positionSeed = positionIndex * 7 + tokens.length * 13

  // German vocabulary with REAL tokens (will be tokenized for real IDs)
  const germanBase = [
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
    { token: ' wie', baseProb: 0.02 },
    { token: ' werden', baseProb: 0.015 },
    { token: '!', baseProb: 0.01 },
    { token: '.', baseProb: 0.02 },
    { token: ',', baseProb: 0.015 },
    { token: '?', baseProb: 0.01 },
  ]

  // English vocabulary with REAL tokens
  const englishBase = [
    { token: ' the', baseProb: 0.15 },
    { token: ' a', baseProb: 0.12 },
    { token: ' and', baseProb: 0.08 },
    { token: ' is', baseProb: 0.07 },
    { token: ' to', baseProb: 0.06 },
    { token: ' of', baseProb: 0.05 },
    { token: ' that', baseProb: 0.04 },
    { token: ' in', baseProb: 0.04 },
    { token: ' it', baseProb: 0.03 },
    { token: ' how', baseProb: 0.03 },
    { token: ' this', baseProb: 0.025 },
    { token: ' with', baseProb: 0.02 },
    { token: '!', baseProb: 0.02 },
    { token: '.', baseProb: 0.025 },
    { token: ',', baseProb: 0.02 },
    { token: '?', baseProb: 0.015 },
  ]

  // Context-specific predictions (German)
  const germanContexts: Record<string, Array<{ token: string; baseProb: number }>> = {
    '!': [
      { token: ' Die', baseProb: 0.15 },
      { token: ' Der', baseProb: 0.12 },
      { token: ' Das', baseProb: 0.10 },
      { token: ' The', baseProb: 0.08 },
      { token: '\n', baseProb: 0.06 },
      ...germanBase.slice(0, 8),
    ],
    'funktioniert': [
      { token: '!', baseProb: 0.25 },
      { token: '.', baseProb: 0.15 },
      { token: ' und', baseProb: 0.10 },
      { token: ' wie', baseProb: 0.08 },
      ...germanBase.slice(0, 8),
    ],
    'oder': [
      { token: '?', baseProb: 0.30 },
      { token: ' nicht', baseProb: 0.15 },
      { token: '.', baseProb: 0.10 },
      ...germanBase.slice(0, 8),
    ],
  }

  // Context-specific predictions (English)
  const englishContexts: Record<string, Array<{ token: string; baseProb: number }>> = {
    'works': [
      { token: '!', baseProb: 0.20 },
      { token: '.', baseProb: 0.15 },
      { token: ' and', baseProb: 0.12 },
      { token: ' well', baseProb: 0.10 },
      ...englishBase.slice(0, 8),
    ],
    'tokenization': [
      { token: ' works', baseProb: 0.18 },
      { token: ' is', baseProb: 0.15 },
      { token: '!', baseProb: 0.12 },
      { token: '.', baseProb: 0.10 },
      ...englishBase.slice(0, 8),
    ],
    'how': [
      { token: ' token', baseProb: 0.15 },
      { token: ' AI', baseProb: 0.12 },
      { token: ' it', baseProb: 0.10 },
      { token: ' the', baseProb: 0.08 },
      ...englishBase.slice(0, 8),
    ],
  }

  const contexts = isGerman ? germanContexts : englishContexts
  const baseVocab = isGerman ? germanBase : englishBase
  const basePreds = contexts[lastToken] || baseVocab

  // Apply position-based variation
  return basePreds.map((pred, i) => {
    const variation = Math.sin(positionSeed + i * 3.7) * 0.3 + 1.0
    return { token: pred.token, baseProb: pred.baseProb * variation }
  })
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
// contextUpToIndex: predict AFTER this token position (uses tokens 0..contextUpToIndex)
export function generatePredictions(
  tokens: Token[],
  temperature: number,
  topK: number,
  topP: number,
  contextUpToIndex?: number
): PredictionCandidate[] {
  // Use only tokens up to the specified index for context
  const effectiveIndex = contextUpToIndex ?? tokens.length - 1
  const contextTokens = tokens.slice(0, effectiveIndex + 1)
  const contextPreds = getContextualPredictions(contextTokens, effectiveIndex)

  // Create initial candidates with REAL tokenIds from tiktoken (DRY - consistent colors!)
  let candidates: PredictionCandidate[] = contextPreds.map((p) => {
    const tokenInfo = getTokenInfo(p.token)
    return {
      token: p.token,
      tokenId: tokenInfo.tokenId,
      colorIndex: tokenInfo.colorIndex,
      probability: p.baseProb,
    }
  })

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
