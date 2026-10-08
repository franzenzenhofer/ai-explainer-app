// Global state (Zustand). The prompt and the sampling settings persist in localStorage; everything
// else lives for one visit. Derived data (tokens, attention, predictions) lives in selectors.ts.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChapterId } from '../core/chapters/types'
import type { LensId } from '../model/attention'
import type { Token } from '../core/types'
import { MODEL_SPECS } from '../core/types'

// One short sentence (9 tokens) with a pronoun ("it") and a single noun it refers to ("dog").
export const DEFAULT_INPUT_TEXT = 'The dog barked because it was hungry.'

export type AttentionView = 'arcs' | 'grid'
export type FeedForwardView = 'alone' | 'withAttention'
export type FetchStatus = 'idle' | 'fetching' | 'error'

// Most calls to the live model one visit may make from the token machine (plan section 7, risk 3).
export const VISIT_CALL_BUDGET = 12
export const MIN_SPEED = 0.25
export const MAX_SPEED = 3

export interface AppStoreState {
  chapterId: ChapterId | null
  setChapterId: (id: ChapterId) => void
  openDrawers: Partial<Record<ChapterId, boolean>>
  toggleDrawer: (id: ChapterId) => void
  closeDrawer: (id: ChapterId) => void

  inputText: string
  setInputText: (text: string) => void
  selectedTokenIndex: number | null
  setSelectedTokenIndex: (index: number | null) => void

  selectedLens: LensId
  setSelectedLens: (lens: LensId) => void
  attentionView: AttentionView
  setAttentionView: (view: AttentionView) => void
  feedForwardView: FeedForwardView
  setFeedForwardView: (view: FeedForwardView) => void
  feedForwardRuns: number
  runFeedForward: () => void
  selectedBlock: number
  setSelectedBlock: (block: number) => void

  temperature: number
  setTemperature: (temp: number) => void
  topK: number
  setTopK: (k: number) => void
  topP: number
  setTopP: (p: number) => void

  continuation: Token[]
  revealedCount: number
  fetchStatus: FetchStatus
  fetchError: string | null
  apiCallsUsed: number
  isPlaying: boolean
  generationSpeed: number
  startFetch: () => void
  finishFetch: (tokens: Token[]) => void
  failFetch: (message: string) => void
  revealNext: () => void
  setIsPlaying: (playing: boolean) => void
  setGenerationSpeed: (speed: number) => void
  resetGeneration: () => void

  debugMode: boolean
  toggleDebugMode: () => void

  // Back to the example sentence and the default settings (the menu's "Start over").
  resetAll: () => void
}

const generationInitial = {
  continuation: [] as Token[],
  revealedCount: 0,
  fetchStatus: 'idle' as FetchStatus,
  fetchError: null as string | null,
  isPlaying: false,
}

const settingsInitial = {
  inputText: DEFAULT_INPUT_TEXT,
  selectedTokenIndex: null as number | null,
  selectedLens: 'pronoun' as LensId,
  attentionView: 'arcs' as AttentionView,
  feedForwardView: 'alone' as FeedForwardView,
  feedForwardRuns: 0,
  selectedBlock: 0,
  temperature: 1.0,
  topK: 40,
  topP: 0.9,
}

const clampBlock = (block: number) => Math.max(0, Math.min(MODEL_SPECS.layers, block))

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      chapterId: null,
      setChapterId: (chapterId) => set({ chapterId }),
      openDrawers: {},
      toggleDrawer: (id) => set((s) => ({ openDrawers: { ...s.openDrawers, [id]: !s.openDrawers[id] } })),
      closeDrawer: (id) => set((s) => ({ openDrawers: { ...s.openDrawers, [id]: false } })),

      inputText: DEFAULT_INPUT_TEXT,
      setInputText: (inputText) => set({ inputText, selectedTokenIndex: null, feedForwardRuns: 0, ...generationInitial }),
      selectedTokenIndex: null,
      setSelectedTokenIndex: (selectedTokenIndex) => set({ selectedTokenIndex }),

      selectedLens: 'pronoun',
      setSelectedLens: (selectedLens) => set({ selectedLens }),
      attentionView: 'arcs',
      setAttentionView: (attentionView) => set({ attentionView }),
      feedForwardView: 'alone',
      setFeedForwardView: (feedForwardView) => set({ feedForwardView }),
      feedForwardRuns: 0,
      runFeedForward: () => set((s) => ({ feedForwardRuns: s.feedForwardRuns + 1 })),
      selectedBlock: 0,
      setSelectedBlock: (block) => set({ selectedBlock: clampBlock(block) }),

      temperature: 1.0,
      setTemperature: (temperature) => set({ temperature }),
      topK: 40,
      setTopK: (topK) => set({ topK }),
      topP: 0.9,
      setTopP: (topP) => set({ topP }),

      ...generationInitial,
      apiCallsUsed: 0,
      generationSpeed: 1,
      startFetch: () => set((s) => ({ fetchStatus: 'fetching', fetchError: null, apiCallsUsed: s.apiCallsUsed + 1 })),
      finishFetch: (tokens) => set((s) => ({ fetchStatus: 'idle', continuation: [...s.continuation, ...tokens] })),
      failFetch: (fetchError) => set({ fetchStatus: 'error', fetchError, isPlaying: false }),
      revealNext: () => set((s) => ({ revealedCount: Math.min(s.continuation.length, s.revealedCount + 1) })),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setGenerationSpeed: (generationSpeed) => set({ generationSpeed }),
      resetGeneration: () => set(generationInitial),

      debugMode: false,
      toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),

      resetAll: () => set({ ...settingsInitial, ...generationInitial, openDrawers: {} }),
    }),
    {
      name: 'ai-explainer-storage-v4', // v4: chapters replace steps; top-k default fits the illustrative list
      // The page renders on the server with the defaults; App rehydrates after mount so hydration matches.
      skipHydration: true,
      partialize: (state) => ({
        inputText: state.inputText,
        temperature: state.temperature,
        topK: state.topK,
        topP: state.topP,
      }),
    },
  ),
)
