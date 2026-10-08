// The frame every visual sits in: a title row with the Real / Simulated badge in the same spot,
// the visual at full width, and an optional caption. The badge never sits on top of the visual.
import type { ReactNode } from 'react'
import { ProvenanceBadge, type Provenance } from './ProvenanceBadge'

interface VisualFrameProps {
  title: string
  provenance: Provenance
  caption?: ReactNode
  children: ReactNode
}

export function VisualFrame({ title, provenance, caption, children }: VisualFrameProps) {
  return (
    <figure className="m-0 border-t-2 border-ink pt-3" data-visual={title}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="m-0 text-base font-semibold text-ink">{title}</h2>
        <ProvenanceBadge provenance={provenance} />
      </div>
      {children}
      {caption && <figcaption className="mt-4 text-base text-ink-2">{caption}</figcaption>}
    </figure>
  )
}
