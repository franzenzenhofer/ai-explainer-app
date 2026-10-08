// The frame every visual sits in: a white card with a band in the stage colour, a title row with the
// Real / Simulated badge in the same spot, and the visual filling the rest. The caption (where the
// data comes from) opens from the "About the data" button so it never crowds the slide.
import { Info } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { ProvenanceBadge, type Provenance } from './ProvenanceBadge'

interface VisualFrameProps {
  title: string
  provenance: Provenance
  caption?: ReactNode
  // Extra controls on the right of the title row (view toggles and the like).
  actions?: ReactNode
  children: ReactNode
}

export function VisualFrame({ title, provenance, caption, actions, children }: VisualFrameProps) {
  const [showCaption, setShowCaption] = useState(false)
  return (
    <figure
      className="visual-frame relative m-0 flex min-h-0 flex-col rounded-2xl border-2 border-t-[6px] bg-paper px-4 pb-3 pt-2 shadow-sm"
      style={{ borderColor: 'var(--concept-soft)', borderTopColor: 'var(--concept)' }}
      data-visual={title}
    >
      <div className="mb-2 flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h2 className="m-0 text-lg font-bold" style={{ color: 'var(--concept-strong)' }}>{title}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {actions}
          {caption && (
            <button
              type="button"
              aria-expanded={showCaption}
              onClick={() => setShowCaption((open) => !open)}
              className="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-base font-medium text-ink-2 hover:text-ink"
            >
              <Info aria-hidden="true" size={18} />
              About the data
            </button>
          )}
          <ProvenanceBadge provenance={provenance} />
        </div>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
      {caption && showCaption && (
        <figcaption className="absolute inset-x-4 top-14 z-20 rounded-xl border-2 bg-paper p-4 text-base text-ink shadow-xl" style={{ borderColor: 'var(--concept-soft)' }}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
