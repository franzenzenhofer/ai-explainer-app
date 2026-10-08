// The old app's stat tiles, with real counts: tokens, words, characters, characters per token, and the
// size of the tokenizer's fixed list. The numbers count up like the old app's.
import { StatTile } from '../../core/components'
import { TOKENIZER_SPECS } from '../../core/types'
import { countWords } from '../../model/tokenizer'

interface StatTilesProps {
  text: string
  tokenCount: number
}

const DECIMALS = 1
const oneDecimal = (value: number) => value.toFixed(DECIMALS)

export function StatTiles({ text, tokenCount }: StatTilesProps) {
  const perToken = tokenCount > 0 ? text.length / tokenCount : 0
  return (
    <div className="grid grid-cols-[1fr_1fr_1.25fr_1.35fr_1.6fr] gap-2" aria-label="Counts for your text" role="group">
      <StatTile value={tokenCount} label="Tokens" />
      <StatTile value={countWords(text)} label="Words" />
      <StatTile value={text.length} label="Characters" />
      <StatTile value={perToken} label="Chars / token" format={oneDecimal} />
      <StatTile value={TOKENIZER_SPECS.vocabulary} label="Tokens in the list" />
    </div>
  )
}
