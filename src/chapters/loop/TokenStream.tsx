// The appended pieces one by one, as the model's tokens (a dot is a space that belongs to the token).
import { useAppStore } from '../../store/appStore'
import { formatTokenDisplay } from '../../core/utils/formatters'

export function TokenStream() {
  const appended = useAppStore((s) => s.appended)
  if (appended.length === 0) return <p className="m-0 text-base text-ink-2">No tokens appended yet.</p>
  return (
    <ol aria-label="Appended tokens in order" className="m-0 flex list-none flex-wrap gap-2 p-0">
      {appended.map((piece, index) => (
        <li key={`${index}-${piece}`} className="flex min-h-11 items-center rounded-[3px] border border-rule px-2 text-base text-ink">
          {formatTokenDisplay(piece)}
        </li>
      ))}
    </ol>
  )
}
