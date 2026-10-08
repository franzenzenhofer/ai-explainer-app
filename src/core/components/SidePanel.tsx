// The right third of a slide: what happens, how, why it matters, the colour key, and the buttons
// that open "Go deeper" and "Sources" as overlays.
import { BookOpen, Link2 } from 'lucide-react'
import type { Chapter } from '../chapters'
import { ColorKey } from './ColorKey'

export type OverlayKind = 'deeper' | 'sources'

interface SidePanelProps {
  chapter: Chapter
  onOpen: (kind: OverlayKind) => void
}

const ROWS = [
  { key: 'what', label: 'What' },
  { key: 'how', label: 'How' },
  { key: 'why', label: 'Why it matters' },
] as const

const PANEL_BUTTON = 'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border-2 px-3 text-base font-semibold'

export function SidePanel({ chapter, onOpen }: SidePanelProps) {
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex flex-col gap-1.5" data-explain>
        {ROWS.map((row) => (
          <p key={row.key} className="m-0 text-base leading-snug text-ink">
            <span className="mr-1.5 inline-block rounded px-1.5 font-bold text-white" style={{ background: 'var(--concept-strong)' }}>
              {row.label}
            </span>
            {chapter.explain[row.key]}
          </p>
        ))}
      </div>
      <div className="rounded-xl border-2 bg-paper px-3 py-2" style={{ borderColor: 'var(--concept-soft)' }}>
        <ColorKey entries={chapter.colorKey} />
      </div>
      <div className="mt-auto flex gap-2">
        <button type="button" data-open-deeper onClick={() => onOpen('deeper')} className={PANEL_BUTTON} style={{ borderColor: 'var(--concept-strong)', color: 'var(--concept-strong)' }}>
          <BookOpen aria-hidden="true" size={18} />
          Go deeper
        </button>
        <button type="button" onClick={() => onOpen('sources')} className={`${PANEL_BUTTON} border-ink/15 text-ink hover:border-ink/40`}>
          <Link2 aria-hidden="true" size={18} />
          Sources
        </button>
      </div>
    </div>
  )
}
