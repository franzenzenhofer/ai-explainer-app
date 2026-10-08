// Pure selectors that derive tokens and attention from the store state.
// Each derivation is memoized on its inputs so React gets a stable reference between renders.

import { tokenize } from '../model/tokenizer'
import { generateAttentionWeights } from '../model/attention'
import type { AttentionWeight, Token } from '../core/types'
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

export const selectTokens = (state: AppStoreState): Token[] => tokenizeMemo(state.inputText)

export const selectAttentionWeights = (state: AppStoreState): AttentionWeight[] =>
  attentionMemo(selectTokens(state), state.selectedLens)

// The position the Scores chapter predicts from: the selected token, else the last one.
export const selectPredictionPosition = (state: AppStoreState): number => {
  const last = selectTokens(state).length - 1
  const selected = state.selectedTokenIndex
  return selected !== null && selected <= last ? selected : last
}
