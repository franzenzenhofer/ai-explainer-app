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

// Format token for display - KISS: just show the text simply
export function formatTokenDisplay(token: string): string {
  // Only replace invisible special characters
  if (token === '\n') return '↵'
  if (token === '\t') return '  '

  // Show the token as-is - spaces are visible naturally
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
