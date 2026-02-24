// Attention logic - Simulated self-attention weights

import type { Token, AttentionWeight } from '../../core/types'

// Generate attention weights for a layer/head combination
export function generateAttentionWeights(
  tokens: Token[],
  layer: number,
  head: number
): AttentionWeight[] {
  const n = tokens.length
  if (n === 0) return []

  const weights: AttentionWeight[] = []
  const seed = layer * 1000 + head

  for (let query = 0; query < n; query++) {
    // Generate raw attention scores
    const rawScores: number[] = []
    let sumExp = 0

    for (let key = 0; key < n; key++) {
      // Decoder-only causal mask: no attention to future tokens
      if (key > query) {
        rawScores.push(Number.NEGATIVE_INFINITY)
        continue
      }

      // Create somewhat realistic patterns
      let score = 0

      // Self-attention (tokens attend to themselves)
      if (query === key) {
        score = 2.0 + pseudoRandom(seed + query * 100 + key) * 0.5
      }
      // Adjacent tokens often have higher attention
      else if (Math.abs(query - key) === 1) {
        score = 1.5 + pseudoRandom(seed + query * 100 + key) * 0.3
      }
      // Earlier tokens (causal attention pattern)
      else if (key < query) {
        score = 0.5 + pseudoRandom(seed + query * 100 + key) * 0.8
      }

      rawScores.push(score)
      sumExp += Math.exp(score)
    }

    // Softmax normalization
    for (let key = 0; key < n; key++) {
      const rawScore = rawScores[key]
      const weight = Number.isFinite(rawScore) && sumExp > 0
        ? Math.exp(rawScore) / sumExp
        : 0
      weights.push({
        queryIdx: query,
        keyIdx: key,
        weight,
      })
    }
  }

  return weights
}

// Get attention weights for a specific query token
export function getQueryAttention(
  weights: AttentionWeight[],
  queryIdx: number
): Array<{ keyIdx: number; weight: number }> {
  return weights
    .filter((w) => w.queryIdx === queryIdx && w.weight > 0)
    .map((w) => ({ keyIdx: w.keyIdx, weight: w.weight }))
    .sort((a, b) => b.weight - a.weight)
}

// Create attention matrix (2D array for heatmap)
export function createAttentionMatrix(
  weights: AttentionWeight[],
  tokenCount: number
): number[][] {
  const matrix: number[][] = []

  for (let i = 0; i < tokenCount; i++) {
    matrix[i] = []
    for (let j = 0; j < tokenCount; j++) {
      const w = weights.find((w) => w.queryIdx === i && w.keyIdx === j)
      matrix[i][j] = w?.weight ?? 0
    }
  }

  return matrix
}

// Seeded pseudo-random for consistent results
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Explanation data for attention patterns
export interface AttentionPattern {
  name: string
  description: string
  example: string
}

export const ATTENTION_PATTERNS: AttentionPattern[] = [
  {
    name: 'Diagonal Pattern',
    description: 'Tokens attend to themselves (self-identity). Seen as a strong diagonal line in the heatmap.',
    example: 'Each word keeps its own identity',
  },
  {
    name: 'Vertical Stripes',
    description: 'All tokens attend to the same important word. Often appears for key nouns or verbs.',
    example: '"cat" gets attention from many tokens',
  },
  {
    name: 'Previous Token',
    description: 'Tokens attend strongly to the word right before them. Common in early layers for grammar.',
    example: '"the" → "cat" (adjective-noun pairs)',
  },
  {
    name: 'Long-Distance',
    description: 'Tokens connect across sentences. Later layers learn pronouns, references, topics.',
    example: '"it" → "cat" (5 words apart)',
  },
]

// Stats for display
export function getAttentionStats(weights: AttentionWeight[]) {
  if (weights.length === 0) {
    return { maxWeight: 0, avgWeight: 0, entropy: 0 }
  }

  const allWeights = weights.map((w) => w.weight)
  const maxWeight = Math.max(...allWeights)
  const avgWeight = allWeights.reduce((a, b) => a + b, 0) / allWeights.length

  // Calculate entropy
  const entropy = -allWeights
    .filter((w) => w > 0)
    .reduce((sum, w) => sum + w * Math.log2(w), 0)

  return {
    maxWeight: maxWeight.toFixed(3),
    avgWeight: avgWeight.toFixed(4),
    entropy: entropy.toFixed(2),
  }
}
