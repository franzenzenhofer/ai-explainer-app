// Hooks that read derived data (tokens, embeddings, attention, predictions) straight from the store.
// There is no effect and no setter: the data is a pure function of the store state.

import { useAppStore } from '../../store/appStore'
import {
  selectAttentionWeights,
  selectEmbeddings,
  selectPredictions,
  selectTokens,
} from '../../store/selectors'

export const useTokens = () => useAppStore(selectTokens)
export const useEmbeddings = () => useAppStore(selectEmbeddings)
export const useAttentionWeights = () => useAppStore(selectAttentionWeights)
export const usePredictions = () => useAppStore(selectPredictions)
