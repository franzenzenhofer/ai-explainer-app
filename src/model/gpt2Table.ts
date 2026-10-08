// Real GPT-2 small token table (ticket P4-3): int8 vectors with a per-row scale, a fixed PCA map and
// the 8 nearest neighbours, all exported offline by scripts/gpt2-export. Loaded only when a chapter opens.
// These are GPT-2's own tokens (leading-space form, e.g. " dog"), not the o200k_base tokens of the Tokens chapter.

import { GPT2_EXPORT, MODEL_SPECS } from '../core/types'

export interface Gpt2Neighbour {
  id: number
  text: string
  cosine: number
}

export interface Gpt2Token {
  id: number
  text: string
  x: number
  y: number
  neighbours: Gpt2Neighbour[]
  vectorIndex: number
  scale: number
}

export interface Gpt2TableFile {
  model: string
  revision: string
  tokenCount: number
  pca: { explainedVarianceRatio: number[] }
  vectors: { maxAbsReconstructionError: number }
  tokens: Gpt2Token[]
}

export interface MapBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface Gpt2Table {
  file: Gpt2TableFile
  rows: Int8Array
  byText: ReadonlyMap<string, Gpt2Token>
  bounds: MapBounds
}

export function buildTable(file: Gpt2TableFile, buffer: ArrayBuffer): Gpt2Table {
  const expected = file.tokens.length * MODEL_SPECS.embeddingDim
  if (buffer.byteLength !== expected) {
    throw new Error(`${GPT2_EXPORT.vectorFile} has ${buffer.byteLength} bytes, expected ${expected}`)
  }
  const xs = file.tokens.map((token) => token.x)
  const ys = file.tokens.map((token) => token.y)
  return {
    file,
    rows: new Int8Array(buffer),
    byText: new Map(file.tokens.map((token) => [token.text, token])),
    bounds: { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) },
  }
}

// value = int8 * scale; the row holds the 768 token-embedding numbers of one token.
export function tokenEmbedding(table: Gpt2Table, token: Gpt2Token): number[] {
  const start = token.vectorIndex * MODEL_SPECS.embeddingDim
  return Array.from(table.rows.subarray(start, start + MODEL_SPECS.embeddingDim), (value) => value * token.scale)
}

export function lookupToken(table: Gpt2Table, text: string): Gpt2Token | undefined {
  return table.byText.get(text)
}

async function fetchChecked(name: string): Promise<Response> {
  const response = await fetch(`/data/${name}`)
  if (!response.ok) throw new Error(`could not load ${name} (HTTP ${response.status})`)
  return response
}

let pending: Promise<Gpt2Table> | null = null

// One shared load per visit; a failed load can be retried.
export function loadGpt2Table(): Promise<Gpt2Table> {
  pending ??= Promise.all([fetchChecked(GPT2_EXPORT.tokenFile), fetchChecked(GPT2_EXPORT.vectorFile)])
    .then(async ([tokens, vectors]) => buildTable((await tokens.json()) as Gpt2TableFile, await vectors.arrayBuffer()))
    .catch((error: unknown) => {
      pending = null
      throw error
    })
  return pending
}
