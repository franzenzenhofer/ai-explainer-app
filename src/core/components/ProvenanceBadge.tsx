// ProvenanceBadge - tells the reader whether a visual shows real data or a simulation.

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
  real: 'border-real text-real',
  simulated: 'border-simulated text-simulated',
}

interface ProvenanceBadgeProps {
  provenance: Provenance
}

export function ProvenanceBadge({ provenance }: ProvenanceBadgeProps) {
  return (
    <span
      title={BADGE_TITLE[provenance]}
      data-provenance={provenance}
      className={`inline-flex shrink-0 items-center rounded-[2px] border-2 px-2 text-base font-semibold leading-7 ${BADGE_STYLE[provenance]}`}
    >
      {BADGE_TEXT[provenance]}
    </span>
  )
}
