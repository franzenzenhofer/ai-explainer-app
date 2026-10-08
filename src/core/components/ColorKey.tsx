// The colour key of a slide: a small sample of each mark next to what it means.
import { CONCEPT_COLORS, tokenColor } from '../colors'
import type { ColorKeyEntry } from '../chapters'

const SAMPLE_TOKENS = ['The', ' dog', ' it']

function ChipsSample() {
  return (
    <span className="flex gap-0.5">
      {SAMPLE_TOKENS.map((text) => {
        const color = tokenColor(text)
        return <span key={text} className="block h-5 w-3.5 rounded-sm border-2" style={{ background: color.fill, borderColor: color.border }} />
      })}
    </span>
  )
}

function Sample({ entry }: { entry: ColorKeyEntry }) {
  if (entry.color === 'identity') {
    if (entry.mark === 'id') return <span className="font-mono text-base font-semibold text-ink-2">#ID</span>
    return <ChipsSample />
  }
  const color = CONCEPT_COLORS[entry.color]
  switch (entry.mark) {
    case 'arc':
      return (
        <svg width="44" height="22" aria-hidden="true">
          <path d="M 4 20 C 4 2, 40 2, 40 20" fill="none" stroke={color.solid} strokeWidth="4" strokeLinecap="round" />
        </svg>
      )
    case 'frame':
      return <span className="block h-5 w-10 rounded-md border-[3px]" style={{ borderColor: color.solid, background: color.tint }} />
    case 'dot':
      return <span className="block h-4 w-4 rounded-full border-[3px] bg-white" style={{ borderColor: color.solid }} />
    case 'dashed':
      return <span className="block h-4 w-10 border-2 border-dashed" style={{ borderColor: color.solid }} />
    case 'grey':
      return <span className="block h-4 w-10 rounded-sm" style={{ background: color.soft }} />
    case 'cell':
      return (
        <span className="flex">
          {[0.25, 0.55, 0.95].map((alpha) => (
            <span key={alpha} className="block h-5 w-3.5" style={{ background: color.solid, opacity: alpha }} />
          ))}
        </span>
      )
    default:
      return <span className="block h-4 w-10 rounded-sm" style={{ background: color.solid }} />
  }
}

export function ColorKey({ entries }: { entries: ColorKeyEntry[] }) {
  return (
    <div data-color-key>
      <h2 className="m-0 mb-1.5 text-base font-bold uppercase tracking-wide text-ink-2">Colour key</h2>
      <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
        {entries.map((entry) => (
          <li key={entry.label} className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-2 text-base leading-snug text-ink">
            <span className="flex justify-center">
              <Sample entry={entry} />
            </span>
            <span>{entry.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
