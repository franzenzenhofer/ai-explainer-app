// Drawer extra: the three head types with a source, each linked to the passage that describes it.
import { SOURCES } from '../../core/chapters'
import { KNOWN_HEAD_TYPES } from './headTypes'

export function HeadTypesList() {
  return (
    <div>
      <h3 className="m-0 mb-3 text-lg font-semibold">Three head types researchers have documented</h3>
      <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-3">
        {KNOWN_HEAD_TYPES.map((head) => (
          <li key={head.name} className="border-t-2 border-ink pt-3">
            <h4 className="m-0 text-lg font-semibold">{head.name}</h4>
            <p className="m-0 mt-1 text-base text-ink-2">{head.what}</p>
            <p className="m-0 mt-1 text-base text-ink-2">{head.example}</p>
            <a href={SOURCES[head.source].url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block py-2 text-base text-ink underline underline-offset-4">
              {SOURCES[head.source].label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
