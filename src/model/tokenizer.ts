// Real tokenization with o200k_base, the tokenizer OpenAI publishes for gpt-4o (js-tiktoken).
// There is no fallback: if the encoder cannot load or encode, the error reaches the caller.

import { getEncoding, type Tiktoken } from 'js-tiktoken'
import { TOKENIZER_SPECS, type Token } from '../core/types'

let encoder: Tiktoken | null = null

function getEncoder(): Tiktoken {
  encoder ??= getEncoding(TOKENIZER_SPECS.name)
  return encoder
}

export function tokenize(text: string): Token[] {
  if (!text) return []
  const enc = getEncoder()
  return enc.encode(text).map((tokenId, index) => ({
    id: index,
    text: enc.decode([tokenId]),
    tokenId,
    // Same token, same colour everywhere.
    colorIndex: tokenId,
  }))
}

// Number of UTF-8 bytes a token stands for.
export function tokenByteLength(token: Token): number {
  return new TextEncoder().encode(token.text).length
}

export function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}
