// The text so far: the prompt in grey, every appended piece underlined, the newest one in the accent.
import { useAppStore } from '../../store/appStore'
import { formatTokenInline } from '../../core/utils/formatters'
import { cn } from '../../core/utils/cn'

export function GeneratedText() {
  const prompt = useAppStore((s) => s.inputText)
  const appended = useAppStore((s) => s.appended)
  const newest = appended.length - 1
  return (
    <p className="m-0 whitespace-pre-wrap break-words font-serif text-2xl leading-relaxed sm:text-3xl" aria-live="polite">
      <span className="text-ink-2">{prompt}</span>
      {appended.map((piece, index) => (
        <span
          key={`${index}-${piece}`}
          className={cn('border-b-4 text-ink', index === newest ? 'tint-accent border-accent' : index % 2 ? 'border-rule-strong' : 'border-ink')}
        >
          {formatTokenInline(piece)}
        </span>
      ))}
    </p>
  )
}
