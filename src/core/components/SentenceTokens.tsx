// The shared token picker: the prompt drawn inline, each token a real button with a 44px target.
// Boundaries show as alternating underlines; the selected token carries the chapter accent.
import type { Token } from '../types'
import { cn } from '../utils/cn'
import { formatTokenInline } from '../utils/formatters'

interface SentenceTokensProps {
  tokens: Token[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  label: string
  // Positions to mark in the accent without selecting them (for example, the keys a query attends to).
  marked?: ReadonlySet<number>
}

const UNDERLINES = ['border-ink', 'border-rule-strong']

export function SentenceTokens({ tokens, selectedIndex, onSelect, label, marked }: SentenceTokensProps) {
  if (tokens.length === 0) return <p className="m-0 text-lg text-ink-2">Type some text to see its tokens.</p>
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-end gap-x-1 gap-y-2">
      {tokens.map((token, index) => {
        const selected = index === selectedIndex
        const highlighted = marked?.has(index) ?? false
        return (
          <button
            key={`${index}-${token.tokenId}`}
            type="button"
            aria-pressed={selected}
            aria-label={`Token ${index + 1}: "${token.text}", ID ${token.tokenId}`}
            onClick={() => onSelect(index)}
            className={cn(
              'inline-flex min-h-11 min-w-11 items-end justify-center whitespace-pre border-b-4 px-1 pb-1 text-2xl leading-tight text-ink transition-colors sm:text-[1.75rem]',
              selected ? 'tint-accent border-accent' : highlighted ? 'border-accent' : UNDERLINES[index % 2],
              !selected && 'hover:bg-wash',
            )}
          >
            {formatTokenInline(token.text)}
          </button>
        )
      })}
    </div>
  )
}
