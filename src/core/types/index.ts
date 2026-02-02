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

// GPT-5 specifications (used throughout the app)
export const GPT5_SPECS = {
  vocabulary: 200_000,
  embeddingDim: 4096,
  layers: 96,
  headsPerLayer: 96,
  contextInput: 272_000,
  contextOutput: 128_000,
  tokenizerName: 'o200k_base',
} as const
