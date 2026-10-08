// The token machine's live loop, shared by Home and Loop. One call to the real model returns a
// continuation; every pick reveals its next token. The page never pretends a pick is a new call.

import { useCallback } from 'react'
import { useAppStore, VISIT_CALL_BUDGET, type AppStoreState } from '../../store/appStore'
import { generateWithGemini } from '../../services/gemini'

// Most tokens one continuation may have (the worker's maxTokens).
export const MAX_CONTINUATION_TOKENS = 30

export type GenerationPhase = 'empty' | 'fetching' | 'showing' | 'limit' | 'error'

export function generationPhase(state: Pick<AppStoreState, 'fetchStatus' | 'revealedCount' | 'continuation'>): GenerationPhase {
  if (state.fetchStatus === 'fetching') return 'fetching'
  if (state.fetchStatus === 'error') return 'error'
  if (state.revealedCount === 0) return 'empty'
  const exhausted = state.revealedCount >= state.continuation.length
  return exhausted ? 'limit' : 'showing'
}

async function fetchContinuation() {
  const store = useAppStore.getState()
  if (store.apiCallsUsed >= VISIT_CALL_BUDGET) {
    store.failFetch(`this visit has used its ${VISIT_CALL_BUDGET} calls to the live model. Reload the page to start again.`)
    return
  }
  const prompt = store.inputText
  store.startFetch()
  const result = await generateWithGemini(prompt, MAX_CONTINUATION_TOKENS, 'continuation')
  const after = useAppStore.getState()
  if (after.inputText !== prompt) return
  if (result.error) return after.failFetch(result.error)
  if (result.tokens.length === 0) return after.failFetch('the model returned no continuation. Press again to retry.')
  after.finishFetch(result.tokens)
  after.revealNext()
}

export function useGeneration() {
  const pickNext = useCallback(async () => {
    const store = useAppStore.getState()
    const phase = generationPhase(store)
    if (phase === 'fetching' || phase === 'limit') return
    if (store.revealedCount < store.continuation.length) {
      store.revealNext()
      return
    }
    await fetchContinuation()
  }, [])

  const reset = useCallback(() => useAppStore.getState().resetGeneration(), [])
  return { pickNext, reset }
}
