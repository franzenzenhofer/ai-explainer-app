// Pure selectors that derive tokens, embeddings, attention and predictions from the store state.
// Each derivation is memoized on its inputs so React gets a stable reference between renders.

import { tokenize } from '../model/tokenizer'
import { generateAttentionWeights } from '../model/attention'
import { illustrativeDistribution } from '../model/distribution'
import { applySampling } from '../model/sampling'
import type { AttentionWeight, PredictionCandidate, Token } from '../core/types'
import type { AppStoreState } from './appStore'

function memoizeLast<Args extends unknown[], Result>(compute: (...args: Args) => Result) {
  let lastArgs: Args | null = null
  let lastResult: Result
  return (...args: Args): Result => {
    const unchanged = lastArgs !== null
      && lastArgs.length === args.length
      && lastArgs.every((value, index) => Object.is(value, args[index]))
    if (unchanged) return lastResult
    lastResult = compute(...args)
    lastArgs = args
    return lastResult
  }
}

const tokenizeMemo = memoizeLast(tokenize)
const attentionMemo = memoizeLast(generateAttentionWeights)
const distributionMemo = memoizeLast(illustrativeDistribution)
const samplingMemo = memoizeLast((candidates: PredictionCandidate[], temperature: number, topK: number, topP: number) =>
  applySampling(candidates, { temperature, topK, topP }),
)
const generatedMemo = memoizeLast((continuation: Token[], count: number) => continuation.slice(0, count))

export const selectTokens = (state: AppStoreState): Token[] => tokenizeMemo(state.inputText)

export const selectAttentionWeights = (state: AppStoreState): AttentionWeight[] =>
  attentionMemo(selectTokens(state), state.selectedLens)

// The position the Scores chapter predicts from: the selected token, else the last one.
export const selectPredictionPosition = (state: AppStoreState): number => {
  const last = selectTokens(state).length - 1
  const selected = state.selectedTokenIndex
  return selected !== null && selected <= last ? selected : last
}

// The raw illustrative distribution, before any sampling setting.
export const selectDistribution = (state: AppStoreState): PredictionCandidate[] =>
  distributionMemo(selectTokens(state), selectPredictionPosition(state))

// The distribution after the last token, with temperature, top-k and top-p applied.
export const selectPredictions = (state: AppStoreState): PredictionCandidate[] => {
  const tokens = selectTokens(state)
  const raw = distributionMemo(tokens, tokens.length - 1)
  return samplingMemo(raw, state.temperature, state.topK, state.topP)
}

export const selectGeneratedTokens = (state: AppStoreState): Token[] =>
  generatedMemo(state.continuation, state.revealedCount)
