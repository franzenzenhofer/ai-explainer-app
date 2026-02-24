// Core types for AI Explainer App

export interface Token {
  id: number
  text: string
  tokenId: number
  colorIndex: number
}

export interface EmbeddingVector {
  tokenId: number
  values: number[]
}

export interface AttentionWeight {
  queryIdx: number
  keyIdx: number
  weight: number
}

export interface PredictionCandidate {
  token: string
  tokenId: number
  colorIndex: number  // For consistent colors - same token = same color everywhere
  probability: number
}

export interface EducationalContent {
  what: string
  how: string
  why: string
}

export interface StepConfig {
  id: string
  title: string
  subtitle: string
  accentColor: string
  educational: EducationalContent
}

export type StepId =
  | 'intro'
  | 'input'
  | 'tokenization'
  | 'embeddings'
  | 'attention'
  | 'prediction'
  | 'generation'
  | 'understanding'

export interface AppState {
  // Current step
  currentStep: number

  // Input
  inputText: string

  // Tokenization
  tokens: Token[]

  // Embeddings
  embeddings: EmbeddingVector[]
  selectedTokenForEmbedding: number | null

  // Attention
  attentionWeights: AttentionWeight[][]
  selectedLayer: number
  selectedHead: number
  selectedQueryToken: number | null

  // Prediction
  predictions: PredictionCandidate[]
  temperature: number
  topK: number
  topP: number

  // Generation
  generatedTokens: Token[]
  isGenerating: boolean
  generationSpeed: number

  // Debug
  debugMode: boolean
}

// Model specifications (used throughout the app)
export const MODEL_SPECS = {
  vocabulary: 200_000,
  embeddingDim: 4096,
  layers: 12,
  headsPerLayer: 12,
  tokenizerName: 'o200k_base',
} as const
