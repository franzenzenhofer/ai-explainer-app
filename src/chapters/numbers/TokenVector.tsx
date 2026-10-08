// The start of one token's list of numbers, and the same list after its position is added.
import { useMemo } from 'react'
import type { Token } from '../../core/types'
import { MODEL_SPECS } from '../../core/types'
import { VisualFrame, type Provenance } from '../../core/components'
import { VectorStrip } from '../../core/components/VectorStrip'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { addVectors, positionVector, tokenVector } from '../../model/vectors'

export const provenance: Provenance = 'simulated'

export const SHOWN_VALUES = 32
const STRIP_SCALE = 1.3

interface TokenVectorProps {
  token: Token
  position: number
}

export function TokenVector({ token, position }: TokenVectorProps) {
  const own = useMemo(() => tokenVector(token.tokenId, SHOWN_VALUES), [token.tokenId])
  const placed = useMemo(() => addVectors(own, positionVector(position, SHOWN_VALUES)), [own, position])
  const name = formatTokenDisplay(token.text)
  return (
    <VisualFrame
      title={`The numbers for "${name}"`}
      provenance={provenance}
      caption={`${SHOWN_VALUES} of the ${MODEL_SPECS.embeddingDim} numbers ${MODEL_SPECS.modelName} uses per token. These values are seeded stand-ins, not GPT-2's table; the real table arrives in a later version.`}
    >
      <h3 className="m-0 text-base font-semibold">Token ID {token.tokenId.toLocaleString('en-US')}: its own list</h3>
      <VectorStrip values={own} scale={STRIP_SCALE} label={`${SHOWN_VALUES} simulated numbers for the token ${name}`} />
      <h3 className="m-0 mt-6 text-base font-semibold">Plus position {position + 1}: what the first block reads</h3>
      <VectorStrip
        values={placed}
        scale={STRIP_SCALE}
        label={`The same numbers after adding position ${position + 1}`}
      />
      <p className="m-0 mt-3 text-base text-ink-2">
        The first list is the same wherever &quot;{name}&quot; appears. The second changes with the position, so the model knows word order.
      </p>
    </VisualFrame>
  )
}
