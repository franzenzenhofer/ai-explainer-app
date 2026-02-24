// Gemini API Service - Real AI generation via secure Cloudflare Worker
// API key is stored securely server-side, never exposed to frontend

import { tokenize } from '../steps/02-tokenization/tokenizer'
import type { Token } from '../core/types'

const API_ENDPOINT = 'https://ai-explainer-api.franz-enzenhofer7308.workers.dev'

export type GenerationMode = 'continuation' | 'qa'

export interface GeminiResponse {
  text: string
  tokens: Token[]  // Full Token objects with REAL tokenIds from tiktoken
  error?: string
}

// Detect language of input text
function detectLanguage(text: string): 'de' | 'en' | 'mixed' {
  const germanPatterns = /[äöüßÄÖÜ]|(\b(und|der|die|das|ist|sind|ein|eine|für|mit|auf|nicht|von|werden|haben|wie|oder|wenn|dass|auch|nach|bei|aus|nur|noch|kann|mehr|sehr|schon|immer|wieder|hier|neue|zum|zur|einem|einer|eines|diese|dieser|diesem|welche|welcher|andere|anderer|anderen|keine|keiner|muss|müssen|soll|sollen|kann|können|wird|wurde|wurden|wäre|wären|hätte|hätten)\b)/gi
  const germanMatches = text.match(germanPatterns) || []
  const words = text.split(/\s+/).length
  const germanRatio = germanMatches.length / Math.max(1, words)

  if (germanRatio > 0.15) return 'de'
  if (germanRatio > 0.05) return 'mixed'
  return 'en'
}

// Generate text continuation using secure API
// Then tokenize with REAL tiktoken tokenizer
export async function generateWithGemini(
  prompt: string,
  maxTokens: number = 30,
  mode: GenerationMode = 'continuation'
): Promise<GeminiResponse> {
  try {
    // Detect language to keep output language aligned with user input
    const lang = detectLanguage(prompt)
    const continuationPrompt = lang === 'de'
      ? 'Continue this German text naturally in German:'
      : lang === 'mixed'
        ? 'Continue this mixed German/English text, maintaining the same language mix:'
        : 'Continue this text naturally:'
    const qaPrompt = lang === 'de'
      ? 'Answer this question directly in German. Keep it concise and factual. If uncertain, say so.'
      : lang === 'mixed'
        ? 'Answer this question while maintaining the same German/English language mix. Be concise and factual. If uncertain, say so.'
        : 'Answer this question directly in English. Keep it concise and factual. If uncertain, say so.'
    const systemPrompt = mode === 'qa' ? qaPrompt : continuationPrompt

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        maxTokens,
        mode,
        systemPrompt,
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

    const data = await response.json() as { text: string; error?: string }

    if (data.error) {
      return {
        text: '',
        tokens: [],
        error: data.error,
      }
    }

    // For continuations, ensure the generated text has a leading space
    // if the prompt doesn't end with whitespace and the response doesn't start with it.
    // Without this, "oder?" + "Und" renders as "oder?Und" with no space.
    let generatedText = data.text
    if (mode === 'continuation' && generatedText.length > 0) {
      const promptEndsWithSpace = /\s$/.test(prompt)
      const responseStartsWithSpace = /^\s/.test(generatedText)
      if (!promptEndsWithSpace && !responseStartsWithSpace) {
        generatedText = ' ' + generatedText
      }
    }

    // Use REAL tiktoken tokenizer - returns full Token objects with real tokenIds
    const realTokens = tokenize(generatedText)

    return {
      text: generatedText,
      tokens: realTokens,  // Full Token[] with real tokenIds from tiktoken
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
