// The appended tokens one by one, as the model produced them.
import { useGeneratedTokens } from '../../core/hooks/useDerived'
import { formatTokenDisplay } from '../../core/utils/formatters'

export function TokenStream() {
  const generated = useGeneratedTokens()
  if (generated.length === 0) return <p className="m-0 text-base text-ink-2">No tokens appended yet.</p>
  return (
    <ol aria-label="Appended tokens in order" className="m-0 flex list-none flex-wrap gap-2 p-0">
      {generated.map((token, index) => (
        <li
          key={`${index}-${token.tokenId}`}
          className="flex min-h-11 items-center rounded-[3px] border border-rule px-2 text-base text-ink"
          title={`ID ${token.tokenId}`}
        >
          {formatTokenDisplay(token.text)}
        </li>
      ))}
    </ol>
  )
}
