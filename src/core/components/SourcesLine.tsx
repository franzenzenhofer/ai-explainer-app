// One line of sources at the bottom of every chapter; every link deep-links to the quoted passage.
import { SOURCES, type SourceKey } from '../chapters'

interface SourcesLineProps {
  sources: SourceKey[]
}

export function SourcesLine({ sources }: SourcesLineProps) {
  return (
    <p className="m-0 border-t border-rule py-4 text-base text-ink-2" data-sources>
      <span className="font-semibold text-ink">Sources: </span>
      {sources.map((key, index) => (
        <span key={key}>
          {index > 0 && <span aria-hidden="true">{' · '}</span>}
          <a
            href={SOURCES[key].url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block py-2 text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-ink"
          >
            {SOURCES[key].label}
          </a>
        </span>
      ))}
    </p>
  )
}
