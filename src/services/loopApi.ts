// The worker's loop mode (ticket P4-1): one greedy continuation of the text with the model's real top
// candidates at every step. Any failure is returned as a message for the reader; there are never invented numbers.

import { LOOP_MODEL } from '../core/types'
import { stepsFromTokens, type ContextStep, type RawLoopToken } from '../model/loopSteps'

export const WORKER_URL = 'https://ai-explainer-api.franz-enzenhofer7308.workers.dev'

const HTTP_BAD_REQUEST = 400
const HTTP_RATE_LIMITED = 429
const HTTP_NO_LOGPROBS = 501

export type LoopResult =
  | { ok: true; model: string; steps: ContextStep[] }
  | { ok: false; message: string }

interface LoopResponse {
  tokens?: RawLoopToken[]
  model?: string
  error?: string
}

function failureMessage(status: number, error: string | undefined): string {
  if (status === HTTP_RATE_LIMITED) return 'The live model allows 8 requests per minute. Wait a minute and press again.'
  if (status === HTTP_NO_LOGPROBS) {
    return `${LOOP_MODEL.name} did not report its probabilities this time, so no numbers are shown rather than invented ones. Try again later.`
  }
  if (status === HTTP_BAD_REQUEST) return `The live model rejected the text: ${error ?? 'invalid request'}.`
  return `The live model failed (${error ?? `HTTP ${status}`}).`
}

export async function requestLoop(prompt: string): Promise<LoopResult> {
  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'loop',
        prompt,
        topLogprobs: LOOP_MODEL.candidatesPerStep,
        maxTokens: LOOP_MODEL.stepsPerCall,
      }),
    })
    const data = (await response.json().catch(() => ({}))) as LoopResponse
    if (!response.ok) return { ok: false, message: failureMessage(response.status, data.error) }
    if (!data.tokens || data.tokens.length === 0 || !data.model) return { ok: false, message: 'The live model returned no tokens. Press again to retry.' }
    return { ok: true, model: data.model, steps: stepsFromTokens(prompt, data.tokens) }
  } catch (error) {
    return { ok: false, message: `The live model could not be reached (${error instanceof Error ? error.message : 'network error'}).` }
  }
}
