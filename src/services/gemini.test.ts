// Live contract test against the deployed worker's question and answer mode. No mocks: a failure
// here means the worker is down or its contract changed. Makes exactly one call.

import { beforeAll, describe, expect, it } from 'vitest'
import { generateWithGemini, type GeminiResponse } from './gemini'
import { tokenize } from '../model/tokenizer'

const QA_PROMPT = 'What is the capital of France?'
const MAX_TOKENS = 20

describe('deployed worker, question and answer', () => {
  let answer: GeminiResponse

  beforeAll(async () => {
    answer = await generateWithGemini(QA_PROMPT, MAX_TOKENS)
  })

  it('returns an answer without an error', () => {
    expect(answer.error).toBeUndefined()
    expect(answer.text.length).toBeGreaterThan(0)
    expect(answer.tokens.length).toBeGreaterThan(0)
  })

  it('carries real o200k_base ids that match the text', () => {
    expect(answer.tokens.map((t) => t.tokenId)).toEqual(tokenize(answer.text).map((t) => t.tokenId))
    expect(answer.tokens.map((t) => t.text).join('')).toBe(answer.text)
  })
})
