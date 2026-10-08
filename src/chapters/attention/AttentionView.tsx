// The attention visual: the view toggle, the Score / Weight / Mix strip, arcs, grid or network, and
// the one-sentence reading of the chosen token. Weights are scripted, so the badge says Simulated.
import type { ReactNode } from 'react'
import type { AttentionWeight, Token } from '../../core/types'
import { ToggleGroup, VisualFrame, type Provenance } from '../../core/components'
import { formatTokenDisplay } from '../../core/utils/formatters'
import { getQueryAttention } from '../../model/attention'
import { AttentionArcs } from './AttentionArcs'
import { AttentionHeatmap } from './AttentionHeatmap'
import { AttentionNetwork } from './AttentionNetwork'
import { StepStrip } from './StepStrip'

export const provenance: Provenance = 'simulated'

export type AttentionMode = 'arcs' | 'grid' | 'network'

const NAMED_TARGETS = 3
const MODES: Array<{ value: AttentionMode; label: string }> = [
  { value: 'arcs', label: 'Arcs' },
  { value: 'grid', label: 'Grid' },
  { value: 'network', label: 'Network' },
]

interface AttentionViewProps {
  mode: AttentionMode
  onMode: (mode: AttentionMode) => void
  data: { tokens: Token[]; weights: AttentionWeight[]; query: number; drawKey: string }
  onSelect: (index: number) => void
  footer: ReactNode
}

function reading(tokens: Token[], weights: AttentionWeight[], query: number): string {
  const name = (index: number) => `"${formatTokenDisplay(tokens[index].text).replace(/·/g, '')}"`
  const parts = getQueryAttention(weights, query)
    .slice(0, NAMED_TARGETS)
    .map(({ keyIdx, weight }) => `${keyIdx === query ? 'itself' : name(keyIdx)} ${Math.round(weight * 100)}%`)
  return `${name(query)} looks back at ${parts.join(', ')}.`
}

const CAPTION = 'Scripted weights that follow the chosen pattern, not measured from a model. Real models have many heads in every layer, each with its own learned pattern. Weights only go left: a token never sees what comes after it.'

export function AttentionView({ mode, onMode, data, onSelect, footer }: AttentionViewProps) {
  const { tokens, weights, query, drawKey } = data
  return (
    <VisualFrame
      title="Who looks back at whom"
      provenance={provenance}
      caption={CAPTION}
      actions={<ToggleGroup label="Attention view" options={MODES} value={mode} onChange={onMode} />}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <StepStrip drawKey={drawKey} />
        <div data-view className="flex min-h-0 flex-1 flex-col justify-center">
          {mode === 'arcs' && <AttentionArcs tokens={tokens} weights={weights} query={query} drawKey={drawKey} onSelect={onSelect} />}
          {mode === 'grid' && <AttentionHeatmap tokens={tokens} weights={weights} query={query} drawKey={drawKey} />}
          {mode === 'network' && <AttentionNetwork tokens={tokens} weights={weights} query={query} drawKey={drawKey} />}
        </div>
        <p className="m-0 text-lg font-semibold text-ink" aria-live="polite">{reading(tokens, weights, query)}</p>
        {footer}
      </div>
    </VisualFrame>
  )
}
