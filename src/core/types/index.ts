// Core types for AI Explainer App

export interface Token {
  id: number
  text: string
  tokenId: number
  colorIndex: number
}

export interface AttentionWeight {
  queryIdx: number
  keyIdx: number
  weight: number
}

// One candidate for the next token, with a real probability from the live model.
export interface PredictionCandidate {
  token: string
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

// Model specifications (used throughout the app)
// The demo model is GPT-2 small (12 layers, 12 heads, 768 numbers per token), the same sizes as
// GPT-3 Small in Table 2.1 of https://arxiv.org/pdf/2005.14165. Every place that shows one of
// these numbers must also show modelName. Sizes of closed models are not published.
export const MODEL_SPECS = {
  modelName: 'GPT-2 small',
  embeddingDim: 768,
  layers: 12,
  headsPerLayer: 12,
} as const

// For scale only: GPT-3 175B, Table 2.1 of https://arxiv.org/pdf/2005.14165
export const LARGE_MODEL_SPECS = {
  modelName: 'GPT-3 175B',
  embeddingDim: 12_288,
  layers: 96,
} as const

// The tokenizer's vocabulary (regular tokens in o200k_base). It belongs to the tokenizer, not to the demo model.
export const TOKENIZER_SPECS = {
  name: 'o200k_base',
  vocabulary: 199_998,
  publishedFor: 'gpt-4o',
} as const

// Where the real GPT-2 small numbers in public/data come from (the Numbers and Stacking chapters).
// The test in model/gpt2Table.test.ts checks the revision against the data file.
export const GPT2_EXPORT = {
  model: 'openai-community/gpt2',
  revision: '607a30d783dfa663caf39e06633721c8d4cfcd7e',
  script: 'scripts/gpt2-export/export_gpt2.py',
  tokenFile: 'gpt2-small-embeddings.json',
  vectorFile: 'gpt2-small-embeddings.int8.bin',
  activationFile: 'demo-activations.json',
} as const

// The live model behind the token machine, Scores, Sampling and Loop (worker mode "loop", ticket P4-1).
// It is the only model in the app that reports real probabilities; it has its own token list, not o200k_base.
export const LOOP_MODEL = {
  id: 'meta-llama/llama-3.1-8b-instruct',
  name: 'Llama 3.1 8B',
  // Steps one call returns, and candidates per step (the worker accepts up to 30 and 20).
  stepsPerCall: 20,
  candidatesPerStep: 20,
} as const
