// Tokenizer logic - REAL tiktoken tokenization (o200k_base)
import { getEncoding } from 'js-tiktoken'
import type { Token } from '../../core/types'

// Use o200k_base - the tokenizer used by modern language models
// Falls back to cl100k_base if o200k not available
let encoder: ReturnType<typeof getEncoding> | null = null

function getEncoder() {
  if (!encoder) {
    try {
      // Try o200k_base first (modern models)
      encoder = getEncoding('o200k_base')
    } catch {
      // Fallback to cl100k_base
      encoder = getEncoding('cl100k_base')
    }
  }
  return encoder
}

// Real tokenization using tiktoken
export function tokenize(text: string): Token[] {
  if (!text) return []

  try {
    const enc = getEncoder()
    const tokenIds = enc.encode(text)

    // Decode each token to get the text
    const tokens: Token[] = tokenIds.map((tokenId, index) => {
      // Decode single token
      const bytes = enc.decode([tokenId])
      return {
        id: index,
        text: bytes,
        tokenId: tokenId,
        colorIndex: tokenId, // Use TOKEN ID - same token = same color everywhere!
      }
    })

    return tokens
  } catch (error) {
    console.error('Tokenization error:', error)
    // Fallback to simple split if tiktoken fails
    return text.split(/(\s+)/).filter(Boolean).map((word, index) => {
      // Hash the word text to get consistent color
      const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      return {
        id: index,
        text: word,
        tokenId: hash,
        colorIndex: hash, // Same text = same color
      }
    })
  }
}

// Calculate token statistics
export function getTokenStats(text: string, tokens: Token[]) {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const chars = text.length

  return {
    tokenCount: tokens.length,
    wordCount: words.length,
    charCount: chars,
    avgCharsPerToken: tokens.length > 0 ? (chars / tokens.length).toFixed(1) : '0',
    compressionRatio: words.length > 0 ? (tokens.length / words.length).toFixed(2) : '0',
  }
}

// Demo: Show how BPE works step by step (educational)
export function demonstrateBPE(word: string): Array<{ step: string; result: string[] }> {
  const steps: Array<{ step: string; result: string[] }> = []

  // Step 1: Characters
  steps.push({
    step: 'Start with characters',
    result: word.split(''),
  })

  // Step 2: Try to tokenize with real tiktoken
  try {
    const tokens = tokenize(word)
    if (tokens.length > 0 && tokens.length < word.length) {
      steps.push({
        step: 'BPE merged common pairs',
        result: tokens.map(t => t.text),
      })
    }

    // Final result
    steps.push({
      step: `Final: ${tokens.length} token${tokens.length !== 1 ? 's' : ''}`,
      result: tokens.map(t => t.text),
    })
  } catch {
    steps.push({
      step: 'Tokenization result',
      result: [word],
    })
  }

  return steps
}

// Get encoder info
export function getTokenizerInfo() {
  return {
    name: 'o200k_base',
    description: 'Tokenizer used by modern language models',
    vocabSize: 200_000,
  }
}
