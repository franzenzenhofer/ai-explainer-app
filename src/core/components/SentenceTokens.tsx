// The shared token picker: the prompt as colourful token chips with their IDs, staggered in when the
// text changes. Each chip is a real button; the selected one carries a ring in the slide's colour.
import type { Token } from '../types'
import { TokenChip, type ChipSize } from './TokenChip'

interface SentenceTokensProps {
  tokens: Token[]
  selectedIndex: number | null
  onSelect: (index: number) => void
  label: string
  // Positions drawn in grey with a hint that they have no data in the current visual.
  muted?: ReadonlySet<number>
  mutedHint?: string
  showIds?: boolean
  size?: ChipSize
  // Extra class for one chip, for example the halo on the token to try next.
  accentChip?: { index: number; className: string }
}

export function SentenceTokens({ tokens, selectedIndex, onSelect, label, muted, mutedHint, showIds = true, size = 'md', accentChip }: SentenceTokensProps) {
  if (tokens.length === 0) return <p className="m-0 text-lg text-ink-2">Type some text to see its tokens.</p>
  const runKey = tokens.map((token) => token.tokenId).join('-')
  return (
    <div key={runKey} role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5">
      {tokens.map((token, index) => {
        const isMuted = muted?.has(index) ?? false
        return (
          <TokenChip
            key={`${index}-${token.tokenId}`}
            text={token.text}
            tokenId={showIds ? token.tokenId : undefined}
            selected={index === selectedIndex}
            muted={isMuted}
            size={size}
            order={index}
            className={accentChip?.index === index ? accentChip.className : undefined}
            onClick={() => onSelect(index)}
            label={`Token ${index + 1}: "${token.text}", ID ${token.tokenId}${isMuted && mutedHint ? `, ${mutedHint}` : ''}`}
          />
        )
      })}
    </div>
  )
}
