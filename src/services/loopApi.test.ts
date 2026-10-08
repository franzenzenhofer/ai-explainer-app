// Live contract test against the deployed worker's loop mode. No mocks. Makes exactly one call
// (the worker allows 8 requests per minute per IP and the key has a monthly cap).

import { beforeAll, describe, expect, it } from 'vitest'
import { LOOP_MODEL } from '../core/types'
import { isSpecialToken } from '../model/loopSteps'
import { requestLoop, WORKER_URL, type LoopResult } from './loopApi'

const PROMPT = 'The capital of France is'

describe('deployed worker, mode loop', () => {
  let result: LoopResult

  beforeAll(async () => {
    result = await requestLoop(PROMPT)
  })

  it('answers with real steps from the pinned model', () => {
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.model).toBe(LOOP_MODEL.id)
    expect(result.steps.length).toBeGreaterThan(1)
    expect(result.steps[0].context).toBe(PROMPT)
  })

  it('gives each step up to 20 real candidates that are sorted, visible and sum to at most 1', () => {
    if (!result.ok) throw new Error(result.message)
    for (const { step } of result.steps) {
      expect(step.candidates.length).toBeGreaterThan(0)
      expect(step.candidates.length).toBeLessThanOrEqual(LOOP_MODEL.candidatesPerStep)
      expect(step.candidates.some((candidate) => isSpecialToken(candidate.token))).toBe(false)
      const probabilities = step.candidates.map((candidate) => candidate.probability)
      expect(probabilities).toEqual([...probabilities].sort((a, b) => b - a))
      expect(probabilities.reduce((sum, p) => sum + p, 0) + step.tailProbability).toBeCloseTo(1, 9)
    }
  })

  it('chains the contexts: each step reads the prompt plus the earlier picks, and the pick is the top candidate', () => {
    if (!result.ok) throw new Error(result.message)
    let context = PROMPT
    for (const entry of result.steps) {
      expect(entry.context).toBe(context)
      if (entry.step.pick === null) break
      expect(entry.step.pick).toBe(entry.step.candidates[0].token)
      context += entry.step.pick
    }
  })

  it('puts a space between the prompt and its first token', () => {
    if (!result.ok) throw new Error(result.message)
    expect(result.steps[0].step.pick).toMatch(/^ \S/)
  })
})

describe('worker errors', () => {
  it('rejects an invalid request with HTTP 400 (no model call is made)', async () => {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'loop', prompt: PROMPT, topLogprobs: 99 }),
    })
    expect(response.status).toBe(400)
  })
})
