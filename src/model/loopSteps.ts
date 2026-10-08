// Real next-token steps from the live model (ticket P4-1). The worker returns one greedy continuation
// with the model's top candidates at every step; this turns that answer into one entry per context
// text: the visible candidates with real probabilities, the tail, and the model's own pick.

import type { PredictionCandidate } from '../core/types'

export interface RawLoopCandidate {
  text: string
  logprob: number
}

export interface RawLoopToken extends RawLoopCandidate {
  top: RawLoopCandidate[]
}

export interface LoopStep {
  // The model's most likely tokens, most likely first, special tokens left out.
  candidates: PredictionCandidate[]
  // Probability of everything that is not in the candidate list: 1 minus their sum.
  tailProbability: number
  // The token the model picked (temperature 0); null when it picked a special end token.
  pick: string | null
}

export interface ContextStep {
  // The full text the model read before this step.
  context: string
  step: LoopStep
}

const SPECIAL_TOKEN = /^<\|.*\|>$/
const STARTS_WITH_WORD_CHARACTER = /^[\p{L}\p{N}]/u
const ENDS_WITH_WHITESPACE = /\s$/u

export const isSpecialToken = (text: string): boolean => SPECIAL_TOKEN.test(text)

// The model's first token comes without its leading space: add one when the text before does not end in
// whitespace and the token starts with a letter or digit.
export function joinLeadingSpace(context: string, token: string): string {
  const needsSpace = context !== '' && !ENDS_WITH_WHITESPACE.test(context) && STARTS_WITH_WORD_CHARACTER.test(token)
  return needsSpace ? ` ${token}` : token
}

// Candidates that read the same once the space is added are one choice for the reader: their probabilities add up.
function mergeSameText(candidates: PredictionCandidate[]): PredictionCandidate[] {
  const merged = new Map<string, number>()
  for (const { token, probability } of candidates) merged.set(token, (merged.get(token) ?? 0) + probability)
  return [...merged].map(([token, probability]) => ({ token, probability })).sort((a, b) => b.probability - a.probability)
}

export function tailOf(candidates: PredictionCandidate[]): number {
  return Math.max(0, 1 - candidates.reduce((sum, candidate) => sum + candidate.probability, 0))
}

function stepFrom(raw: RawLoopToken, shape: (text: string) => string): LoopStep {
  const visible = raw.top
    .filter((candidate) => !isSpecialToken(candidate.text))
    .map((candidate) => ({ token: shape(candidate.text), probability: Math.exp(candidate.logprob) }))
  const candidates = mergeSameText(visible)
  return { candidates, tailProbability: tailOf(candidates), pick: isSpecialToken(raw.text) ? null : shape(raw.text) }
}

// One entry per step, each keyed by the text the model read at that step. The list ends after the
// first step whose pick is a special end token.
export function stepsFromTokens(prompt: string, tokens: RawLoopToken[]): ContextStep[] {
  const entries: ContextStep[] = []
  let context = prompt
  for (const [index, raw] of tokens.entries()) {
    const step = stepFrom(raw, index === 0 ? (text) => joinLeadingSpace(prompt, text) : (text) => text)
    entries.push({ context, step })
    if (step.pick === null) break
    context += step.pick
  }
  return entries
}
