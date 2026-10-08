// The intro's key to the second colour coding: the example sentence as real token chips with IDs.
import { useMemo } from 'react'
import { TokenChip } from '../../core/components/TokenChip'
import { tokenize } from '../../model/tokenizer'
import { DEFAULT_INPUT_TEXT } from '../../store/appStore'

const LEGEND_DELAY = 14

export function ChipLegend() {
  const tokens = useMemo(() => tokenize(DEFAULT_INPUT_TEXT), [])
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1" data-chip-legend>
      <span className="text-base font-semibold text-ink-2">Tokens look like this:</span>
      <span className="flex flex-wrap gap-1">
        {tokens.map((token, index) => (
          <TokenChip key={`${index}-${token.tokenId}`} text={token.text} tokenId={token.tokenId} order={LEGEND_DELAY + index} />
        ))}
      </span>
      <span className="text-base text-ink-2">each with its own colour and its ID number.</span>
    </div>
  )
}
