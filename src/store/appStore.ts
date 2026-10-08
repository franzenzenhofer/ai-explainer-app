// Global state (Zustand). The prompt, the sampling settings and the real model steps persist in localStorage; everything
// else lives for one visit. Derived data (tokens, attention, predictions) lives in selectors.ts.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChapterId } from '../core/chapters/types'
import type { LensId } from '../model/attention'
import { MODEL_SPECS } from '../core/types'
import type { ContextStep, LoopStep } from '../model/loopSteps'

// One short sentence (9 tokens) with a pronoun ("it") and a single noun it refers to ("dog").
export const DEFAULT_INPUT_TEXT = 'The dog barked because it was hungry.'

// The localStorage key of the saved prompt and settings (also read by the inline script in Layout.astro).
export const STORAGE_KEY = 'ai-explainer-storage-v4'

export type AttentionView = 'arcs' | 'grid'
export type FeedForwardView = 'alone' | 'withAttention'
export type FetchStatus = 'idle' | 'fetching' | 'error'

// Most calls to the live model one visit may make (plan section 7, risk 3). One call returns up to 20 steps.
export const VISIT_CALL_BUDGET = 12
export const MIN_SPEED = 0.25
export const MAX_SPEED = 3

export interface AppStoreState {
  chapterId: ChapterId | null
  setChapterId: (id: ChapterId) => void

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

  // Every real step fetched so far, keyed by the text the model read. Survives a change of prompt: the
  // model is deterministic (temperature 0), so a known text never needs a second call.
  loopSteps: Record<string, LoopStep>
  // The pieces added to the prompt by the loop, in order: the model's picks or the reader's own choices.
  appended: string[]
  fetchStatus: FetchStatus
  fetchError: string | null
  apiCallsUsed: number
  isPlaying: boolean
  generationSpeed: number
  startFetch: () => void
  storeSteps: (entries: ContextStep[]) => void
  failFetch: (message: string) => void
  appendPiece: (piece: string) => void
  replaceLastPiece: (piece: string) => void
  setIsPlaying: (playing: boolean) => void
  setGenerationSpeed: (speed: number) => void
  resetGeneration: () => void

  debugMode: boolean
  toggleDebugMode: () => void

  // Back to the example sentence and the default settings (the menu's "Start over").
  resetAll: () => void
}

const generationInitial = {
  appended: [] as string[],
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
      setChapterId: (chapterId) => set((s) => ({ chapterId, ...(s.fetchStatus === 'error' ? { fetchStatus: 'idle' as FetchStatus, fetchError: null } : {}) })),

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
      loopSteps: {},
      startFetch: () => set((s) => ({ fetchStatus: 'fetching', fetchError: null, apiCallsUsed: s.apiCallsUsed + 1 })),
      storeSteps: (entries) =>
        set((s) => ({
          fetchStatus: 'idle',
          loopSteps: { ...s.loopSteps, ...Object.fromEntries(entries.map((entry) => [entry.context, entry.step])) },
        })),
      failFetch: (fetchError) => set({ fetchStatus: 'error', fetchError, isPlaying: false }),
      appendPiece: (piece) => set((s) => ({ appended: [...s.appended, piece] })),
      replaceLastPiece: (piece) => set((s) => ({ appended: [...s.appended.slice(0, -1), piece] })),
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      setGenerationSpeed: (generationSpeed) => set({ generationSpeed }),
      resetGeneration: () => set(generationInitial),

      debugMode: false,
      toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),

      resetAll: () => set({ ...settingsInitial, ...generationInitial }),
    }),
    {
      name: STORAGE_KEY,
      // The page renders on the server with the defaults; App rehydrates after mount so hydration matches.
      skipHydration: true,
      // The real steps are kept too, so a reload or a deep link shows the model's answer for a known text
      // again without a new live call (the worker allows few calls per minute and has a monthly cap).
      partialize: (state) => ({
        loopSteps: state.loopSteps,
        inputText: state.inputText,
        temperature: state.temperature,
        topK: state.topK,
        topP: state.topP,
      }),
    },
  ),
)
