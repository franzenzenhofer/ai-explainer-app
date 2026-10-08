// The loop in four steps: read, score, pick, append, and back to the start.
const STAGES = ['Read the text so far', 'Score every possible next token', 'Pick one', 'Append it to the text']

const ARROW_DOWN = '↓'
const ARROW_RIGHT = '→'
const ARROW_AGAIN = '↺'

export function LoopDiagram() {
  return (
    <div className="mt-12">
      <h2 className="m-0 mb-4 text-base font-semibold">Every press runs this loop once</h2>
      <ol className="m-0 grid list-none gap-0 p-0 md:grid-cols-4" aria-label="The token machine loop">
        {STAGES.map((stage, index) => {
          const last = index === STAGES.length - 1
          return (
            <li key={stage} className="flex items-start justify-between gap-3 border-l-2 border-ink py-3 pl-4 pr-2 md:border-l-0 md:border-t-2 md:pl-0 md:pr-4 md:pt-4">
              <span className="text-lg font-semibold text-ink">{stage}</span>
              <span aria-hidden="true" className="shrink-0 text-xl text-ink-2">
                {last ? ARROW_AGAIN : <><span className="md:hidden">{ARROW_DOWN}</span><span className="hidden md:inline">{ARROW_RIGHT}</span></>}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="m-0 mt-3 text-base text-ink-2">Then the whole machine runs again on the longer text.</p>
    </div>
  )
}
