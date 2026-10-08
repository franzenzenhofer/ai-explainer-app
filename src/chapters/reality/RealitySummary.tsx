// Drawer summary for the Reality chapter: what is safe to say, rewritten without overstatement.

const SUMMARY: Array<{ claim: string; instead: string }> = [
  { claim: 'The model thinks it over', instead: 'It predicts the next token, again and again.' },
  { claim: 'A fluent answer is a true answer', instead: 'Fluent text is likely text; true is a separate question.' },
  { claim: 'It hallucinated', instead: 'A wrong token sequence got a high probability.' },
  { claim: 'It told us how it got there', instead: 'Its story about its steps is more text, not a record of them.' },
]

export function RealitySummary() {
  return (
    <div>
      <h3 className="m-0 mb-3 text-lg font-semibold text-ink">Shortcuts and what to say instead</h3>
      <dl className="m-0 grid gap-4 md:grid-cols-2">
        {SUMMARY.map((row) => (
          <div key={row.claim} className="border-t border-rule pt-2">
            <dt className="text-base font-semibold text-ink">{row.claim}</dt>
            <dd className="m-0 text-base text-ink-2">{row.instead}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
