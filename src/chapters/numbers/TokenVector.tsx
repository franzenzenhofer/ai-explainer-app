// One token's real list of 768 numbers from GPT-2 small, with its most similar tokens.
import type { Token } from '../../core/types'
import { MODEL_SPECS } from '../../core/types'
import { LoadNotice } from '../../core/components/LoadNotice'
import { VisualFrame, type Provenance } from '../../core/components'
import { VectorStrip } from '../../core/components/VectorStrip'
import type { LoadState } from '../../core/hooks/useLoaded'
import { formatTokenDisplay, formatVectorValue } from '../../core/utils/formatters'
import { lookupToken, tokenEmbedding, type Gpt2Table } from '../../model/gpt2Table'
import { SimilarTokens } from './SimilarTokens'

export const provenance: Provenance = 'real'

const PRINTED_VALUES = 8
const STRIP_HEIGHT = 140

interface TokenVectorProps {
  state: LoadState<Gpt2Table>
  token: Token
  outside: boolean
}

const caption = `Real numbers from ${MODEL_SPECS.modelName}, the token-embedding table, ${MODEL_SPECS.embeddingDim} per token. ${MODEL_SPECS.modelName} cuts text slightly differently from the tokenizer in the Tokens chapter, so only tokens it also has are shown. Before the first block the model adds a second list that encodes the position.`

function Body({ table, token, outside }: { table: Gpt2Table; token: Token; outside: boolean }) {
  const entry = lookupToken(table, token.text)
  const name = formatTokenDisplay(token.text)
  if (!entry || outside) {
    return (
      <p className="m-0 text-lg text-ink-2">
        &quot;{name}&quot;: not in demo set. The demo keeps {table.file.tokenCount.toLocaleString('en-US')} common whole words with a leading
        space, so a first word, a word piece or a symbol has no list here.
      </p>
    )
  }
  const values = tokenEmbedding(table, entry)
  const scale = Math.max(...values.map(Math.abs))
  return (
    <>
      <h3 className="m-0 text-base font-semibold">
        {MODEL_SPECS.modelName} token ID {entry.id.toLocaleString('en-US')}: all {values.length} numbers
      </h3>
      <VectorStrip values={values} scale={scale} height={STRIP_HEIGHT} label={`All ${values.length} numbers for the token ${name}`} />
      <p className="m-0 mt-3 text-base text-ink-2">
        First {PRINTED_VALUES}: {values.slice(0, PRINTED_VALUES).map(formatVectorValue).join(', ')}. Up is positive, down is negative.
        The list is the same wherever &quot;{name}&quot; appears.
      </p>
      <SimilarTokens entry={entry} />
    </>
  )
}

export function TokenVector({ state, token, outside }: TokenVectorProps) {
  return (
    <VisualFrame title={`The numbers for "${formatTokenDisplay(token.text)}"`} provenance={provenance} caption={caption}>
      {state.status === 'ready' ? <Body table={state.value} token={token} outside={outside} /> : <LoadNotice state={state} what="the GPT-2 table" />}
    </VisualFrame>
  )
}
