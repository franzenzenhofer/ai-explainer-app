// "Go deeper": closed by default, inline (not an overlay), remembers its state per chapter in the store.
import { useCallback, useId, type ReactNode } from 'react'
import { useAppStore } from '../../store/appStore'
import type { Chapter } from '../chapters'
import { useEscape } from '../navigation/navigation'

interface DepthDrawerProps {
  chapter: Chapter
  extra?: ReactNode
}

export function DepthDrawer({ chapter, extra }: DepthDrawerProps) {
  const open = useAppStore((s) => Boolean(s.openDrawers[chapter.id]))
  const toggleDrawer = useAppStore((s) => s.toggleDrawer)
  const closeDrawer = useAppStore((s) => s.closeDrawer)
  const regionId = useId()
  const close = useCallback(() => closeDrawer(chapter.id), [closeDrawer, chapter.id])
  useEscape(open, close)

  return (
    <section className="border-t border-rule" data-drawer>
      <h2 className="m-0 text-base">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => toggleDrawer(chapter.id)}
          className="flex min-h-14 w-full items-center justify-between gap-4 text-left text-lg font-semibold text-ink hover:text-ink-2"
        >
          <span>{chapter.drawerTitle}</span>
          <span aria-hidden="true" className="text-2xl leading-none">{open ? '−' : '+'}</span>
        </button>
      </h2>
      {open && (
        <div id={regionId} className="pb-8">
          <div className="grid gap-8 md:grid-cols-2">
            {chapter.drawer.map((section) => (
              <div key={section.heading}>
                <h3 className="m-0 mb-2 text-lg font-semibold text-ink">{section.heading}</h3>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="m-0 mb-3 max-w-prose text-base text-ink-2">{paragraph}</p>
                ))}
              </div>
            ))}
          </div>
          {extra && <div className="mt-8">{extra}</div>}
        </div>
      )}
    </section>
  )
}
