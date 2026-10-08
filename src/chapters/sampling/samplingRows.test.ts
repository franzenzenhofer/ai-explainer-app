import { describe, expect, it } from 'vitest'
import type { PredictionCandidate } from '../../core/types'
import { applySampling } from '../../model/sampling'
import { samplingRows } from './samplingRows'

// The shape of a real step: 20 candidates, most likely first, summing to a little under 1.
const raw: PredictionCandidate[] = Array.from({ length: 20 }, (_, index) => ({
  token: ` token${index}`,
  probability: 0.6 * 0.7 ** index * 0.3 + (index === 0 ? 0.3 : 0),
}))

describe('samplingRows', () => {
  it('keeps exactly k rows with top-k and marks the rest as cut', () => {
    const kept = applySampling(raw, { temperature: 1, topK: 5, topP: 1 })
    const rows = samplingRows(raw, kept, 20)
    expect(rows).toHaveLength(20)
    expect(rows.filter((row) => row.keptProbability !== null)).toHaveLength(5)
    expect(rows.slice(0, 5).every((row) => row.keptProbability !== null)).toBe(true)
  })

  it('keeps only the top token at temperature 0', () => {
    const kept = applySampling(raw, { temperature: 0, topK: 40, topP: 0.9 })
    const rows = samplingRows(raw, kept, 20)
    expect(rows[0].keptProbability).toBe(1)
    expect(rows.slice(1).every((row) => row.keptProbability === null)).toBe(true)
  })

  it('keeps everything with wide settings, and kept probabilities sum to 1 over the full list', () => {
    const kept = applySampling(raw, { temperature: 1, topK: raw.length, topP: 1 })
    const rows = samplingRows(raw, kept, raw.length)
    expect(rows.every((row) => row.keptProbability !== null)).toBe(true)
    const total = rows.reduce((sum, row) => sum + (row.keptProbability ?? 0), 0)
    expect(total).toBeCloseTo(1, 10)
  })
})
