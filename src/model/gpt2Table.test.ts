import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { GPT2_EXPORT, MODEL_SPECS } from '../core/types'
import { buildTable, lookupToken, tokenEmbedding, type Gpt2TableFile } from './gpt2Table'
import type { Gpt2Activations } from './gpt2Activations'

const DATA_DIR = join(process.cwd(), 'public', 'data')
const file = JSON.parse(readFileSync(join(DATA_DIR, GPT2_EXPORT.tokenFile), 'utf8')) as Gpt2TableFile
const bytes = readFileSync(join(DATA_DIR, GPT2_EXPORT.vectorFile))
const table = buildTable(file, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))

// First six float32 values of wte rows, read straight from openai-community/gpt2 at the pinned revision
// (see scripts/gpt2-export), printed with 6 significant digits.
const FLOAT_REFERENCE: Record<string, number[]> = {
  ' king': [-0.0194672, -0.117483, 0.08895, 0.0726687, 0.164846, -0.0111544],
  ' dog': [0.0944053, -0.0771487, 0.0346975, -0.0351389, -0.0892086, 0.0924043],
  ' Paris': [-0.219479, 0.0422471, 0.120794, -0.259524, 0.0277781, -0.0512252],
}

describe('GPT-2 small token table (real export)', () => {
  it('has the pinned model revision and the sizes the app states', () => {
    expect(file.model).toBe(GPT2_EXPORT.model)
    expect(file.revision).toBe(GPT2_EXPORT.revision)
    expect(file.tokens).toHaveLength(file.tokenCount)
    expect(bytes.byteLength).toBe(file.tokenCount * MODEL_SPECS.embeddingDim)
  })

  it('fails loudly when the vector file does not match the token list', () => {
    expect(() => buildTable(file, new ArrayBuffer(10))).toThrow(/expected/)
  })

  it.each(Object.entries(FLOAT_REFERENCE))('dequantizes %s to within the export error of the float32 values', (text, reference) => {
    const entry = lookupToken(table, text)
    expect(entry).toBeDefined()
    if (!entry) return
    const vector = tokenEmbedding(table, entry)
    expect(vector).toHaveLength(MODEL_SPECS.embeddingDim)
    reference.forEach((expected, index) => {
      expect(Math.abs(vector[index] - expected)).toBeLessThanOrEqual(file.vectors.maxAbsReconstructionError)
      expect(Math.abs(vector[index] - expected)).toBeLessThanOrEqual(entry.scale / 2 + 1e-6)
    })
  })

  it('decodes as int8 times the row scale', () => {
    const entry = lookupToken(table, ' dog')
    if (!entry) throw new Error('missing " dog"')
    const raw = new Int8Array(bytes.buffer, bytes.byteOffset + entry.vectorIndex * MODEL_SPECS.embeddingDim, 3)
    expect(tokenEmbedding(table, entry).slice(0, 3)).toEqual(Array.from(raw, (value) => value * entry.scale))
  })

  it('looks tokens up by their leading-space text and knows nothing about tokens outside the set', () => {
    expect(lookupToken(table, ' dog')?.id).toBe(3290)
    expect(lookupToken(table, 'The')).toBeUndefined()
    expect(lookupToken(table, 'Großmutter')).toBeUndefined()
  })

  it('gives every token 8 neighbours that are in the set, and a map position', () => {
    for (const token of file.tokens) {
      expect(token.neighbours).toHaveLength(8)
      expect(Number.isFinite(token.x) && Number.isFinite(token.y)).toBe(true)
    }
    const dog = lookupToken(table, ' dog')
    expect(dog?.neighbours.every((n) => lookupToken(table, n.text))).toBe(true)
  })
})

describe('GPT-2 small activations (real export)', () => {
  const activations = JSON.parse(readFileSync(join(DATA_DIR, GPT2_EXPORT.activationFile), 'utf8')) as Gpt2Activations

  it('has the pinned revision, four prompts, and 13 vectors of 768 numbers each', () => {
    expect(activations.revision).toBe(GPT2_EXPORT.revision)
    expect(activations.prompts.map((p) => p.prompt)).toEqual([
      'The dog barked because it was hungry.',
      'The capital of France is',
      'Once upon a time there was a',
      '2 + 2 =',
    ])
    for (const prompt of activations.prompts) {
      expect(prompt.residualStream).toHaveLength(MODEL_SPECS.layers + 1)
      for (const stage of prompt.residualStream) expect(stage.vector).toHaveLength(MODEL_SPECS.embeddingDim)
    }
  })
})
