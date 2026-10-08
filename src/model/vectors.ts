// Simulated vectors for the Numbers, Feed-forward and Layers chapters. The arithmetic is real
// (adding, matrix products, the clip at zero); the numbers are seeded pseudo-random, not GPT-2's.

import type { EmbeddingVector, Token } from '../core/types'
import { MODEL_SPECS } from '../core/types'

const LCG_MULTIPLIER = 1103515245
const LCG_INCREMENT = 12345
const LCG_MODULUS = 0x7fffffff

// Seeded values in [-1, 1).
export function seededValues(seed: number, length: number): number[] {
  const values: number[] = []
  let x = Math.abs(Math.floor(seed)) % LCG_MODULUS
  for (let i = 0; i < length; i++) {
    x = (x * LCG_MULTIPLIER + LCG_INCREMENT) & LCG_MODULUS
    values.push((x / LCG_MODULUS) * 2 - 1)
  }
  return values
}

export function tokenVector(tokenId: number, length: number = MODEL_SPECS.embeddingDim): number[] {
  return seededValues(tokenId + 1, length)
}

const POSITION_SEED = 900_001
const POSITION_SCALE = 0.3

export function positionVector(position: number, length: number): number[] {
  return seededValues(POSITION_SEED + position * 97, length).map((value) => value * POSITION_SCALE)
}

export function addVectors(a: number[], b: number[]): number[] {
  return a.map((value, i) => value + b[i])
}

export function createEmbeddings(tokens: Token[]): EmbeddingVector[] {
  return tokens.map((token) => ({ tokenId: token.tokenId, values: tokenVector(token.tokenId) }))
}

// --- Feed-forward step: x + W2 * max(0, W1 * x), the same weights for every position ---

const FFN_HIDDEN_FACTOR = 4
const FFN_SEED = 424_242
const FFN_OUTPUT_SCALE = 3.5

function matrix(seed: number, rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, (_, r) => seededValues(seed + r * 131, cols))
}

function multiply(m: number[][], v: number[]): number[] {
  return m.map((row) => row.reduce((sum, weight, i) => sum + weight * v[i], 0))
}

export function feedForward(x: number[], blockSeed = 0): number[] {
  const hidden = x.length * FFN_HIDDEN_FACTOR
  const w1 = matrix(FFN_SEED + blockSeed, hidden, x.length)
  const w2 = matrix(FFN_SEED + blockSeed + 7, x.length, hidden)
  const clipped = multiply(w1, x).map((value) => Math.max(0, value))
  const out = multiply(w2, clipped).map((value) => (value * FFN_OUTPUT_SCALE) / hidden)
  return addVectors(x, out)
}

// --- Residual stream: one running vector per position, every block adds to it ---

const ATTENTION_SCALE = 0.25

// The last position's vector after each block: entry 0 is token plus position, entry b is after block b.
export function residualStream(tokens: Token[], blocks: number, length: number): number[][] {
  const last = tokens.length - 1
  if (last < 0) return []
  const start = addVectors(tokenVector(tokens[last].tokenId, length), positionVector(last, length))
  const contextSeed = tokens.reduce((sum, token) => sum + token.tokenId, 0)
  const stream = [start]
  for (let block = 1; block <= blocks; block++) {
    const previous = stream[block - 1]
    const attentionDelta = seededValues(contextSeed + block * 7919, length).map((v) => v * ATTENTION_SCALE)
    stream.push(feedForward(addVectors(previous, attentionDelta), block))
  }
  return stream
}
