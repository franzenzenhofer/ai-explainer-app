// The head types researchers have documented, each linked to the passage that describes it.
import { SOURCES } from '../../core/chapters'
import { KNOWN_HEAD_TYPES } from './headTypes'

export function HeadTypesList() {
  return (
    <div>
      <p className="m-0 mb-3 text-base text-ink-2">
        Each head in each layer learns its own pattern. These three are documented with evidence; most heads have no simple name.
      </p>
      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
        {KNOWN_HEAD_TYPES.map((head) => (
          <li key={head.name} className="rounded-xl border-2 border-[var(--concept-soft)] bg-[var(--concept-tint)] p-3">
            <h4 className="m-0 text-lg font-bold text-[var(--concept-strong)]">{head.name}</h4>
            <p className="m-0 mt-1 text-base text-ink">{head.what}</p>
            <p className="m-0 mt-2 rounded-lg bg-paper px-2 py-1 text-base italic text-ink">{head.example}</p>
            <a href={SOURCES[head.source].url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex min-h-11 items-center text-base text-ink underline underline-offset-4">
              {SOURCES[head.source].label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
