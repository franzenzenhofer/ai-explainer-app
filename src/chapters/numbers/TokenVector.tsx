// One token's real list of 768 numbers from GPT-2 small: the chip turns into numbers (the strip of all
// 768 grows in from the left), then the first 12 values with their positions and the 8 most similar
// tokens. The map of tokens sits next to them.
import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Token } from '../../core/types'
import { MODEL_SPECS } from '../../core/types'
import { TokenChip } from '../../core/components'
import { VectorStrip } from '../../core/components/VectorStrip'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { tokenEmbedding, type Gpt2Table, type Gpt2Token } from '../../model/gpt2Table'
import { SimilarTokens } from './SimilarTokens'
import { ValuesGrid } from './ValuesGrid'

const PRINTED_VALUES = 12
const STRIP_HEIGHT = 42
// The strip draws its bars in --ink; here they take the violet of the numbers stage.
const VIOLET_BARS = { '--ink': 'var(--concept)' } as CSSProperties

export const VECTOR_CAPTION = `Real numbers from ${MODEL_SPECS.modelName}, its token-embedding table, ${MODEL_SPECS.embeddingDim} per token, with GPT-2's own token ID. ${MODEL_SPECS.modelName} cuts text slightly differently from the tokenizer on the Tokens slide, so only tokens it also has get a list. Before the first block the model adds a second list that encodes the position.`

export function NotInSet({ token, tokenCount }: { token: Token; tokenCount: number }) {
  return (
    <p className="m-0 text-lg text-ink-2">
      &quot;{formatTokenDisplay(token.text)}&quot;: not in demo set. The demo keeps {tokenCount.toLocaleString('en-US')} common whole words with a
      leading space, so a first word, a word piece or a symbol has no list here. Pick a coloured chip.
    </p>
  )
}

interface VectorProps {
  table: Gpt2Table
  token: Token
  entry: Gpt2Token
}

export function VectorHeader({ table, token, entry }: VectorProps) {
  const values = tokenEmbedding(table, entry)
  const scale = Math.max(...values.map(Math.abs))
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-lg font-semibold" style={{ color: 'var(--concept-strong)' }}>
        <TokenChip text={token.text} tokenId={entry.id} />
        <ArrowRight aria-hidden="true" size={22} />
        <span>{MODEL_SPECS.modelName} token ID {entry.id.toLocaleString('en-US')}: all {values.length} numbers</span>
      </div>
      <motion.div
        style={VIOLET_BARS}
        initial={{ clipPath: 'inset(0 100% 0 0)' }}
        animate={{ clipPath: 'inset(0 0% 0 0)' }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="rounded-lg border-2 border-[var(--concept-soft)] bg-paper px-1"
      >
        <VectorStrip values={values} scale={scale} height={STRIP_HEIGHT} label={`All ${values.length} numbers for the token ${formatTokenDisplay(token.text)}`} />
      </motion.div>
    </>
  )
}

export function VectorDetails({ table, entry }: Omit<VectorProps, 'token'>) {
  const first = tokenEmbedding(table, entry).slice(0, PRINTED_VALUES)
  const scale = Math.max(...first.map(Math.abs))
  return (
    <>
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="m-0 text-base font-bold" style={{ color: 'var(--concept-strong)' }}>
          First {PRINTED_VALUES}, and {MODEL_SPECS.embeddingDim - PRINTED_VALUES} more
        </h3>
        <ValuesGrid values={first} scale={scale} />
      </div>
      <SimilarTokens entry={entry} />
    </>
  )
}
