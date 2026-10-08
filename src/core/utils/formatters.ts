// Text formatting for tokens and numbers.

// Leading and trailing spaces become a visible middle dot; newline and tab get a symbol.
export function formatTokenDisplay(token: string): string {
  if (token === '\n') return '↵'
  if (token === '\t') return '⇥'
  return token.replace(/\n/g, '↵').replace(/^ +| +$/g, (spaces) => '·'.repeat(spaces.length))
}

// Inside running text spaces stay spaces; only newline and tab get a symbol.
export function formatTokenInline(token: string): string {
  return token.replace(/\n/g, '\u21b5').replace(/\t/g, '\u21e5')
}

export function formatPercent(probability: number): string {
  const percent = probability * 100
  if (percent >= 10) return `${percent.toFixed(0)}%`
  if (percent >= 1) return `${percent.toFixed(1)}%`
  return `${percent.toFixed(2)}%`
}

export function formatVectorValue(value: number): string {
  return value.toFixed(2)
}
