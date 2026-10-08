// Hype and what to say instead (the old "HYPE vs REALITY" list), rewritten so every line is a claim
// plan section 3 supports: likely is not true, and the model's story about its steps is not evidence.
import { CONCEPT_COLORS } from '../../core/colors'

export const SUMMARY: Array<{ claim: string; instead: string }> = [
  { claim: 'It thinks it over', instead: 'It predicts the next token, again and again.' },
  { claim: 'Fluent means true', instead: 'Fluent text is likely text; true is a separate question.' },
  { claim: 'It hallucinated', instead: 'A wrong token sequence got a high probability.' },
  { claim: 'It told us how it got there', instead: 'Its story about its steps is more text, not a record of them.' },
]

export function RealitySummary() {
  const hype = CONCEPT_COLORS.scores
  return (
    <div className="flex flex-col gap-1">
      <h3 className="m-0 text-base font-bold" style={{ color: 'var(--concept-strong)' }}>Hype, and what to say instead</h3>
      <dl className="m-0 grid grid-cols-2 gap-2">
        {SUMMARY.map((row) => (
          <div key={row.claim} className="rounded-lg border-l-4 py-1 pl-3 pr-2"  style={{ borderColor: hype.solid, background: hype.tint }}>
            <dt className="text-base font-semibold leading-snug line-through" style={{ color: hype.strong }}>{row.claim}</dt>
            <dd className="m-0 text-base leading-snug text-ink">{row.instead}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
