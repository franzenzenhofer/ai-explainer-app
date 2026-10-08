// The text so far: the prompt in grey, every appended token underlined, the newest one in the accent.
import { useTokens, useGeneratedTokens } from '../../core/hooks/useDerived'
import { formatTokenInline } from '../../core/utils/formatters'
import { cn } from '../../core/utils/cn'

export function GeneratedText() {
  const prompt = useTokens()
  const generated = useGeneratedTokens()
  const newest = generated.length - 1
  return (
    <p className="m-0 whitespace-pre-wrap break-words font-serif text-2xl leading-relaxed sm:text-3xl" aria-live="polite">
      <span className="text-ink-2">{prompt.map((token) => token.text).join('')}</span>
      {generated.map((token, index) => (
        <span
          key={`${index}-${token.tokenId}`}
          className={cn('border-b-4 text-ink', index === newest ? 'tint-accent border-accent' : index % 2 ? 'border-rule-strong' : 'border-ink')}
        >
          {formatTokenInline(token.text)}
        </span>
      ))}
    </p>
  )
}
