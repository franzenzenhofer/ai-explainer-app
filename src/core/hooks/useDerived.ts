// Hooks that read derived data straight from the store. There is no effect and no setter:
// the data is a pure function of the store state.

import { useAppStore } from '../../store/appStore'
import {
  selectAttentionWeights,
  selectDistribution,
  selectGeneratedTokens,
  selectPredictionPosition,
  selectPredictions,
  selectTokens,
} from '../../store/selectors'

export const useTokens = () => useAppStore(selectTokens)
export const useAttentionWeights = () => useAppStore(selectAttentionWeights)
export const usePredictions = () => useAppStore(selectPredictions)
export const useDistribution = () => useAppStore(selectDistribution)
export const usePredictionPosition = () => useAppStore(selectPredictionPosition)
export const useGeneratedTokens = () => useAppStore(selectGeneratedTokens)
