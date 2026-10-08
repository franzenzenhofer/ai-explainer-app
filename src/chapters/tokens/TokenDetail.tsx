// One line about the chosen token: its text, its ID in the fixed list and its size in bytes.
import { useAppStore } from '../../store/appStore'
import { useTokens } from '../../core/hooks/useDerived'
import { tokenColor } from '../../core/colors'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { tokenByteLength } from '../../model/tokenizer'

export function TokenDetail() {
  const tokens = useTokens()
  const selected = useAppStore((s) => s.selectedTokenIndex)
  const token = selected === null ? undefined : tokens[selected]
  if (!token) return <p className="m-0 text-lg text-ink-2">Tap a chip to see its ID and its size. A dot is a space that belongs to the token.</p>
  const bytes = tokenByteLength(token)
  const color = tokenColor(token.text)
  return (
    <p className="m-0 text-lg text-ink" aria-live="polite">
      Token {selected === null ? 0 : selected + 1}:{' '}
      <span className="rounded px-1.5 font-mono font-semibold" style={{ background: color.fill, color: color.text }}>
        {formatTokenDisplay(token.text)}
      </span>{' '}
      has ID <span className="font-bold tabular-nums">{token.tokenId.toLocaleString('en-US')}</span> in the list and stands for {bytes}{' '}
      {bytes === 1 ? 'byte' : 'bytes'} of text.
    </p>
  )
}
