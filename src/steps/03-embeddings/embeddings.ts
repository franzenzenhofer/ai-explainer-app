// Embeddings logic - Simulated vector embeddings

import type { Token, EmbeddingVector } from '../../core/types'
import { MODEL_SPECS } from '../../core/types'

// Pre-defined 2D positions for visualization (UMAP-like projection)
const SEMANTIC_POSITIONS: Record<string, [number, number]> = {
  // German fairy tale words
  'Es': [0.2, 0.3], 'war': [0.25, 0.35], 'ein': [0.3, 0.3],
  'mal': [0.35, 0.32], 'die': [0.1, 0.4], 'der': [0.15, 0.45],
  'Groß': [0.5, 0.6], 'mutter': [0.55, 0.55],
  'ging': [0.4, 0.7], 'Wald': [0.7, 0.8],

  // English words
  'The': [0.2, 0.15], 'the': [0.22, 0.17], 'is': [0.4, 0.2],
  'capital': [0.6, 0.3], 'France': [0.65, 0.35], 'Paris': [0.67, 0.33],
  'of': [0.3, 0.25],

  // Semantic clusters
  'king': [0.8, 0.2], 'queen': [0.82, 0.18], 'prince': [0.78, 0.22],
  'dog': [0.1, 0.8], 'cat': [0.15, 0.78], 'animal': [0.12, 0.85],
  'happy': [0.9, 0.5], 'sad': [0.05, 0.5], 'joy': [0.88, 0.52],
}

// Generate a pseudo-random but consistent embedding vector
function generateEmbedding(tokenText: string, tokenId: number): number[] {
  const seed = tokenId
  const dim = MODEL_SPECS.embeddingDim
  const values: number[] = []

  // Use seeded random for consistency
  let x = seed
  for (let i = 0; i < dim; i++) {
    x = ((x * 1103515245 + 12345) & 0x7fffffff)
    // Normalize to roughly [-1, 1] range
    values.push((x / 0x7fffffff) * 2 - 1)
  }

  return values
}

// Create embeddings for all tokens
export function createEmbeddings(tokens: Token[]): EmbeddingVector[] {
  return tokens.map((token) => ({
    tokenId: token.tokenId,
    values: generateEmbedding(token.text, token.tokenId),
  }))
}

// Get 2D position for visualization
export function get2DPosition(tokenText: string, tokenId: number): [number, number] {
  if (SEMANTIC_POSITIONS[tokenText]) {
    return SEMANTIC_POSITIONS[tokenText]
  }

  // Generate consistent position based on token ID
  const x = ((tokenId * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff
  const y = ((tokenId * 214013 + 2531011) & 0x7fffffff) / 0x7fffffff

  return [x, y]
}

// Calculate cosine similarity between two embeddings
export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Famous analogy: King - Man + Woman ≈ Queen
export const FAMOUS_ANALOGY = {
  a: { word: 'King', vector: generateEmbedding('king', 1000) },
  b: { word: 'Man', vector: generateEmbedding('man', 1001) },
  c: { word: 'Woman', vector: generateEmbedding('woman', 1002) },
  result: { word: 'Queen', vector: generateEmbedding('queen', 1003) },
}

// Get nearest neighbors (simulated)
export function getNearestNeighbors(
  tokenText: string,
  tokenId: number,
  count = 5
): Array<{ word: string; similarity: number }> {
  const baseEmbedding = generateEmbedding(tokenText, tokenId)

  // Simulated neighbors based on semantic categories
  const neighbors: Array<{ word: string; similarity: number }> = []

  // Add some related words based on the token
  const relatedWords: Record<string, string[]> = {
    'king': ['queen', 'prince', 'royal', 'throne', 'crown'],
    'dog': ['cat', 'pet', 'animal', 'puppy', 'hund'],
    'Wald': ['Baum', 'Natur', 'Wald', 'grün', 'forest'],
    'mutter': ['Vater', 'Familie', 'Eltern', 'Oma', 'mother'],
    'capital': ['city', 'country', 'nation', 'government', 'Paris'],
  }

  const related = relatedWords[tokenText] || ['similar', 'related', 'word', 'token', 'text']

  related.forEach((word, i) => {
    neighbors.push({
      word,
      similarity: 0.95 - i * 0.08 + Math.random() * 0.05,
    })
  })

  return neighbors.slice(0, count).sort((a, b) => b.similarity - a.similarity)
}
