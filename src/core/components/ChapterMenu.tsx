// The ten-chapter list: a menu, not a progress bar. It also holds the global reset.
import { CHAPTERS, type ChapterId } from '../chapters'
import { ChapterLink } from '../navigation/ChapterLink'
import { cn } from '../utils/cn'

interface ChapterMenuProps {
  id: string
  current: ChapterId
  onClose: () => void
  onReset: () => void
}

export function ChapterMenu({ id, current, onClose, onReset }: ChapterMenuProps) {
  return (
    <nav id={id} aria-label="Chapters" className="absolute inset-x-0 top-full border-b-2 border-ink bg-paper shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
      <div className="mx-auto max-h-[calc(100dvh-8rem)] max-w-5xl overflow-y-auto px-4 py-4 sm:px-8">
        <ol className="m-0 grid list-none gap-x-8 p-0 md:grid-cols-2">
          {CHAPTERS.map((chapter) => {
            const isCurrent = chapter.id === current
            return (
              <li key={chapter.id} className="border-b border-rule">
                <ChapterLink
                  chapter={chapter}
                  current={isCurrent ? 'page' : undefined}
                  onNavigate={onClose}
                  className={cn(
                    'flex min-h-11 flex-col justify-center border-l-4 py-3 pl-3 text-ink no-underline hover:bg-wash',
                    isCurrent ? 'border-accent' : 'border-transparent',
                  )}
                >
                  <span className="text-lg font-semibold">{chapter.name}</span>
                  <span className="text-base text-ink-2">{chapter.claim}</span>
                </ChapterLink>
              </li>
            )
          })}
        </ol>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="min-h-11 rounded-[3px] px-3 text-base font-medium text-ink-2 underline underline-offset-4 hover:text-ink"
          >
            Start over with the example sentence
          </button>
        </div>
      </div>
    </nav>
  )
}
