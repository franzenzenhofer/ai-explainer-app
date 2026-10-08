// Live contract tests against the deployed worker. No mocks: a failure here means the worker is down or its contract changed.
// The worker allows 8 requests per minute per IP, so this file makes exactly two calls.

import { beforeAll, describe, expect, it } from 'vitest'
import { generateWithGemini, type GeminiResponse } from './gemini'
import { tokenize } from '../steps/02-tokenization/tokenizer'

const CONTINUATION_PROMPT = 'The capital of France is'
const QA_PROMPT = 'What is the capital of France?'
const MAX_TOKENS = 20

describe('deployed worker contract', () => {
  let continuation: GeminiResponse
  let answer: GeminiResponse

  beforeAll(async () => {
    continuation = await generateWithGemini(CONTINUATION_PROMPT, MAX_TOKENS, 'continuation')
    answer = await generateWithGemini(QA_PROMPT, MAX_TOKENS, 'qa')
  })

  it('continuation returns text and tokens without an error', () => {
    expect(continuation.error).toBeUndefined()
    expect(continuation.text.length).toBeGreaterThan(0)
    expect(continuation.tokens.length).toBeGreaterThan(0)
  })

  it('continuation tokens carry real o200k_base ids that match the text', () => {
    const expected = tokenize(continuation.text)
    expect(continuation.tokens.map((t) => t.tokenId)).toEqual(expected.map((t) => t.tokenId))
    expect(continuation.tokens.map((t) => t.text).join('')).toBe(continuation.text)
  })

  it('continuation does not echo the prompt', () => {
    expect(continuation.text.trimStart().startsWith(CONTINUATION_PROMPT)).toBe(false)
  })

  it('question and answer mode returns an answer', () => {
    expect(answer.error).toBeUndefined()
    expect(answer.text.length).toBeGreaterThan(0)
    expect(answer.tokens.length).toBeGreaterThan(0)
  })
})
