// Pure selectors that derive tokens, embeddings, attention and predictions from the store state.
// Each derivation is memoized on its inputs so React gets a stable reference between renders.

import { tokenize } from '../steps/02-tokenization/tokenizer'
import { createEmbeddings } from '../steps/03-embeddings/embeddings'
import { generateAttentionWeights } from '../steps/04-attention/attention'
import { generatePredictions } from '../steps/05-prediction/sampling'
import type { AttentionWeight, EmbeddingVector, PredictionCandidate, Token } from '../core/types'
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
const embeddingsMemo = memoizeLast(createEmbeddings)
const attentionMemo = memoizeLast(generateAttentionWeights)
const predictionsMemo = memoizeLast(generatePredictions)

export const selectTokens = (state: AppStoreState): Token[] => tokenizeMemo(state.inputText)

export const selectEmbeddings = (state: AppStoreState): EmbeddingVector[] =>
  embeddingsMemo(selectTokens(state))

export const selectAttentionWeights = (state: AppStoreState): AttentionWeight[] =>
  attentionMemo(selectTokens(state), state.selectedLayer, state.selectedHead)

export const selectPredictions = (state: AppStoreState): PredictionCandidate[] =>
  predictionsMemo(selectTokens(state), state.temperature, state.topK, state.topP)
