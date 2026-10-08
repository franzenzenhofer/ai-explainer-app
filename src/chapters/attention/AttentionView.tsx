// The attention visual: arcs or the grid, the one-sentence reading of the chosen token, the badge.
import type { AttentionWeight, Token } from '../../core/types'
import { VisualFrame, type Provenance } from '../../core/components'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { getQueryAttention } from '../../model/attention'
import type { AttentionView as View } from '../../store/appStore'
import { AttentionArcs } from './AttentionArcs'
import { AttentionHeatmap } from './AttentionHeatmap'

export const provenance: Provenance = 'simulated'

const NAMED_TARGETS = 3

interface AttentionViewProps {
  view: View
  tokens: Token[]
  weights: AttentionWeight[]
  query: number
  onSelect: (index: number) => void
}

function reading(tokens: Token[], weights: AttentionWeight[], query: number): string {
  const name = (index: number) => `"${formatTokenDisplay(tokens[index].text).replace(/·/g, '')}"`
  const parts = getQueryAttention(weights, query)
    .slice(0, NAMED_TARGETS)
    .map(({ keyIdx, weight }) => `${keyIdx === query ? 'itself' : name(keyIdx)} ${Math.round(weight * 100)}%`)
  return `${name(query)} looks back at ${parts.join(', ')}.`
}

export function AttentionView({ view, tokens, weights, query, onSelect }: AttentionViewProps) {
  return (
    <VisualFrame
      title={view === 'arcs' ? 'Who looks back at whom' : 'The same weights as a grid'}
      provenance={provenance}
      caption="Scripted weights that follow the chosen pattern, not measured from a model. Arcs only go left: a token never sees what comes after it."
    >
      {view === 'arcs' ? (
        <AttentionArcs tokens={tokens} weights={weights} query={query} onSelect={onSelect} />
      ) : (
        <AttentionHeatmap tokens={tokens} weights={weights} query={query} onSelect={onSelect} />
      )}
      <p className="m-0 mt-4 text-lg text-ink" aria-live="polite">{reading(tokens, weights, query)}</p>
    </VisualFrame>
  )
}
