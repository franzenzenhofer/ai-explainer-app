// Illustrative next-token distribution (Simulated). A real model gives each of the about 200,000
// tokens a probability; this demo gives one to a fixed list of candidates and orders them by a
// simple rule about the last token, so the list changes with the context. It is not a model.

import type { PredictionCandidate, Token } from '../core/types'
import { tokenize } from './tokenizer'
import { ENGLISH_POOLS, GERMAN_POOLS, looksGerman, type CandidatePools } from './vocabulary'

const ZIPF_EXPONENT = 1.1
const ZIPF_OFFSET = 1.5
const GROUP_LIFT = 4
const SENTENCE_END = /[.!?]$/
const DETERMINERS = new Set(['the', 'a', 'an', 'his', 'her', 'my', 'your', 'der', 'die', 'das', 'ein', 'eine', 'den', 'dem'])

type Group = keyof CandidatePools

function favouredGroup(lastText: string): Group {
  const last = lastText.trim().toLowerCase()
  if (last === '' || SENTENCE_END.test(last)) return 'starters'
  if (DETERMINERS.has(last)) return 'nouns'
  return 'functionWords'
}

// Deterministic jitter in [0, 1) from a seed, so the same context always gives the same list.
function jitter(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function rankedCandidates(pools: CandidatePools, favoured: Group, seed: number): string[] {
  const groups = Object.keys(pools) as Group[]
  const scored = groups.flatMap((group) =>
    pools[group].map((text, index) => ({
      text,
      score: (group === favoured ? GROUP_LIFT : 0) + jitter(seed + index * 7 + group.length) * 2 - index * 0.05,
    })),
  )
  return scored.sort((a, b) => b.score - a.score).map((entry) => entry.text)
}

function toCandidate(text: string, probability: number): PredictionCandidate {
  const [first] = tokenize(text)
  return { token: text, tokenId: first.tokenId, colorIndex: first.colorIndex, probability }
}

// Probabilities sum to 1 and are sorted from most to least likely.
export function illustrativeDistribution(tokens: Token[], position: number): PredictionCandidate[] {
  const context = tokens.slice(0, position + 1)
  const contextText = context.map((token) => token.text).join('')
  const pools = looksGerman(contextText) ? GERMAN_POOLS : ENGLISH_POOLS
  const last = context[context.length - 1]
  const seed = (last?.tokenId ?? 0) + context.length * 31
  const ranked = rankedCandidates(pools, favouredGroup(last?.text ?? ''), seed)
  const weights = ranked.map((_, rank) => 1 / Math.pow(rank + ZIPF_OFFSET, ZIPF_EXPONENT))
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  return ranked.map((text, rank) => toCandidate(text, weights[rank] / total))
}

export interface TopAndTail {
  top: PredictionCandidate[]
  // Probability of every candidate outside the top list together: 1 minus the sum of the top list.
  tailProbability: number
}

export function splitTopAndTail(candidates: PredictionCandidate[], size: number): TopAndTail {
  const sorted = [...candidates].sort((a, b) => b.probability - a.probability)
  const top = sorted.slice(0, size)
  const topSum = top.reduce((sum, candidate) => sum + candidate.probability, 0)
  return { top, tailProbability: Math.max(0, 1 - topSum) }
}
