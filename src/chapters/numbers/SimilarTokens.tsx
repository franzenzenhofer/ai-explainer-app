// The 8 tokens whose 768 numbers point most nearly the same way as the chosen token's (cosine similarity).
import { MODEL_SPECS } from '../../core/types'
import { formatTokenDisplay } from '../../core/utils/formatters'
import type { Gpt2Token } from '../../model/gpt2Table'

interface SimilarTokensProps {
  entry: Gpt2Token
}

export function SimilarTokens({ entry }: SimilarTokensProps) {
  return (
    <div className="mt-6">
      <h3 className="m-0 text-base font-semibold">Similar tokens in {MODEL_SPECS.modelName}</h3>
      <ol aria-label="Most similar tokens" className="m-0 mt-2 grid list-none grid-cols-2 gap-x-6 p-0 sm:grid-cols-4">
        {entry.neighbours.map((neighbour) => (
          <li key={neighbour.id} className="min-h-9 text-base">
            <span className="font-semibold text-ink">{formatTokenDisplay(neighbour.text)}</span>{' '}
            <span className="tabular-nums text-ink-2">{neighbour.cosine.toFixed(2)}</span>
          </li>
        ))}
      </ol>
      <p className="m-0 mt-2 text-base text-ink-2">
        Cosine similarity of the full lists: 1 means the same direction, 0 unrelated. It is measured on all {MODEL_SPECS.embeddingDim} numbers, not on the map.
      </p>
    </div>
  )
}
