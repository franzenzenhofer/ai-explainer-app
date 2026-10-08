import { describe, expect, it } from 'vitest'
import { formatPercent, formatTokenDisplay } from './formatters'

describe('formatTokenDisplay', () => {
  it('makes leading and trailing spaces visible', () => {
    expect(formatTokenDisplay(' dog')).toBe('·dog')
    expect(formatTokenDisplay('dog  ')).toBe('dog··')
    expect(formatTokenDisplay('\n')).toBe('↵')
  })
})

describe('formatPercent', () => {
  it('keeps two significant digits for small values', () => {
    expect(formatPercent(0.31)).toBe('31%')
    expect(formatPercent(0.031)).toBe('3.1%')
    expect(formatPercent(0.0031)).toBe('0.31%')
  })
})
