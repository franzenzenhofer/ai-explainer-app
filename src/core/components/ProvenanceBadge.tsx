// ProvenanceBadge - tells the reader whether a visualization shows real data or a simulation

export type Provenance = 'real' | 'simulated'

const BADGE_TEXT: Record<Provenance, string> = {
  real: 'Real',
  simulated: 'Simulated',
}

const BADGE_TITLE: Record<Provenance, string> = {
  real: 'Computed from a real model or a real tokenizer',
  simulated: 'Illustrative values, not computed by a real model',
}

const BADGE_STYLE: Record<Provenance, string> = {
  real: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  simulated: 'border-amber-300 bg-amber-50 text-amber-900',
}

interface ProvenanceBadgeProps {
  provenance: Provenance
}

export function ProvenanceBadge({ provenance }: ProvenanceBadgeProps) {
  return (
    <span
      title={BADGE_TITLE[provenance]}
      className={`pointer-events-auto absolute right-2 top-2 z-20 rounded-full border px-2.5 py-0.5 text-base font-semibold ${BADGE_STYLE[provenance]}`}
    >
      {BADGE_TEXT[provenance]}
    </span>
  )
}
