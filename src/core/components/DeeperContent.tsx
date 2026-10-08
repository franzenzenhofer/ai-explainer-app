// The content of the "Go deeper" and "Sources" overlays: the drawer sections of a slide plus extras,
// and the source list, every link deep-linked to the quoted passage.
import type { ReactNode } from 'react'
import { SOURCES, type Chapter } from '../chapters'

export function DeeperSections({ chapter, extra }: { chapter: Chapter; extra?: ReactNode }) {
  return (
    <div>
      <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
        {chapter.drawer.map((section) => (
          <section key={section.heading}>
            <h3 className="m-0 mb-1 text-lg font-semibold text-ink">{section.heading}</h3>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="m-0 mb-2 text-base text-ink-2">{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
      {extra && <div className="mt-6 border-t border-rule pt-5">{extra}</div>}
      <SourcesList chapter={chapter} />
    </div>
  )
}

export function SourcesList({ chapter }: { chapter: Chapter }) {
  return (
    <section className="mt-6 border-t border-rule pt-4" data-sources>
      <h3 className="m-0 mb-2 text-lg font-semibold text-ink">Sources</h3>
      <ul className="m-0 list-none space-y-1 p-0">
        {chapter.sources.map((key) => (
          <li key={key}>
            <a
              href={SOURCES[key].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-base text-ink underline decoration-rule-strong underline-offset-4 hover:decoration-ink"
            >
              {SOURCES[key].label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
