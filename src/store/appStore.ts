// Global state management with Zustand

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Token, EmbeddingVector, AttentionWeight, PredictionCandidate } from '../core/types'

interface AppState {
  // Current step (0-6)
  currentStep: number
  setCurrentStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  // Input text
  inputText: string
  setInputText: (text: string) => void

  // Tokenization results
  tokens: Token[]
  setTokens: (tokens: Token[]) => void

  // Embeddings
  embeddings: EmbeddingVector[]
  setEmbeddings: (embeddings: EmbeddingVector[]) => void
  selectedTokenForEmbedding: number | null
  setSelectedTokenForEmbedding: (idx: number | null) => void

  // Attention
  attentionWeights: AttentionWeight[][]
  setAttentionWeights: (weights: AttentionWeight[][]) => void
  selectedLayer: number
  setSelectedLayer: (layer: number) => void
  selectedHead: number
  setSelectedHead: (head: number) => void
  selectedQueryToken: number | null
  setSelectedQueryToken: (idx: number | null) => void

  // Prediction
  predictions: PredictionCandidate[]
  setPredictions: (predictions: PredictionCandidate[]) => void
  temperature: number
  setTemperature: (temp: number) => void
  topK: number
  setTopK: (k: number) => void
  topP: number
  setTopP: (p: number) => void

  // Generation
  generatedTokens: Token[]
  setGeneratedTokens: (tokens: Token[]) => void
  addGeneratedToken: (token: Token) => void
  clearGeneratedTokens: () => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  generationSpeed: number
  setGenerationSpeed: (speed: number) => void

  // Debug mode
  debugMode: boolean
  toggleDebugMode: () => void

  // Reset state
  reset: () => void
}

const TOTAL_STEPS = 8

// Default example text showcasing tokenization with long words, punctuation, German & English
const DEFAULT_INPUT_TEXT = 'Künstliche Intelligenz (AI) revolutioniert unsere Weltanschauung! The Donaudampfschifffahrtsgesellschaftskapitän said: "Transformation, Innovation, Kommunikation - these extraordinary words demonstrate how tokenization works!" Außergewöhnlich, oder?'

const initialState = {
  currentStep: 0,
  inputText: DEFAULT_INPUT_TEXT,
  tokens: [],
  embeddings: [],
  selectedTokenForEmbedding: null,
  attentionWeights: [],
  selectedLayer: 0,
  selectedHead: 0,
  selectedQueryToken: null,
  predictions: [],
  temperature: 1.0,
  topK: 50,
  topP: 0.9,
  generatedTokens: [],
  isGenerating: false,
  generationSpeed: 0.5,
  debugMode: false,
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,

        // Step navigation
        setCurrentStep: (step) => set({ currentStep: Math.max(0, Math.min(TOTAL_STEPS - 1, step)) }),
        nextStep: () => set((state) => ({
          currentStep: Math.min(TOTAL_STEPS - 1, state.currentStep + 1)
        })),
        prevStep: () => set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1)
        })),

        // Input
        setInputText: (inputText) => set({ inputText }),

        // Tokenization
        setTokens: (tokens) => set({ tokens }),

        // Embeddings
        setEmbeddings: (embeddings) => set({ embeddings }),
        setSelectedTokenForEmbedding: (selectedTokenForEmbedding) => set({ selectedTokenForEmbedding }),

        // Attention
        setAttentionWeights: (attentionWeights) => set({ attentionWeights }),
        setSelectedLayer: (selectedLayer) => set({ selectedLayer }),
        setSelectedHead: (selectedHead) => set({ selectedHead }),
        setSelectedQueryToken: (selectedQueryToken) => set({ selectedQueryToken }),

        // Prediction
        setPredictions: (predictions) => set({ predictions }),
        setTemperature: (temperature) => set({ temperature }),
        setTopK: (topK) => set({ topK }),
        setTopP: (topP) => set({ topP }),

        // Generation
        setGeneratedTokens: (generatedTokens) => set({ generatedTokens }),
        addGeneratedToken: (token) => set((state) => ({
          generatedTokens: [...state.generatedTokens, token]
        })),
        clearGeneratedTokens: () => set({ generatedTokens: [] }),
        setIsGenerating: (isGenerating) => set({ isGenerating }),
        setGenerationSpeed: (generationSpeed) => set({ generationSpeed }),

        // Debug
        toggleDebugMode: () => set((state) => ({ debugMode: !state.debugMode })),

        // Reset
        reset: () => set(initialState),
      }),
      {
        name: 'ai-explainer-storage-v2', // v2: invalidate old cached text with typos
        partialize: (state) => ({
          inputText: state.inputText,
          debugMode: state.debugMode,
          temperature: state.temperature,
          topK: state.topK,
          topP: state.topP,
        }),
      }
    ),
    { name: 'AI-Explainer' }
  )
)
