import { describe, expect, it } from 'vitest'
import type { PredictionCandidate } from '../../core/types'
import { applyTemperature, applyTopK, applyTopP, generatePredictions } from './sampling'
import { tokenize } from '../02-tokenization/tokenizer'

const BASE_PROBABILITIES = [0.4, 0.25, 0.15, 0.1, 0.05, 0.03, 0.02]

const candidatesFrom = (probabilities: number[]): PredictionCandidate[] =>
  probabilities.map((probability, index) => ({
    token: `t${index}`,
    tokenId: index,
    colorIndex: index,
    probability,
  }))

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)
const probabilitiesOf = (candidates: PredictionCandidate[]) => candidates.map((c) => c.probability)

describe('applyTemperature', () => {
  it('is one-hot on the most likely entry at temperature 0', () => {
    expect(applyTemperature(BASE_PROBABILITIES, 0)).toEqual([1, 0, 0, 0, 0, 0, 0])
  })

  it.each([0.2, 0.5, 1, 1.5, 2])('sums to 1 at temperature %s', (temperature) => {
    expect(sum(applyTemperature(BASE_PROBABILITIES, temperature))).toBeCloseTo(1, 10)
  })

  it('flattens the distribution when the temperature rises', () => {
    const cold = applyTemperature(BASE_PROBABILITIES, 0.5)
    const hot = applyTemperature(BASE_PROBABILITIES, 2)
    expect(cold[0]).toBeGreaterThan(hot[0])
  })
})

describe('applyTopK', () => {
  it.each([1, 2, 3, 5])('keeps %s candidates and sums to 1', (k) => {
    const kept = applyTopK(candidatesFrom(BASE_PROBABILITIES), k)
    expect(kept).toHaveLength(k)
    expect(sum(probabilitiesOf(kept))).toBeCloseTo(1, 10)
  })

  it('keeps the most likely candidates', () => {
    const kept = applyTopK(candidatesFrom(BASE_PROBABILITIES), 2)
    expect(kept.map((c) => c.token)).toEqual(['t0', 't1'])
  })
})

describe('applyTopP', () => {
  it('keeps the smallest prefix whose probability reaches 0.9', () => {
    const kept = applyTopP(candidatesFrom(BASE_PROBABILITIES), 0.9)
    expect(kept.map((c) => c.token)).toEqual(['t0', 't1', 't2', 't3'])
    expect(sum(probabilitiesOf(kept))).toBeCloseTo(1, 10)
  })

  it('keeps everything at top-p 1', () => {
    expect(applyTopP(candidatesFrom(BASE_PROBABILITIES), 1)).toHaveLength(BASE_PROBABILITIES.length)
  })
})

describe('generatePredictions', () => {
  const tokens = tokenize('The cat sat on the')

  it.each([
    { temperature: 0.5, topK: 50, topP: 1 },
    { temperature: 1, topK: 3, topP: 1 },
    { temperature: 1, topK: 50, topP: 0.9 },
    { temperature: 1.5, topK: 5, topP: 0.8 },
  ])('sums to 1 for %j', ({ temperature, topK, topP }) => {
    const predictions = generatePredictions(tokens, temperature, topK, topP)
    expect(predictions.length).toBeGreaterThan(0)
    expect(sum(probabilitiesOf(predictions))).toBeCloseTo(1, 10)
  })

  it('returns exactly one certain candidate at temperature 0', () => {
    const predictions = generatePredictions(tokens, 0, 50, 1)
    expect(predictions[0].probability).toBe(1)
  })
})
