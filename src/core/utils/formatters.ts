// Number and text formatting utilities

// Format large numbers with commas and optional abbreviation
export function formatNumber(num: number, abbreviated = false): string {
  if (abbreviated) {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(1)}M`
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`
    }
  }
  return num.toLocaleString()
}

// Format probability as percentage
export function formatProbability(prob: number, decimals = 2): string {
  return `${(prob * 100).toFixed(decimals)}%`
}

// Format vector values for display (scientific notation for very small)
export function formatVectorValue(value: number): string {
  if (Math.abs(value) < 0.0001) {
    return value.toExponential(2)
  }
  return value.toFixed(4)
}

// Format token for display - make whitespace VISIBLE so users understand tokenization
export function formatTokenDisplay(token: string): string {
  // Replace invisible special characters with visible symbols
  if (token === '\n') return '↵'
  if (token === '\t') return '⇥'
  if (token === ' ') return '_'  // Single space = underscore
  if (token === '  ') return '__' // Double space

  // Make leading spaces visible (very common in tokenization!)
  // " the" → "_the", "  code" → "__code"
  if (token.startsWith(' ')) {
    const leadingSpaces = token.match(/^( +)/)?.[1] || ''
    const rest = token.slice(leadingSpaces.length)
    const visibleSpaces = leadingSpaces.split('').map(() => '_').join('')
    return visibleSpaces + rest
  }

  // Make trailing spaces visible too
  if (token.endsWith(' ')) {
    const trailingSpaces = token.match(/( +)$/)?.[1] || ''
    const rest = token.slice(0, -trailingSpaces.length)
    const visibleSpaces = trailingSpaces.split('').map(() => '_').join('')
    return rest + visibleSpaces
  }

  return token
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1) + '…'
}

// Format duration in seconds
export function formatDuration(seconds: number): string {
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs.toFixed(0)}s`
}

// Format token/second rate
export function formatTokenRate(tokensPerSecond: number): string {
  return `${tokensPerSecond.toFixed(1)} tok/s`
}
