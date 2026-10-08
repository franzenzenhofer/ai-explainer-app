// Real GPT-2 small activations (ticket P4-3): for four sample prompts, the residual stream at the
// last position after the embedding and after each of the 12 blocks. Loaded only when Stacking opens.

import { GPT2_EXPORT } from '../core/types'

export interface Gpt2PromptToken {
  position: number
  id: number
  text: string
}

export interface Gpt2Stage {
  stage: string
  vector: number[]
}

export interface Gpt2Prompt {
  prompt: string
  tokens: Gpt2PromptToken[]
  lastPosition: number
  residualStream: Gpt2Stage[]
}

export interface Gpt2Activations {
  model: string
  revision: string
  prompts: Gpt2Prompt[]
}

export function findSamplePrompt(activations: Gpt2Activations, text: string): Gpt2Prompt | undefined {
  return activations.prompts.find((sample) => sample.prompt === text)
}

let pending: Promise<Gpt2Activations> | null = null

export function loadGpt2Activations(): Promise<Gpt2Activations> {
  pending ??= fetch(`/data/${GPT2_EXPORT.activationFile}`)
    .then((response) => {
      if (!response.ok) throw new Error(`could not load ${GPT2_EXPORT.activationFile} (HTTP ${response.status})`)
      return response.json() as Promise<Gpt2Activations>
    })
    .catch((error: unknown) => {
      pending = null
      throw error
    })
  return pending
}
