// The loop in four words: read, score, pick, append, and back to the start.
const STAGES = ['Read the text so far', 'Score every possible next token', 'Pick one', 'Append it to the text']

export function LoopDiagram() {
  return (
    <div className="mt-12">
      <h2 className="m-0 mb-4 text-base font-semibold">Every press runs this loop once</h2>
      <ol className="m-0 grid list-none gap-0 p-0 md:grid-cols-4" aria-label="The token machine loop">
        {STAGES.map((stage, index) => (
          <li key={stage} className="relative border-l-2 border-ink py-3 pl-4 pr-6 md:border-l-0 md:border-t-2 md:pl-0 md:pt-4">
            <span className="text-lg font-semibold text-ink">{stage}</span>
            <span aria-hidden="true" className="absolute right-2 top-3 text-xl text-ink-2 md:top-4">
              {index === STAGES.length - 1 ? '↺' : '→'}
            </span>
          </li>
        ))}
      </ol>
      <p className="m-0 mt-3 text-base text-ink-2">Then the whole machine runs again on the longer text.</p>
    </div>
  )
}
