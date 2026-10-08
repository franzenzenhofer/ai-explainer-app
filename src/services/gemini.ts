// Question and answer via the secure Cloudflare Worker (the Reality chapter). The API key stays
// server-side. The worker's loop mode, with real probabilities, is in loopApi.ts.

import { tokenize } from '../model/tokenizer'
import type { Token } from '../core/types'

const API_ENDPOINT = 'https://ai-explainer-api.franz-enzenhofer7308.workers.dev'

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

// Ask the worker to answer a question, then tokenize the answer with the REAL tiktoken tokenizer.
export async function generateWithGemini(prompt: string, maxTokens: number): Promise<GeminiResponse> {
  try {
    // Detect language to keep the answer language aligned with the question
    const lang = detectLanguage(prompt)
    const systemPrompt = lang === 'de'
      ? 'Answer this question directly in German. Keep it concise and factual. If uncertain, say so.'
      : lang === 'mixed'
        ? 'Answer this question while maintaining the same German/English language mix. Be concise and factual. If uncertain, say so.'
        : 'Answer this question directly in English. Keep it concise and factual. If uncertain, say so.'

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        maxTokens,
        mode: 'qa',
        systemPrompt,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as { error?: string }
      console.error('API error:', errorData)
      return {
        text: '',
        tokens: [],
        error: errorData.error || `API error: ${response.status}`,
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

    // Use REAL tiktoken tokenizer - returns full Token objects with real tokenIds
    const realTokens = tokenize(data.text)

    return {
      text: data.text,
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
