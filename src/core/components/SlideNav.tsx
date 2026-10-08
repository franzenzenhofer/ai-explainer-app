// The bottom bar of every slide: Back, a clickable dot per slide with the counter, Next.
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'
import { useFirstPaint } from '../hooks/useFirstPaint'
import { useAppStore } from '../../store/appStore'
import { CONCEPT_COLORS } from '../colors'
import { CHAPTERS, chapterIndex, neighbourChapter, type ChapterId } from '../chapters'
import { ChapterLink } from '../navigation/ChapterLink'
import { cn } from '../utils/cn'

const NEUTRAL_DOT = '#64748b'

function Dots({ current }: { current: ChapterId }) {
  return (
    <ol aria-label="Slides" className="m-0 flex list-none items-center p-0">
      {CHAPTERS.map((chapter) => {
        const active = chapter.id === current
        const color = chapter.stage ? CONCEPT_COLORS[chapter.stage].solid : NEUTRAL_DOT
        return (
          <li key={chapter.id}>
            <ChapterLink
              chapter={chapter}
              aria-label={`Slide ${chapterIndex(chapter.id) + 1}: ${chapter.shortName}`}
              aria-current={active ? 'page' : undefined}
              title={chapter.shortName}
              className="flex h-11 w-8 items-center justify-center"
            >
              {active ? (
                <motion.span layoutId="active-slide-dot" className="block h-4 w-4 rounded-full" style={{ background: color, boxShadow: `0 0 0 4px ${color}33` }} />
              ) : (
                <span className="block h-2.5 w-2.5 rounded-full opacity-50 transition-opacity hover:opacity-100" style={{ background: color }} />
              )}
            </ChapterLink>
          </li>
        )
      })}
    </ol>
  )
}

const NAV_BUTTON = 'inline-flex min-h-11 items-center gap-1 rounded-lg border-2 px-3 text-base font-semibold no-underline transition-transform hover:scale-[1.03] active:scale-95'

export function SlideNav({ current }: { current: ChapterId }) {
  const previous = neighbourChapter(current, -1)
  const next = neighbourChapter(current, 1)
  const resetAll = useAppStore((s) => s.resetAll)
  const position = chapterIndex(current) + 1
  const firstPaint = useFirstPaint()
  return (
    <motion.div initial={firstPaint ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="slide-nav flex items-center justify-between gap-3">
      <div className="flex min-w-48 items-center gap-2">
        {previous && (
          <ChapterLink chapter={previous} className={cn(NAV_BUTTON, 'border-ink/15 bg-paper text-ink hover:border-ink/40')}>
            <ChevronLeft aria-hidden="true" size={20} />
            Back
          </ChapterLink>
        )}
        <button type="button" onClick={resetAll} title="Start over with the example text" className={cn(NAV_BUTTON, 'border-transparent text-ink-2 hover:text-ink')}>
          <RotateCcw aria-hidden="true" size={18} />
          Reset
        </button>
      </div>
      <div className="flex items-center gap-3">
        <Dots current={current} />
        <span className="text-base font-semibold tabular-nums text-ink-2" aria-live="polite">
          {position} / {CHAPTERS.length}
        </span>
      </div>
      <div className="flex min-w-48 justify-end">
        {next ? (
          <ChapterLink chapter={next} className={cn(NAV_BUTTON, 'border-[var(--concept-strong)] bg-[var(--concept-strong)] text-white hover:opacity-90')}>
            Next: {next.shortName}
            <ChevronRight aria-hidden="true" size={20} />
          </ChapterLink>
        ) : (
          <ChapterLink chapter={CHAPTERS[0]} className={cn(NAV_BUTTON, 'border-[var(--concept-strong)] bg-[var(--concept-strong)] text-white')}>
            Back to the start
          </ChapterLink>
        )}
      </div>
    </motion.div>
  )
}
