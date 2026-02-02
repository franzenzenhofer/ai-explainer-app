// Gemini API Service - Real AI generation via secure Cloudflare Worker
// API key is stored securely server-side, never exposed to frontend

import { tokenize } from '../steps/02-tokenization/tokenizer'

const API_ENDPOINT = 'https://ai-explainer-api.franz-enzenhofer7308.workers.dev'

export interface GeminiResponse {
  text: string
  tokens: string[]
  error?: string
}

// Generate text continuation using secure API
// Then tokenize with REAL tiktoken tokenizer
export async function generateWithGemini(
  prompt: string,
  maxTokens: number = 30
): Promise<GeminiResponse> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        maxTokens,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API error:', errorData)
      return {
        text: '',
        tokens: [],
        error: (errorData as any).error || `API error: ${response.status}`,
      }
    }

    const data = await response.json() as { text: string; tokens: string[]; error?: string }

    if (data.error) {
      return {
        text: '',
        tokens: [],
        error: data.error,
      }
    }

    // Use REAL tiktoken tokenizer instead of fake word-split from worker
    const realTokens = tokenize(data.text)

    return {
      text: data.text,
      tokens: realTokens.map(t => t.text),
    }
  } catch (error) {
    console.error('API call failed:', error)
    return {
      text: '',
      tokens: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
